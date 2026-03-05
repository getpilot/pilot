import { Check, Minus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pilot/ui/components/table"

type Advantage = "Pilot" | "ManyChat"

const rows = [
  {
    dimension: "AI intelligence",
    manychat: "Flow-first logic with AI sold as an add-on",
    pilot: "AI-native intent detection with conversation context",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Conversation handling",
    manychat: "Trigger-based replies per mapped flow",
    pilot: "Context-aware responses with memory across threads",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Lead management",
    manychat: "Basic contact list and tags",
    pilot: "Built-in CRM with lead score, stage, sentiment, and notes",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Human handoff and safety",
    manychat: "Mostly manual live-chat intervention",
    pilot: "HRN safety routing for risky or complex threads",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Pricing model",
    manychat: "Contact-based pricing that spikes as audience grows",
    pilot: "Open-source and self-hostable model with predictable economics",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Open source",
    manychat: "Closed platform",
    pilot: "Fully open-source and forkable",
    advantage: "Pilot" as Advantage,
  },
  {
    dimension: "Visual flow builder",
    manychat: "Available",
    pilot: "Not built yet",
    advantage: "ManyChat" as Advantage,
  },
  {
    dimension: "Multi-channel support",
    manychat: "Instagram, Facebook, WhatsApp, SMS",
    pilot: "Instagram-first today (expanding next)",
    advantage: "ManyChat" as Advantage,
  },
  {
    dimension: "Integration breadth",
    manychat: "Large integration ecosystem",
    pilot: "Early-stage integration surface",
    advantage: "ManyChat" as Advantage,
  },
]

const CompareTable = () => {
  return (
    <section
      id="comparison"
      aria-labelledby="comparison-title"
      className="mx-auto w-full max-w-6xl"
    >
      <h2
        id="comparison-title"
        className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        Pilot vs ManyChat
      </h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
        The short version: Pilot is built for conversion reliability, not
        flow-builder complexity or contact-tax pricing.
      </p>

      <div className="-mx-2 mt-8 overflow-x-auto sm:mx-0">
        <div className="rounded-xl border border-border">
          <Table className="min-w-[760px] sm:min-w-[920px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto w-[220px] px-4 py-4 text-xs sm:w-[260px] sm:px-6 sm:py-5 sm:text-sm">Dimension</TableHead>
              <TableHead className="h-auto w-[220px] px-4 py-4 text-xs sm:w-[260px] sm:py-5 sm:text-sm">ManyChat</TableHead>
              <TableHead className="h-auto w-[220px] bg-muted/40 px-4 py-4 text-xs sm:w-[260px] sm:py-5 sm:text-sm">
                Pilot
              </TableHead>
              <TableHead className="h-auto w-[120px] px-4 py-4 text-center text-xs sm:w-[180px] sm:py-5 sm:text-sm">
                Advantage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.dimension}>
                <TableCell className="px-4 py-4 text-xs font-medium whitespace-normal sm:px-6 sm:py-6 sm:text-sm">
                  {row.dimension}
                </TableCell>
                <TableCell className="px-4 py-4 text-xs text-muted-foreground whitespace-normal sm:py-6 sm:text-sm">
                  {row.manychat}
                </TableCell>
                <TableCell className="bg-muted/40 px-4 py-4 text-xs text-foreground whitespace-normal sm:py-6 sm:text-sm">
                  {row.pilot}
                </TableCell>
                <TableCell className="px-4 py-4 text-center text-xs font-medium sm:py-6 sm:text-sm">
                  {row.advantage === "Pilot" ? (
                    <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Pilot
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Minus className="h-4 w-4" />
                      ManyChat
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}

export default CompareTable
