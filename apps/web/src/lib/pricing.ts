type PlanId = "free" | "starter" | "growth" | "pro"

interface BillingLimits {
  maxContactsTotal: number | null
  maxNewContactsPerMonth: number | null
  maxAutomations: number | null
  maxSidekickSendsPerMonth: number | null
  maxSidekickChatPromptsPerMonth: number | null
}

interface PricingPlan {
  planId: PlanId
  title: string
  description: string
  monthlyPriceCents: number
  yearlyPriceCents: number | null
  displayMonthlyPrice: string
  displayYearlyPrice: string | null
  features: string[]
  highlighted?: boolean
  limits: BillingLimits
}

function formatLimitValue(value: number | null, singular: string): string {
  if (value === null) {
    return `Unlimited ${singular}s`
  }

  return `Up to ${value.toLocaleString()} ${singular}${value === 1 ? "" : "s"}`
}

function getPlanFeaturesFromLimits(limits: BillingLimits): string[] {
  return [
    formatLimitValue(limits.maxContactsTotal, "contact"),
    limits.maxAutomations === null
      ? "Unlimited automations"
      : `Up to ${limits.maxAutomations.toLocaleString()} automation${limits.maxAutomations === 1 ? "" : "s"}`,
    limits.maxNewContactsPerMonth === null
      ? "Unlimited new contacts per month"
      : `Up to ${limits.maxNewContactsPerMonth.toLocaleString()} new contacts per month`,
    limits.maxSidekickSendsPerMonth === null
      ? "Unlimited AI sends per month"
      : `Up to ${limits.maxSidekickSendsPerMonth.toLocaleString()} AI sends per month`,
    limits.maxSidekickChatPromptsPerMonth === null
      ? "Unlimited Sidekick chats per month"
      : `Up to ${limits.maxSidekickChatPromptsPerMonth.toLocaleString()} Sidekick chats per month`,
  ]
}

export const pricingPlans: PricingPlan[] = [
  {
    planId: "free",
    title: "Free",
    description: "Use the core workflow with strict caps.",
    monthlyPriceCents: 0,
    yearlyPriceCents: null,
    displayMonthlyPrice: "$0",
    displayYearlyPrice: null,
    features: getPlanFeaturesFromLimits({
      maxContactsTotal: 50,
      maxNewContactsPerMonth: 10,
      maxAutomations: 1,
      maxSidekickSendsPerMonth: 10,
      maxSidekickChatPromptsPerMonth: 3,
    }),
    limits: {
      maxContactsTotal: 50,
      maxNewContactsPerMonth: 10,
      maxAutomations: 1,
      maxSidekickSendsPerMonth: 10,
      maxSidekickChatPromptsPerMonth: 3,
    },
  },
  {
    planId: "starter",
    title: "Starter",
    description: "For creators handling a modest volume.",
    monthlyPriceCents: 1900,
    yearlyPriceCents: 1520,
    displayMonthlyPrice: "$19",
    displayYearlyPrice: "$15.20",
    highlighted: true,
    features: getPlanFeaturesFromLimits({
      maxContactsTotal: 2000,
      maxNewContactsPerMonth: 500,
      maxAutomations: 3,
      maxSidekickSendsPerMonth: 1000,
      maxSidekickChatPromptsPerMonth: 100,
    }),
    limits: {
      maxContactsTotal: 2000,
      maxNewContactsPerMonth: 500,
      maxAutomations: 3,
      maxSidekickSendsPerMonth: 1000,
      maxSidekickChatPromptsPerMonth: 100,
    },
  },
  {
    planId: "growth",
    title: "Growth",
    description: "For growing teams that need more headroom.",
    monthlyPriceCents: 3900,
    yearlyPriceCents: 3120,
    displayMonthlyPrice: "$39",
    displayYearlyPrice: "$31.20",
    features: getPlanFeaturesFromLimits({
      maxContactsTotal: 5000,
      maxNewContactsPerMonth: 2000,
      maxAutomations: null,
      maxSidekickSendsPerMonth: 2500,
      maxSidekickChatPromptsPerMonth: 300,
    }),
    limits: {
      maxContactsTotal: 5000,
      maxNewContactsPerMonth: 2000,
      maxAutomations: null,
      maxSidekickSendsPerMonth: 2500,
      maxSidekickChatPromptsPerMonth: 300,
    },
  },
  {
    planId: "pro",
    title: "Pro",
    description: "For high-volume teams that need the full range.",
    monthlyPriceCents: 4900,
    yearlyPriceCents: 3920,
    displayMonthlyPrice: "$49",
    displayYearlyPrice: "$39.20",
    features: getPlanFeaturesFromLimits({
      maxContactsTotal: 10000,
      maxNewContactsPerMonth: 5000,
      maxAutomations: null,
      maxSidekickSendsPerMonth: 6000,
      maxSidekickChatPromptsPerMonth: 500,
    }),
    limits: {
      maxContactsTotal: 10000,
      maxNewContactsPerMonth: 5000,
      maxAutomations: null,
      maxSidekickSendsPerMonth: 6000,
      maxSidekickChatPromptsPerMonth: 500,
    },
  },
]

export function hasAnyYearlyPricing(): boolean {
  return pricingPlans.some(
    (plan) =>
      plan.yearlyPriceCents !== null && plan.displayYearlyPrice !== null,
  )
}

export function formatPlanPrice(plan: PricingPlan, isYearly: boolean): string {
  if (isYearly && plan.displayYearlyPrice) {
    return plan.displayYearlyPrice
  }

  return plan.displayMonthlyPrice
}
