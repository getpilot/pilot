"use server";

import { auth } from "@/lib/auth";
import { getRLSDb } from "@/lib/auth-utils";
import { sanitizeText } from "@/lib/utils";
import { getInstagramIntegration } from "@/actions/instagram";
import { instagramIntegration, user } from "@pilot/db/schema";
import { generateText, geminiModel } from "@pilot/core/ai/model";
import { getPersonalizedAutoReplyPrompt } from "@pilot/core/sidekick/personalization";
import { fetchConversationsForSync } from "@pilot/instagram";
import type {
  InstagramConversation,
  InstagramMessage,
  InstagramParticipant,
} from "@pilot/types/instagram";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type OnboardingPreviewMessage = {
  direction: "incoming" | "outgoing";
  sender: string;
  text: string;
  timestamp: string;
};

type OnboardingPreviewData = {
  accountUsername: string;
  conversationCount: number;
  previewMessages: OnboardingPreviewMessage[];
  previewTarget: string;
  pulledDmCount: number;
  replyPreview: string;
  source: "live" | "starter";
};

function getLeadParticipant(
  conversation: InstagramConversation,
  integration: {
    appScopedUserId: string | null;
    instagramUserId: string;
    username: string;
  },
): InstagramParticipant | undefined {
  return conversation.participants.data.find((participant) => {
    return (
      participant.id !== integration.instagramUserId &&
      participant.id !== integration.appScopedUserId &&
      participant.username !== integration.username
    );
  });
}

function isBusinessMessage(message: InstagramMessage, businessUsername: string) {
  return message.from.username === businessUsername;
}

function getTextMessages(messages: InstagramMessage[]) {
  return messages
    .filter(
      (message) =>
        typeof message.message === "string" &&
        message.message.trim().length > 0,
    )
    .sort((left, right) => {
      const leftTime = new Date(left.created_time).getTime();
      const rightTime = new Date(right.created_time).getTime();

      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
        return 0;
      }

      return leftTime - rightTime;
    });
}

function buildPreviewMessages(params: {
  businessUsername: string;
  leadName: string;
  messages: InstagramMessage[];
}): OnboardingPreviewMessage[] {
  const textMessages = getTextMessages(params.messages);

  const lastIncomingIndex = [...textMessages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(
      ({ message }) => !isBusinessMessage(message, params.businessUsername),
    )?.index;

  if (lastIncomingIndex === undefined) {
    return [];
  }

  const hasBusinessReplyBeforeLatestIncoming = textMessages
    .slice(0, lastIncomingIndex)
    .some((message) => isBusinessMessage(message, params.businessUsername));

  if (!hasBusinessReplyBeforeLatestIncoming) {
    return [];
  }

  return textMessages
    .slice(Math.max(0, lastIncomingIndex - 5), lastIncomingIndex + 1)
    .map((message) => {
      const isBusinessReply = isBusinessMessage(
        message,
        params.businessUsername,
      );

      return {
        direction: isBusinessReply ? "outgoing" : "incoming",
        sender: isBusinessReply ? "You" : params.leadName,
        text: sanitizeText(message.message).slice(0, 280),
        timestamp: message.created_time,
      };
    });
}

function buildConversationContext(messages: OnboardingPreviewMessage[]) {
  return messages
    .map((message) => `${message.sender}: ${message.text}`)
    .join("\n");
}

function buildFallbackPreview(accountUsername: string): OnboardingPreviewData {
  return {
    accountUsername,
    conversationCount: 0,
    previewMessages: [
      {
        direction: "incoming",
        sender: "Lead",
        text: "Hey, is this still available? I'd love the details.",
        timestamp: new Date().toISOString(),
      },
    ],
    previewTarget: "Lead",
    pulledDmCount: 0,
    replyPreview:
      "Yep, it is. I can send the details here and point you to the best next step based on what you're looking for.",
    source: "starter",
  };
}

async function buildReplyPreview(params: {
  conversationContext: string;
  fallbackReply: string;
  userId: string;
}) {
  try {
    const db = await getRLSDb();
    const personalized = await getPersonalizedAutoReplyPrompt(
      db,
      params.conversationContext,
      params.userId,
    );
    const aiResult = await generateText({
      model: geminiModel,
      system: personalized.system,
      prompt: personalized.main,
      temperature: 0.4,
    });

    const reply = sanitizeText(aiResult.text).slice(0, 280);
    return reply || params.fallbackReply;
  } catch (error) {
    console.error("Error generating onboarding preview reply:", error);
    return params.fallbackReply;
  }
}

function selectPreviewConversation(
  conversations: InstagramConversation[],
  integration: {
    appScopedUserId: string | null;
    instagramUserId: string;
    username: string;
  },
  userName?: string | null,
) {
  for (const conversation of conversations) {
    if (!Array.isArray(conversation.messages?.data)) {
      continue;
    }

    const leadParticipant = getLeadParticipant(conversation, integration) ?? {
      id: "lead",
      username: userName ? `${userName}'s lead` : "Lead",
    };

    const previewMessages = buildPreviewMessages({
      businessUsername: integration.username,
      leadName: leadParticipant.username,
      messages: conversation.messages.data,
    });

    if (previewMessages.length === 0) {
      continue;
    }

    return {
      conversation,
      leadParticipant,
      previewMessages,
    };
  }

  return null;
}

export async function getUserData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .then((res) => res[0]);

    return { success: true, userData };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { success: false, error: "Failed to fetch user data" };
  }
}

export async function updateOnboardingStep(
  formData: Record<string, string | string[]>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    await db.update(user).set(formData).where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating onboarding data:", error);
    return { success: false, error: "Failed to update onboarding data" };
  }
}

export async function completeOnboarding() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    await db
      .update(user)
      .set({ onboarding_complete: true })
      .where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

export async function checkOnboardingStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const userData = await db
      .select({ onboarding_complete: user.onboarding_complete })
      .from(user)
      .where(eq(user.id, session.user.id))
      .then((res) => res[0]);

    return { onboarding_complete: userData?.onboarding_complete || false };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return {
      onboarding_complete: false,
      error: "Failed to check onboarding status",
    };
  }
}

export async function getInstagramOnboardingState() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const integration = await getInstagramIntegration();

    if (!integration.connected) {
      return { connected: false } as const;
    }

    return {
      connected: true,
      username: integration.username,
    } as const;
  } catch (error) {
    console.error("Error checking Instagram onboarding state:", error);
    return {
      connected: false,
      error: "Failed to check Instagram connection",
    } as const;
  }
}

export async function prepareInstagramPreview() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const [integration, userData] = await Promise.all([
      db.query.instagramIntegration.findFirst({
        where: eq(instagramIntegration.userId, session.user.id),
      }),
      db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, session.user.id))
        .then((rows) => rows[0]),
    ]);

    if (!integration) {
      return {
        success: false,
        connected: false,
        error: "Instagram is not connected",
      } as const;
    }

    const fallback = buildFallbackPreview(integration.username);

    const conversations = await fetchConversationsForSync({
      accessToken: integration.accessToken,
      igUserId: integration.instagramUserId,
    }).catch((error) => {
      console.error("Error fetching Instagram preview conversations:", error);
      return [] as InstagramConversation[];
    });

    const recentConversations = conversations
      .filter((conversation) => Array.isArray(conversation.messages?.data))
      .slice(0, 12);

    const previewSelection = selectPreviewConversation(
      recentConversations,
      {
        appScopedUserId: integration.appScopedUserId,
        instagramUserId: integration.instagramUserId,
        username: integration.username,
      },
      userData?.name,
    );

    if (!previewSelection) {
      return {
        success: true,
        connected: true,
        data: fallback,
      } as const;
    }

    const { leadParticipant, previewMessages } = previewSelection;

    const conversationContext = buildConversationContext(previewMessages);
    const fallbackReply =
      "Absolutely. I can walk you through the details here and help you figure out the best next step.";
    const replyPreview = await buildReplyPreview({
      conversationContext,
      fallbackReply,
      userId: session.user.id,
    });

    const pulledDmCount = Math.min(
      recentConversations.reduce((total, conversation) => {
        return (
          total +
          (Array.isArray(conversation.messages?.data)
            ? conversation.messages.data.filter(
                (message) =>
                  typeof message.message === "string" &&
                  message.message.trim().length > 0,
              ).length
            : 0)
        );
      }, 0),
      20,
    );

    return {
      success: true,
      connected: true,
      data: {
        accountUsername: integration.username,
        conversationCount: recentConversations.length,
        previewMessages,
        previewTarget: leadParticipant.username,
        pulledDmCount,
        replyPreview,
        source: "live",
      },
    } as const;
  } catch (error) {
    console.error("Error preparing Instagram preview:", error);
    return {
      success: false,
      connected: true,
      error: "Failed to prepare your Instagram preview",
    } as const;
  }
}
