"use server";

import {
  automation,
  automationActionLog,
  contact,
  automationPost,
} from "@pilot/db/schema";
import { and, eq, desc, gt, isNull, or, ne } from "drizzle-orm";
import { getUser, getRLSDb } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { assertBillingAllowed } from "@/lib/billing/enforce";

export type Automation = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  triggerWord: string;
  responseType: "fixed" | "ai_prompt" | "generic_template";
  responseContent: string;
  isActive: boolean | null;
  expiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  triggerScope: "dm" | "comment" | "both" | null;
  commentReplyCount: number | null;
  commentReplyText?: string | null;
  hrnEnforced?: boolean | null;
};

export type CreateAutomationData = {
  title: string;
  description?: string;
  triggerWord: string;
  responseType: "fixed" | "ai_prompt" | "generic_template";
  responseContent: string;
  expiresAt?: Date;
  triggerScope?: "dm" | "comment" | "both";
  postId?: string;
  commentReplyText?: string;
  hrnEnforced?: boolean;
};

export type UpdateAutomationData = Partial<CreateAutomationData> & {
  isActive?: boolean;
};

export type AutomationLogItem = {
  id: string;
  userId: string;
  platform: "instagram";
  threadId: string;
  recipientId: string;
  recipientUsername: string;
  automationId: string;
  automationTitle: string;
  triggerWord: string;
  action:
    | "dm_automation_triggered"
    | "comment_automation_triggered"
    | "dm_and_comment_automation_triggered";
  text: string | null;
  messageId: string | null;
  createdAt: Date | null;
};

export async function getAutomations(): Promise<Automation[]> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = await getRLSDb();
  const automations = await db
    .select()
    .from(automation)
    .where(eq(automation.userId, user.id))
    .orderBy(desc(automation.createdAt));

  return automations;
}

export async function getAutomation(id: string): Promise<Automation | null> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = await getRLSDb();
  const result = await db
    .select()
    .from(automation)
    .where(and(eq(automation.id, id), eq(automation.userId, user.id)))
    .limit(1);

  return result[0] || null;
}

export async function getAutomationPostId(
  automationId: string
): Promise<string | null> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = await getRLSDb();
  const result = await db
    .select()
    .from(automationPost)
    .where(eq(automationPost.automationId, automationId))
    .limit(1);

  if (result && result[0] && typeof result[0].postId === "string") {
    return result[0].postId;
  }
  return null;
}

export async function createAutomation(
  data: CreateAutomationData
): Promise<Automation> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await assertBillingAllowed(user.id, "automation:create");

  if (!data.triggerWord || data.triggerWord.trim().length === 0) {
    throw new Error("Trigger word is required");
  }

  if (data.triggerWord.length > 100) {
    throw new Error("Trigger word must be 100 characters or less");
  }

  if (!data.responseContent || data.responseContent.trim().length === 0) {
    throw new Error("Response content is required");
  }

  const db = await getRLSDb();
  const existing = await db
    .select()
    .from(automation)
    .where(
      and(
        eq(automation.userId, user.id),
        eq(automation.triggerWord, data.triggerWord.toLowerCase())
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("An automation with this trigger word already exists");
  }

  const scope = data.triggerScope || "dm";
  if ((scope === "comment" || scope === "both") && !data.postId) {
    throw new Error("Post selection is required for comment/both scope");
  }

  const wantPublicComment =
    (scope === "comment" || scope === "both") &&
    data.commentReplyText !== undefined;
  const trimmedPublic = data.commentReplyText?.trim() ?? "";
  const publicCommentText =
    wantPublicComment && trimmedPublic.length > 0 ? trimmedPublic : undefined;

  const newAutomation: Automation = {
    id: crypto.randomUUID(),
    userId: user.id,
    title: data.title,
    description: data.description || null,
    triggerWord: data.triggerWord.toLowerCase(),
    responseType: data.responseType,
    responseContent: data.responseContent,
    isActive: true,
    expiresAt: data.expiresAt || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    triggerScope: scope,
    commentReplyCount: null,
    commentReplyText: publicCommentText ?? null,
    hrnEnforced: data.hrnEnforced ?? false,
  };

  await db.insert(automation).values(newAutomation);
  if (scope !== "dm" && data.postId) {
    await db.insert(automationPost).values({
      id: crypto.randomUUID(),
      automationId: newAutomation.id,
      postId: data.postId,
      createdAt: new Date(),
    });
  }

  revalidatePath("/automations");
  return newAutomation as Automation;
}

export async function updateAutomation(
  id: string,
  data: UpdateAutomationData
): Promise<Automation> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await assertBillingAllowed(user.id, "automation:mutate");

  const existing = await getAutomation(id);
  if (!existing) {
    throw new Error("Automation not found");
  }

  if (data.triggerWord !== undefined) {
    if (!data.triggerWord || data.triggerWord.trim().length === 0) {
      throw new Error("Trigger word is required");
    }

    if (data.triggerWord.length > 100) {
      throw new Error("Trigger word must be 100 characters or less");
    }

    const db = await getRLSDb();
    const duplicate = await db
      .select()
      .from(automation)
      .where(
        and(
          eq(automation.userId, user.id),
          eq(automation.triggerWord, data.triggerWord.toLowerCase()),
          ne(automation.id, id)
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      throw new Error("An automation with this trigger word already exists");
    }
  }

  if (data.responseContent !== undefined) {
    if (!data.responseContent || data.responseContent.trim().length === 0) {
      throw new Error("Response content is required");
    }
  }

  const scope = data.triggerScope ?? existing.triggerScope ?? "dm";
  if ((scope === "comment" || scope === "both") && data.postId === undefined) {
    // require explicit postId presence on update for comment/both
    // caller must send postId
    throw new Error("Post selection is required for comment/both scope");
  }

  let commentReplyText: string | null | undefined = data.commentReplyText;
  if (scope === "comment" || scope === "both") {
    if (commentReplyText !== undefined) {
      const trimmed = (commentReplyText ?? "").trim();
      commentReplyText = trimmed.length > 0 ? trimmed : null; // normalize empty to null
    }
  } else {
    // for DM-only scope, always null out any existing public reply text
    commentReplyText = commentReplyText !== undefined ? null : undefined;
  }

  const updateDataBase: Partial<typeof automation.$inferInsert> = {
    ...data,
    triggerWord: data.triggerWord?.toLowerCase(),
    updatedAt: new Date(),
  };
  const updateData: Partial<typeof automation.$inferInsert> & {
    commentReplyText?: string | null;
  } = {
    ...updateDataBase,
    ...(commentReplyText !== undefined ? { commentReplyText } : {}),
  };

  const db = await getRLSDb();
  // sequential updates without explicit transaction
  await db.update(automation).set(updateData).where(eq(automation.id, id));

  if (scope !== "dm") {
    await db.delete(automationPost).where(eq(automationPost.automationId, id));
    if (data.postId) {
      await db.insert(automationPost).values({
        id: crypto.randomUUID(),
        automationId: id,
        postId: data.postId,
        createdAt: new Date(),
      });
    }
  } else {
    await db.delete(automationPost).where(eq(automationPost.automationId, id));
  }

  revalidatePath("/automations");

  const updated = await getAutomation(id);
  if (!updated) {
    throw new Error("Failed to retrieve updated automation");
  }

  return updated;
}

export async function deleteAutomation(id: string): Promise<void> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await assertBillingAllowed(user.id, "automation:mutate");

  const existing = await getAutomation(id);
  if (!existing) {
    throw new Error("Automation not found");
  }

  const db = await getRLSDb();
  await db
    .delete(automation)
    .where(and(eq(automation.id, id), eq(automation.userId, user.id)));

  revalidatePath("/automations");
}

export async function toggleAutomation(id: string): Promise<Automation> {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const existing = await getAutomation(id);
  if (!existing) {
    throw new Error("Automation not found");
  }

  return updateAutomation(id, { isActive: !existing.isActive });
}

export async function getActiveAutomations(
  userId: string
): Promise<Automation[]> {
  console.log(`Getting active automations for user ${userId}`);

  const db = await getRLSDb();
  const automations = await db
    .select()
    .from(automation)
    .where(
      and(
        eq(automation.userId, userId),
        eq(automation.isActive, true),
        or(isNull(automation.expiresAt), gt(automation.expiresAt, new Date()))
      )
    );

  console.log(`Database query returned ${automations.length} automations`);
  automations.forEach((a) => {
    console.log(
      `- ID: ${a.id}, Title: "${a.title}", Active: ${a.isActive}, Expires: ${a.expiresAt}`
    );
  });

  return automations;
}

export async function checkTriggerMatch(
  messageText: string,
  userId: string,
  scope: "dm" | "comment" = "dm"
): Promise<Automation | null> {
  console.log(`=== CHECKING AUTOMATIONS ===`);
  console.log(`Message: "${messageText}"`);
  console.log(`User ID: ${userId}`);
  console.log(`Scope: ${scope}`);

  const activeAutomations = await getActiveAutomations(userId);

  console.log(
    `Found ${activeAutomations.length} active automations for user ${userId}`
  );
  activeAutomations.forEach((a) => {
    console.log(
      `- "${a.title}": trigger="${a.triggerWord}", scope=${a.triggerScope}, type=${a.responseType}`
    );
  });

  for (const a of activeAutomations) {
    const trigger = a.triggerWord?.toLowerCase?.() ?? "";
    if (!trigger) {
      console.log(`Skipping automation "${a.title}" - no trigger word`);
      continue;
    }

    const aScope = a.triggerScope || "dm";
    const scopeMatches =
      aScope === "both" || aScope === scope || (scope === "dm" && !aScope);

    console.log(`Checking "${a.title}":`);
    console.log(`  Trigger: "${trigger}"`);
    console.log(`  Scope: ${aScope}`);
    console.log(`  Scope matches: ${scopeMatches}`);
    console.log(
      `  Message contains trigger: ${messageText
        .toLowerCase()
        .includes(trigger)}`
    );

    if (scopeMatches && messageText.toLowerCase().includes(trigger)) {
      console.log(`✅ AUTOMATION MATCHED: "${a.title}"`);
      return a as Automation;
    } else {
      console.log(`❌ No match for "${a.title}"`);
    }
  }

  console.log(`❌ No automation matched`);
  return null;
}

export async function logAutomationUsage(params: {
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
}): Promise<void> {
  const {
    userId,
    platform,
    threadId,
    recipientId,
    automationId,
    triggerWord,
    action,
    text,
    messageId,
  } = params;

  const db = await getRLSDb();
  await db.insert(automationActionLog).values({
    id: crypto.randomUUID(),
    userId,
    platform,
    threadId,
    recipientId,
    automationId,
    triggerWord,
    action,
    text: text ?? null,
    messageId,
    createdAt: new Date(),
  });
}

export async function getRecentAutomationLogs(
  limit: number = 25
): Promise<AutomationLogItem[]> {
  const safeLimit = Math.min(Math.max(1, limit), 100);

  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const db = await getRLSDb();
  const logs = await db
    .select({
      id: automationActionLog.id,
      userId: automationActionLog.userId,
      platform: automationActionLog.platform,
      threadId: automationActionLog.threadId,
      recipientId: automationActionLog.recipientId,
      recipientUsername: contact.username,
      automationId: automationActionLog.automationId,
      triggerWord: automationActionLog.triggerWord,
      action: automationActionLog.action,
      text: automationActionLog.text,
      messageId: automationActionLog.messageId,
      createdAt: automationActionLog.createdAt,
      automationTitle: automation.title,
    })
    .from(automationActionLog)
    .leftJoin(automation, eq(automation.id, automationActionLog.automationId))
    .leftJoin(
      contact,
      and(
        eq(contact.id, automationActionLog.recipientId),
        eq(contact.userId, automationActionLog.userId)
      )
    )
    .where(eq(automationActionLog.userId, user.id))
    .orderBy(desc(automationActionLog.createdAt))
    .limit(safeLimit);

  return logs.map((r) => ({
    ...r,
    recipientUsername: r.recipientUsername || r.recipientId,
  })) as AutomationLogItem[];
}
