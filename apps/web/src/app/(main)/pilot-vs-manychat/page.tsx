import type { Metadata } from "next";
import Link from "next/link";
import CompareTable from "@/components/landing/compare";
import { Button } from "@pilot/ui/components/button";
import { RelatedReading } from "@/components/marketing/related-reading";
import {
  MARKETING_LAST_UPDATED_LABEL,
  buildPageMetadata,
  getBreadcrumbSchema,
  getWebPageSchema,
} from "@/lib/seo";

const pageTitle = "Pilot vs ManyChat";
const pageDescription =
  "Compare Pilot vs ManyChat for Instagram DM automation, CRM depth, AI replies, pricing model, and open-source control.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/pilot-vs-manychat",
  keywords: [
    "pilot vs manychat",
    "manychat alternative",
    "instagram dm automation comparison",
  ],
});

const comparisonBullets = [
  "Pilot is built for teams that want one system for inbox automation, lead qualification, and CRM context instead of a separate chatbot layer.",
  "ManyChat is still stronger for visual flow mapping and broader packaged channel support, but Pilot is stronger when the job is conversion quality inside Instagram DMs.",
  "If your team cares about predictable pricing, business-aware AI replies, and open-source control, Pilot is the sharper alternative.",
];

const proofMoments = [
  {
    title: "Warm intent arrives in bursts",
    body: "A post, reel, or story can create dozens of simultaneous DM threads. That is exactly when rigid flow logic starts to show its limits and when revenue leaks through follow-up gaps.",
  },
  {
    title: "Rule trees protect logic, not context",
    body: "ManyChat can route users through clear branches, but the system still depends on you predicting every path in advance. Pilot is designed to understand the business context around the conversation, not just the trigger that started it.",
  },
  {
    title: "The closer the thread gets to purchase, the more context matters",
    body: "Price objections, intent shifts, and handoff moments are rarely clean if/else branches. Pilot is better aligned with those real sales conversations because the AI layer is meant to operate on context, not just routing rules.",
  },
];

const PilotVsManyChatPage = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Pilot vs ManyChat", path: "/pilot-vs-manychat" },
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
              path: "/pilot-vs-manychat",
            }),
          ),
        }}
      />
      <div className="max-w-4xl">
        <p className="text-sm font-medium text-primary">Comparison</p>
        <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Pilot vs ManyChat for Instagram DM automation
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {MARKETING_LAST_UPDATED_LABEL}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          This page is for teams evaluating whether they need a traditional
          flow-builder or a more modern Instagram sales system. Pilot focuses
          on qualifying demand, keeping CRM context attached to every thread,
          and escalating sensitive conversations before automation becomes
          risky.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {comparisonBullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {bullet}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-[2rem] border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
            Focus areas
          </p>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl">
            Why teams usually pick Pilot over ManyChat
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            The three biggest reasons are usually pricing clarity, AI-native
            conversion workflows, and open-source control. This is where the
            product experience feels fundamentally different, not just
            cosmetically different.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border bg-background/70 p-5">
            <h3 className="font-heading text-2xl text-foreground">
              Pricing that is easier to forecast
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pilot shows public plan bands and what each one includes. That
              makes it easier for teams to estimate spend before a campaign or a
              viral post drives new conversations into the system.
            </p>
          </article>
          <article className="rounded-2xl border bg-background/70 p-5">
            <h3 className="font-heading text-2xl text-foreground">
              AI-native instead of rule-map-first
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyChat is strongest when you want a rigid trigger tree. Pilot is
              built around business-aware AI that can work from your offers,
              FAQs, tone, lead context, and handoff rules to move the thread
              toward conversion instead of only routing through predefined maps.
            </p>
          </article>
          <article className="rounded-2xl border bg-background/70 p-5">
            <h3 className="font-heading text-2xl text-foreground">
              Open source and self-host control
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pilot gives teams an inspectable, forkable path instead of forcing
              them into a closed automation layer. That matters when the system
              touches customer conversations and revenue operations.
            </p>
          </article>
        </div>
      </section>

      <div className="mt-14">
        <CompareTable
          showPageLink={false}
          title="Feature-by-feature breakdown"
          description="A practical view of where Pilot is stronger today, where ManyChat still has the edge, and what those tradeoffs mean for an Instagram-first team."
        />
      </div>

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
            Case-study lens
          </p>
          <h2 className="font-heading mt-3 text-3xl text-foreground">
            Why this comparison matters in a real buying workflow
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Most teams do not switch tools because they suddenly love software
            comparisons. They switch because inbound demand is already there and
            the current system is too rigid to keep up with how people actually
            buy in DMs.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {proofMoments.map((moment) => (
            <article key={moment.title} className="rounded-2xl border p-5">
              <h3 className="font-heading text-2xl text-foreground">
                {moment.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {moment.body}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border bg-background/70 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary/80">
            Small proof page
          </p>
          <h3 className="font-heading mt-3 text-2xl text-foreground">
            See the compact workflow proof behind this argument
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            If you want the short version, the proof page shows the operating
            difference: Pilot is built to keep warm leads moving with business
            context attached, while ManyChat is still better understood as a
            rule-first automation tool.
          </p>
          <div className="mt-5">
            <Button asChild variant="outline">
              <Link href="/creator-dm-proof">Read the proof page</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl text-foreground">
            Choose Pilot if you want
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>AI-assisted replies with CRM memory across threads</li>
            <li>Human response needed guardrails for risky conversations</li>
            <li>Self-hostable infrastructure and transparent product direction</li>
            <li>Pricing that does not punish audience growth</li>
          </ul>
        </article>
        <article className="rounded-2xl border bg-card p-6">
          <h2 className="font-heading text-2xl text-foreground">
            Choose ManyChat if you need
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>A mature visual flow builder today</li>
            <li>Broader channel coverage across Facebook, WhatsApp, and SMS</li>
            <li>A larger existing integration ecosystem out of the box</li>
          </ul>
        </article>
      </section>

      <RelatedReading
        links={[
          {
            href: "/pricing",
            title: "Pilot pricing",
            description:
              "See how the pricing model behaves as contacts, automations, and AI usage grow.",
          },
          {
            href: "/creator-dm-proof",
            title: "Creator DM proof page",
            description:
              "See the compact case-study style page behind this comparison.",
          },
          {
            href: "/instagram-dm-automation",
            title: "Instagram DM automation guide",
            description:
              "Understand the broader category and what a stronger automation stack should include.",
          },
        ]}
      />

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/pricing">View Pilot pricing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/instagram-dm-automation">
            Read the Instagram DM automation guide
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default PilotVsManyChatPage;
