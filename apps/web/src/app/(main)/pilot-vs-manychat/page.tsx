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
  "Pilot is built for teams that want one system for inbox automation, lead qualification, and CRM context.",
  "ManyChat is stronger today for visual flow mapping and multi-channel breadth, but Pilot is stronger on AI-native replies, pipeline context, and self-host control.",
  "If your team cares about account safety, human handoff, and predictable economics as volume grows, Pilot is the sharper fit.",
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
          flow-builder or a more modern Instagram sales system. Pilot focuses on
          qualifying demand, keeping CRM context attached to every thread, and
          escalating sensitive conversations before automation becomes risky.
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

      <div className="mt-14">
        <CompareTable
          showPageLink={false}
          title="Feature-by-feature breakdown"
          description="A practical view of where Pilot is stronger today, where ManyChat still has the edge, and what those tradeoffs mean for an Instagram-first team."
        />
      </div>

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

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <h2 className="font-heading text-3xl text-foreground">
          How this comparison should be read
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-medium text-foreground">What matters most</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This comparison is weighted toward Instagram-first teams that care
              about lead qualification, CRM context, account safety, and human
              handoff more than visual flow mapping.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Where ManyChat wins</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyChat is still the better fit if you need a mature visual flow
              builder or broader multi-channel support right now.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Where Pilot wins</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pilot is the better fit when you want a sales-system approach:
              contextual replies, contact records, safer escalation, and more
              transparent control over the stack.
            </p>
          </div>
        </div>
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
            href: "/instagram-dm-automation",
            title: "Instagram DM automation guide",
            description:
              "Understand the broader category and what a stronger automation stack should include.",
          },
          {
            href: "/open-source",
            title: "Why Pilot is open source",
            description:
              "See why inspectability and self-hosting are part of the product strategy.",
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
