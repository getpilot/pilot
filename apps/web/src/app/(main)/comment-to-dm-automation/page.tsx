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

const pageTitle = "Comment-to-DM Automation";
const pageDescription =
  "Learn how comment-to-DM automation works, where it creates pipeline, and how to keep it safe and conversion-focused on Instagram.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/comment-to-dm-automation",
  keywords: [
    "comment to dm automation",
    "instagram comment to dm automation",
    "instagram comment automation",
  ],
});

const principles = [
  {
    title: "Move interest into a private conversation fast",
    body: "The point of comment-to-DM automation is not just to acknowledge a comment. It is to shift a warm public signal into a private thread where qualification and follow-up can continue without friction.",
  },
  {
    title: "Keep the first DM contextual",
    body: "The opening message should reflect the post, the offer, or the intent behind the trigger. Generic canned replies feel spammy and reduce trust even when the automation itself technically works.",
  },
  {
    title: "Hand off when the thread stops being obvious",
    body: "Once the conversation hits pricing nuance, delivery questions, refund concerns, or emotional context, operators need a clean handoff path rather than more automation pressure.",
  },
];

const CommentToDMAutomationPage = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              {
                name: "Comment-to-DM Automation",
                path: "/comment-to-dm-automation",
              },
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
              path: "/comment-to-dm-automation",
            }),
          ),
        }}
      />

      <div className="max-w-4xl">
        <p className="text-sm font-medium text-primary">Guide</p>
        <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Comment-to-DM automation that moves conversations into pipeline
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {MARKETING_LAST_UPDATED_LABEL}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Comment-to-DM automation works best when it turns visible demand into
          a clear next step. The goal is not to blast every commenter. The goal
          is to open a private conversation quickly, preserve context from the
          original post, and qualify the lead without making the brand feel
          robotic.
        </p>
      </div>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border bg-card p-6">
          <p className="font-heading text-4xl text-foreground">73%</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            of social users say they will buy from a competitor if a brand does
            not respond on social.
          </p>
          <Link
            href={researchSources.competitorRisk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-primary underline underline-offset-4"
          >
            Source: {researchSources.competitorRisk.name}
          </Link>
        </article>
        <article className="rounded-2xl border bg-card p-6">
          <p className="font-heading text-4xl text-foreground">73%</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            expect brands to respond on social within 24 hours or sooner.
          </p>
          <Link
            href={researchSources.socialResponseWindow.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-primary underline underline-offset-4"
          >
            Source: {researchSources.socialResponseWindow.name}
          </Link>
        </article>
        <article className="rounded-2xl border bg-card p-6">
          <p className="font-heading text-4xl text-foreground">35%</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            of U.S. consumers used Instagram for customer service in Sprout&apos;s
            2022 Index, cited again in its 2025 customer-service analysis.
          </p>
          <Link
            href="https://sproutsocial.com/insights/social-media-customer-service-statistics/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-primary underline underline-offset-4"
          >
            Source: Sprout Social customer service analysis
          </Link>
        </article>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {principles.map((principle) => (
          <article key={principle.title} className="rounded-2xl border bg-card p-6">
            <h2 className="font-heading text-2xl text-foreground">
              {principle.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {principle.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <h2 className="font-heading text-3xl text-foreground">
          What a stronger comment-to-DM workflow looks like
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Workflow essentials
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Trigger the DM from a relevant post or offer</li>
              <li>Reference the original context in the first message</li>
              <li>Capture the contact in a CRM-style record immediately</li>
              <li>Route edge cases to a human before the thread degrades</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Common failure modes
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sending the same message regardless of the post context</li>
              <li>Treating every commenter like a sales-ready lead</li>
              <li>No visibility into who replied, converted, or stalled</li>
              <li>No handoff rule for pricing, policy, or emotional questions</li>
            </ul>
          </div>
        </div>
      </section>

      <RelatedReading
        links={[
          {
            href: "/instagram-dm-automation",
            title: "Instagram DM automation guide",
            description:
              "The broader category guide for teams evaluating automation, qualification, and human handoff.",
          },
          {
            href: "/pilot-vs-manychat",
            title: "Pilot vs ManyChat",
            description:
              "A practical comparison for teams deciding between a flow builder and a sales-system approach.",
          },
          {
            href: "/pricing",
            title: "Pilot pricing",
            description:
              "See how Pilot packages contacts, automations, and AI-assisted workflow volume.",
          },
        ]}
      />

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/waitlist">Join waitlist</Link>
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

export default CommentToDMAutomationPage;
