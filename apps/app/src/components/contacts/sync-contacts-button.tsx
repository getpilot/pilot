"use client";

import { Button } from "@pilot/ui/components/button";
import { Checkbox } from "@pilot/ui/components/checkbox";
import { Label } from "@pilot/ui/components/label";
import {
  getContactsLastUpdatedAt,
  hasContactsUpdatedSince,
  syncInstagramContacts,
} from "@/actions/contacts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, RefreshCw } from "lucide-react";

const SYNC_STATUS_POLL_INTERVAL_MS = 1_200;
const MAX_SYNC_STATUS_WAIT_MS = 15_000;
const MANUAL_SYNC_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const MANUAL_SYNC_STORAGE_KEY = "pilot:last-manual-contact-sync-at";

function getStoredNextAllowedAt() {
  if (typeof window === "undefined") {
    return null;
  }

  const lastManualSyncAt = window.localStorage.getItem(MANUAL_SYNC_STORAGE_KEY);
  if (!lastManualSyncAt) {
    return null;
  }

  const nextAllowedAt = new Date(
    new Date(lastManualSyncAt).getTime() + MANUAL_SYNC_COOLDOWN_MS,
  );

  if (
    Number.isNaN(nextAllowedAt.getTime()) ||
    nextAllowedAt.getTime() <= Date.now()
  ) {
    window.localStorage.removeItem(MANUAL_SYNC_STORAGE_KEY);
    return null;
  }

  return nextAllowedAt.toISOString();
}

async function performSync(
  fullSync: boolean,
  setIsLoading: (v: boolean) => void,
  setNextAllowedAt: (v: string | null) => void,
) {
  try {
    setIsLoading(true);
    toast.info("Syncing Instagram contacts...");
    const before = await getContactsLastUpdatedAt();

    const result = await syncInstagramContacts(fullSync);

    if (result.success) {
      const nextAllowedAt = new Date(
        Date.now() + MANUAL_SYNC_COOLDOWN_MS,
      ).toISOString();
      setNextAllowedAt(nextAllowedAt);
      window.localStorage.setItem(
        MANUAL_SYNC_STORAGE_KEY,
        new Date().toISOString(),
      );

      if (result.queued && before) {
        const startedAt = Date.now();

        while (Date.now() - startedAt < MAX_SYNC_STATUS_WAIT_MS) {
          const { updated } = await hasContactsUpdatedSince(before);
          if (updated) {
            toast.success("Sync complete. Contacts updated.");
            window.location.reload();
            return;
          }

          await new Promise((resolve) =>
            window.setTimeout(resolve, SYNC_STATUS_POLL_INTERVAL_MS),
          );
        }

        toast.success("Sync queued. Inngest accepted the event; updates will appear shortly.");
        window.location.reload();
        return;
      }

      toast.success(
        typeof result.count === "number"
          ? `Sync complete. ${result.count} contact${result.count === 1 ? "" : "s"} processed.`
          : "Sync queued. Inngest accepted the event.",
      );
      window.location.reload();
    } else {
      const errorMessage = result.error?.includes("token expired")
        ? "Instagram token expired. Please reconnect your Instagram account in Settings."
        : result.error || "Failed to sync contacts. Please try again later.";
      toast.error(errorMessage);

      console.error("Sync failed:", result.error);
    }
  } catch (error) {
    toast.error("An error occurred while syncing contacts");
    console.error("Error syncing contacts:", error);
  } finally {
    setIsLoading(false);
  }
}

export default function SyncContactsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [fullSync, setFullSync] = useState(false);
  const [nextAllowedAt, setNextAllowedAt] = useState<string | null>(
    getStoredNextAllowedAt,
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const remainingMs = nextAllowedAt
    ? new Date(nextAllowedAt).getTime() - nowMs
    : 0;
  const syncDisabled = remainingMs > 0;
  const rateLimitMessage = syncDisabled
    ? `Manual sync is available again in ${formatRemainingDuration(remainingMs)}.`
    : null;

  useEffect(() => {
    if (!syncDisabled) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [syncDisabled]);

  useEffect(() => {
    if (!nextAllowedAt || syncDisabled) {
      return;
    }

    window.localStorage.removeItem(MANUAL_SYNC_STORAGE_KEY);
  }, [nextAllowedAt, syncDisabled]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== MANUAL_SYNC_STORAGE_KEY) {
        return;
      }

      setNowMs(Date.now());
      setNextAllowedAt(getStoredNextAllowedAt());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleSync = () => {
    if (syncDisabled) {
      toast.error(
        `Manual sync is rate-limited. Try again in ${formatRemainingDuration(
          remainingMs,
        )}.`,
      );
      return;
    }

    return performSync(
      fullSync,
      setIsLoading,
      (value) => {
        setNowMs(Date.now());
        setNextAllowedAt(value);
      },
    );
  };

  return (
    <div className="flex items-center gap-3">
      {rateLimitMessage && (
        <p className="text-xs text-muted-foreground">{rateLimitMessage}</p>
      )}
      <div className="flex items-center gap-2">
        <Checkbox
          id="full-sync"
          checked={fullSync}
          onCheckedChange={(checked) => setFullSync(Boolean(checked))}
          className="border-border data-[state=checked]:bg-primary"
          disabled={isLoading || syncDisabled}
        />
        <Label htmlFor="full-sync" className="text-sm">
          Full sync
        </Label>
      </div>
      <Button
        type="button"
        onClick={handleSync}
        disabled={isLoading || syncDisabled}
        className="gap-2"
      >
        {isLoading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Sync Contacts
      </Button>
    </div>
  );
}

function formatRemainingDuration(remainingMs: number) {
  const totalMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}
