"use server";

import { v4 as uuidv4 } from "uuid";
import {
  userOffer,
  userToneProfile,
  userOfferLink,
  userFaq,
  user,
} from "@pilot/db/schema";
import { auth } from "@/lib/auth";
import { getRLSDb } from "@/lib/auth-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { enqueueBusinessKnowledgeSync } from "@/lib/supermemory/events";
import {
  getSidekickSetupStatusByUserId,
  SIDEKICK_SETUP_STEPS,
} from "@pilot/core/sidekick/personalization";

export type SidekickOnboardingData = {
  offerLinks?: {
    type: "primary" | "calendar" | "notion" | "website";
    url: string;
  }[];
  offers?: {
    name: string;
    content: string;
    value?: number;
  }[];
  productDescription?: string;
  mainOffering?: string;
  faqs?: {
    question: string;
    answer?: string;
  }[];
  toneProfile?: {
    toneType: "friendly" | "direct" | "like_me" | "custom";
    sampleText?: string[];
    sampleFiles?: string[];
  };
};

export async function updateSidekickOnboardingData(
  data: SidekickOnboardingData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    if (data.mainOffering) {
      await db
        .update(user)
        .set({
          main_offering: data.mainOffering,
        })
        .where(eq(user.id, session.user.id));
    }

    if (data.offerLinks && data.offerLinks.length > 0) {
      for (const link of data.offerLinks) {
        const existingLinks = await db
          .select()
          .from(userOfferLink)
          .where(
            and(
              eq(userOfferLink.userId, session.user.id),
              eq(userOfferLink.type, link.type),
              eq(userOfferLink.url, link.url),
            ),
          );

        if (existingLinks.length === 0) {
          await db.insert(userOfferLink).values({
            id: uuidv4(),
            userId: session.user.id,
            type: link.type,
            url: link.url,
          });
        }
      }
    }

    if (data.offers && data.offers.length > 0) {
      for (const offer of data.offers) {
        const existingOffers = await db
          .select()
          .from(userOffer)
          .where(
            and(
              eq(userOffer.userId, session.user.id),
              eq(userOffer.name, offer.name),
              eq(userOffer.content, offer.content),
            ),
          );

        if (existingOffers.length === 0) {
          await db.insert(userOffer).values({
            id: uuidv4(),
            userId: session.user.id,
            name: offer.name,
            content: offer.content,
            value: offer.value,
          });
        }
      }
    }

    if (data.faqs && data.faqs.length > 0) {
      for (const faq of data.faqs) {
        const existingFaqs = await db
          .select()
          .from(userFaq)
          .where(
            and(
              eq(userFaq.userId, session.user.id),
              eq(userFaq.question, faq.question),
            ),
          );

        if (existingFaqs.length === 0) {
          await db.insert(userFaq).values({
            id: uuidv4(),
            userId: session.user.id,
            question: faq.question,
            answer: faq.answer || null,
          });
        } else {
          await db
            .update(userFaq)
            .set({
              question: faq.question,
              answer: faq.answer || null,
            })
            .where(eq(userFaq.id, existingFaqs[0].id));
        }
      }
    }

    if (data.toneProfile) {
      const existingProfiles = await db
        .select()
        .from(userToneProfile)
        .where(eq(userToneProfile.userId, session.user.id));

      if (existingProfiles.length === 0) {
        await db.insert(userToneProfile).values({
          id: uuidv4(),
          userId: session.user.id,
          toneType: data.toneProfile.toneType,
          sampleText: data.toneProfile.sampleText || [],
          sampleFiles: data.toneProfile.sampleFiles || [],
        });
      } else {
        await db
          .update(userToneProfile)
          .set({
            toneType: data.toneProfile.toneType,
            sampleText: data.toneProfile.sampleText || [],
            sampleFiles: data.toneProfile.sampleFiles || [],
          })
          .where(eq(userToneProfile.id, existingProfiles[0].id));
      }
    }

    await enqueueBusinessKnowledgeSync(
      session.user.id,
      "updateSidekickOnboardingData",
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating sidekick onboarding data:", error);
    return {
      success: false,
      error: "Failed to update sidekick onboarding data",
    };
  }
}

export async function deleteOffer(offerId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    await db
      .delete(userOffer)
      .where(
        and(eq(userOffer.id, offerId), eq(userOffer.userId, session.user.id)),
      );

    await enqueueBusinessKnowledgeSync(session.user.id, "deleteOffer");

    return { success: true };
  } catch (error) {
    console.error("Error deleting offer:", error);
    return { success: false, error: "Failed to delete offer" };
  }
}

export async function saveSidekickOfferLink(linkData: {
  type: "primary" | "calendar" | "notion" | "website";
  url: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const existingLinks = await db
      .select()
      .from(userOfferLink)
      .where(
        and(
          eq(userOfferLink.url, linkData.url),
          eq(userOfferLink.userId, session.user.id),
          eq(userOfferLink.type, linkData.type),
        ),
      );

    if (existingLinks.length === 0) {
      await db.insert(userOfferLink).values({
        id: uuidv4(),
        userId: session.user.id,
        type: linkData.type,
        url: linkData.url,
      });
    }

    await enqueueBusinessKnowledgeSync(
      session.user.id,
      "saveSidekickOfferLink",
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving offer link:", error);
    return { success: false, error: "Failed to save offer link" };
  }
}

export async function getSidekickFaqs() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const faqs = await db
      .select()
      .from(userFaq)
      .where(eq(userFaq.userId, session.user.id));

    return { success: true, data: faqs };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return { success: false, error: "Failed to fetch FAQs" };
  }
}

export async function deleteFaq(faqId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    await db
      .delete(userFaq)
      .where(and(eq(userFaq.id, faqId), eq(userFaq.userId, session.user.id)));

    await enqueueBusinessKnowledgeSync(session.user.id, "deleteFaq");

    return { success: true };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return { success: false, error: "Failed to delete FAQ" };
  }
}

export async function saveSidekickOffer(offerData: {
  name: string;
  content: string;
  value?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const existingOffers = await db
      .select()
      .from(userOffer)
      .where(
        and(
          eq(userOffer.userId, session.user.id),
          eq(userOffer.name, offerData.name),
          eq(userOffer.content, offerData.content),
        ),
      );

    if (existingOffers.length === 0) {
      await db.insert(userOffer).values({
        id: uuidv4(),
        userId: session.user.id,
        name: offerData.name,
        content: offerData.content,
        value: offerData.value,
      });
    }

    await enqueueBusinessKnowledgeSync(session.user.id, "saveSidekickOffer");

    return { success: true };
  } catch (error) {
    console.error("Error saving offer:", error);
    return { success: false, error: "Failed to save offer" };
  }
}

export async function saveSidekickToneProfile(toneData: {
  toneType: "friendly" | "direct" | "like_me" | "custom";
  sampleText?: string[];
  sampleFiles?: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const existingProfiles = await db
      .select()
      .from(userToneProfile)
      .where(eq(userToneProfile.userId, session.user.id));

    if (existingProfiles.length === 0) {
      await db.insert(userToneProfile).values({
        id: uuidv4(),
        userId: session.user.id,
        toneType: toneData.toneType,
        sampleText: toneData.sampleText || [],
        sampleFiles: toneData.sampleFiles || [],
      });
    } else {
      // Update existing tone profile instead of creating a new one
      await db
        .update(userToneProfile)
        .set({
          toneType: toneData.toneType,
          sampleText: toneData.sampleText || [],
          sampleFiles: toneData.sampleFiles || [],
        })
        .where(eq(userToneProfile.id, existingProfiles[0].id));
    }

    await enqueueBusinessKnowledgeSync(
      session.user.id,
      "saveSidekickToneProfile",
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving tone profile:", error);
    return { success: false, error: "Failed to save tone profile" };
  }
}

export async function completeSidekickOnboarding() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    await db
      .update(user)
      .set({
        sidekick_onboarding_complete: true,
      })
      .where(eq(user.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error completing sidekick onboarding:", error);
    return { success: false, error: "Failed to complete sidekick onboarding" };
  }
}

export async function getSidekickOnboardingData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const db = await getRLSDb();
    const userData = await db
      .select({
        main_offering: user.main_offering,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .then((res) => res[0]);

    const links = await db
      .select()
      .from(userOfferLink)
      .where(eq(userOfferLink.userId, session.user.id));

    const formattedLinks = {
      primaryOfferUrl: "",
      calendarLink: "",
      additionalInfoUrl: "",
    };

    links.forEach((link) => {
      if (link.type === "primary") {
        formattedLinks.primaryOfferUrl = link.url;
      } else if (link.type === "calendar") {
        formattedLinks.calendarLink = link.url;
      } else if (link.type === "website") {
        formattedLinks.additionalInfoUrl = link.url;
      }
    });

    const offers = await db
      .select()
      .from(userOffer)
      .where(eq(userOffer.userId, session.user.id));

    const toneProfiles = await db
      .select()
      .from(userToneProfile)
      .where(eq(userToneProfile.userId, session.user.id))
      .limit(1);

    let toneProfileData = { toneType: "", customTone: "", sampleMessages: "" };

    if (toneProfiles.length > 0) {
      const profile = toneProfiles[0];
      let toneType = "";
      let customTone = "";
      let sampleMessages = "";

      switch (profile.toneType) {
        case "friendly":
          toneType = "Chill & Friendly";
          break;
        case "direct":
          toneType = "Confident & Direct";
          break;
        case "like_me":
          toneType = "Like Me";
          if (profile.sampleText && profile.sampleText.length > 0) {
            sampleMessages = profile.sampleText.join("\n");
          }
          break;
        case "custom":
          toneType = "Custom";
          if (profile.sampleText && profile.sampleText.length > 0) {
            customTone = profile.sampleText[0];
          }
          break;
      }

      toneProfileData = {
        toneType,
        customTone,
        sampleMessages,
      };
    }

    return {
      success: true,
      data: {
        offerLinks: formattedLinks,
        offers,
        toneProfile: toneProfileData,
        mainOffering: userData?.main_offering || "",
      },
    };
  } catch (error) {
    console.error("Error fetching sidekick onboarding data:", error);
    return {
      success: false,
      error: "Failed to fetch sidekick onboarding data",
    };
  }
}

export async function getSidekickOfferLinks() {
  const result = await getSidekickOnboardingData();
  if (result.success) {
    return { success: true, data: result.data?.offerLinks };
  }
  return {
    success: false,
    error: result.error || "Failed to fetch offer links",
  };
}

export async function getSidekickOffers() {
  const result = await getSidekickOnboardingData();
  if (result.success) {
    return { success: true, data: result.data?.offers };
  }
  return { success: false, error: result.error || "Failed to fetch offers" };
}

export async function getSidekickToneProfile() {
  const result = await getSidekickOnboardingData();
  if (result.success) {
    return { success: true, data: result.data?.toneProfile };
  }
  return {
    success: false,
    error: result.error || "Failed to fetch tone profile",
  };
}

export async function getSidekickMainOffering() {
  const result = await getSidekickOnboardingData();
  if (result.success) {
    return { success: true, data: result.data?.mainOffering };
  }
  return {
    success: false,
    error: result.error || "Failed to fetch main offering",
  };
}

export async function checkSidekickOnboardingStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  try {
    const db = await getRLSDb();
    const result = await getSidekickSetupStatusByUserId(db, session.user.id);

    if (result.success) {
      return result.data;
    }

    return {
      sidekick_onboarding_complete: false,
      isReady: false,
      resumeStep: 0,
      resumeHref: "/sidekick-onboarding?step=0",
      completedSteps: 0,
      totalSteps: SIDEKICK_SETUP_STEPS.length,
      missing: ["Sidekick setup data"],
      steps: SIDEKICK_SETUP_STEPS.map((step) => ({
        ...step,
        complete: false,
      })),
      error: result.error,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return {
      sidekick_onboarding_complete: false,
      isReady: false,
      resumeStep: 0,
      resumeHref: "/sidekick-onboarding?step=0",
      completedSteps: 0,
      totalSteps: SIDEKICK_SETUP_STEPS.length,
      missing: ["Sidekick setup data"],
      steps: SIDEKICK_SETUP_STEPS.map((step) => ({
        ...step,
        complete: false,
      })),
      error: "Failed to check onboarding status",
    };
  }
}
