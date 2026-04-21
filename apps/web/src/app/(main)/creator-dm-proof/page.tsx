import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@pilot/ui/components/button";
import { RelatedReading } from "@/components/marketing/related-reading";
import {
  MARKETING_LAST_UPDATED_LABEL,
  buildPageMetadata,
  getBreadcrumbSchema,
  getWebPageSchema,
} from "@/lib/seo";

const pageTitle = "Creator DM Proof";
const pageDescription =
  "A compact case-study style proof page showing how Pilot helps creator-led teams stop losing warm Instagram leads in DMs.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/creator-dm-proof",
  keywords: [
    "instagram dm conversion case study",
    "creator dm automation proof",
    "instagram lead conversion proof",
  ],
});

const workflowSteps = [
  {
    title: "The setup",
    body: "Warm leads were arriving through comments, story replies, and inbound DMs, but the conversation context kept breaking. Operators had to remember the offer, the previous reply, and whether someone was still worth following up with.",
  },
  {
    title: "Where rule-based automation broke down",
    body: "The old approach could route simple intent, but it could not gracefully handle mixed signals, buying questions, or nuanced follow-ups without turning into a brittle tree of conditions. The team spent time managing logic instead of moving conversations forward.",
  },
  {
    title: "What Pilot changed",
    body: "Pilot treated the inbox like pipeline. The AI layer could work from business context, offers, FAQs, and conversation state while keeping human handoff available when the thread became sensitive or commercially important.",
  },
  {
    title: "Why this performs better",
    body: "The system stopped acting like a static autoresponder. Instead of only firing rigid rules, it helped teams reply in context, continue the sales conversation, and surface follow-up tasks before warm intent cooled off.",
  },
];

const proofSignals = [
  "AI-native replies grounded in business context, not just a trigger map",
  "Lead qualification and follow-up live in the same workflow as the conversation",
  "Operators get a cleaner handoff path when pricing or nuance requires a human",
];

const caseStudyNotes = [
  {
    title: "Page type",
    body: "This is a proof-style workflow page, not a named customer case study with published revenue numbers.",
  },
  {
    title: "What it demonstrates",
    body: "The point is to show the operational difference between rule-first DM automation and AI-native, context-aware DM conversion workflows.",
  },
  {
    title: "Why it matters",
    body: "In creator-led sales motions, the biggest leak is often not traffic. It is warm intent going unmanaged inside DMs after content already did the hard work.",
  },
];

const CreatorDMProofPage = () => {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Creator DM Proof", path: "/creator-dm-proof" },
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
              path: "/creator-dm-proof",
            }),
          ),
        }}
      />

      <div className="max-w-4xl">
        <p className="text-sm font-medium text-primary">Proof</p>
        <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          A compact proof page for how Pilot converts warmer Instagram DMs
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {MARKETING_LAST_UPDATED_LABEL}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          This is a compact case-study style page built around the workflow
          problems we repeatedly hear from creator-led teams in early access:
          too many warm leads stuck in DMs, too much manual recall, and too
          many conversations that never reach a clear next step.
        </p>
      </div>

      <section className="mt-12 rounded-[2rem] border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8">
        <blockquote className="font-heading max-w-3xl text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
          &quot;Pilot gave us the follow-up discipline we were missing. Warm leads
          stopped slipping through inbox cracks.&quot;
        </blockquote>
        <p className="mt-4 text-sm text-muted-foreground">
          Early access customer, creator-led business operator
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {caseStudyNotes.map((note) => (
          <article key={note.title} className="rounded-2xl border bg-card p-5">
            <h2 className="text-lg font-medium text-foreground">{note.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {note.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {workflowSteps.map((step) => (
          <article key={step.title} className="rounded-2xl border bg-card p-6">
            <h2 className="font-heading text-2xl text-foreground">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-3xl border bg-card p-8">
        <h2 className="font-heading text-3xl text-foreground">
          The practical difference
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          ManyChat is often strongest when the workflow can stay inside a rigid
          rule tree. Pilot is strongest when the business needs a more adaptive,
          AI-native system that understands the offer, the buyer context, and
          the current state of the thread well enough to keep moving the lead
          toward conversion.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {proofSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <RelatedReading
        links={[
          {
            href: "/pilot-vs-manychat",
            title: "Pilot vs ManyChat",
            description:
              "See the alternatives page focused on pricing, AI-native conversion, and open-source control.",
          },
          {
            href: "/comment-to-dm-automation",
            title: "Comment-to-DM automation",
            description:
              "Understand how post engagement turns into private sales conversations.",
          },
          {
            href: "/pricing",
            title: "Pilot pricing",
            description:
              "Review the pricing model for teams scaling contacts, workflows, and AI-assisted actions.",
          },
        ]}
      />

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/waitlist">Join waitlist</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pilot-vs-manychat">Read the full comparison</Link>
        </Button>
      </div>
    </main>
  );
};

export default CreatorDMProofPage;
