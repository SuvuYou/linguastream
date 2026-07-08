"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArchiveRestore } from "lucide-react";
import { useTransition } from "react";

export default function ReindexCard() {
  const [isPending, startTransition] = useTransition();

  const handleReindex = () => {
    startTransition(async () => {
      await fetch("/api/admin/reindex", { method: "POST" });
    });
  };

  return (
    <Card className="flex-1 justify-between max-w-lg">
      <CardHeader>
        <CardTitle>Reindex Subtitles</CardTitle>
        <CardDescription>Reindex your subtitle files</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={isPending}
          onClick={handleReindex}
          aria-label={isPending ? "Reindexing..." : "Reindex Subtitles"}
          aria-busy={isPending}
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <ArchiveRestore className="size-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
