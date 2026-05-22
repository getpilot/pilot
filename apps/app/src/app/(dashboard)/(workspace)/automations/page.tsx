import { Suspense } from "react";
import { Button } from "@pilot/ui/components/button";
import { LockKeyhole, Plus } from "lucide-react";
import Link from "next/link";
import AutomationsList from "@/components/automations/list";
import AutomationsLogs from "@/components/automations/logs";
import { Skeleton } from "@pilot/ui/components/skeleton";
import { SidekickLayout } from "@/components/sidekick/layout";
import { getUser } from "@/lib/auth-utils";
import { getBillingStatus } from "@/lib/billing/enforce";
import { getInstagramIntegration } from "@/actions/instagram";

function InstagramLockedAutomations() {
  return (
    <div className="rounded-lg border bg-muted/30 p-8 text-center">
      <LockKeyhole
        className="mx-auto mb-3 size-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="text-balance text-lg font-semibold">
        Automations are locked
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-muted-foreground">
        Once Instagram is connected, Pilot can safely load automation rules,
        logs, and create flows that send replies from the right account.
      </p>
    </div>
  );
}

export default async function AutomationsPage() {
  const [user, instagram] = await Promise.all([
    getUser(),
    getInstagramIntegration(),
  ]);
  const billingStatus =
    user && instagram.connected ? await getBillingStatus(user.id) : null;
  const isFrozen = billingStatus?.flags.isStructurallyFrozen ?? false;
  const canCreateAutomation =
    instagram.connected && (billingStatus?.flags.canCreateAutomation ?? false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Automations</h1>
          <p className="text-pretty text-muted-foreground">
            Build automated replies for common DM and comment questions.
          </p>
        </div>
        {canCreateAutomation ? (
          <Button asChild className="mt-auto">
            <Link href="/automations/new">
              <Plus className="size-4" />
              New Automation
            </Link>
          </Button>
        ) : (
          <Button className="mt-auto" disabled>
            <Plus className="size-4" />
            New Automation
          </Button>
        )}
      </div>

      {isFrozen && (
        <p className="text-pretty text-sm text-muted-foreground">
          Your workspace is frozen because it is above the current plan cap.
          Existing automations remain visible, but changes are disabled until
          usage is reduced or the plan is upgraded.
        </p>
      )}

      {instagram.connected ? (
        <SidekickLayout>
          <Suspense
            fallback={
              <div className="w-full max-w-xl">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            }
          >
            <AutomationsLogs />
          </Suspense>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            }
          >
            <AutomationsList />
          </Suspense>
        </SidekickLayout>
      ) : (
        <InstagramLockedAutomations />
      )}
    </div>
  );
}
