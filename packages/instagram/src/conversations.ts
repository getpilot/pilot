import {
  IG_API_VERSION,
  graphUrl,
  instagramRequest,
  type InstagramRequestResult,
} from "./client";
import type {
  InstagramConversation,
  InstagramMessage,
} from "@pilot/types/instagram";
import type {
  InstagramConversationsResponse,
  InstagramMessagesResponse,
} from "./types";

const DEFAULT_MESSAGE_LIMIT = 10;
const REQUEST_DELAY_MS = 200;

export async function fetchConversations(params: {
  accessToken: string;
  igUserId?: string;
}): Promise<InstagramConversationsResponse> {
  const { accessToken } = params;
  const conversationsPath = params.igUserId
    ? `/${IG_API_VERSION}/${encodeURIComponent(params.igUserId)}/conversations`
    : `/${IG_API_VERSION}/me/conversations`;
  try {
    const res = await instagramRequest<{ data?: unknown }>({
      method: "GET",
      url: graphUrl(conversationsPath),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        platform: "instagram",
        fields: "id,participants,updated_time",
      },
    });
    return { status: res.status, data: { data: res.data?.data } };
  } catch {
    return { status: 500, data: { data: undefined } };
  }
}

export async function fetchConversationMessages(params: {
  accessToken: string;
  conversationId: string;
  limit?: number;
}): Promise<InstagramMessagesResponse> {
  const { accessToken, conversationId, limit = DEFAULT_MESSAGE_LIMIT } = params;
  try {
    const res = await instagramRequest<{ messages?: { data?: unknown } }>({
      method: "GET",
      url: graphUrl(
        `/${IG_API_VERSION}/${encodeURIComponent(conversationId)}`,
      ),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: `messages.limit(${limit}){id,from{id,username},to{id,username},message,created_time}`,
      },
    });
    return { status: res.status, data: { data: res.data?.messages?.data } };
  } catch {
    return { status: 500, data: { data: undefined } };
  }
}

export async function fetchConversationMessagesForSync(params: {
  accessToken: string;
  conversationId: string;
  limit?: number;
}): Promise<InstagramMessage[]> {
  const { accessToken, conversationId, limit = DEFAULT_MESSAGE_LIMIT } = params;
  const res = await instagramRequest<{ messages?: { data?: unknown } }>({
    method: "GET",
    url: graphUrl(
      `/${IG_API_VERSION}/${encodeURIComponent(conversationId)}`,
    ),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      fields: `messages.limit(${limit}){id,from{id,username},to{id,username},message,created_time}`,
    },
    postRequestDelayMs: REQUEST_DELAY_MS,
  });

  throwIfTokenExpired(res);

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Instagram API request failed (${res.status})`);
  }

  const data = res.data?.messages?.data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data as InstagramMessage[];
}

export async function fetchConversationsForSync(params: {
  accessToken: string;
  igUserId?: string;
}): Promise<InstagramConversation[]> {
  const { accessToken } = params;
  const conversationsPath = params.igUserId
    ? `/${IG_API_VERSION}/${encodeURIComponent(params.igUserId)}/conversations`
    : `/${IG_API_VERSION}/me/conversations`;
  const res = await instagramRequest<{ data?: unknown }>({
    method: "GET",
    url: graphUrl(conversationsPath),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      platform: "instagram",
      fields:
        "id,participants,messages.limit(1){id,from{id,username},to{id,username},message,created_time},updated_time",
    },
    postRequestDelayMs: REQUEST_DELAY_MS,
  });

  throwIfTokenExpired(res);

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Instagram API request failed (${res.status})`);
  }

  const data = res.data?.data;
  if (!Array.isArray(data)) {
    throw new Error("Instagram API returned invalid data format");
  }

  return (data as InstagramConversation[]).filter((item) => {
    if (!item || typeof item !== "object") return false;
    if (!item.participants || !Array.isArray(item.participants.data)) {
      return false;
    }
    return true;
  });
}

function throwIfTokenExpired(
  response: InstagramRequestResult<unknown>,
): void {
  if (response.status === 401) {
    throw new Error(
      "Instagram token expired. Please reconnect your Instagram account.",
    );
  }
}
