import type { Metadata } from "next";
import {
  buildPageMetadata,
  getBreadcrumbSchema,
  getWebPageSchema,
} from "@/lib/seo";

const pageTitle = "The Pilot Manifesto";
const pageDescription =
  "Read the product philosophy behind Pilot: Instagram automation with CRM depth, account-safety guardrails, and open-source control.";

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/manifesto",
  keywords: ["pilot manifesto", "instagram automation philosophy"],
});

const ManifestoPage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-16 sm:px-6 md:mt-16 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Manifesto", path: "/manifesto" },
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
              path: "/manifesto",
            }),
          ),
        }}
      />
      <p className="text-sm font-medium text-primary">Manifesto</p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        The Pilot Manifesto
      </h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        <p>
          Pilot helps you turn Instagram conversations into real pipeline.
          Creators, founders, and small teams should not need to juggle DMs,
          sheets, and disconnected tools.
        </p>
        <p>
          We built Pilot as a sales system. It handles conversations, keeps CRM
          context, and makes handoff clear when a human should reply.
        </p>
        <p>
          Safety is part of the product. We focus on account health,
          risk-aware throttling, and HRN guardrails for sensitive threads.
        </p>
        <p>
          Pilot is open source because trust matters. You can read the code,
          self-host it, and keep control of your data.
        </p>
        <p>
          We ship in small steps. Reliability comes first. We test, learn, and
          improve with real feedback.
        </p>
        <p>
          Current priorities are practical: knowledge-base ingest, stronger
          comment-to-DM flows, natural-language trigger matching, and safer
          sending behavior.
        </p>
        <p>
          Next, we are going deeper on CRM and analytics: better pipeline
          visibility, lead scoring, attribution, and automation diagnostics.
        </p>
        <p>If this matches how you work, join us and build with us.</p>
        <p>The Pilot team</p>
      </div>

    </main>
  );
};

export default ManifestoPage;
