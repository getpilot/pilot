import { automation, contact, instagramIntegration, sidekickActionLog } from "@pilot/db/schema";
import { and, desc, eq, gt, or } from "drizzle-orm";
import {
  postPublicCommentReply,
  sendInstagramCommentGenericTemplate,
  sendInstagramCommentReply,
  sendInstagramMessage,
} from "@pilot/instagram";
import type { CommentChange } from "@pilot/types/instagram";
import { checkTriggerMatch, logAutomationUsage } from "../automation/matching";
import { generateAutomationResponse } from "../automation/response";
import { classifyHumanResponseNeeded } from "../ai/hrn";
import { generateReply } from "../sidekick/reply";

type GenericTemplateButton = {
  type: string;
  title: string;
  url?: string;
};

type GenericTemplateElement = {
  title?: string;
  text?: string;
  image_url?: string;
  subtitle?: string;
  default_action?: { type: "web_url"; url: string };
  buttons?: GenericTemplateButton[];
  [key: string]: unknown;
};

type InstagramWebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp?: number;
      message?: { text?: string; mid?: string; is_echo?: boolean };
    }>;
    changes?: Array<unknown>;
  }>;
};

type BillingWebhookStatus = {
  flags: {
    isStructurallyFrozen: boolean;
    canCreateContact: boolean;
    canSendSidekickReply: boolean;
  };
};

async function upsertContactState(params: {
  dbClient: any;
  contactId: string;
  userId: string;
  messageText: string;
  stage: "new" | "lead" | "follow-up" | "ghosted";
  sentiment: "hot" | "warm" | "cold" | "ghosted" | "neutral";
  leadScore: number;
  requiresHRN: boolean;
  humanResponseSetAt?: Date | null;
}) {
  const now = new Date();
  const hrnSetAt =
    params.humanResponseSetAt !== undefined
      ? params.humanResponseSetAt
      : params.requiresHRN
        ? now
        : null;

  await params.dbClient
    .insert(contact)
    .values({
      id: params.contactId,
      userId: params.userId,
      username: null,
      lastMessage: params.messageText,
      lastMessageAt: now,
      stage: params.stage,
      sentiment: params.sentiment,
      leadScore: params.leadScore,
      requiresHumanResponse: params.requiresHRN,
      humanResponseSetAt: hrnSetAt ?? null,
      updatedAt: now,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: contact.id,
      set: {
        lastMessage: params.messageText,
        lastMessageAt: now,
        stage: params.stage,
        sentiment: params.sentiment,
        leadScore: params.leadScore,
        requiresHumanResponse: params.requiresHRN,
        humanResponseSetAt: hrnSetAt ?? null,
        updatedAt: now,
      },
    });
}

function isValidTemplateElement(value: unknown): value is GenericTemplateElement {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  const titleOrText = record.title ?? record.text;
  const hasTitleOrText = typeof titleOrText === "string" && titleOrText.trim().length > 0;
  if (!hasTitleOrText) {
    return false;
  }

  return record.buttons === undefined || Array.isArray(record.buttons);
}

function normalizeTemplateElements(rawElements: GenericTemplateElement[]) {
  return rawElements.map((rawElement) => ({
    title:
      typeof rawElement.title === "string" && rawElement.title
        ? rawElement.title
        : (rawElement.text as string),
    subtitle: typeof rawElement.subtitle === "string" ? rawElement.subtitle : undefined,
    image_url: typeof rawElement.image_url === "string" ? rawElement.image_url : undefined,
    default_action:
      rawElement.default_action &&
      rawElement.default_action.type === "web_url" &&
      typeof rawElement.default_action.url === "string"
        ? { type: "web_url" as const, url: rawElement.default_action.url }
        : undefined,
    buttons: Array.isArray(rawElement.buttons)
      ? rawElement.buttons
          .filter(
            (button): button is { type: "web_url"; url: string; title: string } =>
              !!button &&
              typeof button === "object" &&
              button.type === "web_url" &&
              typeof button.url === "string" &&
              typeof button.title === "string",
          )
          .map((button) => ({
            type: "web_url" as const,
            url: button.url,
            title: button.title,
          }))
      : undefined,
  }));
}

async function processCommentChanges(params: {
  dbClient: any;
  changes: CommentChange[];
  igUserId: string | undefined;
  resolveBillingStatus: (userId: string) => Promise<BillingWebhookStatus>;
}) {
  for (const change of params.changes) {
    const value = change?.value;
    if (change?.field !== "comments" || !value || typeof value !== "object") {
      continue;
    }

    const commentId = typeof value.id === "string" ? value.id : undefined;
    const commenterId = typeof value.from?.id === "string" ? value.from.id : undefined;
    const messageText = typeof value.text === "string" ? value.text : "";

    if (!params.igUserId || !commenterId || !messageText) {
      continue;
    }

    const integration = await params.dbClient.query.instagramIntegration.findFirst({
      where: or(
        eq(instagramIntegration.instagramUserId, params.igUserId),
        eq(instagramIntegration.appScopedUserId, params.igUserId),
      ),
    });
    if (!integration) {
      continue;
    }

    const billingStatus = await params.resolveBillingStatus(integration.userId);
    if (!billingStatus.flags.canSendSidekickReply) {
      continue;
    }

    const matchedAutomation = await checkTriggerMatch({
      dbClient: params.dbClient,
      messageText,
      userId: integration.userId,
      scope: "comment",
    });

    if (!matchedAutomation || !commentId) {
      continue;
    }

    let replyText = "";
    if (matchedAutomation.responseType === "fixed") {
      replyText = matchedAutomation.responseContent;
    } else if (matchedAutomation.responseType === "ai_prompt") {
      const aiResponse = await generateAutomationResponse({
        prompt: matchedAutomation.responseContent,
        userMessage: messageText,
      });
      replyText = aiResponse?.text || "Thanks for your comment! We'll follow up in DMs.";
    }

    let sendResponse:
      | { status: number; data?: { id?: string; message_id?: string } }
      | undefined;

    if (matchedAutomation.responseType === "generic_template") {
      try {
        const parsed = JSON.parse(matchedAutomation.responseContent) as unknown;
        const elements = Array.isArray(parsed) ? parsed.filter(isValidTemplateElement) : [];
        if (elements.length > 0) {
          const normalized = normalizeTemplateElements(elements);
          sendResponse = await sendInstagramCommentGenericTemplate({
            igUserId: integration.instagramUserId || params.igUserId,
            commentId,
            accessToken: integration.accessToken,
            elements: normalized,
          });
        }
      } catch (error) {
        console.error("invalid generic_template payload", error);
      }
    }

    if (!sendResponse && replyText) {
      sendResponse = await sendInstagramCommentReply({
        igUserId: integration.instagramUserId || params.igUserId,
        commentId,
        accessToken: integration.accessToken,
        text: replyText,
      });
    }

    const messageId = sendResponse?.data?.id || sendResponse?.data?.message_id;
    const threadId = `${params.igUserId}:comment:${commentId}`;

    await logAutomationUsage(params.dbClient, {
      userId: integration.userId,
      platform: "instagram",
      threadId,
      recipientId: commenterId,
      automationId: matchedAutomation.id,
      triggerWord: matchedAutomation.triggerWord,
      action: "comment_automation_triggered",
      text: replyText,
      messageId,
    });

    const commentReplyText = (matchedAutomation as { commentReplyText?: string | null }).commentReplyText;
    if (commentReplyText && commentReplyText.trim()) {
      try {
        await postPublicCommentReply({
          commentId,
          accessToken: integration.accessToken,
          message: commentReplyText,
        });
      } catch (error) {
        console.error("failed to send public comment reply", error);
      }
    }
  }
}

async function processDirectMessage(params: {
  dbClient: any;
  inngestClient: any;
  igUserId: string;
  senderId: string;
  messageText: string;
  webhookMid?: string | null;
  resolveBillingStatus: (userId: string) => Promise<BillingWebhookStatus>;
}) {
  const integration = await params.dbClient.query.instagramIntegration.findFirst({
    where: or(
      eq(instagramIntegration.instagramUserId, params.igUserId),
      eq(instagramIntegration.appScopedUserId, params.igUserId),
    ),
  });

  if (!integration) {
    return { status: "ok" } as const;
  }

  const threadId = `${integration.instagramUserId || params.igUserId}:${params.senderId}`;
  const fallbackWindowStart = new Date(Date.now() - 30000);

  if (params.webhookMid) {
    const duplicateMid = await params.dbClient
      .select()
      .from(sidekickActionLog)
      .where(
        and(
          eq(sidekickActionLog.userId, integration.userId),
          eq(sidekickActionLog.webhookMid, params.webhookMid),
        ),
      )
      .limit(1);

    if (duplicateMid.length > 0) {
      return { status: "ok" } as const;
    }
  }

  if (!params.webhookMid) {
    const recent = await params.dbClient
      .select()
      .from(sidekickActionLog)
      .where(
        and(
          eq(sidekickActionLog.userId, integration.userId),
          eq(sidekickActionLog.threadId, threadId),
          gt(sidekickActionLog.createdAt, fallbackWindowStart),
        ),
      )
      .orderBy(desc(sidekickActionLog.createdAt))
      .limit(1);

    if (recent.length > 0) {
      return { status: "ok" } as const;
    }
  }

  const billingStatus = await params.resolveBillingStatus(integration.userId);

  if (billingStatus.flags.isStructurallyFrozen) {
    return { status: "ok", frozen: true } as const;
  }

  const existingContact = await params.dbClient.query.contact.findFirst({
    where: and(eq(contact.userId, integration.userId), eq(contact.id, params.senderId)),
  });

  if (!existingContact && !billingStatus.flags.canCreateContact) {
    return { status: "ok", blocked: true } as const;
  }

  if (existingContact?.requiresHumanResponse) {
    const now = new Date();
    await upsertContactState({
      dbClient: params.dbClient,
      contactId: params.senderId,
      userId: integration.userId,
      messageText: params.messageText,
      stage: existingContact.stage ?? "new",
      sentiment: existingContact.sentiment ?? "neutral",
      leadScore: existingContact.leadScore ?? 50,
      requiresHRN: true,
      humanResponseSetAt: existingContact.humanResponseSetAt ?? now,
    });
    return { status: "ok", hrn: true } as const;
  }

  const hrnDecision = await classifyHumanResponseNeeded({ message: params.messageText });
  if (hrnDecision.hrn) {
    await upsertContactState({
      dbClient: params.dbClient,
      contactId: params.senderId,
      userId: integration.userId,
      messageText: params.messageText,
      stage: existingContact?.stage ?? "new",
      sentiment: existingContact?.sentiment ?? "neutral",
      leadScore: existingContact?.leadScore ?? 50,
      requiresHRN: true,
      humanResponseSetAt: new Date(),
    });
    return { status: "ok", hrn: true } as const;
  }

  const matchedAutomation = await checkTriggerMatch({
    dbClient: params.dbClient,
    messageText: params.messageText,
    userId: integration.userId,
    scope: "dm",
  });

  if (matchedAutomation?.hrnEnforced) {
    await upsertContactState({
      dbClient: params.dbClient,
      contactId: params.senderId,
      userId: integration.userId,
      messageText: params.messageText,
      stage: existingContact?.stage ?? "new",
      sentiment: existingContact?.sentiment ?? "neutral",
      leadScore: existingContact?.leadScore ?? 50,
      requiresHRN: true,
      humanResponseSetAt: new Date(),
    });
    return { status: "ok", hrn: true, automationHrn: true } as const;
  }

  let replyText = "";
  if (matchedAutomation?.responseType === "fixed") {
    replyText = matchedAutomation.responseContent;
  } else if (matchedAutomation?.responseType === "ai_prompt") {
    const aiResponse = await generateAutomationResponse({
      prompt: matchedAutomation.responseContent,
      userMessage: params.messageText,
    });
    replyText = aiResponse?.text || "";
  }

  if (!replyText) {
    const reply = await generateReply({
      dbClient: params.dbClient,
      userId: integration.userId,
      senderId: params.senderId,
      text: params.messageText,
      accessToken: integration.accessToken,
      igUserId: integration.instagramUserId || params.igUserId,
    });

    if (!reply) {
      return { status: "ok" } as const;
    }

    replyText = reply.text;
  }

  if (!billingStatus.flags.canSendSidekickReply) {
    await upsertContactState({
      dbClient: params.dbClient,
      contactId: params.senderId,
      userId: integration.userId,
      messageText: params.messageText,
      stage: existingContact?.stage ?? "new",
      sentiment: existingContact?.sentiment ?? "neutral",
      leadScore: existingContact?.leadScore ?? 50,
      requiresHRN: existingContact?.requiresHumanResponse ?? false,
      humanResponseSetAt: existingContact?.humanResponseSetAt ?? null,
    });
    return { status: "ok", sendBlocked: true } as const;
  }

  const sendResponse = await sendInstagramMessage({
    igUserId: integration.instagramUserId || params.igUserId,
    recipientId: params.senderId,
    accessToken: integration.accessToken,
    text: replyText,
  });

  const delivered = sendResponse.status >= 200 && sendResponse.status < 300;
  const messageId =
    (sendResponse.data as { id?: string; message_id?: string } | undefined)?.id ||
    (sendResponse.data as { id?: string; message_id?: string } | undefined)?.message_id;
  const now = new Date();

  await params.dbClient
    .insert(contact)
    .values({
      id: params.senderId,
      userId: integration.userId,
      username: null,
      lastMessage: params.messageText,
      lastMessageAt: now,
      stage: existingContact?.stage ?? "new",
      sentiment: existingContact?.sentiment ?? "neutral",
      leadScore: existingContact?.leadScore ?? 50,
      updatedAt: now,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: contact.id,
      set: {
        lastMessage: params.messageText,
        lastMessageAt: now,
        stage: existingContact?.stage ?? "new",
        sentiment: existingContact?.sentiment ?? "neutral",
        leadScore: existingContact?.leadScore ?? 50,
        updatedAt: now,
      },
    });

  const actionLogId = crypto.randomUUID();
  await params.dbClient.insert(sidekickActionLog).values({
    id: actionLogId,
    userId: integration.userId,
    platform: "instagram",
    threadId,
    recipientId: params.senderId,
    action: "sent_reply",
    text: replyText,
    result: delivered ? "sent" : "failed",
    createdAt: now,
    messageId,
    webhookMid: params.webhookMid ?? undefined,
  });

  if (!delivered) {
    try {
      await params.inngestClient.send({
        name: "instagram/send-failed",
        data: {
          igUserId: integration.instagramUserId || params.igUserId,
          recipientId: params.senderId,
          integrationId: integration.id,
          text: replyText,
          userId: integration.userId,
          threadId,
          actionLogId,
        },
      });
    } catch (error) {
      console.error("Failed to queue dead-letter send", error);
    }
  }

  if (matchedAutomation) {
    const scope = matchedAutomation.triggerScope || "dm";
    const action =
      scope === "both"
        ? "dm_and_comment_automation_triggered"
        : scope === "comment"
          ? "comment_automation_triggered"
          : "dm_automation_triggered";

    await logAutomationUsage(params.dbClient, {
      userId: integration.userId,
      platform: "instagram",
      threadId,
      recipientId: params.senderId,
      automationId: matchedAutomation.id,
      triggerWord: matchedAutomation.triggerWord,
      action,
      text: replyText,
      messageId,
    });
  }

  return { status: "ok" } as const;
}

export async function processInstagramWebhook(params: {
  dbClient: any;
  inngestClient: any;
  payload: InstagramWebhookPayload;
  resolveBillingStatus: (userId: string) => Promise<BillingWebhookStatus>;
}) {
  const entry = params.payload.entry?.[0];
  const changes = Array.isArray(entry?.changes)
    ? (entry.changes as Array<CommentChange>)
    : undefined;

  if (changes && changes.length > 0) {
    await processCommentChanges({
      dbClient: params.dbClient,
      changes,
      igUserId: entry?.id,
      resolveBillingStatus: params.resolveBillingStatus,
    });
    return { status: "ok" } as const;
  }

  const message = entry?.messaging?.[0];
  const senderId = message?.sender?.id;
  const messageText = message?.message?.text || "";
  const isEcho = Boolean(message?.message?.is_echo);

  if (!entry?.id || !senderId || !messageText || isEcho || senderId === entry.id) {
    return { status: "ok" } as const;
  }

  try {
    return await processDirectMessage({
      dbClient: params.dbClient,
      inngestClient: params.inngestClient,
      igUserId: entry.id,
      senderId,
      messageText,
      webhookMid: message?.message?.mid || null,
      resolveBillingStatus: params.resolveBillingStatus,
    });
  } catch (error) {
    console.error("generateReply/send flow failed", error);
    return { status: "ok" } as const;
  }
}
