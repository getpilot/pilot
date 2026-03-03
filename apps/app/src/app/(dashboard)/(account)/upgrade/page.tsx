"use client";

import { Button } from "@pilot/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@pilot/ui/components/card";
import { ArrowRight, Check } from "lucide-react";
import {
  type PaidPlanId,
  formatPlanPrice,
  getCheckoutConfig,
  hasAnyYearlyPricing,
  isPaidPlanId,
  pricingPlans,
} from "@/lib/constants/pricing";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { handleCheckout } from "@/lib/polar/client";
import PlanBadge from "@/components/subscription-badge";

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const showYearlyToggle = hasAnyYearlyPricing();

  return (
    <section className="bg-background @container">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16 lg:py-24">
        <PlanBadge />

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold md:text-4xl lg:text-5xl">
            Pick a plan that fits your volume
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance text-base md:text-lg">
            Start simple, then upgrade when you need more capacity. Limits are
            enforced by tier, and you can update the quota values in code
            whenever you want.
          </p>
        </div>

        {showYearlyToggle && (
          <div className="flex items-center justify-center mt-10">
            <div
              className="flex items-center justify-between bg-muted rounded-full relative w-[300px] border"
              role="radiogroup"
              aria-label="Billing frequency"
            >
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 py-3 px-6 text-sm font-medium w-[120px] text-center ${
                  !isYearly ? "text-white" : ""
                }`}
                role="radio"
                aria-checked={!isYearly}
                aria-label="Monthly billing"
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 py-3 px-6 text-sm font-medium w-[180px] text-center ${
                  isYearly ? "text-white" : ""
                }`}
                role="radio"
                aria-checked={isYearly}
                aria-label="Yearly billing"
              >
                Yearly (20% off)
              </button>
              <motion.div
                className="absolute z-0 rounded-full bg-primary"
                initial={false}
                animate={{ x: isYearly ? 120 : 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: isYearly ? 180 : 120, height: "100%" }}
              />
            </div>
          </div>
        )}

        <div className="@xl:grid-cols-2 @4xl:grid-cols-4 mt-12 grid gap-4">
          {pricingPlans.map((plan) => {
            const isBestValue = plan.planId === "growth";
            const checkoutConfig = isPaidPlanId(plan.planId)
              ? getCheckoutConfig(plan.planId, isYearly)
              : null;

            return (
              <Card
                key={plan.planId}
                className={[
                  "relative flex h-full flex-col border p-0",
                  isBestValue
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : "bg-card",
                ].join(" ")}
              >
                <CardHeader className="px-6 pt-6 pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg font-medium">
                      {plan.title}
                    </CardTitle>
                    {isBestValue ? (
                      <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                        Best Value
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {plan.description}
                  </p>
                  <div className="mt-5">
                    <span className="text-4xl font-semibold md:text-5xl">
                      {formatPlanPrice(plan, isYearly)}
                    </span>
                    <span className="text-muted-foreground ml-1 text-sm">
                      / month
                    </span>
                  </div>
                  {showYearlyToggle && isYearly ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Billed annually
                    </p>
                  ) : null}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col px-6 pt-6 pb-6">
                  <ul role="list" className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-muted-foreground flex items-center gap-2 text-sm"
                      >
                        <Check className="text-primary size-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    {isPaidPlanId(plan.planId) ? (
                      <Button
                        className="w-full gap-2"
                        variant={isBestValue ? "default" : "outline"}
                        disabled={!checkoutConfig}
                        onClick={async () => {
                          await handleCheckout(
                            plan.planId as PaidPlanId,
                            isYearly,
                          );
                        }}
                      >
                        {checkoutConfig
                          ? "Subscribe"
                          : isYearly
                            ? "Yearly soon"
                            : "Subscribe"}
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Current free tier
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          No free trials. Free access stays on the built-in free tier until you
          subscribe.
        </p>
      </div>
    </section>
  );
}
