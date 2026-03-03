import { contact, instagramIntegration, sidekickSetting } from "@pilot/db/schema";
import { and, eq, inArray, lt } from "drizzle-orm";
import {
  fetchConversationMessagesForSync,
  fetchConversationsForSync,
  refreshLongLivedInstagramToken,
} from "@pilot/instagram";
import type {
  AnalysisResult,
  InstagramContact,
  InstagramConversation,
  InstagramMessage,
  InstagramParticipant,
} from "@pilot/types/instagram";
import { generateText, geminiModel, parseJsonResponse } from "../ai/model";
import {
  DEFAULT_SIDEKICK_PROMPT,
  getPersonalizedFollowUpPrompt,
  getPersonalizedLeadAnalysisPrompt,
} from "../sidekick/personalization";
import { sanitizeText } from "../utils";

const MIN_MESSAGES_PER_CONTACT = 2;
const DEFAULT_MESSAGE_LIMIT = 10;
const BATCH_SIZE = 20;
const REQUEST_DELAY_MS = 200;

type IntegrationRecord = {
  id: string;
  userId: string;
  instagramUserId: string;
  appScopedUserId: string | null;
  username: string | null;
  accessToken: string;
  expiresAt: Date | string | null;
  lastSyncedAt: Date | string | null;
  syncIntervalHours: number | null;
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch<T, R>(items: T[], processor: (item: T) => Promise<R>) {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    const batch = items.slice(index, index + BATCH_SIZE);
    const batchResults: R[] = [];

    for (const item of batch) {
      const result = await processor(item);
      batchResults.push(result);
      if (batchResults.length < batch.length) {
        await delay(REQUEST_DELAY_MS);
      }
    }

    results.push(...batchResults);

    if (index + BATCH_SIZE < items.length) {
      await delay(1000);
    }
  }

  return results;
}

export async function fetchConversationMessages(params: {
  accessToken: string;
  conversationId: string;
}): Promise<InstagramMessage[]> {
  try {
    return await fetchConversationMessagesForSync({
      accessToken: params.accessToken,
      conversationId: params.conversationId,
      limit: DEFAULT_MESSAGE_LIMIT,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("token expired")) {
      throw error;
    }

    return [];
  }
}

export async function analyzeConversation(params: {
  dbClient: any;
  messages: InstagramMessage[];
  username: string;
  userId: string;
}): Promise<AnalysisResult> {
  try {
    const formattedMessages = params.messages
      .map((message) => {
        const sender = message.from.username === params.username ? "Customer" : "Business";
        const sanitizedMessage = sanitizeText(message.message).slice(0, 500);
        return `${sender}: ${sanitizedMessage}`;
      })
      .join("\n");

    const personalized = await getPersonalizedLeadAnalysisPrompt(
      params.dbClient,
      formattedMessages,
      params.userId,
    );

    const result = await generateText({
      model: geminiModel,
      system: personalized.system,
      prompt: personalized.main,
      temperature: 0,
    });

    const analysis = parseJsonResponse<AnalysisResult>(result.text || "");

    if (analysis) {
      return {
        stage: analysis.stage || "new",
        sentiment: analysis.sentiment || "neutral",
        leadScore: analysis.leadScore || 0,
        nextAction: analysis.nextAction || "",
        leadValue: analysis.leadValue || 0,
      };
    }
  } catch (error) {
    console.error("Error analyzing conversation:", error);
  }

  return {
    stage: "new",
    sentiment: "neutral",
    leadScore: 0,
    nextAction: "",
    leadValue: 0,
  };
}

export async function batchAnalyzeConversations(params: {
  dbClient: any;
  conversationsData: Array<{ messages: InstagramMessage[]; username: string }>;
  userId: string;
}): Promise<AnalysisResult[]> {
  const validConversations = params.conversationsData.filter(
    ({ messages }) => messages.length >= MIN_MESSAGES_PER_CONTACT,
  );

  if (validConversations.length === 0) {
    return [];
  }

  try {
    return await Promise.all(
      validConversations.map(({ messages, username }) =>
        analyzeConversation({
          dbClient: params.dbClient,
          messages,
          username,
          userId: params.userId,
        }),
      ),
    );
  } catch {
    const fallback: AnalysisResult[] = [];
    for (const conversation of validConversations) {
      fallback.push(
        await analyzeConversation({
          dbClient: params.dbClient,
          messages: conversation.messages,
          username: conversation.username,
          userId: params.userId,
        }),
      );
    }
    return fallback;
  }
}

async function fetchInstagramIntegration(dbClient: any, userId: string) {
  const integration = await dbClient.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, userId),
  });

  if (!integration?.accessToken) {
    return null;
  }

  const now = new Date();
  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null;
  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    return null;
  }

  return integration;
}

async function fetchInstagramConversations(params: {
  accessToken: string;
  igUserId: string;
}) {
  const conversations = (await fetchConversationsForSync({
    accessToken: params.accessToken,
    igUserId: params.igUserId,
  })) as InstagramConversation[];

  return conversations.filter(
    (item) => !!item && typeof item === "object" && Array.isArray(item.participants?.data),
  );
}

async function enrichConversationsWithMessages(params: {
  conversations: InstagramConversation[];
  accessToken: string;
  username: string;
}) {
  const results = await processBatch(params.conversations, async (conversation) => {
    const participant = conversation.participants.data.find(
      (entry) => entry.username !== params.username,
    );

    if (!participant?.id) {
      return null;
    }

    try {
      const messages = await fetchConversationMessages({
        accessToken: params.accessToken,
        conversationId: conversation.id,
      });
      const messageTexts = messages.map((message) => `${message.from.username}: ${message.message}`);

      if (messages.length < MIN_MESSAGES_PER_CONTACT) {
        return null;
      }

      return {
        conversation,
        participant,
        messages,
        messageTexts,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("token expired")) {
        throw error;
      }
      return null;
    }
  });

  return results.filter(Boolean) as Array<{
    conversation: InstagramConversation;
    participant: InstagramParticipant;
    messages: InstagramMessage[];
    messageTexts: string[];
  }>;
}

async function storeContacts(params: {
  dbClient: any;
  contactsData: Array<{
    participant: InstagramParticipant;
    lastMessage?: InstagramMessage;
    timestamp: string;
    messageTexts: string[];
    analysis: AnalysisResult;
  }>;
  userId: string;
  existingContactsMap: Map<string, typeof contact.$inferSelect>;
  fullSync: boolean;
}) {
  const contacts: InstagramContact[] = [];
  const contactsToInsert = [];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const item of params.contactsData) {
    const existingContact = params.existingContactsMap.get(item.participant.id);
    const lastMessageTime = item.lastMessage?.created_time
      ? new Date(item.lastMessage.created_time)
      : new Date(item.timestamp);

    const needsFollowup =
      lastMessageTime < twentyFourHoursAgo && item.analysis.stage !== "ghosted";

    contacts.push({
      id: item.participant.id,
      name: item.participant.username || "Unknown",
      lastMessage: item.lastMessage?.message || "",
      timestamp: item.timestamp,
      messages: item.messageTexts,
      ...item.analysis,
    });

    contactsToInsert.push({
      id: item.participant.id,
      userId: params.userId,
      username: item.participant.username,
      lastMessage: item.lastMessage?.message || null,
      lastMessageAt: lastMessageTime,
      stage: item.analysis.stage,
      sentiment: item.analysis.sentiment,
      leadScore: item.analysis.leadScore,
      nextAction: item.analysis.nextAction,
      leadValue: item.analysis.leadValue,
      triggerMatched: existingContact?.triggerMatched || false,
      followupNeeded: needsFollowup,
      notes: existingContact?.notes || null,
      updatedAt: new Date(),
      createdAt: existingContact?.createdAt || new Date(),
    });
  }

  await Promise.all(
    contactsToInsert.map((row) =>
      params.dbClient
        .insert(contact)
        .values(row)
        .onConflictDoUpdate({
          target: contact.id,
          set: params.fullSync
            ? {
                username: row.username,
                lastMessage: row.lastMessage,
                lastMessageAt: row.lastMessageAt,
                stage: row.stage,
                sentiment: row.sentiment,
                leadScore: row.leadScore,
                nextAction: row.nextAction,
                leadValue: row.leadValue,
                followupNeeded: row.followupNeeded,
                updatedAt: new Date(),
              }
            : {
                lastMessage: row.lastMessage,
                lastMessageAt: row.lastMessageAt,
                followupNeeded: row.followupNeeded,
                updatedAt: new Date(),
              },
        }),
    ),
  );

  return contacts;
}

export async function fetchAndStoreInstagramContacts(params: {
  dbClient: any;
  userId: string;
  fullSync?: boolean;
}): Promise<InstagramContact[]> {
  try {
    const integration = await fetchInstagramIntegration(params.dbClient, params.userId);
    if (!integration) {
      return [];
    }

    const igUserId = integration.instagramUserId;
    const conversations = await fetchInstagramConversations({
      accessToken: integration.accessToken,
      igUserId,
    });
    const allParticipants = conversations
      .map((conversation) =>
        conversation.participants.data.find(
          (participant) => participant.username !== integration.username,
        ),
      )
      .filter(Boolean) as InstagramParticipant[];

    const participantIds = allParticipants.map((participant) => participant.id);
    const existingContacts = participantIds.length
      ? await params.dbClient.query.contact.findMany({
          where: and(eq(contact.userId, params.userId), inArray(contact.id, participantIds)),
        })
      : [];

    const existingContactsMap = new Map<string, typeof contact.$inferSelect>(
      (existingContacts as Array<typeof contact.$inferSelect>).map((row) => [
        row.id,
        row,
      ]),
    );
    const fullSync = params.fullSync ?? process.env.NODE_ENV !== "production";

    const targetConversations = fullSync
      ? conversations
      : conversations.filter((conversation) => {
          const participant = conversation.participants.data.find(
            (entry) => entry.username !== integration.username,
          );
          if (!participant?.id) {
            return false;
          }

          const notSeenBefore = !existingContactsMap.has(participant.id);
          const lastSynced = integration.lastSyncedAt ? new Date(integration.lastSyncedAt) : null;
          if (!lastSynced) {
            return true;
          }

          return new Date(conversation.updated_time) > lastSynced || notSeenBefore;
        });

    const enrichedData = await enrichConversationsWithMessages({
      conversations: targetConversations,
      accessToken: integration.accessToken,
      username: integration.username,
    });

    const analysisResults = await batchAnalyzeConversations({
      dbClient: params.dbClient,
      conversationsData: enrichedData.map((item) => ({
        messages: item.messages,
        username: item.participant.username,
      })),
      userId: params.userId,
    });

    const contactsData = enrichedData.map((item, index) => ({
      participant: item.participant,
      lastMessage: item.conversation.messages?.data?.[0],
      timestamp: item.conversation.messages?.data?.[0]?.created_time || item.conversation.updated_time,
      messageTexts: item.messageTexts,
      analysis: analysisResults[index],
    }));

    const contactsResult = await storeContacts({
      dbClient: params.dbClient,
      contactsData,
      userId: params.userId,
      existingContactsMap,
      fullSync,
    });

    await params.dbClient
      .update(instagramIntegration)
      .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(instagramIntegration.userId, params.userId));

    return contactsResult;
  } catch (error) {
    const typedError = error as { message?: string; response?: { status: number } };
    console.error("Failed to fetch Instagram contacts:", {
      message: typedError.message || "Unknown error",
      status: typedError.response?.status,
      userId: params.userId,
      fullSync: params.fullSync,
    });

    if (typedError.message?.includes("token expired")) {
      throw error;
    }

    return [];
  }
}

export async function generateFollowUpMessageText(params: {
  dbClient: any;
  userId: string;
  contactId: string;
}) {
  const contactData = await params.dbClient.query.contact.findFirst({
    where: and(eq(contact.id, params.contactId), eq(contact.userId, params.userId)),
  });

  if (!contactData) {
    return { success: false, error: "Contact not found" } as const;
  }

  const integration = await params.dbClient.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, params.userId),
  });

  if (!integration?.accessToken) {
    return { success: false, error: "No Instagram integration found" } as const;
  }

  const settings = await params.dbClient.query.sidekickSetting.findFirst({
    where: eq(sidekickSetting.userId, params.userId),
  });

  const systemPrompt = settings?.systemPrompt || DEFAULT_SIDEKICK_PROMPT;
  const messages = await fetchConversationMessages({
    accessToken: integration.accessToken,
    conversationId: params.contactId,
  });

  const conversationHistory = messages
    .slice(0, 10)
    .map((message) => {
      const sender = message.from.username === integration.username ? "Business" : "Customer";
      const sanitizedMessage = sanitizeText(message.message).slice(0, 500);
      return `${sender}: ${sanitizedMessage}`;
    })
    .join("\n");

  const personalized = await getPersonalizedFollowUpPrompt(params.dbClient, {
    userId: params.userId,
    customerName: contactData.username || "Unknown",
    stage: contactData.stage || "new",
    leadScore: contactData.leadScore || 0,
    lastMessage: contactData.lastMessage || "No previous message",
    conversationHistory,
  });

  const aiResult = await generateText({
    model: geminiModel,
    system: systemPrompt || personalized.system,
    prompt: personalized.main,
    temperature: 0.4,
  });

  const followUpText = sanitizeText(aiResult.text || "").slice(0, 280);
  if (!followUpText) {
    return { success: false, error: "Failed to generate follow-up message" } as const;
  }

  return { success: true, message: followUpText } as const;
}

export function summarizeContacts(contacts: InstagramContact[]) {
  const stageDistribution = contacts.reduce((acc: Record<string, number>, item) => {
    const stage = item.stage || "unknown";
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const sentimentDistribution = contacts.reduce((acc: Record<string, number>, item) => {
    const sentiment = item.sentiment || "unknown";
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const averageLeadScore = contacts.length
    ? contacts.reduce((sum, item) => sum + (item.leadScore || 0), 0) / contacts.length
    : 0;
  const averageLeadValue = contacts.length
    ? contacts.reduce((sum, item) => sum + (item.leadValue || 0), 0) / contacts.length
    : 0;

  return {
    stageDistribution,
    sentimentDistribution,
    averageLeadScore,
    averageLeadValue,
  };
}

export function getDueSyncIntegrations(integrations: IntegrationRecord[], now: Date = new Date()) {
  return integrations.filter((integration) => {
    if (!integration.accessToken) {
      return false;
    }

    const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null;
    if (expiresAt && expiresAt.getTime() < now.getTime()) {
      return false;
    }

    const interval = Math.min(24, Math.max(5, integration.syncIntervalHours ?? 24));
    const lastSyncedAt = integration.lastSyncedAt ? new Date(integration.lastSyncedAt) : null;
    if (!lastSyncedAt) {
      return true;
    }

    return new Date(lastSyncedAt.getTime() + interval * 60 * 60 * 1000) <= now;
  });
}

export async function getExpiringIntegrations(dbClient: any, before: Date) {
  return dbClient.query.instagramIntegration.findMany({
    where: lt(instagramIntegration.expiresAt, before),
  });
}

export async function refreshInstagramTokenIfExpiring(params: {
  dbClient: any;
  integration: IntegrationRecord;
}) {
  const data = await refreshLongLivedInstagramToken({
    accessToken: params.integration.accessToken,
  });

  const newExpiresAt = new Date();
  newExpiresAt.setSeconds(newExpiresAt.getSeconds() + data.expiresIn);

  await params.dbClient
    .update(instagramIntegration)
    .set({
      accessToken: data.accessToken,
      expiresAt: newExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(instagramIntegration.id, params.integration.id));

  return { accessToken: data.accessToken, expiresAt: newExpiresAt };
}
