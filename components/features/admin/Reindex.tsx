"use client";

import { useTransition } from "react";

export default function Reindex() {
  const [isPending, startTransition] = useTransition();

  const handleReindex = () => {
    startTransition(async () => {
      await fetch("/api/admin/reindex", { method: "POST" });
    });
  };

  return (
    <button
      onClick={handleReindex}
      disabled={isPending}
      className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
    >
      {isPending ? "Reindexing..." : "Reindex Subtitles"}
    </button>
  );
}
