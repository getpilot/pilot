import { pricingPlans } from "@/lib/pricing";

export function GET() {
  const body = [
    "# Pilot pricing",
    "",
    "All prices are in USD.",
    "",
    ...pricingPlans.flatMap((plan) => [
      `## ${plan.title}`,
      `- Price monthly: ${plan.displayMonthlyPrice}/month`,
      `- Price yearly: ${plan.displayYearlyPrice ? `${plan.displayYearlyPrice}/month billed annually` : "Not available"}`,
      `- Description: ${plan.description}`,
      ...plan.features.map((feature) => `- ${feature}`),
      "",
    ]),
    "## Enterprise",
    "- Price: Custom",
    "- Features: Unlimited contacts, dedicated infrastructure, SLA, custom integrations, self-host support",
    "- Contact: https://www.instagram.com/pilot.ops/ or https://x.com/PilotOps_",
    "",
    "Checkout happens inside the Pilot app.",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
