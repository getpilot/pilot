import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  pgPolicy,
  check,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/neon";
import { sql } from "drizzle-orm";
const DEFAULT_SIDEKICK_PROMPT =
  "You are a friendly, professional assistant focused on qualifying leads and helping with business inquiries.";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  gender: text("gender"),
  use_case: text("use_case").array(),
  other_use_case: text("other_use_case"),
  leads_per_month: text("leads_per_month"),
  active_platforms: text("active_platforms").array(),
  other_platform: text("other_platform"),
  business_type: text("business_type"),
  other_business_type: text("other_business_type"),
  pilot_goal: text("pilot_goal").array(),
  current_tracking: text("current_tracking").array(),
  other_tracking: text("other_tracking"),
  main_offering: text("main_offering"),
  onboarding_complete: boolean("onboarding_complete").default(false),
  sidekick_onboarding_complete: boolean("sidekick_onboarding_complete").default(
    false,
  ),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const instagramIntegration = pgTable(
  "instagram_integration",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // PROFESSIONAL ACCOUNT ID USED BY WEBHOOKS (IG GRAPH "user_id")
    instagramUserId: text("instagram_user_id").notNull(),
    // APP-SCOPED USER ID FROM GRAPH "me.id" (useful for diagnostics)
    appScopedUserId: text("app_scoped_user_id"),
    username: text("username").notNull(),
    accessToken: text("access_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    syncIntervalHours: integer("sync_interval_hours").default(24),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_instagram_integration_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const contact = pgTable(
  "contact",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    username: text("username"),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at"),
    stage: text("stage")
      .default("new")
      .$type<"new" | "lead" | "follow-up" | "ghosted">(),
    sentiment: text("sentiment")
      .default("neutral")
      .$type<"hot" | "warm" | "cold" | "ghosted" | "neutral">(),
    leadScore: integer("lead_score"),
    nextAction: text("next_action"),
    leadValue: integer("lead_value"),
    triggerMatched: boolean("trigger_matched").default(false),
    followupNeeded: boolean("followup_needed").default(false),
    followupMessage: text("followup_message"),
    requiresHumanResponse: boolean("requires_human_response").default(false),
    humanResponseSetAt: timestamp("human_response_set_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    // Users can only see their own contacts
    pgPolicy("user_contacts_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const contactTag = pgTable(
  "contact_tag",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    contactId: text("contact_id")
      .notNull()
      .references(() => contact.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    // Users can only see their own contact tags
    pgPolicy("user_contact_tags_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const contactTagUnique = unique("contact_tag_contact_id_tag_unique").on(
  contactTag.contactId,
  contactTag.tag,
);

export const userOffer = pgTable(
  "user_offer",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(),
    value: integer("value"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_offers_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const userToneProfile = pgTable(
  "user_tone_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toneType: text("tone_type")
      .notNull()
      .$type<"friendly" | "direct" | "like_me" | "custom">(),
    sampleText: text("sample_text").array(),
    sampleFiles: text("sample_files").array(),
    trainedEmbeddingId: text("trained_embedding_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_tone_profile_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const userOfferLink = pgTable(
  "user_offer_link",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type")
      .notNull()
      .$type<"primary" | "calendar" | "notion" | "website">(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_offer_links_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const userFaq = pgTable(
  "user_faq",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_faq_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const sidekickSetting = pgTable(
  "sidekick_setting",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    systemPrompt: text("system_prompt")
      .notNull()
      .default(DEFAULT_SIDEKICK_PROMPT),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_sidekick_settings_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const sidekickActionLog = pgTable(
  "sidekick_action_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull().$type<"instagram">(),
    threadId: text("thread_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    action: text("action").notNull().$type<"sent_reply">(),
    text: text("text").notNull(),
    result: text("result").notNull().$type<"sent" | "failed">(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    messageId: text("message_id"),
    webhookMid: text("webhook_mid"),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_sidekick_action_logs_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const billingUsageEvent = pgTable(
  "billing_usage_event",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind")
      .notNull()
      .$type<"sidekick_chat_prompt">(),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (table) => [
    check(
      "billing_usage_event_kind_check",
      sql`${table.kind} = 'sidekick_chat_prompt'`,
    ),
    pgPolicy("user_billing_usage_events_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const chatSession = pgTable(
  "chat_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_chat_sessions_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => chatSession.id, { onDelete: "cascade" }),
    role: text("role").notNull().$type<"user" | "assistant">(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_chat_messages_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`session_id IN (
      SELECT id FROM chat_session WHERE user_id = auth.uid()
    )`,
      withCheck: sql`session_id IN (
      SELECT id FROM chat_session WHERE user_id = auth.uid()
    )`,
    }),
  ],
);

export const automation = pgTable(
  "automation",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    triggerWord: text("trigger_word").notNull(),
    responseType: text("response_type")
      .notNull()
      .$type<"fixed" | "ai_prompt" | "generic_template">(),
    responseContent: text("response_content").notNull(),
    isActive: boolean("is_active").default(true),
    triggerScope: text("trigger_scope")
      .default("dm")
      .$type<"dm" | "comment" | "both">(),
    hrnEnforced: boolean("hrn_enforced").default(false),
    commentReplyCount: integer("comment_reply_count").default(0),
    commentReplyText: text("comment_reply_text"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_automations_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const automationPost = pgTable(
  "automation_post",
  {
    id: text("id").primaryKey(),
    automationId: text("automation_id")
      .notNull()
      .references(() => automation.id, { onDelete: "cascade" }),
    postId: text("post_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_automation_posts_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`automation_id IN (
      SELECT id FROM automation WHERE user_id = auth.uid()
    )`,
      withCheck: sql`automation_id IN (
      SELECT id FROM automation WHERE user_id = auth.uid()
    )`,
    }),
  ],
);

export const automationActionLog = pgTable(
  "automation_action_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull().$type<"instagram">(),
    threadId: text("thread_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    automationId: text("automation_id")
      .notNull()
      .references(() => automation.id, { onDelete: "cascade" }),
    triggerWord: text("trigger_word").notNull(),
    action: text("action")
      .notNull()
      .$type<
        | "dm_automation_triggered"
        | "comment_automation_triggered"
        | "dm_and_comment_automation_triggered"
        | "sent_reply"
      >(),
    text: text("text"),
    messageId: text("message_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("user_automation_action_logs_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`user_id = auth.uid()`,
      withCheck: sql`user_id = auth.uid()`,
    }),
  ],
);

export const waitlist = pgTable(
  "waitlist",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_table) => [
    pgPolicy("waitlist_policy", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);
