import {
  facebookGraphUrl,
  IG_API_VERSION,
  graphUrl,
  instagramRequest,
} from "./client";

export async function sendInstagramCommentReply(params: {
  igUserId: string;
  commentId: string;
  accessToken: string;
  text: string;
}): Promise<{ status: number; data?: { id?: string; message_id?: string } }> {
  const { igUserId, commentId, accessToken, text } = params;

  try {
    const res = await instagramRequest<{ id?: string; message_id?: string }>({
      method: "POST",
      url: graphUrl(`/${IG_API_VERSION}/${encodeURIComponent(igUserId)}/messages`),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "instagram",
        recipient: { comment_id: commentId },
        message: { text },
      },
    });

    return { status: res.status, data: shapeMessageData(res.data) };
  } catch {
    return { status: 500 };
  }
}

export async function sendInstagramCommentGenericTemplate(params: {
  igUserId: string;
  commentId: string;
  accessToken: string;
  elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
      type: "web_url";
      url: string;
    };
    buttons?: Array<{ type: "web_url"; url: string; title: string }>;
  }>;
}): Promise<{ status: number; data?: { id?: string; message_id?: string } }> {
  const { igUserId, commentId, accessToken, elements } = params;

  try {
    const res = await instagramRequest<{ id?: string; message_id?: string }>({
      method: "POST",
      url: graphUrl(`/${IG_API_VERSION}/${encodeURIComponent(igUserId)}/messages`),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "instagram",
        recipient: { comment_id: commentId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements,
            },
          },
        },
      },
    });

    return { status: res.status, data: shapeMessageData(res.data) };
  } catch {
    return { status: 500 };
  }
}

export async function postPublicCommentReply(params: {
  commentId: string;
  accessToken: string;
  message: string;
}): Promise<{ status: number; data?: { id?: string; message_id?: string } }> {
  const { commentId, accessToken, message } = params;

  try {
    const res = await instagramRequest<{ id?: string; message_id?: string }>({
      method: "POST",
      url: facebookGraphUrl(
        `/${IG_API_VERSION}/${encodeURIComponent(commentId)}/replies`,
      ),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: { message },
    });

    return { status: res.status, data: shapeMessageData(res.data) };
  } catch {
    return { status: 500 };
  }
}

function shapeMessageData(data: unknown): { id?: string; message_id?: string } {
  if (!data || typeof data !== "object") return {};
  const record = data as Record<string, unknown>;
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    message_id:
      typeof record.message_id === "string" ? record.message_id : undefined,
  };
}
