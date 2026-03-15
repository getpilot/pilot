export type InstagramSendResponse = {
  status: number;
  data?: { id?: string; message_id?: string } | { error?: string };
};

export type InstagramConversationsResponse = {
  status: number;
  data: { data?: unknown };
};

export type InstagramMessagesResponse = {
  status: number;
  data: { data?: unknown };
};

export type InstagramProfile = {
  id: string;
  username: string;
  user_id?: string;
};

export type InstagramCodeExchangeResult = {
  accessToken: string;
  appScopedUserId: string;
};

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  media_product_type?: string;
};

export type InstagramLongLivedToken = {
  accessToken: string;
  expiresIn: number;
};
