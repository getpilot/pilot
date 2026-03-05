import Link from "next/link";

const PrivacyPage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Legal</p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: March 5, 2026
      </p>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        This Privacy Policy describes how Pilot collects, processes, stores, and
        discloses data across the marketing website, waitlist flow, and
        application services. It also describes user controls, security
        safeguards, and deletion workflows.
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            1. Scope
          </h2>
          <p className="mt-3 text-muted-foreground">
            This policy applies to Pilot-operated properties, including
            `pilot-ops.vercel.app`, the waitlist, and the product app. It covers
            data collected directly from users, data received from third-party
            integrations, and system-generated operational data.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            2. Data We Collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Identity and account data: name, email, profile image, account ID,
              provider account records, session token metadata, IP address, and
              user agent.
            </li>
            <li>
              Onboarding and profile data: business context and onboarding
              fields (for example use case, business type, goals, lead volume,
              and offering details).
            </li>
            <li>Waitlist submissions: name, email, and timestamps.</li>
            <li>
              Instagram integration data: professional account ID, app-scoped
              user ID, username, access token, expiry timestamps, and sync
              metadata.
            </li>
            <li>
              Messaging and CRM data: contact identifiers, conversation-derived
              fields (stage, sentiment, lead score), notes, tags, follow-up
              metadata, HRN flags, and action logs.
            </li>
            <li>
              Automation and Sidekick data: triggers, prompts, response
              configuration, chat sessions/messages, and execution logs.
            </li>
            <li>
              Billing/usage metadata: usage event records and plan/checkout
              metadata needed to enforce product limits.
            </li>
            <li>
              Diagnostics and performance telemetry from infrastructure and
              analytics tools.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            3. End-to-End Data Flow
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>
              A user creates an account or submits the waitlist form, and core
              profile/session data is stored in PostgreSQL.
            </li>
            <li>
              If Instagram is connected, OAuth is initiated with Instagram Graph
              API scopes and access tokens are exchanged and stored.
            </li>
            <li>
              Instagram events are delivered to Pilot webhooks. Webhook
              signatures are validated before processing.
            </li>
            <li>
              Events are evaluated by automation and Sidekick workflows to
              classify intent, apply routing rules, and determine HRN handoff.
            </li>
            <li>
              Contact and operational records are updated in PostgreSQL and
              replies are sent through Instagram Graph API endpoints.
            </li>
            <li>
              Logs and usage records are stored to support reliability,
              debugging, billing enforcement, and product analytics.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            4. How We Use Data
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Provide authentication, account management, and product access.
            </li>
            <li>
              Operate Instagram automation, contact management, and workflow
              routing.
            </li>
            <li>
              Generate and deliver Sidekick or automation-assisted responses.
            </li>
            <li>
              Maintain platform integrity, fraud prevention, and abuse control.
            </li>
            <li>
              Monitor service health, troubleshoot incidents, and improve
              product quality.
            </li>
            <li>
              Support billing, subscriptions, and usage-limit enforcement.
            </li>
            <li>
              Respond to legal obligations and enforce contractual rights.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            5. Storage and Security Architecture
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot stores operational data in PostgreSQL (Neon). Access is
            constrained by row-level policies built around authenticated user
            identity checks (for example `user_id = auth.uid()` and equivalent
            scoped checks). Core relational records use foreign-key constraints
            with cascading deletion for dependent records where applicable.
          </p>
          <p className="mt-3 text-muted-foreground">
            Webhook ingestion includes signature validation before processing.
            Access to integrated third-party APIs is performed with scoped
            credentials and server-side environment secrets.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            6. Third-Party Processors and Integrations
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Meta/Instagram Graph API for Instagram messaging and account
              integration.
            </li>
            <li>Neon/PostgreSQL for persistent application data storage.</li>
            <li>Vercel for hosting, analytics, and performance insights.</li>
            <li>Better Auth for authentication/session management patterns.</li>
            <li>Google Gemini for AI generation/classification features.</li>
            <li>Cloudinary for user-uploaded image hosting workflows.</li>
            <li>Polar for billing and subscription infrastructure in-app.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            7. Retention
          </h2>
          <p className="mt-3 text-muted-foreground">
            Data is retained while accounts remain active and for a reasonable
            period thereafter to support security, dispute handling, product
            integrity, and legal compliance. Retention windows may vary by data
            type and operational necessity.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            8. User Controls and Deletion
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Instagram disconnect control is available in product settings and
              removes stored Instagram integration records.
            </li>
            <li>
              Users can delete selected records in-product (for example specific
              chats, FAQs, or offers where controls exist).
            </li>
            <li>
              Full account deletion requests may be submitted through support
              channels listed below.
            </li>
            <li>
              When account deletion is executed, dependent records tied through
              cascading foreign keys are deleted from associated tables.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            9. International Processing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot and its subprocessors may process data in multiple regions. By
            using the service, users acknowledge such processing as required to
            provide the product.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            10. Open-Source License Notice
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot includes open-source code distributed under the GNU Affero
            General Public License v3.0 (AGPLv3). For full terms, see the{" "}
            <Link
              href="https://github.com/getpilot/app/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              LICENSE
            </Link>{" "}
            file.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            11. Policy Updates
          </h2>
          <p className="mt-3 text-muted-foreground">
            This policy may be updated periodically. Material changes will be
            reflected by updating the "Last updated" date on this page.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            12. Contact
          </h2>
          <p className="mt-3 text-muted-foreground">
            For privacy and deletion requests, contact Pilot on{" "}
            <Link
              href="https://x.com/PilotOps_"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              X
            </Link>
            ,{" "}
            <Link
              href="https://www.linkedin.com/company/pilot-ops/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              LinkedIn
            </Link>
            ,{" "}
            <Link
              href="https://github.com/getpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              GitHub
            </Link>
            , or message Pilot on{" "}
            <Link
              href="https://www.instagram.com/pilot.ops/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Instagram
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPage;
