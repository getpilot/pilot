import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { db } from "@pilot/db";
import { user } from "@pilot/db/schema";
import { eq } from "drizzle-orm";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@pilot/ui/components/alert";
import { Badge } from "@pilot/ui/components/badge";
import { Button } from "@pilot/ui/components/button";
import { SidebarInset, SidebarProvider } from "@pilot/ui/components/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar";
import PageHeader from "@/components/dashboard/page-header";
import { SidekickToggle } from "@/components/sidekick/toggle";
import { SidekickProvider } from "@/components/sidekick/context";
import { checkSidekickOnboardingStatus } from "@/actions/sidekick/onboarding";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

function SidekickSetupBanner({
  status,
}: {
  status: Awaited<ReturnType<typeof checkSidekickOnboardingStatus>>;
}) {
  if (status.isReady) {
    return null;
  }

  const statusMessage =
    status.missing.length > 0
      ? `Missing: ${status.missing.join(", ")}.`
      : "Finish the final setup step to turn Sidekick on.";

  return (
    <Alert className="rounded-none border-0 border-b bg-amber-50 px-4 py-2 text-amber-950 dark:bg-amber-950/30 dark:text-amber-50 sm:px-6">
      <TriangleAlert className="size-4" aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <AlertTitle className="min-h-0 text-balance text-sm font-semibold">
            Sidekick setup incomplete
          </AlertTitle>
          <AlertDescription className="text-pretty text-xs">
            Sidekick is unavailable until setup is complete. {statusMessage}
          </AlertDescription>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-background/60 text-xs">
            {status.completedSteps} / {status.totalSteps}
          </Badge>
          <Button asChild size="sm" className="h-7 px-3 text-xs">
            <Link href={status.resumeHref}>Resume setup</Link>
          </Button>
        </div>
      </div>
    </Alert>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    const userData = await db
      .select({ onboarding_complete: user.onboarding_complete })
      .from(user)
      .where(eq(user.id, session.user.id))
      .then((res) => res[0]);

    if (!userData) {
      console.error("User data not found");
      redirect("/onboarding");
    }

    if (!userData.onboarding_complete) {
      redirect("/onboarding");
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to fetch user onboarding status:", error);
    redirect("/onboarding");
  }

  let sidekickStatus: Awaited<
    ReturnType<typeof checkSidekickOnboardingStatus>
  > | null = null;
  let sidekickReady = false;
  try {
    sidekickStatus = await checkSidekickOnboardingStatus();
    sidekickReady = sidekickStatus.isReady;
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to fetch Sidekick setup status:", error);
  }

  return (
    <SidekickProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
            "--sidebar-right-width":
              "min(33rem, calc((100vw - (var(--spacing) * 72)) * 0.4))",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col bg-background border">
          <PageHeader />
          {sidekickStatus ? (
            <SidekickSetupBanner status={sidekickStatus} />
          ) : null}
          <main className="px-8 py-6">{children}</main>
        </SidebarInset>
        {sidekickReady ? <SidekickToggle /> : null}
      </SidebarProvider>
    </SidekickProvider>
  );
}
