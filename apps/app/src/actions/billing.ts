"use server";

import { getUser } from "@/lib/auth-utils";
import { getBillingStatus } from "@/lib/billing/enforce";

export async function getCurrentBillingStatusAction() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  return getBillingStatus(user.id);
}
