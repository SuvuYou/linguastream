import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/watch/lines";

export default function WatchHeader({
  title,
  channelName,
  durationMs,
  language,
}: {
  title: string;
  channelName: string | null;
  durationMs: number | null;
  language: string;
}) {
  return (
    <header className="flex items-center gap-4 px-5 py-2.5 @max-[600px]:px-3">
      <Link
        href="/dashboard/personal"
        aria-label="Back to library"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-raised text-foreground transition-colors hover:bg-raised-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 lang={language} title={title} className="text-base font-semibold">
          <span className="block truncate">{title}</span>
        </h1>
        <p className="flex min-w-0 gap-1 text-[13px] text-text-3">
          {channelName && (
            <span title={channelName} className="truncate">
              {channelName}
            </span>
          )}
          {channelName && durationMs !== null && (
            <span aria-hidden="true">·</span>
          )}
          {durationMs !== null && (
            <span className="shrink-0 font-mono">{formatTime(durationMs)}</span>
          )}
        </p>
      </div>
    </header>
  );
}
