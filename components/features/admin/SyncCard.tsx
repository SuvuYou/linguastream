"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { CloudSync } from "lucide-react";
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
    <Card className="flex-1 justify-between max-w-lg">
      <CardHeader>
        <CardTitle>Sync Jellyfin</CardTitle>
        <CardDescription>
          Sync your Jellyfin library with the latest changes
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSync}
          disabled={isPending}
          aria-label={isPending ? "Syncing Jellyfin..." : "Sync Jellyfin"}
          aria-busy={isPending}
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <CloudSync className="size-4" />
          )}
        </Button>

        {syncInfo && (
          <Badge variant="secondary" className="text-xs font-normal">
            {syncInfo.synced} new items synced ({syncInfo.total} total)
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
