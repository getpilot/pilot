import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@pilot/db";
import { env } from "@/env";
import { polarInstance } from "@/lib/polar/server";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { getPaidPricingPlans } from "@/lib/constants/pricing";

const checkoutProducts = getPaidPricingPlans().flatMap((plan) => {
  const products: Array<{ productId: string; slug: string }> = [];

  if (plan.polar.monthlyProductId && plan.polar.monthlySlug) {
    products.push({
      productId: plan.polar.monthlyProductId,
      slug: plan.polar.monthlySlug,
    });
  }

  if (plan.polar.yearlyProductId && plan.polar.yearlySlug) {
    products.push({
      productId: plan.polar.yearlyProductId,
      slug: plan.polar.yearlySlug,
    });
  }

  return products;
});

export const auth = betterAuth({
  baseURL:
    process.env.VERCEL === "1"
      ? process.env.VERCEL_ENV === "production"
        ? process.env.BETTER_AUTH_URL
        : process.env.VERCEL_ENV === "preview"
          ? `https://${process.env.VERCEL_URL}`
          : undefined
      : undefined,
  trustedOrigins: [
    "http://localhost:3000",
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    nextCookies(),
    polar({
      client: polarInstance,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: checkoutProducts,
          authenticatedUsersOnly: true,
          successUrl: "/",
        }),
        portal(),
      ],
    }),
  ],
});
