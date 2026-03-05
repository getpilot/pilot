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
  formatPlanPrice,
  hasAnyYearlyPricing,
  pricingPlans,
} from "@/lib/pricing";
import { useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import Link from "next/link";

const APP_UPGRADE_URL = "https://pilot-ops-app.vercel.app/upgrade";

const getLastRowSpanClass = (index: number, totalCards: number): string => {
  const remainder = totalCards % 3;

  if (remainder === 1 && index === totalCards - 1) {
    return "xl:col-span-6";
  }

  if (remainder === 2 && index >= totalCards - 2) {
    return "xl:col-span-3";
  }

  return "xl:col-span-2";
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const showYearlyToggle = hasAnyYearlyPricing();
  const totalCards = pricingPlans.length + 1;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="mx-auto w-full max-w-6xl"
    >
      <div className="mx-auto text-center">
        <h2
          id="pricing-title"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          Pick a plan that fits your volume
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance text-base md:text-lg">
          Start where you are. Upgrade in-app when your contacts, automations,
          and Sidekick usage grow.
        </p>
      </div>

      {showYearlyToggle && (
        <div className="mt-10 flex items-center justify-center">
          <div
            className="bg-muted relative flex w-[300px] items-center justify-between rounded-full border"
            role="radiogroup"
            aria-label="Billing frequency"
          >
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 w-[120px] px-6 py-3 text-center text-sm font-medium ${!isYearly ? "text-white" : ""}`}
              role="radio"
              aria-checked={!isYearly}
              aria-label="Monthly billing"
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 w-[180px] px-6 py-3 text-center text-sm font-medium ${isYearly ? "text-white" : ""}`}
              role="radio"
              aria-checked={isYearly}
              aria-label="Yearly billing"
            >
              Yearly (20% off)
            </button>
            <LazyMotion features={domAnimation}>
              <m.div
                className="bg-primary absolute z-0 rounded-full"
                initial={false}
                animate={{ x: isYearly ? 120 : 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 300, damping: 30 }
                }
                style={{ width: isYearly ? 180 : 120, height: "100%" }}
              />
            </LazyMotion>
          </div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {pricingPlans.map((plan, index) => {
          const isBestValue = plan.planId === "growth";

          return (
            <Card
              key={plan.planId}
              className={[
                "relative flex h-full flex-col border p-0",
                getLastRowSpanClass(index, totalCards),
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
                  {plan.planId === "free" ? (
                    <Button className="w-full gap-2" variant="outline" asChild>
                      <Link
                        href={APP_UPGRADE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Start in app
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      variant={isBestValue ? "default" : "outline"}
                      asChild
                    >
                      <Link
                        href={APP_UPGRADE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buy in app
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card
          className={[
            "relative flex h-full flex-col border bg-card p-0",
            getLastRowSpanClass(totalCards - 1, totalCards),
          ].join(" ")}
        >
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-lg font-medium">Enterprise</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              For teams that need custom infrastructure and support.
            </p>
            <div className="mt-5">
              <span className="text-4xl font-semibold md:text-5xl">Custom</span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col px-6 pt-6 pb-6">
            <ul role="list" className="space-y-3">
              {[
                "Unlimited contacts",
                "Dedicated infrastructure",
                "SLA",
                "Custom integrations",
                "Self-host support",
              ].map((feature) => (
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
              <Button className="w-full gap-2" variant="outline" asChild>
                <Link
                  href={APP_UPGRADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy in app
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Checkout happens inside the app. Use Buy in app to continue.
      </p>
    </section>
  );
};

export default Pricing;
