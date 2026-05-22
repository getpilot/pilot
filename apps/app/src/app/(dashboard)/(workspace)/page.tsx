import { getInstagramIntegration } from "@/actions/instagram";
import { checkSidekickOnboardingStatus } from "@/actions/sidekick/onboarding";
import { getSidekickMemoryOverview } from "@/actions/sidekick/memory";
import { SidekickPanel } from "@/components/sidekick/sidekick-panel";
import { FollowUpList } from "@/components/sidekick/follow-up-list";
import { HRNList } from "@/components/sidekick/hrn-list";
import { SidekickLayout } from "@/components/sidekick/layout";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@pilot/ui/components/alert";
import { CheckCircle2, LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

function SidekickReadyBanner() {
  return (
    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-50">
      <CheckCircle2 className="size-4" aria-hidden="true" />
      <AlertTitle className="text-balance">Sidekick setup complete</AlertTitle>
      <AlertDescription className="text-pretty">
        <p>Sidekick is ready to use with your current onboarding data.</p>
      </AlertDescription>
    </Alert>
  );
}

function InstagramLockedSidekick() {
  return (
    <div className="rounded-lg border bg-muted/30 p-8 text-center">
      <LockKeyhole
        className="mx-auto mb-3 size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="text-balance text-lg font-semibold">Sidekick is locked</h2>
      <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        Once Instagram is connected, Pilot can safely load Sidekick memory, HRN,
        follow-ups, and chat tools for the right account.
      </p>
    </div>
  );
}

function SidekickUnavailable() {
  return (
    <div className="rounded-lg border bg-muted/30 p-8 text-center">
      <LockKeyhole
        className="mx-auto mb-3 size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="text-balance text-lg font-semibold">
        Sidekick is locked for now
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        Finish the required onboarding data before using chat, follow-ups, HRN,
        or AI replies. This keeps Sidekick from sending messages without enough
        business context.
      </p>
    </div>
  );
}

export default async function SidekickPage() {
  const [onboardingStatus, instagram] = await Promise.all([
    checkSidekickOnboardingStatus(),
    getInstagramIntegration(),
  ]);

  let overview = null;
  let hasError = false;
  let overviewResult;
  if (onboardingStatus.isReady && instagram.connected) {
    try {
      overviewResult = await getSidekickMemoryOverview();
    } catch (error) {
      console.error("Error in SidekickPage:", error);
      hasError = true;
    }
  }
  if (overviewResult && overviewResult.success && overviewResult.overview) {
    overview = overviewResult.overview;
  }

  if (hasError) {
    return (
      <main className="w-full px-4 md:px-6 py-6 md:py-10 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Sidekick</h1>
        <p className="text-destructive">
          Failed to load sidekick memory. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">
          Sidekick
        </h1>
        <p className="text-pretty text-muted-foreground">
          Your AI assistant for Instagram DMs. It helps you reply faster, follow
          up on time, and keep conversations moving.
        </p>
      </div>

      {onboardingStatus.isReady && instagram.connected ? (
        <SidekickReadyBanner />
      ) : null}

      {!instagram.connected ? (
        <InstagramLockedSidekick />
      ) : !onboardingStatus.isReady ? (
        <SidekickUnavailable />
      ) : (
        <SidekickLayout>
          <div className="min-w-0 flex-1">
            <SidekickPanel initialOverview={overview} />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <FollowUpList />
            <HRNList />
          </div>
        </SidekickLayout>
      )}
    </div>
  );
}
