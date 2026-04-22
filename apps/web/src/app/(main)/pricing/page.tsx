import type { Metadata } from "next";
import Link from "next/link";
import Pricing from "@/components/landing/pricing";
import { Button } from "@pilot/ui/components/button";
import { RelatedReading } from "@/components/marketing/related-reading";
import {
  MARKETING_LAST_UPDATED_LABEL,
  buildPageMetadata,
  getBreadcrumbSchema,
  getPricingSchema,
  getWebPageSchema,
} from "@/lib/seo";

const pageTitle = "Pilot Pricing";
const pageDescription =
  "Compare Pilot pricing plans for Instagram DM automation, lead management, AI replies, and self-host support.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/pricing",
  keywords: [
    "instagram dm automation pricing",
    "instagram crm pricing",
    "pilot pricing",
  ],
});

const PricingPage = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Pricing", path: "/pricing" },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getWebPageSchema({
              title: pageTitle,
              description: pageDescription,
              path: "/pricing",
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPricingSchema()),
        }}
      />
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-primary">Pricing</p>
        <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Transparent pricing for Instagram-first sales teams
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {MARKETING_LAST_UPDATED_LABEL}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Pilot keeps pricing transparent so creators, founders, and agencies
          can evaluate Instagram automation without guessing at feature gates or
          contact-tax surprises. Every plan includes CRM context, AI-assisted
          workflows, and a path to self-hosting.
        </p>
      </div>

      <div className="mt-12 rounded-[2rem] border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
            Plans
          </p>
          <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose the right volume band, then upgrade inside the app
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every plan includes the core Pilot workflow. The main differences are
            how many contacts, automations, and AI-assisted actions your team
            needs each month.
          </p>
        </div>
        <div className="mt-10">
          <Pricing showHeader={false} showPageLink={false} />
        </div>
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl text-foreground">
            What pricing is optimized for
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Pilot pricing is designed around conversation volume, automations,
            and AI usage so you can forecast costs before a viral post hits.
          </p>
        </article>
        <article className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl text-foreground">
            Need more control?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Enterprise plans are for teams that need dedicated infrastructure,
            SLAs, self-host support, or custom integrations.
          </p>
        </article>
      </section>

      <RelatedReading
        links={[
          {
            href: "/pilot-vs-manychat",
            title: "Pilot vs ManyChat",
            description:
              "See how the pricing model compares alongside CRM depth, AI replies, and self-host control.",
          },
          {
            href: "/comment-to-dm-automation",
            title: "Comment-to-DM automation",
            description:
              "Understand the workflow that turns post engagement into private conversations and pipeline.",
          },
          {
            href: "/open-source",
            title: "Why Pilot is open source",
            description:
              "Learn why transparency and self-hosting are part of the product strategy.",
          },
        ]}
      />

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/waitlist">Join waitlist</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pilot-vs-manychat">Compare Pilot vs ManyChat</Link>
        </Button>
      </div>
    </main>
  );
};

export default PricingPage;
