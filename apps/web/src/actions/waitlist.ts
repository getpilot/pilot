"use server";

import { randomUUID } from "crypto";
import { db } from "@pilot/db";
import { waitlist } from "@pilot/db/schema";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Add a user to the waitlist directly from the web app
 *
 * @param email - User's email address
 * @param name - User's full name
 * @returns Promise with success/error response matching your existing server action format
 */
const addToWaitlist = async (
  email: string,
  name: string
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    if (!EMAIL_REGEX.test(email)) {
      return { success: false, error: "Please enter a valid email" };
    }

    if (!name.trim()) {
      return { success: false, error: "Please enter your name" };
    }

    await db.insert(waitlist).values({
      id: randomUUID(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error in addToWaitlist action:", error);

    const err = error as { code?: string };
    if (err?.code === "23505") {
      return { success: false, error: "Email is already on the waitlist" };
    }

    return { success: false, error: "Failed to add to waitlist" };
  }
}

/**
 * Server action for form submission that accepts FormData
 */
export async function submitWaitlistAction(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const email = String(formData.get("email") || "").trim();
  const name = String(formData.get("name") || "").trim();

  return await addToWaitlist(email, name);
}

