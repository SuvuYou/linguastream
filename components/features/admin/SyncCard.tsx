"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudSync, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

export default function SyncCard() {
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
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Sync Jellyfin</CardTitle>
        <CardDescription>
          Sync your Jellyfin library with the latest changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <button
          onClick={handleSync}
          disabled={isPending}
          className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <CloudSync className="size-4" />
          )}
        </button>
        {syncInfo && (
          <span className="text-xs text-secondary-text">
            {syncInfo.synced} new items synced ({syncInfo.total} total)
          </span>
        )}
      </CardContent>
    </Card>
  );
}
