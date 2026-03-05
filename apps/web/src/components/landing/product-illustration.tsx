import { Badge } from "@pilot/ui/components/badge";
import { Button } from "@pilot/ui/components/button";
import { Checkbox } from "@pilot/ui/components/checkbox";
import { Input } from "@pilot/ui/components/input";
import { Label } from "@pilot/ui/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@pilot/ui/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pilot/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pilot/ui/components/table";
import { cn } from "@pilot/ui/lib/utils";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRight,
  Columns3Icon,
  DownloadIcon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";

type ContactRow = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  stage: Stage;
  sentiment: Stage;
  requiresHumanResponse: boolean;
  tags: string[];
  leadScore: number;
  leadValue: number;
};

type Stage =
  | "hot"
  | "warm"
  | "cold"
  | "neutral"
  | "ghosted"
  | "new"
  | "lead"
  | "follow-up"
  | "hrn";

const STATUS_BADGE_STYLES: Record<Stage, string> = {
  hot: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-500",
  warm: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-500",
  cold: "bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 border border-sky-500",
  neutral:
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-500",
  ghosted:
    "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-600",
  new: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-500",
  lead: "bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 border border-fuchsia-500",
  "follow-up":
    "bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 border border-violet-500",
  hrn: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-500",
};

const MOCK_CONTACTS: ContactRow[] = [
  {
    id: "c1",
    name: "Ariana Dev",
    lastMessage: "Can you share annual pricing and setup timeline?",
    timestamp: "2 minutes ago",
    stage: "lead",
    sentiment: "warm",
    requiresHumanResponse: false,
    tags: ["pricing", "creator"],
    leadScore: 82,
    leadValue: 2400,
  },
  {
    id: "c2",
    name: "Noah Studio",
    lastMessage: "Need human review for custom contract terms.",
    timestamp: "8 minutes ago",
    stage: "follow-up",
    sentiment: "hot",
    requiresHumanResponse: true,
    tags: ["enterprise", "urgent"],
    leadScore: 94,
    leadValue: 7200,
  },
  {
    id: "c3",
    name: "Maya Brand",
    lastMessage: "Looking for ManyChat migration path and ROI proof.",
    timestamp: "22 minutes ago",
    stage: "new",
    sentiment: "lead",
    requiresHumanResponse: false,
    tags: ["migration"],
    leadScore: 73,
    leadValue: 1600,
  },
  {
    id: "c4",
    name: "Theo Launch",
    lastMessage: "Can this run only for Instagram comments?",
    timestamp: "39 minutes ago",
    stage: "lead",
    sentiment: "neutral",
    requiresHumanResponse: false,
    tags: ["instagram"],
    leadScore: 58,
    leadValue: 900,
  },
  {
    id: "c5",
    name: "Rhea Ops",
    lastMessage: "Please route this thread to sales manager.",
    timestamp: "1 hour ago",
    stage: "follow-up",
    sentiment: "warm",
    requiresHumanResponse: true,
    tags: ["handoff", "agency"],
    leadScore: 88,
    leadValue: 5100,
  },
];

const ProductIllustration = () => {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 max-h-[520px] select-none overflow-hidden mask-[radial-gradient(white_35%,transparent_95%)] perspective-[4000px] perspective-origin-center sm:max-h-[620px]"
    >
      <div className="-translate-y-6 -translate-z-6 rotate-x-6 rotate-y-12 -rotate-z-6 transform-3d sm:-translate-y-8 sm:rotate-x-8 sm:rotate-y-14 sm:-rotate-z-8 md:-translate-y-10 md:-translate-z-10 md:rotate-x-10 md:rotate-y-18 md:-rotate-z-10">
        <div className="w-full space-y-5 rounded-xl border border-border bg-card/95 p-5 shadow-xl">
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Contacts
            </h3>
            <p className="text-muted-foreground">
              Keep your leads, notes, tags, and follow-ups in one view.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Input
                  className="peer min-w-[180px] sm:min-w-[240px] ps-9 border-border focus-visible:ring-ring"
                  value="Filter by name..."
                  readOnly
                  aria-label="Filter by name"
                />
                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                  <ListFilterIcon size={16} aria-hidden="true" />
                </div>
              </div>
              <Button
                variant="outline"
                className="border-border hover:bg-muted hover:text-foreground"
              >
                <FilterIcon className="opacity-60" size={16} aria-hidden="true" />
                Stage
                <ChevronDownIcon className="opacity-60" size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-muted hover:text-foreground"
              >
                <FilterIcon className="opacity-60" size={16} aria-hidden="true" />
                Sentiment
                <ChevronDownIcon className="opacity-60" size={16} aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <Checkbox id="mock-hrn-only" className="border-border data-[state=checked]:bg-primary" />
                <Label htmlFor="mock-hrn-only" className="text-sm font-normal text-foreground">
                  HRN only
                </Label>
              </div>
              <Button
                variant="outline"
                className="border-border hover:bg-muted hover:text-foreground"
              >
                <Columns3Icon className="opacity-60" size={16} aria-hidden="true" />
                View
              </Button>
            </div>
            <Button variant="outline">
              <DownloadIcon className="opacity-60" size={16} aria-hidden="true" />
              Export
            </Button>
          </div>

          <div className="bg-card overflow-x-auto rounded-md border border-border shadow-sm">
            <Table className="min-w-[760px] table-fixed sm:min-w-[980px]">
              <TableHeader className="bg-muted">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="w-10 bg-background/75" />
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Name</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Last Message</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Last Message At</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Stage</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Sentiment</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">HRN</TableHead>
                  <TableHead className="h-11 bg-background/75 text-foreground/70">Tags</TableHead>
                  <TableHead className="h-11 bg-background/75 text-right text-foreground/70">Lead Score</TableHead>
                  <TableHead className="h-11 bg-background/75 text-right text-foreground/70">Lead Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_CONTACTS.map((contact) => (
                  <TableRow key={contact.id} className="border-border hover:bg-muted/40">
                    <TableCell>
                      <Button variant="ghost" size="sm" className="size-8 p-0" aria-label="Expand row">
                        <ChevronRight size={16} className="transition-transform duration-200" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <div className="max-w-[230px] truncate text-muted-foreground">
                        {contact.lastMessage}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contact.timestamp}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium text-xs", STATUS_BADGE_STYLES[contact.stage])}>
                        {contact.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium text-xs", STATUS_BADGE_STYLES[contact.sentiment])}>
                        {contact.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contact.requiresHumanResponse ? (
                        <Badge variant="outline" className={cn("font-medium text-xs", STATUS_BADGE_STYLES.hrn)}>
                          HRN
                        </Badge>
                      ) : (
                        <div className="text-xs text-muted-foreground">Auto</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={cn(
                          contact.leadScore >= 75
                            ? "text-green-600 font-medium"
                            : contact.leadScore >= 50
                              ? "text-amber-600 font-medium"
                              : "text-muted-foreground"
                        )}
                      >
                        {contact.leadScore}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">${contact.leadValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center gap-6 px-1">
            <div className="flex items-center gap-3">
              <Label htmlFor="mock-page-size" className="text-muted-foreground whitespace-nowrap">
                Rows per page
              </Label>
              <Select value="10">
                <SelectTrigger id="mock-page-size" className="w-fit whitespace-nowrap border-border">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground ml-auto flex text-sm whitespace-nowrap">
              <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                <span className="text-foreground font-medium">1-5</span> of{" "}
                <span className="text-foreground font-medium">5</span>
              </p>
            </div>

            <Pagination className="ml-2">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="size-8 border-border" disabled aria-label="Go to first page">
                    <ChevronFirstIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="size-8 border-border" disabled aria-label="Go to previous page">
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="size-8 border-border" disabled aria-label="Go to next page">
                    <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="size-8 border-border" disabled aria-label="Go to last page">
                    <ChevronLastIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIllustration;
