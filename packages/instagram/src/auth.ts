import {
  authUrl,
  facebookGraphUrl,
  IG_API_VERSION,
  instagramRequest,
  loginGraphUrl,
} from "./client";
import type {
  InstagramCodeExchangeResult,
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
}): Promise<InstagramCodeExchangeResult> {
  const response = await instagramRequest<{
    access_token?: string;
    user_id?: string | number | bigint;
  }>({
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

  const accessToken = response.data?.access_token;
  const appScopedUserId = normalizeInstagramId(response.data?.user_id);

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !accessToken ||
    !appScopedUserId
  ) {
    const detail = extractInstagramErrorDetail(response.data);
    throw new Error(
      detail
        ? `Failed to exchange Instagram code (${response.status}): ${detail}`
        : `Failed to exchange Instagram code (${response.status})`,
    );
  }

  return { accessToken, appScopedUserId };
}

export async function fetchInstagramProfile(params: {
  accessToken: string;
  igUserId?: string;
}): Promise<InstagramProfile> {
  const normalizedIgUserId = params.igUserId ? String(params.igUserId) : null;
  const profilePath = normalizedIgUserId ? `/${normalizedIgUserId}` : "/me";
  const fields = normalizedIgUserId ? "username,user_id" : "id,username,user_id";
  const response = await instagramRequest<{
    id?: string | number | bigint;
    username?: string;
    user_id?: string | number | bigint;
  }>({
    method: "GET",
    url: loginGraphUrl(`/${IG_API_VERSION}${profilePath}`),
    params: {
      fields,
      access_token: params.accessToken,
    },
  });

  const id = normalizeInstagramId(response.data?.id) ?? normalizedIgUserId;
  const username = response.data?.username;
  const userId = normalizeInstagramId(response.data?.user_id);

  if (response.status < 200 || response.status >= 300 || !id || !username) {
    throw new Error(`Failed to fetch Instagram profile (${response.status})`);
  }

  return {
    id,
    username,
    user_id: userId ?? undefined,
  };
}

export async function exchangeLongLivedInstagramToken(params: {
  clientSecret: string;
  accessToken: string;
}): Promise<InstagramLongLivedToken> {
  const response = await instagramRequest<{
    access_token?: string;
    expires_in?: number | string;
  }>({
    method: "GET",
    url: loginGraphUrl("/access_token"),
    params: {
      grant_type: "ig_exchange_token",
      client_secret: params.clientSecret,
      access_token: params.accessToken,
    },
  });
  const accessToken = response.data?.access_token;
  const expiresIn = Number(response.data?.expires_in);

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !accessToken ||
    !Number.isFinite(expiresIn)
  ) {
    throw new Error(
      `Failed to exchange Instagram long-lived token (${response.status})`,
    );
  }

  return {
    accessToken,
    expiresIn,
  };
}

export async function refreshLongLivedInstagramToken(params: {
  accessToken: string;
}): Promise<InstagramLongLivedToken> {
  const response = await instagramRequest<{
    access_token?: string;
    expires_in?: number | string;
  }>({
    method: "GET",
    url: loginGraphUrl("/refresh_access_token"),
    params: {
      grant_type: "ig_refresh_token",
      access_token: params.accessToken,
    },
  });
  const accessToken = response.data?.access_token;
  const expiresIn = Number(response.data?.expires_in);

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !accessToken ||
    !Number.isFinite(expiresIn)
  ) {
    throw new Error(`Failed to refresh Instagram token (${response.status})`);
  }

  return {
    accessToken,
    expiresIn,
  };
}

export async function validateInstagramToken(params: {
  accessToken: string;
  igUserId?: string;
}): Promise<boolean> {
  const validationPath = params.igUserId ? `/${params.igUserId}` : "/me";
  const fields = params.igUserId ? "username,user_id" : "id,username";
  const response = await instagramRequest({
    method: "GET",
    url: loginGraphUrl(`/${IG_API_VERSION}${validationPath}`),
    params: {
      fields,
      access_token: params.accessToken,
    },
    maxRetries: 1,
  });

  return response.status >= 200 && response.status < 300;
}

export async function fetchRecentInstagramMedia(params: {
  accessToken: string;
  igUserId?: string;
  limit?: number;
}): Promise<InstagramMediaItem[]> {
  const limit = Math.max(1, Math.min(25, params.limit ?? 5));
  const mediaPath = params.igUserId
    ? `/${IG_API_VERSION}/${encodeURIComponent(params.igUserId)}/media`
    : `/${IG_API_VERSION}/me/media`;
  const response = await instagramRequest<{ data?: unknown }>({
    method: "GET",
    url: facebookGraphUrl(mediaPath),
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

function normalizeInstagramId(
  value: string | number | bigint | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  return null;
}
