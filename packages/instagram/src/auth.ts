import { authUrl, graphUrl, instagramRequest } from "./client";
import type {
  InstagramLongLivedToken,
  InstagramMediaItem,
  InstagramProfile,
} from "./types";

const DEFAULT_SCOPE =
  "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";

export function buildInstagramAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  scope?: string;
}): string {
  const scope = params.scope ?? DEFAULT_SCOPE;
  return (
    "https://www.instagram.com/oauth/authorize" +
    `?enable_fb_login=0` +
    `&force_authentication=1` +
    `&client_id=${params.clientId}` +
    `&redirect_uri=${params.redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}`
  );
}

export async function exchangeCodeForAccessToken(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<{ accessToken: string }> {
  const response = await instagramRequest<{ access_token?: string }>({
    method: "POST",
    url: authUrl("/oauth/access_token"),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
      code: params.code,
    }),
  });

  if (response.status < 200 || response.status >= 300 || !response.data?.access_token) {
    const detail = extractInstagramErrorDetail(response.data);
    throw new Error(
      detail
        ? `Failed to exchange Instagram code (${response.status}): ${detail}`
        : `Failed to exchange Instagram code (${response.status})`,
    );
  }

  return { accessToken: response.data.access_token };
}

export async function fetchInstagramProfile(params: {
  accessToken: string;
}): Promise<InstagramProfile> {
  const response = await instagramRequest<InstagramProfile>({
    method: "GET",
    url: graphUrl("/me"),
    params: {
      fields: "id,username,user_id",
      access_token: params.accessToken,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to fetch Instagram profile (${response.status})`);
  }

  return response.data;
}

export async function exchangeLongLivedInstagramToken(params: {
  clientSecret: string;
  accessToken: string;
}): Promise<InstagramLongLivedToken> {
  const response = await instagramRequest<{
    access_token?: string;
    expires_in?: number;
  }>({
    method: "GET",
    url: graphUrl("/access_token"),
    params: {
      grant_type: "ig_exchange_token",
      client_secret: params.clientSecret,
      access_token: params.accessToken,
    },
  });

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !response.data?.access_token ||
    typeof response.data?.expires_in !== "number"
  ) {
    throw new Error(
      `Failed to exchange Instagram long-lived token (${response.status})`,
    );
  }

  return {
    accessToken: response.data.access_token,
    expiresIn: response.data.expires_in,
  };
}

export async function refreshLongLivedInstagramToken(params: {
  accessToken: string;
}): Promise<InstagramLongLivedToken> {
  const response = await instagramRequest<{
    access_token?: string;
    expires_in?: number;
  }>({
    method: "GET",
    url: graphUrl("/refresh_access_token"),
    params: {
      grant_type: "ig_refresh_token",
      access_token: params.accessToken,
    },
  });

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !response.data?.access_token ||
    typeof response.data?.expires_in !== "number"
  ) {
    throw new Error(`Failed to refresh Instagram token (${response.status})`);
  }

  return {
    accessToken: response.data.access_token,
    expiresIn: response.data.expires_in,
  };
}

export async function validateInstagramToken(params: {
  accessToken: string;
}): Promise<boolean> {
  const response = await instagramRequest({
    method: "GET",
    url: graphUrl("/me"),
    params: {
      fields: "id,username",
      access_token: params.accessToken,
    },
    maxRetries: 1,
  });

  return response.status >= 200 && response.status < 300;
}

export async function fetchRecentInstagramMedia(params: {
  accessToken: string;
  limit?: number;
}): Promise<InstagramMediaItem[]> {
  const limit = Math.max(1, Math.min(25, params.limit ?? 5));
  const response = await instagramRequest<{ data?: unknown }>({
    method: "GET",
    url: graphUrl("/me/media"),
    params: {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
      limit,
      access_token: params.accessToken,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to fetch Instagram media (${response.status})`);
  }

  const items = response.data?.data;
  return Array.isArray(items) ? (items as InstagramMediaItem[]) : [];
}

function extractInstagramErrorDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.error_message === "string" && record.error_message.length > 0) {
    return record.error_message;
  }

  if (record.error && typeof record.error === "object") {
    const error = record.error as Record<string, unknown>;
    const parts = [
      typeof error.message === "string" ? error.message : null,
      typeof error.type === "string" ? `type=${error.type}` : null,
      typeof error.code === "number" ? `code=${error.code}` : null,
      typeof error.error_subcode === "number"
        ? `subcode=${error.error_subcode}`
        : null,
    ].filter((value): value is string => Boolean(value));

    if (parts.length > 0) {
      return parts.join(" | ");
    }
  }

  return null;
}
