"use client";

import { useState, useTransition } from "react";

export default function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const [syncInfo, setSyncInfo] = useState<{
    synced: number;
    total: number;
  } | null>(null);

  const handleSync = () => {
    startTransition(async () => {
      const res = await fetch("/api/sync-jellyfin", { method: "POST" });
      const data = await res.json();
      setSyncInfo(data);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        {isPending ? "Syncing..." : "Sync Jellyfin"}
      </button>
      {syncInfo && (
        <span className="text-xs text-secondary-text">
          {syncInfo.synced} new items synced ({syncInfo.total} total)
        </span>
      )}
    </div>
  );
}
