import { IG_API_VERSION, graphUrl, instagramRequest } from "./client";
import type { InstagramSendResponse } from "./types";

export async function sendInstagramMessage(params: {
  igUserId: string;
  recipientId: string;
  accessToken: string;
  text: string;
}): Promise<InstagramSendResponse> {
  const { igUserId, recipientId, accessToken, text } = params;

  try {
    const res = await instagramRequest<{ id?: string; message_id?: string }>({
      method: "POST",
      url: graphUrl(`/${IG_API_VERSION}/${encodeURIComponent(igUserId)}/messages`),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        recipient: { id: recipientId },
        message: { text },
      },
    });

    return { status: res.status, data: res.data };
  } catch {
    return { status: 500, data: { error: "network_error" } };
  }
}
