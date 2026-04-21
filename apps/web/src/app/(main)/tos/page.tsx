import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Review the Pilot Terms of Service for website access, Instagram automation usage, billing limits, AI outputs, and acceptable use.",
  path: "/tos",
  keywords: ["pilot terms of service"],
});

const TermsOfServicePage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 pb-16 md:mt-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Legal</p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: March 5, 2026
      </p>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        These Terms of Service govern access to and use of Pilot, including the
        marketing site, waitlist, and product application. By accessing or using
        Pilot, you agree to these terms.
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            1. Eligibility
          </h2>
          <p className="mt-3 text-muted-foreground">
            You must have legal capacity to enter into a binding agreement and
            must use the service in compliance with applicable law and platform
            policies, including Meta and Instagram platform requirements.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            2. Service Description
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot provides Instagram-focused automation, lead management, and
            AI-assisted workflow features. Features may include contact routing,
            response generation, action logs, analytics, and human-response
            safeguards.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            3. Account and Credentials
          </h2>
          <p className="mt-3 text-muted-foreground">
            You are responsible for all activity under your account and for
            maintaining the confidentiality of credentials and integration
            tokens. You must promptly notify Pilot of any unauthorized use.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            4. Instagram Graph API and Third-Party Platforms
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot uses Instagram Graph API endpoints to perform approved
            automation operations. You authorize Pilot to process integration
            data necessary for this purpose. You remain responsible for your use
            of third-party platforms and compliance with their terms, limits,
            and policies.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            5. Acceptable Use
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>No unlawful, deceptive, abusive, or infringing use.</li>
            <li>
              No attempts to bypass access controls, billing controls, or safety
              mechanisms.
            </li>
            <li>No use that violates Instagram or Meta policy requirements.</li>
            <li>
              No transmission of malicious code, credential theft payloads, or
              intentional service abuse.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            6. AI and Automation Outputs
          </h2>
          <p className="mt-3 text-muted-foreground">
            AI-generated content and automation outputs are probabilistic and
            may be inaccurate, incomplete, or unsuitable for specific contexts.
            You are responsible for reviewing outputs and for final business
            decisions, customer communications, and legal compliance.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            7. Billing and Plan Limits
          </h2>
          <p className="mt-3 text-muted-foreground">
            Paid features, quotas, and billing events may be enforced based on
            active plan configuration. Subscription and checkout workflows may
            be handled through external billing providers. Non-payment or plan
            limits may restrict certain actions.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            8. Data Processing and Privacy
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot processes user data to provide service functionality,
            including storage in PostgreSQL and policy-constrained access using
            row-level security controls. For full details, see the{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            9. Intellectual Property and Open Source
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot may include open-source components and repository-distributed
            code under their respective licenses. Use of open-source portions is
            governed by the applicable license terms. Branding and proprietary
            marks remain protected.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            10. Suspension and Termination
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot may suspend or terminate access for violations of these terms,
            abuse, security risk, legal requirements, or operational necessity.
            Users may discontinue use at any time and may request account
            deletion according to the Privacy Policy.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            11. Disclaimer of Warranties
          </h2>
          <p className="mt-3 text-muted-foreground">
            The service is provided on an "as is" and "as available" basis,
            without warranties of any kind, express or implied, including
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement, to the maximum extent permitted by law.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            12. Limitation of Liability
          </h2>
          <p className="mt-3 text-muted-foreground">
            To the maximum extent permitted by law, Pilot will not be liable for
            indirect, incidental, special, consequential, exemplary, or punitive
            damages, or for loss of revenue, profits, data, or goodwill arising
            out of or related to use of the service.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            13. Changes to Terms
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot may modify these terms from time to time. Continued use after
            updates constitutes acceptance of the revised terms.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            14. Contact
          </h2>
          <p className="mt-3 text-muted-foreground">
            For legal or terms-related inquiries, open an issue on{" "}
            <Link
              href="https://github.com/getpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              GitHub
            </Link>{" "}
            or message Pilot on{" "}
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

export default TermsOfServicePage;
