import { automation, automationActionLog, automationPost } from "@pilot/db/schema";
import { and, eq, gt, inArray, isNull, or } from "drizzle-orm";

export type AutomationRecord = typeof automation.$inferSelect;

export async function getActiveAutomations(
  dbClient: any,
  userId: string,
): Promise<AutomationRecord[]> {
  return dbClient
    .select()
    .from(automation)
    .where(
      and(
        eq(automation.userId, userId),
        eq(automation.isActive, true),
        or(isNull(automation.expiresAt), gt(automation.expiresAt, new Date())),
      ),
    );
}

export async function checkTriggerMatch(params: {
  dbClient: any;
  messageText: string;
  userId: string;
  scope?: "dm" | "comment";
  postId?: string | null;
}): Promise<AutomationRecord | null> {
  const { dbClient, messageText, userId, scope = "dm", postId } = params;
  const activeAutomations = await getActiveAutomations(dbClient, userId);
  const lowerMessage = messageText.toLowerCase();
  const postIdsByAutomationId = new Map<string, string>();

  if (scope === "comment" && activeAutomations.length > 0) {
    const scopedPosts = await dbClient
      .select({
        automationId: automationPost.automationId,
        postId: automationPost.postId,
      })
      .from(automationPost)
      .where(
        inArray(
          automationPost.automationId,
          activeAutomations.map((record) => record.id),
        ),
      );

    for (const scopedPost of scopedPosts) {
      postIdsByAutomationId.set(scopedPost.automationId, scopedPost.postId);
    }
  }

  for (const automationRecord of activeAutomations) {
    const trigger = automationRecord.triggerWord?.toLowerCase?.() ?? "";
    if (!trigger) {
      continue;
    }

    const triggerScope = automationRecord.triggerScope || "dm";
    const scopeMatches =
      triggerScope === "both" ||
      triggerScope === scope ||
      (scope === "dm" && !triggerScope);
    const postMatches =
      scope !== "comment" ||
      !postIdsByAutomationId.has(automationRecord.id) ||
      postIdsByAutomationId.get(automationRecord.id) === postId;

    if (scopeMatches && postMatches && lowerMessage.includes(trigger)) {
      return automationRecord;
    }
  }

  return null;
}

export async function logAutomationUsage(
  dbClient: any,
  params: {
    userId: string;
    platform: "instagram";
    threadId: string;
    recipientId: string;
    automationId: string;
    triggerWord: string;
    action:
      | "dm_automation_triggered"
      | "comment_automation_triggered"
      | "dm_and_comment_automation_triggered";
    text?: string;
    messageId?: string;
  },
): Promise<void> {
  await dbClient.insert(automationActionLog).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    platform: params.platform,
    threadId: params.threadId,
    recipientId: params.recipientId,
    automationId: params.automationId,
    triggerWord: params.triggerWord,
    action: params.action,
    text: params.text ?? null,
    messageId: params.messageId,
    createdAt: new Date(),
  });
}
