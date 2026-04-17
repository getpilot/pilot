import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { BlurFade } from "@pilot/ui/components/blur-fade";
import { Button } from "@pilot/ui/components/button";
import GameOfLife from "./hero-background";

const Hero = () => {
  return (
    <section aria-label="hero">
      <div className="relative flex flex-col items-center justify-center px-4">
        <BlurFade inView inViewMargin="-100px" className="mx-auto">
          <Button
            asChild
            variant="outline"
            className="text-xs inline-flex h-auto max-w-full items-center gap-3 rounded-full bg-card/70 px-2.5 py-0.5 pr-3 pl-0.5 text-foreground shadow-lg shadow-primary/10 backdrop-blur-[1px] transition-colors hover:bg-primary/5 sm:text-sm"
          >
            <Link
              aria-label="Open the Pilot app"
              href="https://dashboard.trypilot.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="shrink-0 truncate rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground">
                Update
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="w-full truncate">
                  Early access is open for waitlist users
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
              </span>
            </Link>
          </Button>
        </BlurFade>
        <BlurFade delay={0.08} inView inViewMargin="-100px">
          <h1 className="md:leading-20 lg:leading-28 mx-auto max-w-5xl font-heading mt-8 text-center text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-8xl">
            Turn Instagram DMs into qualified leads
          </h1>
        </BlurFade>
        <BlurFade delay={0.12} inView inViewMargin="-100px">
          <p className="mt-5 max-w-2xl text-center text-base text-balance text-muted-foreground sm:mt-8 sm:text-lg">
            Most teams lose warm leads in DMs because follow-up breaks. Pilot
            qualifies intent, routes risk, and keeps replies moving so revenue
            does not stall in the inbox.
          </p>
        </BlurFade>
        <BlurFade
          delay={0.18}
          inView
          inViewMargin="-100px"
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild>
            <Link href="/waitlist">Join waitlist</Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href="https://dashboard.trypilot.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open app
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </BlurFade>
        <div className="absolute inset-0 -z-10 overflow-hidden mx-auto max-w-6xl">
          <GameOfLife />
        </div>
      </div>
    </section>
  );
};

export default Hero;
