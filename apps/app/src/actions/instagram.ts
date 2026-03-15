"use server";

import { instagramIntegration } from "@pilot/db/schema";
import { getUser, getRLSDb } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  fetchInstagramMediaById,
  validateInstagramToken,
  fetchRecentInstagramMedia,
} from "@pilot/instagram";

const InstagramIdSchema = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((value) => String(value));

const InstagramConnectionSchema = z.object({
  instagramUserId: InstagramIdSchema,
  appScopedUserId: InstagramIdSchema,
  username: z.string(),
  accessToken: z.string(),
  expiresIn: z.coerce.number().positive(),
});

export async function getInstagramIntegration() {
  const user = await getUser();

  if (!user) {
    return { connected: false };
  }

  const db = await getRLSDb();
  const integration = await db.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, user.id),
  });

  if (!integration) {
    return { connected: false };
  }

  try {
    const isValid = await validateInstagramToken({
      accessToken: integration.accessToken,
    });
    if (!isValid) {
      return { connected: false, error: "Invalid token" };
    }

    return {
      connected: true,
      username: integration.username,
      id: integration.instagramUserId,
    };
  } catch (error) {
    console.error("Instagram API validation error:", error);
    return { connected: false, error: "Invalid token" };
  }
}

export async function disconnectInstagram() {
  const user = await getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const db = await getRLSDb();
    await db
      .delete(instagramIntegration)
      .where(eq(instagramIntegration.userId, user.id));
    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect Instagram:", error);
    return { success: false, error: "Failed to disconnect" };
  }
}

export async function saveInstagramConnection(data: unknown) {
  const parsed = InstagramConnectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }
  const { instagramUserId, appScopedUserId, username, accessToken, expiresIn } =
    parsed.data;

  const user = await getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const db = await getRLSDb();
    const existingIntegration = await db.query.instagramIntegration.findFirst({
      where: eq(instagramIntegration.userId, user.id),
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    if (existingIntegration) {
      await db
        .update(instagramIntegration)
        .set({
          instagramUserId,
          appScopedUserId,
          username,
          accessToken,
          expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(instagramIntegration.id, existingIntegration.id));
    } else {
      await db.insert(instagramIntegration).values({
        id: uuidv4(),
        userId: user.id,
        instagramUserId,
        appScopedUserId,
        username,
        accessToken,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save Instagram connection:", error);
    return { success: false, error: "Failed to save connection" };
  }
}

export async function getInstagramSyncConfig() {
  const user = await getUser();
  if (!user) return { connected: false };

  const db = await getRLSDb();
  const integ = await db.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, user.id),
  });

  if (!integ) return { connected: false };

  const hours = Math.min(24, Math.max(5, integ.syncIntervalHours ?? 24));
  return {
    connected: true,
    intervalHours: hours,
    lastSyncedAt: integ.lastSyncedAt ? integ.lastSyncedAt.toISOString() : null,
  };
}

export async function updateInstagramSyncInterval(hours: number) {
  const user = await getUser();
  if (!user) return { success: false, error: "not authenticated" };

  // coerce and validate to ensure NaN never reaches the database
  const coerced = Number(hours);
  if (!Number.isFinite(coerced) || Number.isNaN(coerced)) {
    return { success: false, error: "invalid intervalHours" };
  }

  const floored = Math.floor(coerced);
  const clamped = Math.min(24, Math.max(5, floored));

  try {
    const db = await getRLSDb();
    const existingIntegration = await db.query.instagramIntegration.findFirst({
      where: eq(instagramIntegration.userId, user.id),
    });
    if (!existingIntegration) {
      return { success: false, error: "instagram not connected" };
    }

    await db
      .update(instagramIntegration)
      .set({ syncIntervalHours: clamped, updatedAt: new Date() })
      .where(eq(instagramIntegration.id, existingIntegration.id));

    return { success: true, intervalHours: clamped };
  } catch (error) {
    console.error("failed to update sync interval:", error);
    return { success: false, error: "update failed" };
  }
}

export async function getRecentInstagramPosts(limit: number = 5) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const db = await getRLSDb();
  const integration = await db.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, user.id),
  });
  if (!integration) {
    throw new Error("Instagram not connected");
  }

  const items = await fetchRecentInstagramMedia({
    accessToken: integration.accessToken,
    limit,
  });

  return items as Array<{
    id: string;
    caption?: string;
    media_type?: string;
    media_url?: string;
    thumbnail_url?: string;
    permalink?: string;
    timestamp?: string;
  }>;
}

export async function getInstagramPostById(postId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const normalizedPostId = postId.trim();
  if (!normalizedPostId) {
    return null;
  }

  const db = await getRLSDb();
  const integration = await db.query.instagramIntegration.findFirst({
    where: eq(instagramIntegration.userId, user.id),
  });
  if (!integration) {
    throw new Error("Instagram not connected");
  }

  return fetchInstagramMediaById({
    accessToken: integration.accessToken,
    mediaId: normalizedPostId,
  });
}
