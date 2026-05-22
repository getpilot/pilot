"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@pilot/ui/components/alert";
import { Button } from "@pilot/ui/components/button";
import Link from "next/link";
import { ArrowRight, Instagram } from "lucide-react";

type InstagramStatus = {
  connected: boolean;
  username?: string;
};

async function loadInstagramStatus(
  setStatus: (s: InstagramStatus) => void,
  signal: AbortSignal,
) {
  try {
    const res = await fetch("/api/auth/instagram/status", {
      cache: "no-cache",
      signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (!signal.aborted) {
      setStatus({ connected: !!data.connected, username: data.username });
    }
  } catch {
    if (!signal.aborted) {
      setStatus({ connected: false });
    }
  }
}

export default function InstagramConnectionBanner() {
  const [status, setStatus] = useState<InstagramStatus | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const controller = new AbortController();
    loadInstagramStatus(setStatus, controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  if (!status) return null;

  const isOnSettings = pathname === "/settings";

  if (status.connected) {
    return null;
  }

  return (
    <Alert
      className="flex items-center justify-between gap-3 rounded-none border-0 border-b bg-red-50 px-4 py-2 dark:bg-red-950/30 sm:px-6"
      variant="destructive"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Instagram className="size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <AlertTitle className="min-h-0 text-balance text-sm font-semibold">
            Instagram not connected
          </AlertTitle>
          <AlertDescription className="text-pretty text-xs">
            Connect Instagram to use automations and contact sync.
          </AlertDescription>
        </div>
      </div>
      {!isOnSettings && (
        <Button
          asChild
          variant="destructive"
          size="sm"
          className="h-7 shrink-0 px-3 text-xs"
        >
          <Link href="/settings">
            Settings <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      )}
    </Alert>
  );
}
