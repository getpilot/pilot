import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { Button } from "@pilot/ui/components/button";
import Link from "next/link";
import { Icons } from "../icons";
import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

function WaitlistWrapperContent({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={clsx(
        "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center",
        "bg-card/70 dark:bg-card/80 pb-0 overflow-hidden rounded-2xl",
        "shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.08),0px_2px_4px_-1px_rgba(0,0,0,0.03)]",
        "border border-border/70 dark:border-border/90",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 flex-1 text-center w-full p-6 pb-4">
        <div className="flex flex-col gap-10">{children}</div>
      </div>
      <footer
        className={clsx(
          "border-t border-border/70 dark:border-border/90",
          "flex flex-col md:flex-row justify-between items-center",
          "w-full self-stretch px-4 md:px-8 py-3 text-sm",
          "bg-secondary/60 dark:bg-accent/30 overflow-hidden",
          "gap-4 md:gap-2",
        )}
      >
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto text-center md:text-left">
          <div className="flex items-center justify-center gap-3 mb-1 md:mb-0">
            <Link
              href="https://github.com/pilot-ops-crm/app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="hover:opacity-75 transition-opacity"
            >
              <Icons.Github width={16} height={16} />
            </Link>
            <Link
              href="https://x.com/PilotOps_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pilot Twitter"
              className="hover:opacity-75 transition-opacity"
            >
              <Icons.Twitter width={15} height={15} />
            </Link>
            <Link
              href="https://www.instagram.com/Pilot.Ops"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pilot Instagram"
              className="hover:opacity-75 transition-opacity"
            >
              <Icons.Instagram width={15} height={15} />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground w-full md:w-auto">
            open source. built with care. © {new Date().getFullYear()} Pilot.
          </p>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs w-full md:w-auto justify-center flex"
          >
            <Link
              href="https://dashboard.trypilot.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the Pilot app in new tab"
            >
              open the app
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}

function WaitlistWrapperFallback({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "w-full mx-auto max-w-[500px] flex flex-col justify-center items-center bg-card/70 dark:bg-card/80 pb-0 overflow-hidden rounded-2xl border border-border/70 dark:border-border/90",
        className,
      )}
    >
      <div className="flex items-center gap-2 p-6">
        <Icons.Loader className="text-muted-foreground" />
      </div>
    </div>
  );
}

export function WaitlistWrapper({
  children,
  className,
}: PropsWithChildren & { className?: string }) {
  return (
    <Suspense fallback={<WaitlistWrapperFallback className={className} />}>
      <WaitlistWrapperContent className={className}>
        {children}
      </WaitlistWrapperContent>
    </Suspense>
  );
}
