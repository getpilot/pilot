import Link from "next/link"

const PrivacyPage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 md:mt-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Privacy</p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Privacy and data control
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: March 5, 2026
      </p>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        This page explains what data Pilot collects, how it is used, and the
        controls available to users. This policy applies to the marketing
        website, waitlist, and product app.
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Data we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Waitlist data: name and email submitted via the waitlist form.</li>
            <li>
              Account and auth data: profile fields, session data, and sign-in
              provider records.
            </li>
            <li>
              Product data: contact records, automation configs, action logs,
              and related workspace settings.
            </li>
            <li>
              Instagram integration data: account identifiers, usernames, and
              access tokens required for API operations.
            </li>
            <li>
              Usage and analytics data: performance/visit telemetry from Vercel
              Analytics and Speed Insights.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            How we use data
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Operate authentication, billing, and core app functionality.</li>
            <li>Run DM automation workflows and lead-management features.</li>
            <li>Improve reliability, security posture, and product quality.</li>
            <li>Communicate product updates and roadmap progress.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Privacy-first product decisions
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Open-source core for auditability and independent verification.</li>
            <li>Self-hosting path for teams with strict data residency needs.</li>
            <li>Human Response Needed routing for sensitive or risky threads.</li>
            <li>Operational focus on policy-safe automation behavior.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Infrastructure and processors
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pilot is built with third-party infrastructure and services,
            including Vercel (hosting/analytics), Neon (database), Better Auth
            (authentication framework), and Polar (billing in-app).
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Pilot vs ManyChat on privacy and control
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>ManyChat is closed SaaS. Pilot is open source and self-hostable.</li>
            <li>ManyChat pricing scales by contacts. Pilot avoids growth-tax lock-in.</li>
            <li>ManyChat flows are often rule-heavy. Pilot emphasizes context + HRN safety.</li>
            <li>ManyChat centralizes control in vendor infrastructure. Pilot gives deployment choice.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            For privacy-conscious teams, this difference matters: you can run
            Pilot in a way that matches your security model instead of adapting
            your model to a closed platform.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Security and access controls
          </h2>
          <p className="mt-3 text-muted-foreground">
            We apply role-based access controls and row-level data protections
            in the database layer so users can access only their own workspace
            records.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Retention and deletion
          </h2>
          <p className="mt-3 text-muted-foreground">
            Data is retained while your account is active or as required for
            legitimate operational and legal needs. You may request deletion of
            your account-related data.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="mt-3 text-muted-foreground">
            For privacy requests, open an issue on{" "}
            <Link
              href="https://github.com/getpilot"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              GitHub
            </Link>{" "}
            or message us on{" "}
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
  )
}

export default PrivacyPage
