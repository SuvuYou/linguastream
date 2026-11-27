"use client";

import type { LibraryVideo } from "@linguastream/contracts";
import { CircleAlert, LoaderCircle, RotateCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CardState } from "@/lib/library/card-state";
import { addedLabel, coverTint, thumbnailUrl } from "@/lib/library/format";
import { TRANSLATION_FAILURE_SHORT } from "@/lib/processing/stages";
import { formatTime } from "@/lib/watch/lines";
import VideoCardMenu from "./VideoCardMenu";
import { cn } from "@/lib/utils";

interface Props {
  video: LibraryVideo;
  state: CardState;
  retrying: boolean;
  retryFailed: boolean;
  onRetry: () => void;
  deleting: boolean;
  deleteFailed: boolean;
  onTranslate: () => void;
  onDelete: () => void;
}

function StatusOverlay({ state }: { state: CardState }) {
  if (state.kind === "ready") return null;
  if (state.kind === "failed")
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 px-4 pb-8 text-center">
        <CircleAlert aria-hidden="true" className="size-5 text-destructive" />
        <span className="text-[13px] font-semibold">Couldn&apos;t prepare</span>
        <span className="line-clamp-2 text-xs text-text-2">
          {state.message}
        </span>
      </div>
    );
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
      <LoaderCircle
        aria-hidden="true"
        className="size-6 animate-spin text-primary motion-reduce:animate-none"
      />
      <span className="text-[13px] font-semibold">
        {state.kind === "waiting"
          ? "Waiting to prepare"
          : `${state.stage} ${state.percent}%`}
      </span>
    </div>
  );
}

function statusText(state: CardState) {
  switch (state.kind) {
    case "ready":
      return null;
    case "waiting":
      return "Waiting to prepare";
    case "preparing":
      return `Preparing: ${state.stage}, ${state.percent}%`;
    case "failed":
      return `Couldn't prepare. ${state.message}`;
  }
}

export default function VideoCard({
  video,
  state,
  retrying,
  retryFailed,
  onRetry,
  deleting,
  deleteFailed,
  onTranslate,
  onDelete,
}: Props) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const meta = [video.channel_name, addedLabel(video.added_at)].filter(Boolean);
  const status = statusText(state);

  return (
    <article className="group relative flex min-w-0 flex-col gap-2.5">
      <Link
        href={`/watch/${video.id}`}
        className="flex min-w-0 flex-col gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-raised">
          <div
            aria-hidden="true"
            style={{ "--tint": coverTint(video.id) } as React.CSSProperties}
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-linear-135 from-[color-mix(in_srgb,var(--tint)_22%,var(--raised-2))] to-inset transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none",
              state.kind !== "ready" && "opacity-60",
            )}
          >
            <span className="text-5xl font-bold text-foreground/15 select-none">
              {video.title.trim().charAt(0).toUpperCase()}
            </span>
          </div>
          {!thumbFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailUrl(video.youtube_video_id)}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setThumbFailed(true)}
              className={cn(
                "absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none",
                state.kind !== "ready" && "opacity-60",
              )}
            />
          )}
          <StatusOverlay state={state} />
          {state.kind === "ready" && video.duration_ms !== null && (
            <span className="absolute right-2 bottom-2 rounded-sm bg-black/75 px-1.5 py-0.5 font-mono text-xs">
              {formatTime(video.duration_ms)}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <b title={video.title} className="text-sm font-semibold">
            <span className="line-clamp-2">{video.title}</span>
          </b>
          <span className="flex min-w-0 text-[13px] text-text-3">
            <span className="truncate">{meta.join(" · ")}</span>
          </span>
          {state.kind === "ready" &&
            video.translation?.status === "failed" &&
            video.translation.error_code && (
              <span className="flex min-w-0 text-xs text-destructive">
                <span className="truncate">
                  Translation failed:{" "}
                  {TRANSLATION_FAILURE_SHORT[video.translation.error_code]}
                </span>
              </span>
            )}
        </div>
        {status && <span className="sr-only">{status}</span>}
      </Link>
      <VideoCardMenu
        video={video}
        canTranslate={
          state.kind === "ready" &&
          (video.translation?.status === "none" ||
            video.translation?.status === "failed")
        }
        deleting={deleting}
        deleteFailed={deleteFailed}
        onTranslate={onTranslate}
        onDelete={onDelete}
      />
      {state.kind === "failed" && state.retryable && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-video items-end justify-center pb-3 text-[13px] font-semibold">
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {retrying ? (
              <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" />
            ) : (
              <RotateCw aria-hidden="true" className="size-3.5" />
            )}
            {retryFailed ? "Couldn't start. Try again" : "Try again"}
            <span className="sr-only">: {video.title}</span>
          </button>
        </div>
      )}
    </article>
  );
}
