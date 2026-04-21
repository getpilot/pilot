import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@pilot/ui/components/button";
import { RelatedReading } from "@/components/marketing/related-reading";
import {
  MARKETING_LAST_UPDATED_LABEL,
  buildPageMetadata,
  getBreadcrumbSchema,
  getWebPageSchema,
  researchSources,
} from "@/lib/seo";

const pageTitle = "Instagram DM Automation Guide";
const pageDescription =
  "Learn what Instagram DM automation should do, what teams should look for in a tool, and how Pilot handles follow-up, routing, and lead qualification.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/instagram-dm-automation",
  keywords: [
    "instagram dm automation",
    "instagram comment to dm automation",
    "instagram lead management",
  ],
});

const proofCards = [
  {
    stat: "73%",
    title: "expect a response within 24 hours or sooner",
    source: researchSources.socialResponseWindow,
  },
  {
    stat: "73%",
    title: "say they will buy from a competitor if a brand does not respond on social",
    source: researchSources.competitorRisk,
  },
  {
    stat: "35%",
    title: "of U.S. consumers used Instagram for customer service in Sprout's 2022 Index, cited in its 2025 customer service analysis",
    source: {
      name: "Sprout Social customer service analysis",
      url: "https://sproutsocial.com/insights/social-media-customer-service-statistics/",
      stat: "Our 2022 Sprout Social Index found that 35% of U.S. consumers use Instagram for customer service.",
    },
  },
];

const sections = [
  {
    title: "What Instagram DM automation should actually solve",
    body: "Good Instagram automation does more than send a canned reply. It should capture buying signals from DMs and comments, preserve context across the thread, route risky cases to a human, and keep lead data attached to the conversation.",
  },
  {
    title: "Where basic flow-builders fall short",
    body: "Most DM tools are optimized for trigger maps, not revenue operations. Teams outgrow them when they need CRM context, nuanced replies, lead scoring, ownership, or a safe way to pause automation when a thread gets sensitive.",
  },
  {
    title: "How Pilot approaches the problem",
    body: "Pilot treats Instagram messaging like a live pipeline. It combines AI-assisted classification, reply generation, contact records, workflow controls, and human-response-needed routing so follow-up stays fast without becoming reckless.",
  },
];

const InstagramDMAutomationPage = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Instagram DM Automation", path: "/instagram-dm-automation" },
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
              path: "/instagram-dm-automation",
            }),
          ),
        }}
      />
      <div className="max-w-4xl">
        <p className="text-sm font-medium text-primary">Guide</p>
        <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Instagram DM automation for teams that care about conversion quality
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {MARKETING_LAST_UPDATED_LABEL}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Instagram DM automation works best when it behaves like a sales system,
          not a brittle autoresponder. The goal is to respond quickly, keep lead
          context intact, and know exactly when a human should step in.
        </p>
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {proofCards.map((card) => (
          <article key={card.title} className="rounded-2xl border bg-card p-6">
            <p className="font-heading text-4xl text-foreground">{card.stat}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {card.title}
            </p>
            <Link
              href={card.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm text-primary underline underline-offset-4"
            >
              Source: {card.source.name}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border bg-card p-6">
            <h2 className="font-heading text-2xl text-foreground">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <h2 className="font-heading text-3xl text-foreground">
          What to look for in an Instagram automation stack
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Operations requirements
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Shared inbox visibility across DMs, comments, and follow-up</li>
              <li>Lead records with stage, owner, notes, and sentiment</li>
              <li>Safe escalation rules for risky or nuanced conversations</li>
              <li>Pricing that stays predictable as conversation volume grows</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Buyer questions to ask
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Can the tool move from comment to DM without losing context?</li>
              <li>Does it support human handoff before a thread goes sideways?</li>
              <li>Can operators audit what the automation is doing?</li>
              <li>Is pricing transparent enough for both humans and AI buyers?</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <h2 className="font-heading text-3xl text-foreground">
          How to roll out DM automation without hurting trust
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Start with the highest-intent entry points first: warm inbound DMs,
          repeat questions, and comment-trigger follow-up that leads to a real
          next step. Keep humans in the loop for refund requests, policy-heavy
          conversations, pricing exceptions, and emotionally charged threads.
          The best automation stack is the one that speeds up simple conversations
          while making handoff obvious when nuance matters.
        </p>
      </section>

      <RelatedReading
        links={[
          {
            href: "/comment-to-dm-automation",
            title: "Comment-to-DM automation",
            description:
              "A more specific guide on turning public post engagement into private pipeline.",
          },
          {
            href: "/pilot-vs-manychat",
            title: "Pilot vs ManyChat",
            description:
              "Compare the category tradeoffs between a flow-builder and a sales-system approach.",
          },
          {
            href: "/pricing",
            title: "Pilot pricing",
            description:
              "Review the plans for teams scaling contacts, automations, and AI-assisted workflow volume.",
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

export default InstagramDMAutomationPage;
