import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@pilot/ui/components/button"

const OpenSourcePage = () => {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-24 md:mt-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-primary">Open Source</p>
      <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Why Pilot is open source by design
      </h1>
      <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Pilot exists to turn Instagram conversations into qualified pipeline.
        We are open source because sales infrastructure should be inspectable,
        forkable, and deployable on your own stack, especially when your team
        is handling customer conversations and revenue data.
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Our philosophy
          </h2>
          <p className="mt-3 text-muted-foreground">
            CRM and DM automation are not cosmetic tooling. They are operating
            systems for your customer pipeline. Teams should be able to inspect
            behavior, verify how automation decisions are made, and keep full
            control over where data is processed.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Why this matters now
          </h2>
          <p className="mt-3 text-muted-foreground">
            The Instagram automation market has become more restrictive and more
            expensive. In that environment, closed systems create two risks:
            unpredictable cost as volume grows and limited visibility into how
            automation behaves under policy pressure.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            What open source changes in practice
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Transparent behavior: inspect core workflows and change them.</li>
            <li>Deployment choice: managed cloud or self-hosting for control.</li>
            <li>Lower lock-in: no forced dependency on a single vendor model.</li>
            <li>Faster reliability loops: community and customer fixes ship faster.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Pilot vs ManyChat in this context
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>ManyChat is closed and contact-priced. Pilot is open and forkable.</li>
            <li>ManyChat AI is positioned as an add-on. Pilot is AI-first by default.</li>
            <li>ManyChat focuses on flow maps. Pilot focuses on intent and context.</li>
            <li>ManyChat lock-in grows with contacts. Pilot supports self-hosted control.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            How we build
          </h2>
          <p className="mt-3 text-muted-foreground">
            We ship in small steps, prioritize account safety and conversion
            reliability, and iterate with real user feedback from creators,
            founders, and agencies. Open source keeps that process accountable.
          </p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="https://github.com/getpilot" target="_blank" rel="noopener noreferrer">
            View GitHub
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/waitlist">Read manifesto</Link>
        </Button>
      </div>
    </main>
  )
}

export default OpenSourcePage
