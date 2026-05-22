import { inngest } from "./client";
import { sendInstagramMessage, sendWithRetry } from "@pilot/instagram";
import { db } from "@pilot/db";
import { sidekickActionLog, instagramIntegration } from "@pilot/db/schema";

import { eq } from "drizzle-orm";

/**
 * Dead-letter retry for failed Instagram sends.
 * Triggered by "instagram/send-failed" event after the inline attempt fails.
 *
 * Uses sendWithRetry (3 attempts, exponential backoff) since this runs
 * asynchronously via Inngest — no webhook timeout concern.
 *
 * Looks up the access token from the DB using integrationId
 * (never stored in event payload for security).
 */
export const retryFailedInstagramSend = inngest.createFunction(
  {
    id: "retry-failed-instagram-send",
    name: "Retry Failed Instagram Send",
    retries: 0,
    triggers: [{ event: "instagram/send-failed" }],
  },
  async ({ event, step }) => {
    const {
      igUserId,
      recipientId,
      integrationId,
      text,
      userId,
      threadId,
      actionLogId,
    } = event.data as {
      igUserId: string;
      recipientId: string;
      integrationId: string;
      text: string;
      userId: string;
      threadId: string;
      actionLogId?: string;
    };

    // Fetch the access token from DB — never stored in event payload
    const integration = await step.run("fetch-token", async () => {
      const row = await db.query.instagramIntegration.findFirst({
        where: eq(instagramIntegration.id, integrationId),
      });
      if (!row) {
        console.error("send.dead_letter_failed", {
          userId,
          threadId,
          reason: "integration_not_found",
          integrationId,
        });
        throw new Error(`Integration ${integrationId} not found`);
      }
      return { accessToken: row.accessToken };
    });

    const result = await step.run("retry-send", async () => {
      // 2 attempts here + 1 inline in webhook = 3 total max
      const res = await sendWithRetry(
        () =>
          sendInstagramMessage({
            igUserId,
            recipientId,
            accessToken: integration.accessToken,
            text,
          }),
        {
          action: "dead_letter_retry",
          recipientId,
          threadId,
        },
        2,
      );

      const delivered = res.status >= 200 && res.status < 300;

      if (delivered) {
        console.log("send.dead_letter_success", {
          userId,
          threadId,
          recipientId,
          status: res.status,
          attempts: res.attempts,
        });
      } else {
        console.error("send.dead_letter_failed", {
          userId,
          threadId,
          recipientId,
          status: res.status,
          attempts: res.attempts,
        });
      }

      // Update the existing action log entry if we have the ID
      if (actionLogId && delivered) {
        try {
          await db
            .update(sidekickActionLog)
            .set({ result: "sent" })
            .where(eq(sidekickActionLog.id, actionLogId));
        } catch (e) {
          console.error(
            "Failed to update action log after dead-letter retry",
            e,
          );
        }
      }

      return { delivered, status: res.status, attempts: res.attempts };
    });

    return result;
  },
);
