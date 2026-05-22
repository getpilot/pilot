import {
  user,
  userFaq,
  userOffer,
  userOfferLink,
  userToneProfile,
} from "@pilot/db/schema";
import type { BusinessKnowledgeSnapshot } from "../memory/supermemory";
import type { Offer, UserPersonalizationData } from "@pilot/types/user";
import { eq } from "drizzle-orm";

export const SIDEKICK_SETUP_STEPS = [
  {
    id: 0,
    name: "Your Links",
  },
  {
    id: 1,
    name: "What You Sell",
  },
  {
    id: 2,
    name: "Common Questions",
  },
  {
    id: 3,
    name: "Your Voice",
  },
] as const;

export type SidekickSetupStatus = {
  sidekick_onboarding_complete: boolean;
  isReady: boolean;
  resumeStep: number;
  resumeHref: string;
  completedSteps: number;
  totalSteps: number;
  missing: string[];
  steps: Array<{
    id: number;
    name: string;
    complete: boolean;
  }>;
};

export type SidekickSetupStatusResult =
  | {
      success: true;
      data: SidekickSetupStatus;
    }
  | {
      success: false;
      error: string;
    };

export const DEFAULT_SIDEKICK_PROMPT =
  "You are Sidekick, Pilot's sales assistant. Reply as the business owner. Rely on retrieved memory and current context. Never invent business facts. Write like a real human: professional, natural, clear, direct, and conversational. Sound like you are explaining something to a smart friend over coffee. Use simple words and short sentences. Stay on point. Do not use buzzwords, corporate jargon, press-release language, fluff, or em dashes. Do not use the 'no x, no y, but z' pattern.";

const PROMPTS = {
  LEAD_ANALYSIS: {
    SYSTEM:
      "You are a lead qualification expert analyzing Instagram conversations. Always respond with valid JSON containing the requested fields: stage, sentiment, leadScore, and nextAction. Never include explanations or additional text outside of the JSON object.",
    MAIN: `You are a lead qualification expert for {businessName}, a {businessType} business that {mainOffering}.\n\nBusiness Context:\n- Business Type: {businessType}\n- Main Offering: {mainOffering}\n- Use Cases: {useCases}\n- Target Goals: {pilotGoals}\n- Lead Volume: {leadsPerMonth} leads per month\n\nAnalyze this Instagram conversation between {businessName} and a potential customer:\n\n{conversationHistory}\n\nBased on this conversation, provide the following information in JSON format:\n1. stage: The stage of the lead ("new", "lead", "follow-up", or "ghosted")\n2. sentiment: The customer sentiment ("hot", "warm", "cold", "neutral", or "ghosted")\n3. leadScore: A numerical score from 0-100 indicating lead quality\n4. nextAction: A brief recommendation for the next action to take with this lead\n\nReturn ONLY valid JSON with these fields and nothing else.`,
  },
  FOLLOW_UP: {
    SYSTEM:
      "Draft Instagram DM follow-ups on behalf of the business owner. Write in first person, use the supplied memory and business facts, and do not invent prices, policies, or offer details. Sound professional but natural. Use simple words, short sentences, and a real human tone. Do not use buzzwords, corporate jargon, press-release language, fluff, em dashes, or the 'no x, no y, but z' pattern.",
    MAIN: `Generate a follow-up DM for {customerName}.\n\nBusiness: {businessName}\nMain offering: {mainOffering}\nTone guidance: {toneGuidance}\nCustomer stage: {stage}\nLead score: {leadScore}\nLast message: {lastMessage}\n\nRecent transcript:\n{recentTranscript}\n\nBusiness knowledge:\n{businessKnowledge}\n\nContact memory:\n{contactMemory}\n\nWrite one short Instagram DM in first person as the business owner. Keep it under 280 characters, friendly, direct, and aimed at the next step. If exact details are missing, ask a brief clarifying question instead of guessing.\n\nMessage:`,
  },
  AUTO_REPLY: {
    SYSTEM:
      "Draft Instagram DM replies on behalf of the business owner. Write in first person, match the requested tone, use retrieved memory, and never invent business details. Sound professional but natural. Use simple words, short sentences, and a real human tone. Do not use buzzwords, corporate jargon, press-release language, fluff, em dashes, or the 'no x, no y, but z' pattern.",
    MAIN: `Continue the Instagram DM with the customer in 1-2 short sentences.\n\nBusiness: {businessName}\nMain offering: {mainOffering}\nTone guidance: {toneGuidance}\n\nRecent transcript:\n{recentTranscript}\n\nBusiness knowledge:\n{businessKnowledge}\n\nContact memory:\n{contactMemory}\n\nBe helpful, friendly, and move toward the next step. Keep it under 280 characters. If the customer asks for exact price, offer details, or policies, use the supplied business knowledge. If it is not present, ask a short clarifying question instead of guessing.`,
  },
} as const;

export async function getSidekickSetupStatusByUserId(
  dbClient: any,
  userId: string,
): Promise<SidekickSetupStatusResult> {
  try {
    const [userData, links, offers, toneProfiles, faqs] = await Promise.all([
      dbClient
        .select({
          main_offering: user.main_offering,
          sidekick_onboarding_complete: user.sidekick_onboarding_complete,
        })
        .from(user)
        .where(eq(user.id, userId))
        .then((rows: Array<Record<string, unknown>>) => rows[0]),
      dbClient
        .select()
        .from(userOfferLink)
        .where(eq(userOfferLink.userId, userId)),
      dbClient.select().from(userOffer).where(eq(userOffer.userId, userId)),
      dbClient
        .select()
        .from(userToneProfile)
        .where(eq(userToneProfile.userId, userId))
        .limit(1),
      dbClient.select().from(userFaq).where(eq(userFaq.userId, userId)),
    ]);

    if (!userData) {
      return { success: false, error: "User not found" } as const;
    }

    const hasPrimaryOfferLink = links.some(
      (link: { type?: string; url?: string | null }) =>
        link.type === "primary" && !!link.url?.trim(),
    );
    const hasOffer = offers.some(
      (offer: { name?: string | null; content?: string | null }) =>
        !!offer.name?.trim() && !!offer.content?.trim(),
    );
    const hasMainOffering =
      typeof userData.main_offering === "string" &&
      userData.main_offering.trim().length > 0;
    const hasFaq = faqs.some(
      (faq: { question?: string | null }) => !!faq.question?.trim(),
    );
    const hasToneProfile = !!toneProfiles[0]?.toneType;

    const steps = SIDEKICK_SETUP_STEPS.map((step) => {
      const complete =
        step.id === 0
          ? hasPrimaryOfferLink
          : step.id === 1
            ? hasOffer && hasMainOffering
            : step.id === 2
              ? hasFaq
              : hasToneProfile;

      return {
        ...step,
        complete,
      };
    });
    const missing = [
      !hasPrimaryOfferLink ? "main offer page" : null,
      !hasOffer ? "at least one offer" : null,
      !hasMainOffering ? "main offering" : null,
      !hasFaq ? "at least one common question" : null,
      !hasToneProfile ? "tone profile" : null,
    ].filter((item): item is string => Boolean(item));
    const firstIncompleteStep = steps.find((step) => !step.complete);
    const hasRequiredData = missing.length === 0;
    const resumeStep = firstIncompleteStep?.id ?? 0;
    const persistedSidekickOnboardingComplete = Boolean(
      userData.sidekick_onboarding_complete,
    );

    if (hasRequiredData && !persistedSidekickOnboardingComplete) {
      try {
        await dbClient
          .update(user)
          .set({ sidekick_onboarding_complete: true })
          .where(eq(user.id, userId));
      } catch (error) {
        console.error(
          "Failed to persist Sidekick onboarding completion:",
          error,
        );
      }
    }

    const sidekick_onboarding_complete =
      persistedSidekickOnboardingComplete || hasRequiredData;

    return {
      success: true,
      data: {
        sidekick_onboarding_complete,
        isReady: hasRequiredData,
        resumeStep,
        resumeHref: hasRequiredData
          ? "/"
          : `/sidekick-onboarding?step=${resumeStep}`,
        completedSteps: steps.filter((step) => step.complete).length,
        totalSteps: steps.length,
        missing,
        steps,
      },
    } as const;
  } catch (error) {
    console.error("Error checking sidekick setup status:", error);
    return {
      success: false,
      error: "Failed to check sidekick setup status",
    } as const;
  }
}

export async function getPersonalizedSidekickDataByUserId(
  dbClient: any,
  userId: string,
) {
  try {
    const userData = await dbClient
      .select({
        name: user.name,
        main_offering: user.main_offering,
        use_case: user.use_case,
        business_type: user.business_type,
        leads_per_month: user.leads_per_month,
        active_platforms: user.active_platforms,
        pilot_goal: user.pilot_goal,
        current_tracking: user.current_tracking,
      })
      .from(user)
      .where(eq(user.id, userId))
      .then((rows: Array<Record<string, unknown>>) => rows[0]);

    const links = await dbClient
      .select()
      .from(userOfferLink)
      .where(eq(userOfferLink.userId, userId));
    const offers = await dbClient
      .select()
      .from(userOffer)
      .where(eq(userOffer.userId, userId));
    const toneProfiles = await dbClient
      .select()
      .from(userToneProfile)
      .where(eq(userToneProfile.userId, userId))
      .limit(1);
    const faqs = await dbClient
      .select()
      .from(userFaq)
      .where(eq(userFaq.userId, userId));

    if (!userData) {
      return { success: false, error: "User not found" } as const;
    }

    return {
      success: true,
      data: {
        user: userData,
        offerLinks: links,
        offers,
        toneProfile: toneProfiles[0] || null,
        faqs,
      },
    } as const;
  } catch (error) {
    console.error("Error fetching personalized sidekick data:", error);
    return {
      success: false,
      error: "Failed to fetch personalized sidekick data",
    } as const;
  }
}

function formatPrompt(
  promptTemplate: string,
  variables: Record<string, string | number>,
) {
  let formattedPrompt = promptTemplate;

  for (const [key, value] of Object.entries(variables)) {
    formattedPrompt = formattedPrompt.split(`{${key}}`).join(String(value));
  }

  return formattedPrompt;
}

function formatPersonalizedPrompt(
  promptTemplate: string,
  userData: UserPersonalizationData & Record<string, unknown>,
) {
  const variables: Record<string, string | number> = {
    businessName: userData.user?.name || "the business",
    businessType: userData.user?.business_type || "business",
    mainOffering: userData.user?.main_offering || "provides services",
    useCases: Array.isArray(userData.user?.use_case)
      ? userData.user.use_case.join(", ")
      : userData.user?.use_case || "various use cases",
    pilotGoals: Array.isArray(userData.user?.pilot_goal)
      ? userData.user.pilot_goal.join(", ")
      : userData.user?.pilot_goal || "business goals",
    leadsPerMonth: userData.user?.leads_per_month || "multiple",
    activePlatforms: Array.isArray(userData.user?.active_platforms)
      ? userData.user.active_platforms.join(", ")
      : userData.user?.active_platforms || "various platforms",
    currentTracking: Array.isArray(userData.user?.current_tracking)
      ? userData.user.current_tracking.join(", ")
      : userData.user?.current_tracking || "various methods",
    toneStyle: userData.toneProfile?.toneType || "professional",
    toneGuidance: buildToneGuidanceFromProfile(userData),
    currentOffers:
      userData.offers
        ?.map((offer: Offer) => `${offer.name}: ${offer.content}`)
        .join("; ") || "various offers",
  };

  return formatPrompt(promptTemplate, variables);
}

async function getPersonalizedSidekickPrompt(params: {
  dbClient: any;
  promptType: keyof typeof PROMPTS;
  additionalVariables?: Record<string, string>;
  userId: string;
}) {
  const result = await getPersonalizedSidekickDataByUserId(
    params.dbClient,
    params.userId,
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch personalized data");
  }

  let finalPrompt = formatPersonalizedPrompt(
    PROMPTS[params.promptType].MAIN,
    result.data,
  );
  let finalSystem = formatPersonalizedPrompt(
    PROMPTS[params.promptType].SYSTEM,
    result.data,
  );

  for (const [key, value] of Object.entries(params.additionalVariables || {})) {
    finalPrompt = finalPrompt.split(`{${key}}`).join(value);
    finalSystem = finalSystem.split(`{${key}}`).join(value);
  }

  return {
    system: finalSystem,
    main: finalPrompt,
  };
}

export function getPersonalizedLeadAnalysisPrompt(
  dbClient: any,
  conversationHistory: string,
  userId: string,
) {
  return getPersonalizedSidekickPrompt({
    dbClient,
    promptType: "LEAD_ANALYSIS",
    additionalVariables: { conversationHistory },
    userId,
  });
}

export function getPersonalizedFollowUpPrompt(
  dbClient: any,
  params: {
    userId: string;
    customerName: string;
    stage: string;
    leadScore: number;
    lastMessage: string;
    recentTranscript: string;
    businessKnowledge: string;
    contactMemory: string;
  },
) {
  return getPersonalizedSidekickPrompt({
    dbClient,
    promptType: "FOLLOW_UP",
    additionalVariables: {
      customerName: params.customerName,
      stage: params.stage,
      leadScore: params.leadScore.toString(),
      lastMessage: params.lastMessage,
      recentTranscript: params.recentTranscript,
      businessKnowledge: params.businessKnowledge,
      contactMemory: params.contactMemory,
    },
    userId: params.userId,
  });
}

export function getPersonalizedAutoReplyPrompt(
  dbClient: any,
  params: {
    userId: string;
    recentTranscript: string;
    businessKnowledge: string;
    contactMemory: string;
  },
) {
  return getPersonalizedSidekickPrompt({
    dbClient,
    promptType: "AUTO_REPLY",
    additionalVariables: params,
    userId: params.userId,
  });
}

function buildToneGuidanceFromProfile(
  userData: UserPersonalizationData & Record<string, unknown>,
) {
  const toneType = userData.toneProfile?.toneType || "friendly";
  const toneProfileRecord = userData.toneProfile as
    | { sampleText?: string[] | null }
    | undefined;
  const samples = Array.isArray(toneProfileRecord?.sampleText)
    ? toneProfileRecord.sampleText.filter(Boolean).slice(0, 3)
    : [];
  const sampleSuffix =
    samples.length > 0 ? ` Examples: ${samples.join(" | ")}` : "";

  switch (toneType) {
    case "direct":
      return `Direct, concise, businesslike.${sampleSuffix}`;
    case "like_me":
      return `Mirror the user's natural voice and phrasing.${sampleSuffix}`;
    case "custom":
      return `Follow the user's custom tone notes.${sampleSuffix}`;
    default:
      return `Warm, professional, and helpful.${sampleSuffix}`;
  }
}

export async function getBusinessKnowledgeSnapshotByUserId(
  dbClient: any,
  userId: string,
) {
  const result = await getPersonalizedSidekickDataByUserId(dbClient, userId);

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch personalized data");
  }

  return {
    mainOffering: result.data.user?.main_offering || null,
    faqs: result.data.faqs.map(
      (faq: { id: string; question: string; answer?: string | null }) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer ?? null,
      }),
    ),
    offers: result.data.offers.map(
      (offer: {
        id: string;
        name: string;
        content: string;
        value?: number | null;
      }) => ({
        id: offer.id,
        name: offer.name,
        content: offer.content,
        value: offer.value ?? null,
      }),
    ),
    offerLinks: result.data.offerLinks.map(
      (link: {
        id: string;
        type: "primary" | "calendar" | "notion" | "website";
        url: string;
      }) => ({
        id: link.id,
        type: link.type,
        url: link.url,
      }),
    ),
    toneProfile: result.data.toneProfile
      ? {
          id: result.data.toneProfile.id,
          toneType: result.data.toneProfile.toneType,
          sampleText: result.data.toneProfile.sampleText || [],
          sampleFiles: result.data.toneProfile.sampleFiles || [],
        }
      : null,
  } satisfies BusinessKnowledgeSnapshot;
}
