"use server";

import { z } from "zod";
import { getUser, getRLSDb } from "@/lib/auth-utils";
import { user } from "@pilot/db/schema";
import { eq } from "drizzle-orm";
import { getBillingStatus } from "@/lib/billing/enforce";
import { getPricingPlan } from "@/lib/constants/pricing";

const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  gender: z.string().trim().max(50, "Gender too long").optional(),
  use_case: z
    .array(z.string().trim().min(1, "Use case cannot be empty"))
    .max(10, "Too many use cases")
    .optional(),
  business_type: z
    .string()
    .trim()
    .max(100, "Business type too long")
    .optional(),
  main_offering: z
    .string()
    .trim()
    .max(500, "Main offering too long")
    .optional(),
});

export async function getUserProfile() {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const db = await getRLSDb();
    const userProfile = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
      columns: {
        id: true,
        name: true,
        email: true,
        gender: true,
        use_case: true,
        business_type: true,
        main_offering: true,
      },
    });

    if (!userProfile) {
      return { success: false, error: "User profile not found" };
    }

    const billingStatus = await getBillingStatus(currentUser.id);
    const currentPlan = getPricingPlan(billingStatus.planId);
    const quotaExceeded =
      billingStatus.flags.isStructurallyFrozen ||
      !billingStatus.flags.canCreateContact ||
      !billingStatus.flags.canCreateAutomation ||
      !billingStatus.flags.canUseSidekickChat ||
      !billingStatus.flags.canSendSidekickReply;

    return {
      success: true,
      profile: {
        name: userProfile.name,
        email: userProfile.email,
        gender: userProfile.gender,
        use_case: userProfile.use_case,
        business_type: userProfile.business_type,
        main_offering: userProfile.main_offering,
        quota: {
          planId: billingStatus.planId,
          planName: currentPlan.title,
          exceeded: quotaExceeded,
          usage: billingStatus.usage,
          limits: billingStatus.limits,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch user profile",
    };
  }
}

export async function updateUserProfile(fields: {
  name?: string;
  gender?: string;
  use_case?: string[];
  business_type?: string;
  main_offering?: string;
}) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const validationResult = updateUserProfileSchema.safeParse(fields);
    if (!validationResult.success) {
      return {
        success: false,
        error: `Validation failed: ${validationResult.error.issues
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    const validatedFields = validationResult.data;
    const updateData: Partial<typeof user.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validatedFields.name !== undefined)
      updateData.name = validatedFields.name;
    if (validatedFields.gender !== undefined)
      updateData.gender = validatedFields.gender;
    if (validatedFields.use_case !== undefined)
      updateData.use_case = validatedFields.use_case;
    if (validatedFields.business_type !== undefined)
      updateData.business_type = validatedFields.business_type;
    if (validatedFields.main_offering !== undefined)
      updateData.main_offering = validatedFields.main_offering;

    const db = await getRLSDb();
    await db.update(user).set(updateData).where(eq(user.id, currentUser.id));

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update user profile",
    };
  }
}
