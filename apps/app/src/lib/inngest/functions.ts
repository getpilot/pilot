import { db } from "@pilot/db";
import { contact, instagramIntegration, user } from "@pilot/db/schema";
import { eq } from "drizzle-orm";
import type { InstagramContact } from "@pilot/types/instagram";
import {
  fetchAndStoreInstagramContacts,
  getDueSyncIntegrations,
  getExpiringIntegrations,
  refreshInstagramTokenIfExpiring,
  summarizeContacts,
} from "@pilot/core/contacts/sync";
import { appendContactTranscriptMemory } from "@pilot/core/memory/supermemory";
import {
  fetchConversationMessagesForSync,
  fetchConversationsForSync,
} from "@pilot/instagram";
import type { InstagramConversation } from "@pilot/types/instagram";
import { inngest } from "./client";
import { getBillingStatus } from "@/lib/billing/enforce";
import { syncBusinessKnowledgeMemory } from "@/lib/supermemory/knowledge";

export const syncInstagramContacts = inngest.createFunction(
  {
    id: "sync-instagram-contacts",
    name: "Sync Instagram Contacts",
    triggers: [{ event: "contacts/sync" }],
  },
  async ({ event, step }) => {
    const { userId, fullSync = false } = event.data as {
      userId?: string;
      fullSync?: boolean;
    };

    if (!userId || typeof userId !== "string") {
      throw new Error("User ID must be a non-empty string");
    }

    await step.run("fetch-user", async () => {
      const userResult = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userResult) {
        throw new Error(`User not found: ${userId}`);
      }
    });

    try {
      await step.sendEvent("sync-started", {
        name: "sync/status",
        data: {
          userId,
          status: "started",
          fullSync: Boolean(fullSync),
        },
      });
    } catch (error) {
      console.error("Failed to send sync started event:", error);
    }

    type ContactsResult = { contacts: InstagramContact[]; error?: string };
    const contactsResult = await step.run(
      "fetch-contacts",
      async (): Promise<ContactsResult> => {
        try {
          const billing = await getBillingStatus(userId);
          const contacts = await fetchAndStoreInstagramContacts({
            dbClient: db,
            userId,
            fullSync,
            billing,
          });

          if (!Array.isArray(contacts)) {
            return { contacts: [], error: "Invalid contacts result" };
          }

          return { contacts };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          if (message.includes("token expired")) {
            return { contacts: [], error: "token_expired" };
          }
          return { contacts: [], error: message };
        }
      },
    );

    if (contactsResult.error) {
      try {
        await step.sendEvent("sync-failed", {
          name: "sync/status",
          data: {
            userId,
            status: "failed",
            error:
              contactsResult.error === "token_expired"
                ? "Instagram token expired. Please reconnect your Instagram account."
                : contactsResult.error,
            fullSync: Boolean(fullSync),
          },
        });
      } catch (error) {
        console.error("Failed to send sync failed status:", error);
      }

      return {
        userId,
        contactsCount: 0,
        success: false,
        contacts: [],
        error: contactsResult.error,
      } as const;
    }

    const summary = summarizeContacts(contactsResult.contacts);

    try {
      await step.sendEvent("sync-completed", {
        name: "sync/status",
        data: {
          userId,
          status: "completed",
          count: contactsResult.contacts.length,
        },
      });
    } catch (error) {
      console.error("Failed to send sync completed event:", error);
    }

    try {
      await step.sendEvent("enqueue-memory-backfill", {
        name: "memory/contact.backfill",
        data: { userId },
      });
    } catch (error) {
      console.error("Failed to enqueue contact memory backfill:", error);
    }

    return {
      userId,
      contactsCount: contactsResult.contacts.length,
      success: true,
      contacts: contactsResult.contacts,
      ...summary,
    };
  },
);

export const scheduleContactsSync = inngest.createFunction(
  {
    id: "schedule-contacts-sync",
    name: "Schedule Contacts Sync",
    triggers: [{ cron: "0 * * * *" }],
  },
  async ({ step }) => {
    const integrations = await step.run("load-integrations", async () => {
      return db.query.instagramIntegration.findMany({});
    });

    const due = getDueSyncIntegrations(integrations);

    const events = await step.run("enqueue-due-syncs", async () => {
      if (due.length === 0) {
        return [] as Array<{
          name: string;
          data: { userId: string; fullSync: boolean };
        }>;
      }

      return due.map((integration) => ({
        name: "contacts/sync",
        data: { userId: integration.userId, fullSync: false },
      }));
    });

    if (events.length > 0) {
      await step.sendEvent("send-sync-events", events);
    }

    return { checked: integrations.length, scheduled: due.length };
  },
);

export const syncBusinessKnowledge = inngest.createFunction(
  {
    id: "sync-business-knowledge-memory",
    name: "Sync Business Knowledge Memory",
    retries: 1,
    triggers: [{ event: "memory/knowledge.sync" }],
  },
  async ({ event, step }) => {
    const { userId } = event.data as { userId?: string };

    if (!userId || typeof userId !== "string") {
      throw new Error("User ID must be a non-empty string");
    }

    return step.run("sync-business-knowledge", async () => {
      return syncBusinessKnowledgeMemory(userId, db);
    });
  },
);

export const backfillActiveContactMemory = inngest.createFunction(
  {
    id: "backfill-active-contact-memory",
    name: "Backfill Active Contact Memory",
    retries: 0,
    triggers: [{ event: "memory/contact.backfill" }],
  },
  async ({ event, step }) => {
    const { userId } = event.data as { userId?: string };

    if (!userId || typeof userId !== "string") {
      throw new Error("User ID must be a non-empty string");
    }

    const [integration, contacts] = await Promise.all([
      step.run("load-instagram-integration", async () => {
        return db.query.instagramIntegration.findFirst({
          where: eq(instagramIntegration.userId, userId),
        });
      }),
      step.run("load-contacts", async () => {
        return db.query.contact.findMany({
          where: eq(contact.userId, userId),
          orderBy: (contacts, { desc }) => [desc(contacts.lastMessageAt)],
        });
      }),
    ]);

    if (!integration?.accessToken || !integration.instagramUserId) {
      return { synced: 0, skipped: true };
    }

    const conversationMap = await step.run("load-conversation-map", async () => {
      const conversations = await fetchConversationsForSync({
        accessToken: integration.accessToken,
        igUserId: integration.instagramUserId,
        messageLimit: 1,
      });

      return conversations.reduce<Record<string, string>>(
        (acc, conversation: InstagramConversation) => {
          const participant = conversation.participants.data.find(
            (entry) => entry.username !== integration.username,
          );

          if (participant?.id) {
            acc[participant.id] = conversation.id;
          }

          return acc;
        },
        {},
      );
    });

    const now = Date.now();
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
    const eligibleContacts = contacts
      .filter((item) => !item.memorySeededAt)
      .filter((item) => {
        const lastMessageAt = item.lastMessageAt
          ? new Date(item.lastMessageAt).getTime()
          : 0;
        return (
          lastMessageAt >= sixtyDaysAgo ||
          item.stage === "lead" ||
          item.stage === "follow-up" ||
          Boolean(item.followupNeeded) ||
          Boolean(item.requiresHumanResponse)
        );
      })
      .slice(0, 100);

    let synced = 0;

    for (const targetContact of eligibleContacts) {
      const conversationId = conversationMap[targetContact.id];
      if (!conversationId) {
        continue;
      }

      const messages = await step.run(`fetch-thread-${targetContact.id}`, async () => {
        return fetchConversationMessagesForSync({
          accessToken: integration.accessToken,
          conversationId,
          limit: 25,
        });
      });

      if (messages.length === 0) {
        continue;
      }

      await step.run(`sync-thread-${targetContact.id}`, async () => {
        await appendContactTranscriptMemory({
          userId,
          instagramUserId: integration.instagramUserId,
          contactId: targetContact.id,
          entries: messages
            .slice()
            .reverse()
            .filter((message) => Boolean(message.message?.trim()))
            .map((message) => ({
              role:
                message.from.username === integration.username
                  ? ("assistant" as const)
                  : ("user" as const),
              content: message.message.trim(),
              timestamp: message.created_time,
            })),
        });

        await db
          .update(contact)
          .set({
            memorySeededAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contact.id, targetContact.id));
      });

      synced += 1;
    }

    return { synced, scanned: eligibleContacts.length };
  },
);

export const refreshInstagramTokens = inngest.createFunction(
  {
    id: "refresh-instagram-tokens",
    name: "Refresh Instagram Tokens",
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const expiringIntegrations = await step.run("find-expiring-tokens", async () => {
      return getExpiringIntegrations(db, sevenDaysFromNow);
    });

    let refreshed = 0;
    let failed = 0;

    for (const integration of expiringIntegrations) {
      const result = await step.run(`refresh-token-${integration.id}`, async () => {
        try {
          await refreshInstagramTokenIfExpiring({
            dbClient: db,
            integration,
          });
          return { success: true } as const;
        } catch (error) {
          console.error("token.refresh_failed", {
            userId: integration.userId,
            integrationId: integration.id,
            error: error instanceof Error ? error.message : "unknown error",
          });
          return { success: false } as const;
        }
      });

      if (result.success) {
        refreshed += 1;
      } else {
        failed += 1;
      }
    }

    return {
      checked: expiringIntegrations.length,
      refreshed,
      failed,
    };
  },
);
