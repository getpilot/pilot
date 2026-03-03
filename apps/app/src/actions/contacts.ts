"use server";

import { getRLSDb, getUser } from "@/lib/auth-utils";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import {
  contact,
  instagramIntegration,
  sidekickSetting,
  contactTag,
} from "@pilot/db/schema";
import { eq, and, inArray, desc, gt, asc } from "drizzle-orm";
import { inngest } from "@/lib/inngest/client";
import { revalidatePath } from "next/cache";
import {
  generateText,
  geminiModel,
  parseJsonResponse,
} from "@pilot/core/ai/model";
import {
  InstagramContact,
  InstagramParticipant,
  InstagramMessage,
  InstagramConversation,
  AnalysisResult,
  ContactField,
} from "@pilot/types/instagram";
import {
  DEFAULT_SIDEKICK_PROMPT,
  getPersonalizedFollowUpPrompt,
  getPersonalizedLeadAnalysisPrompt,
} from "@pilot/core/sidekick/personalization";
import { sanitizeText } from "@/lib/utils";
import { assertBillingAllowed, BillingLimitError } from "@/lib/billing/enforce";
import {
  fetchConversationMessagesForSync as fetchInstagramConversationMessagesForSync,
  fetchConversationsForSync as fetchInstagramConversationsForSync,
} from "@pilot/instagram";

const MIN_MESSAGES_PER_CONTACT = 2;
const DEFAULT_MESSAGE_LIMIT = 10;
const BATCH_SIZE = 20;
const REQUEST_DELAY_MS = 200;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = BATCH_SIZE,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        items.length / batchSize,
      )} (${batch.length} items)`,
    );

    const batchResults: R[] = [];
    for (const item of batch) {
      const result = await processor(item);
      batchResults.push(result);
      if (batchResults.length < batch.length) {
        await delay(REQUEST_DELAY_MS);
      }
    }

    results.push(...batchResults);

    if (i + batchSize < items.length) {
      await delay(1000);
    }
  }

  return results;
}

export async function fetchContacts(): Promise<InstagramContact[]> {
  try {
    console.log("Starting to fetch contacts");
    const user = await getUser();
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    const db = await getRLSDb();
    console.log("Fetching contacts from DB");
    const contacts = await db.query.contact.findMany({
      where: eq(contact.userId, user.id),
    });
    console.log(`Found ${contacts.length} contacts in the database`);

    const contactIds = contacts.map((c) => c.id);
    const tagsMap = await fetchContactTagsForContacts(contactIds);

    return contacts.map((c) => ({
      id: c.id,
      name: c.username || "Unknown",
      lastMessage: c.lastMessage || undefined,
      timestamp: c.lastMessageAt?.toISOString(),
      stage: c.stage || undefined,
      sentiment: c.sentiment || undefined,
      notes: c.notes || undefined,
      leadScore: c.leadScore || undefined,
      nextAction: c.nextAction || undefined,
      leadValue: c.leadValue || undefined,
      requiresHumanResponse: c.requiresHumanResponse || undefined,
      humanResponseSetAt: c.humanResponseSetAt?.toISOString(),
      tags: tagsMap[c.id] || [],
    }));
  } catch (error) {
    console.error("Error fetching Instagram contacts:", error);
    return [];
  }
}

export async function fetchFollowUpContacts(): Promise<InstagramContact[]> {
  try {
    console.log("Starting to fetch follow-up contacts");
    const user = await getUser();
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    console.log("Fetching contacts that need follow-up from DB");
    const db = await getRLSDb();
    const contacts = await db.query.contact.findMany({
      where: and(eq(contact.userId, user.id), eq(contact.followupNeeded, true)),
    });
    console.log(`Found ${contacts.length} contacts needing follow-up`);

    return contacts.map((c) => ({
      id: c.id,
      name: c.username || "Unknown",
      lastMessage: c.lastMessage || undefined,
      timestamp: c.lastMessageAt?.toISOString(),
      stage: c.stage || undefined,
      sentiment: c.sentiment || undefined,
      notes: c.notes || undefined,
      leadScore: c.leadScore || undefined,
      nextAction: c.nextAction || undefined,
      leadValue: c.leadValue || undefined,
      followupMessage: c.followupMessage || undefined,
      requiresHumanResponse: c.requiresHumanResponse || undefined,
      humanResponseSetAt: c.humanResponseSetAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching follow-up contacts:", error);
    return [];
  }
}

export async function fetchHRNContacts(): Promise<InstagramContact[]> {
  try {
    console.log("Starting to fetch HRN contacts");
    const user = await getUser();
    if (!user) {
      console.log("No authenticated user found");
      return [];
    }

    console.log("Fetching HRN contacts from DB");
    const db = await getRLSDb();
    const contacts = await db.query.contact.findMany({
      where: and(
        eq(contact.userId, user.id),
        eq(contact.requiresHumanResponse, true),
      ),
      orderBy: desc(contact.humanResponseSetAt ?? contact.updatedAt),
    });
    console.log(`Found ${contacts.length} HRN contacts`);

    return contacts.map((c) => ({
      id: c.id,
      name: c.username || "Unknown",
      lastMessage: c.lastMessage || undefined,
      timestamp: c.lastMessageAt?.toISOString(),
      stage: c.stage || undefined,
      sentiment: c.sentiment || undefined,
      notes: c.notes || undefined,
      leadScore: c.leadScore || undefined,
      nextAction: c.nextAction || undefined,
      leadValue: c.leadValue || undefined,
      requiresHumanResponse: c.requiresHumanResponse || undefined,
      humanResponseSetAt: c.humanResponseSetAt?.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching HRN contacts:", error);
    return [];
  }
}

async function updateContactField(
  contactId: string,
  field: ContactField,
  value: string,
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existingContact = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });

    if (!existingContact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    const updateData = {
      updatedAt: new Date(),
    } as Record<string, unknown>;

    updateData[field] = value;

    await db
      .update(contact)
      .set(updateData)
      .where(and(eq(contact.id, contactId), eq(contact.userId, user.id)));

    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error(`Error updating contact ${field}:`, error);
    return { success: false, error: `Failed to update contact ${field}` };
  }
}

export async function updateContactStage(
  contactId: string,
  stage: "new" | "lead" | "follow-up" | "ghosted",
) {
  return updateContactField(contactId, "stage", stage);
}

export async function updateContactSentiment(
  contactId: string,
  sentiment: "hot" | "warm" | "cold" | "ghosted" | "neutral",
) {
  return updateContactField(contactId, "sentiment", sentiment);
}

export async function updateContactNotes(contactId: string, notes: string) {
  return updateContactField(contactId, "notes", notes);
}

export async function updateContactHRNState(
  contactId: string,
  opts: { requiresHumanResponse: boolean },
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existingContact = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });

    if (!existingContact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    const now = new Date();
    const requiresHumanResponse = !!opts.requiresHumanResponse;

    await db
      .update(contact)
      .set({
        requiresHumanResponse,
        humanResponseSetAt: requiresHumanResponse ? now : null,
        updatedAt: now,
      })
      .where(and(eq(contact.id, contactId), eq(contact.userId, user.id)));

    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("Error updating HRN state:", error);
    return { success: false, error: "Failed to update HRN state" };
  }
}

export async function updateContactFollowUpStatus(
  contactId: string,
  followupNeeded: boolean,
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existingContact = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });

    if (!existingContact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    await db
      .update(contact)
      .set({
        followupNeeded,
        updatedAt: new Date(),
      })
      .where(and(eq(contact.id, contactId), eq(contact.userId, user.id)));

    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("Error updating contact follow-up status:", error);
    return {
      success: false,
      error: "Failed to update contact follow-up status",
    };
  }
}

export async function updateContactAfterFollowUp(
  contactId: string,
  updates: {
    stage?: "new" | "lead" | "follow-up" | "ghosted";
    sentiment?: "hot" | "warm" | "cold" | "ghosted" | "neutral";
    leadScore?: number;
    leadValue?: number;
    nextAction?: string;
  },
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existingContact = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });

    if (!existingContact) {
      return { success: false, error: "Contact not found or unauthorized" };
    }

    await db
      .update(contact)
      .set({
        ...updates,
        followupNeeded: false,
        updatedAt: new Date(),
      })
      .where(and(eq(contact.id, contactId), eq(contact.userId, user.id)));

    revalidatePath("/contacts");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("Error updating contact after follow-up:", error);
    return {
      success: false,
      error: "Failed to update contact after follow-up",
    };
  }
}

export async function addContactTagAction(contactId: string, tag: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existing = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });
    if (!existing) return { success: false, error: "Contact not found" };

    const MAX_TAG_LENGTH = 24;
    const normalized = tag.trim().toLowerCase();
    if (normalized.length === 0) {
      return { success: false, error: "Tag is required" };
    }
    if (normalized.length > MAX_TAG_LENGTH) {
      return {
        success: false,
        error: `Tag too long (max ${MAX_TAG_LENGTH} characters)`,
      };
    }

    const duplicate = await db
      .select()
      .from(contactTag)
      .where(
        and(
          eq(contactTag.contactId, contactId),
          eq(contactTag.userId, user.id),
          eq(contactTag.tag, normalized),
        ),
      )
      .limit(1);
    if (duplicate.length > 0) {
      return { success: false, error: "Tag already exists for this contact" };
    }

    await db.insert(contactTag).values({
      id: crypto.randomUUID(),
      userId: user.id,
      contactId,
      tag: normalized,
      createdAt: new Date(),
    });

    revalidateTag(`user-tags-${user.id}`, "max");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("addContactTagAction error:", error);
    return { success: false, error: "Failed to add tag" };
  }
}

export async function removeContactTagAction(contactId: string, tag: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const existing = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });
    if (!existing) return { success: false, error: "Contact not found" };

    const normalized = (tag || "").trim().toLowerCase();
    if (!normalized) {
      return { success: false, error: "Tag is required" };
    }

    await db
      .delete(contactTag)
      .where(
        and(
          eq(contactTag.userId, user.id),
          eq(contactTag.contactId, contactId),
          eq(contactTag.tag, normalized),
        ),
      );

    revalidateTag(`user-tags-${user.id}`, "max");
    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("removeContactTagAction error:", error);
    return { success: false, error: "Failed to remove tag" };
  }
}

export async function getContactTagsAction(contactId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const db = await getRLSDb();
    const existing = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });
    if (!existing) return { success: false, error: "Contact not found" };

    const rows = await db
      .select({ tag: contactTag.tag })
      .from(contactTag)
      .where(
        and(
          eq(contactTag.userId, user.id),
          eq(contactTag.contactId, contactId),
        ),
      )
      .orderBy(asc(contactTag.tag));

    return { success: true, tags: rows.map((r) => r.tag) };
  } catch (error) {
    console.error("getContactTagsAction error:", error);
    return { success: false, error: "Failed to fetch tags" };
  }
}

export async function fetchContactTagsForContacts(contactIds: string[]) {
  try {
    const user = await getUser();
    if (!user) return {} as Record<string, string[]>;

    if (!contactIds.length) return {} as Record<string, string[]>;

    const db = await getRLSDb();
    const rows = await db
      .select({ contactId: contactTag.contactId, tag: contactTag.tag })
      .from(contactTag)
      .where(
        and(
          eq(contactTag.userId, user.id),
          inArray(contactTag.contactId, contactIds),
        ),
      )
      .orderBy(asc(contactTag.contactId), asc(contactTag.tag));

    const map: Record<string, string[]> = {};
    for (const r of rows) {
      if (!map[r.contactId]) map[r.contactId] = [];
      map[r.contactId].push(r.tag);
    }
    return map;
  } catch (error) {
    console.error("fetchContactTagsForContacts error:", error);
    return {} as Record<string, string[]>;
  }
}

export async function getUserTagsAction() {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Not authenticated" };
    const db = await getRLSDb();

    const cachedFetch = nextCache(
      async (uid: string) => {
        const rows = await db
          .select({ tag: contactTag.tag })
          .from(contactTag)
          .where(eq(contactTag.userId, uid))
          .orderBy(asc(contactTag.tag));
        return Array.from(new Set(rows.map((r) => r.tag)));
      },
      ["user-tags", user.id],
      { tags: [`user-tags-${user.id}`], revalidate: 300 },
    );

    const distinct = await cachedFetch(user.id);
    return { success: true, tags: distinct };
  } catch (error) {
    console.error("getUserTagsAction error:", error);
    return { success: false, error: "Failed to fetch user tags" };
  }
}

export async function syncInstagramContacts(fullSync?: boolean) {
  const user = await getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await assertBillingAllowed(user.id, "contact:mutate");
    console.log("Triggering contact sync for user:", user.id);
    await inngest.send({
      name: "contacts/sync",
      data: {
        userId: user.id,
        fullSync:
          typeof fullSync === "boolean"
            ? fullSync
            : process.env.NODE_ENV !== "production",
      },
    });

    revalidatePath("/contacts");

    return { success: true };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("Error triggering contact sync:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync contacts",
    };
  }
}

export async function fetchConversationMessages(
  accessToken: string,
  conversationId: string,
): Promise<InstagramMessage[]> {
  try {
    console.log(`Fetching messages for conversation: ${conversationId}`);
    const messages = await fetchInstagramConversationMessagesForSync({
      accessToken,
      conversationId,
      limit: DEFAULT_MESSAGE_LIMIT,
    });
    console.log(
      `Retrieved ${messages.length} messages for conversation ${conversationId}`,
    );
    return messages;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Error fetching messages for conversation ${conversationId}:`,
      errorMessage,
    );

    if (error instanceof Error && error.message.includes("token expired")) {
      throw error;
    }

    return [];
  }
}

export async function getContactsLastUpdatedAt(): Promise<string | null> {
  try {
    const user = await getUser();
    if (!user) return null;

    const db = await getRLSDb();
    const rows = await db
      .select({ updatedAt: contact.updatedAt })
      .from(contact)
      .orderBy(desc(contact.updatedAt))
      .limit(1);

    const latest = rows[0]?.updatedAt;
    return latest ? latest.toISOString() : null;
  } catch (error) {
    console.error("Failed to get contacts lastUpdatedAt:", error);
    return null;
  }
}

export async function hasContactsUpdatedSince(
  sinceIso: string,
): Promise<{ updated: boolean }> {
  try {
    const user = await getUser();
    if (!user) return { updated: false };
    const since = new Date(sinceIso);
    if (Number.isNaN(since.getTime())) return { updated: false };

    const db = await getRLSDb();
    const rows = await db
      .select({ id: contact.id })
      .from(contact)
      .where(gt(contact.updatedAt, since))
      .limit(1);

    return { updated: rows.length > 0 };
  } catch (error) {
    console.error("Failed checking contacts updated since:", error);
    return { updated: false };
  }
}

export async function analyzeConversation(
  messages: InstagramMessage[],
  username: string,
  opts?: { userId?: string },
): Promise<AnalysisResult> {
  try {
    console.log(`Analyzing conversation with ${username} using Gemini AI`);

    const formattedMessages = messages
      .map((msg) => {
        const sender = msg.from.username === username ? "Customer" : "Business";
        const sanitizedMessage = sanitizeText(msg.message).slice(0, 500);
        return `${sender}: ${sanitizedMessage}`;
      })
      .join("\n");

    const db = await getRLSDb();
    const userId = opts?.userId || (await getUser())?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const personalized = await getPersonalizedLeadAnalysisPrompt(
      db,
      formattedMessages,
      userId,
    );

    console.log("Sending prompt to Gemini AI");
    const result = await generateText({
      model: geminiModel,
      system: personalized.system,
      prompt: personalized.main,
      temperature: 0,
    });

    console.log("Received response from Gemini AI");

    const analysis = parseJsonResponse<AnalysisResult>(result.text ?? "");

    if (analysis) {
      console.log("Parsed analysis:", analysis);
      return {
        stage: analysis.stage || "new",
        sentiment: analysis.sentiment || "neutral",
        leadScore: analysis.leadScore || 0,
        nextAction: analysis.nextAction || "",
        leadValue: analysis.leadValue || 0,
      };
    } else {
      console.error("Failed to parse Gemini response:", result.text);
      return {
        stage: "new",
        sentiment: "neutral",
        leadScore: 0,
        nextAction: "",
        leadValue: 0,
      };
    }
  } catch (error) {
    console.error("Error analyzing conversation with Gemini:", error);
    return {
      stage: "new",
      sentiment: "neutral",
      leadScore: 0,
      nextAction: "",
      leadValue: 0,
    };
  }
}

export async function batchAnalyzeConversations(
  conversationsData: Array<{ messages: InstagramMessage[]; username: string }>,
  opts?: { userId?: string },
): Promise<AnalysisResult[]> {
  console.log(`Batch analyzing ${conversationsData.length} conversations`);

  const validConversations = conversationsData.filter(
    ({ messages }) => messages.length >= MIN_MESSAGES_PER_CONTACT,
  );

  console.log(
    `Filtered down to ${validConversations.length} valid conversations with enough messages`,
  );

  if (validConversations.length === 0) {
    return [];
  }

  try {
    const analysisPromises = validConversations.map(({ messages, username }) =>
      analyzeConversation(messages, username, opts),
    );

    const results = await Promise.all(analysisPromises);
    return results;
  } catch (error) {
    console.error("Error in parallel conversation analysis:", error);

    const results: AnalysisResult[] = [];
    for (const { messages, username } of validConversations) {
      try {
        const result = await analyzeConversation(messages, username, opts);
        results.push(result);
      } catch (individualError) {
        console.error(`Failed to analyze conversation:`, individualError);
        results.push({
          stage: "new",
          sentiment: "neutral",
          leadScore: 0,
          nextAction: "",
          leadValue: 0,
        });
      }
    }

    return results;
  }
}

async function fetchInstagramIntegration(userId: string) {
  const db = await getRLSDb();
  const integration = await db.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, userId),
  });

  if (!integration || !integration.accessToken) {
    console.log("No Instagram integration found for user");
    return null;
  }

  const now = new Date();
  const exp = integration.expiresAt ? new Date(integration.expiresAt) : null;
  if (exp && exp.getTime() < now.getTime()) {
    console.error(
      `instagram token expired for user ${userId}; skipping sync until reconnected`,
    );
    return null;
  }

  return integration;
}

async function fetchInstagramConversations(accessToken: string) {
  console.log("Fetching conversations from Instagram API");
  const conversations = (await fetchInstagramConversationsForSync({
    accessToken,
  })) as InstagramConversation[];

  const filteredConversations = conversations.filter(
    (item: InstagramConversation) => {
      if (!item || typeof item !== "object") {
        console.warn("Skipping invalid conversation item:", item);
        return false;
      }

      if (
        !item.participants ||
        !item.participants.data ||
        !Array.isArray(item.participants.data)
      ) {
        console.warn(
          "Skipping conversation with invalid participants data:",
          item.id,
        );
        return false;
      }

      return true;
    },
  );

  console.log(`Found ${filteredConversations.length} valid conversations`);
  return filteredConversations;
}

async function enrichConversationsWithMessages(
  conversations: InstagramConversation[],
  accessToken: string,
  username: string,
) {
  const enrichedData: Array<{
    conversation: InstagramConversation;
    participant: InstagramParticipant;
    messages: InstagramMessage[];
    messageTexts: string[];
  }> = [];

  console.log(
    `Processing ${conversations.length} conversations in batches of ${BATCH_SIZE}`,
  );

  const results = await processBatch(
    conversations,
    async (conversation) => {
      const participant = conversation.participants.data.find(
        (p: InstagramParticipant) => p.username !== username,
      );

      if (!participant?.id) {
        return null;
      }

      console.log(
        `Processing contact: ${participant.username || "Unknown"} (${
          participant.id
        })`,
      );

      try {
        const messages = await fetchConversationMessages(
          accessToken,
          conversation.id,
        );
        const messageTexts = messages.map(
          (msg) => `${msg.from.username}: ${msg.message}`,
        );

        if (messages.length >= MIN_MESSAGES_PER_CONTACT) {
          return {
            conversation,
            participant,
            messages,
            messageTexts,
          };
        } else {
          console.log(
            `Not enough messages (${
              messages.length
            }/${MIN_MESSAGES_PER_CONTACT}) found for ${
              participant.username || "Unknown"
            }`,
          );
          return null;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Failed to process conversation ${conversation.id}:`,
          errorMessage,
        );

        if (error instanceof Error && error.message.includes("token expired")) {
          throw error;
        }

        return null;
      }
    },
    BATCH_SIZE,
  );

  for (const result of results) {
    if (result !== null) {
      enrichedData.push(result);
    }
  }

  console.log(
    `Successfully processed ${enrichedData.length} conversations with sufficient messages`,
  );
  return enrichedData;
}

async function storeContacts(
  contactsData: Array<{
    participant: InstagramParticipant;
    lastMessage?: InstagramMessage;
    timestamp: string;
    messageTexts: string[];
    analysis: AnalysisResult;
  }>,
  userId: string,
  existingContactsMap: Map<string, typeof contact.$inferSelect>,
  fullSync: boolean,
) {
  console.log(`Storing ${contactsData.length} contacts in database`);

  const contacts: InstagramContact[] = [];
  const contactsToInsert = [];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const {
    participant,
    lastMessage,
    timestamp,
    messageTexts,
    analysis,
  } of contactsData) {
    const existingContact = existingContactsMap.get(participant.id);
    const lastMessageTime = lastMessage?.created_time
      ? new Date(lastMessage.created_time)
      : new Date(timestamp);

    // calculate if follow-up is needed
    const needsFollowup =
      lastMessageTime < twentyFourHoursAgo && analysis.stage !== "ghosted";

    const contactData = {
      id: participant.id,
      name: participant?.username || "Unknown",
      lastMessage: lastMessage?.message || "",
      timestamp,
      messages: messageTexts,
      ...analysis,
    };

    contacts.push(contactData);

    contactsToInsert.push({
      id: participant.id,
      userId,
      username: participant.username,
      lastMessage: lastMessage?.message || null,
      lastMessageAt: lastMessageTime,
      stage: analysis.stage,
      sentiment: analysis.sentiment,
      leadScore: analysis.leadScore,
      nextAction: analysis.nextAction,
      leadValue: analysis.leadValue,
      triggerMatched: existingContact?.triggerMatched || false,
      followupNeeded: needsFollowup,
      notes: existingContact?.notes || null,
      updatedAt: new Date(),
      createdAt: existingContact?.createdAt || new Date(),
    });
  }

  const db = await getRLSDb();
  let dbPromises: Promise<unknown>[];
  if (fullSync) {
    dbPromises = contactsToInsert.map((contactToInsert) =>
      db
        .insert(contact)
        .values(contactToInsert)
        .onConflictDoUpdate({
          target: contact.id,
          set: {
            username: contactToInsert.username,
            lastMessage: contactToInsert.lastMessage,
            lastMessageAt: contactToInsert.lastMessageAt,
            stage: contactToInsert.stage,
            sentiment: contactToInsert.sentiment,
            leadScore: contactToInsert.leadScore,
            nextAction: contactToInsert.nextAction,
            leadValue: contactToInsert.leadValue,
            followupNeeded: contactToInsert.followupNeeded,
            updatedAt: new Date(),
          },
        }),
    );
  } else {
    dbPromises = contactsToInsert.map((contactToInsert) =>
      db
        .insert(contact)
        .values(contactToInsert)
        .onConflictDoUpdate({
          target: contact.id,
          set: {
            lastMessage: contactToInsert.lastMessage,
            lastMessageAt: contactToInsert.lastMessageAt,
            followupNeeded: contactToInsert.followupNeeded,
            updatedAt: new Date(),
          },
        }),
    );
  }

  await Promise.all(dbPromises);

  console.log(`Updated ${contactsToInsert.length} contacts in database`);
  return contacts;
}

export async function fetchAndStoreInstagramContacts(
  userId: string,
  options?: { fullSync?: boolean },
): Promise<InstagramContact[]> {
  try {
    console.log(
      `Starting to fetch and store Instagram contacts for user: ${userId}`,
    );
    const startTime = Date.now();

    // Step 1: Fetch Instagram integration
    const integration = await fetchInstagramIntegration(userId);
    if (!integration) {
      return [];
    }

    // Step 2: Fetch conversations from Instagram API
    const conversations = await fetchInstagramConversations(
      integration.accessToken,
    );

    // Step 3: Determine which conversations to process based on sync mode
    const allParticipants = conversations
      .map((conversation) =>
        conversation.participants.data.find(
          (p: InstagramParticipant) => p.username !== integration.username,
        ),
      )
      .filter(Boolean) as InstagramParticipant[];

    const participantIds = allParticipants.map((p) => p.id);

    // Step 4: Batch fetch existing contacts to avoid N+1 query problem
    const db = await getRLSDb();
    const existingContacts = await db.query.contact.findMany({
      where: and(
        eq(contact.userId, userId),
        inArray(contact.id, participantIds),
      ),
    });

    const existingContactsMap = new Map(existingContacts.map((c) => [c.id, c]));

    const fullSync = options?.fullSync ?? process.env.NODE_ENV !== "production";
    const targetConversations = fullSync
      ? conversations
      : conversations.filter((conversation) => {
          const p = conversation.participants.data.find(
            (pp: InstagramParticipant) => pp.username !== integration.username,
          );
          if (!p?.id) return false;
          const notSeenBefore = !existingContactsMap.has(p.id);
          const lastSynced = integration.lastSyncedAt
            ? new Date(integration.lastSyncedAt)
            : null;
          if (!lastSynced) return true;
          const updatedAt = new Date(conversation.updated_time);
          return notSeenBefore || updatedAt > lastSynced;
        });

    if (!fullSync && targetConversations.length === 0) {
      console.log(
        "No new contacts to sync in incremental mode; updating follow-up flags and skipping AI and message fetch.",
      );

      try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000,
        );

        const existing = await db.query.contact.findMany({
          where: eq(contact.userId, userId),
        });

        const idsToSetTrue: string[] = [];
        const idsToSetFalse: string[] = [];

        for (const c of existing) {
          const lastAt = c.lastMessageAt ? new Date(c.lastMessageAt) : null;
          const shouldFollow =
            !!lastAt && lastAt < twentyFourHoursAgo && c.stage !== "ghosted";
          if (shouldFollow && !c.followupNeeded) idsToSetTrue.push(c.id);
          if (!shouldFollow && c.followupNeeded) idsToSetFalse.push(c.id);
        }

        if (idsToSetTrue.length > 0) {
          await db
            .update(contact)
            .set({ followupNeeded: true, updatedAt: new Date() })
            .where(
              and(
                eq(contact.userId, userId),
                inArray(contact.id, idsToSetTrue),
              ),
            );
        }

        if (idsToSetFalse.length > 0) {
          await db
            .update(contact)
            .set({ followupNeeded: false, updatedAt: new Date() })
            .where(
              and(
                eq(contact.userId, userId),
                inArray(contact.id, idsToSetFalse),
              ),
            );
        }

        console.log(
          `Updated follow-up flags: set true for ${idsToSetTrue.length}, set false for ${idsToSetFalse.length}`,
        );
      } catch (e) {
        console.error(
          "Failed to update follow-up flags in incremental no-op path",
          e,
        );
      }

      return [];
    }

    // Step 5: Enrich conversations with messages (only for target conversations)
    const enrichedData = await enrichConversationsWithMessages(
      targetConversations,
      integration.accessToken,
      integration.username,
    );

    // Step 6: Analyze conversations (only those we are processing)
    console.log(`Analyzing ${enrichedData.length} conversations with messages`);
    const analysisResults = await batchAnalyzeConversations(
      enrichedData.map(({ messages, participant }) => ({
        messages,
        username: participant.username,
      })),
      { userId },
    );

    // Step 7: Prepare and store contacts
    const contactsData = enrichedData.map((data, index) => {
      const lastMessage = data.conversation.messages?.data?.[0];
      return {
        participant: data.participant,
        lastMessage,
        timestamp: lastMessage?.created_time || data.conversation.updated_time,
        messageTexts: data.messageTexts,
        analysis: analysisResults[index],
      };
    });

    // Step 8: Store contacts in database (mode-aware)
    const contacts = await storeContacts(
      contactsData,
      userId,
      existingContactsMap,
      fullSync,
    );

    // Step 9: update lastSyncedAt for the integration when incremental
    await db
      .update(instagramIntegration)
      .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(instagramIntegration.userId, userId));

    const endTime = Date.now();
    console.log(
      `Processed ${contacts.length} contacts in total in ${
        (endTime - startTime) / 1000
      } seconds`,
    );
    return contacts;
  } catch (error: unknown) {
    const axiosError = error as {
      message?: string;
      response?: { status: number };
    };
    console.error("Failed to fetch Instagram contacts:", {
      message: axiosError.message || "Unknown error",
      status: axiosError.response?.status,
      userId,
      fullSync: options?.fullSync,
    });

    if (axiosError.message?.includes("token expired")) {
      throw error;
    }

    return [];
  }
}

export async function generateFollowUpMessage(contactId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    await assertBillingAllowed(user.id, "contact:mutate");

    const db = await getRLSDb();
    const contactData = await db.query.contact.findFirst({
      where: and(eq(contact.id, contactId), eq(contact.userId, user.id)),
    });

    if (!contactData) {
      return { success: false, error: "Contact not found" };
    }

    const integration = await db.query.instagramIntegration.findFirst({
      where: eq(instagramIntegration.userId, user.id),
    });

    if (!integration?.accessToken) {
      return { success: false, error: "No Instagram integration found" };
    }

    const settings = await db.query.sidekickSetting.findFirst({
      where: eq(sidekickSetting.userId, user.id),
    });

    const systemPrompt = settings?.systemPrompt || DEFAULT_SIDEKICK_PROMPT;

    // fetch last 10 messages for context
    const messages = await fetchConversationMessages(
      integration.accessToken,
      contactId,
    );

    const conversationHistory = messages
      .slice(0, 10)
      .map((msg) => {
        const sender =
          msg.from.username === integration.username ? "Business" : "Customer";
        const sanitizedMessage = sanitizeText(msg.message).slice(0, 500);
        return `${sender}: ${sanitizedMessage}`;
      })
      .join("\n");

    const personalized = await getPersonalizedFollowUpPrompt(
      db,
      {
        userId: user.id,
        customerName: contactData.username || "Unknown",
        stage: contactData.stage || "new",
        leadScore: contactData.leadScore || 0,
        lastMessage: contactData.lastMessage || "No previous message",
        conversationHistory,
      },
    );

    const aiResult = await generateText({
      model: geminiModel,
      system: systemPrompt || personalized.system,
      prompt: personalized.main,
      temperature: 0.4,
    });

    const followUpText = sanitizeText(aiResult.text).slice(0, 280);

    if (!followUpText) {
      return { success: false, error: "Failed to generate follow-up message" };
    }

    await db
      .update(contact)
      .set({
        followupMessage: followUpText,
        updatedAt: new Date(),
      })
      .where(and(eq(contact.id, contactId), eq(contact.userId, user.id)));

    revalidatePath("/contacts");
    return { success: true, message: followUpText };
  } catch (error) {
    if (error instanceof BillingLimitError) {
      return { success: false, error: error.message };
    }

    console.error("Error generating follow-up message:", error);
    return { success: false, error: "Failed to generate follow-up message" };
  }
}

