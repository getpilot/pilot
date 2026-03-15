export type InstagramContact = {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: string;
  stage?: string;
  sentiment?: string;
  notes?: string;
  leadScore?: number;
  nextAction?: string;
  leadValue?: number;
  followupMessage?: string;
  requiresHumanResponse?: boolean;
  humanResponseSetAt?: string;
  messages?: string[];
  tags?: string[];
};

export type InstagramParticipant = {
  id: string;
  username: string;
};

export type InstagramMessage = {
  from: { id: string; username: string };
  message: string;
  created_time: string;
};

export interface InstagramConversation {
  id: string;
  participants: {
    data: InstagramParticipant[];
  };
  messages?: {
    data: InstagramMessage[];
  };
  updated_time: string;
}

export type AnalysisResult = {
  stage: "new" | "lead" | "follow-up" | "ghosted";
  sentiment: "hot" | "warm" | "cold" | "ghosted" | "neutral";
  leadScore: number;
  nextAction: string;
  leadValue: number;
};

export type ContactField = "stage" | "sentiment" | "notes";

export type CommentChange = {
  field: string;
  value?: {
    id?: string;
    comment_id?: string;
    text?: string;
    from?: { id?: string; username?: string };
    media?: {
      id?: string;
      media_product_type?: string;
      original_media_id?: string;
    };
  };
};
