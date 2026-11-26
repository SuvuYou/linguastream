"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLineWindows } from "@/hooks/useLineWindows";
import { useVideo } from "@/hooks/useVideo";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { ApiRequestError } from "@/lib/api/client";
import { createPlaybackClock } from "@/lib/watch/playback-clock";
import type { VideoDetail } from "@linguastream/contracts";
import ControlBar from "./ControlBar";
import TranscriptPanel, { trackState } from "./TranscriptPanel";
import VideoStage from "./VideoStage";
import WatchHeader from "./WatchHeader";

const TYPING = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (TYPING.has(el.tagName) || el.isContentEditable);
}

function Layout({
  header,
  stage,
  side,
}: {
  header: React.ReactNode;
  stage: React.ReactNode;
  side: React.ReactNode;
}) {
  return (
    <div className="@container h-dvh bg-background text-foreground">
      <div className="flex h-full flex-col">
        {header}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 pb-4 @min-[960px]:flex-row @max-[600px]:gap-0 @max-[600px]:px-0 @max-[600px]:pb-0">
          <section
            aria-label="Video"
            className="flex min-w-0 shrink-0 flex-col gap-3 @min-[960px]:flex-1 @max-[600px]:gap-0"
          >
            {stage}
          </section>
          <div className="flex min-h-0 flex-1 flex-col @min-[960px]:w-[clamp(360px,30cqi,460px)] @min-[960px]:flex-none">
            {side}
          </div>
        </div>
      </div>
    </div>
  );
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold">{title}</h1>
        <p className="text-sm text-text-3">{body}</p>
      </div>
      <Link
        href="/dashboard/personal"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-raised-2 px-4 text-sm transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" /> Back to library
      </Link>
    </div>
  );
}

function LoadingScreen() {
  return (
    <Layout
      header={
        <div className="flex items-center gap-4 px-5 py-2.5" aria-hidden="true">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      }
      stage={<Skeleton className="aspect-video w-full rounded-3xl" />}
      side={<Skeleton className="min-h-40 flex-1 rounded-3xl" />}
    />
  );
}

function Watch({ video, startMs }: { video: VideoDetail; startMs: number }) {
  const [clock] = useState(() => createPlaybackClock(startMs));
  const hostRef = useRef<HTMLDivElement>(null);
  const player = useVideoPlayer(
    hostRef,
    video.youtube_video_id,
    startMs,
    clock,
  );
  const lines = useLineWindows(video, startMs);
  const state = trackState(video, lines);
  const { toggle } = player;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || isTyping(event.target))
        return;
      if (
        event.target instanceof Element &&
        event.target.closest("button, [role=slider], [role=menuitemradio]")
      )
        return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <Layout
      header={
        <WatchHeader
          title={video.title}
          channelName={video.channel_name}
          durationMs={video.duration_ms}
          language={video.language}
        />
      }
      stage={
        <>
          <VideoStage
            hostRef={hostRef}
            status={player.status}
            lines={lines.lines}
            clock={clock}
            language={video.language}
            translationLanguage={video.translation_language}
          />
          <ControlBar
            player={player}
            clock={clock}
            fallbackDurationMs={video.duration_ms}
          />
        </>
      }
      side={
        <TranscriptPanel
          video={video}
          lines={lines.lines}
          state={state}
          clock={clock}
          onSeek={player.seek}
        />
      }
    />
  );
}

export default function WatchScreen({
  videoId,
  startMs,
}: {
  videoId: string;
  startMs: number;
}) {
  const video = useVideo(videoId);

  if (video.isPending) return <LoadingScreen />;
  if (video.isError) {
    const notFound =
      video.error instanceof ApiRequestError &&
      (video.error.status === 404 || video.error.status === 400);
    return notFound ? (
      <CenteredMessage
        title="This video isn't in your library"
        body="It may have been removed, or the link is wrong."
      />
    ) : (
      <CenteredMessage
        title="Couldn't load this video"
        body="Check your connection and reload the page."
      />
    );
  }
  return <Watch video={video.data} startMs={startMs} />;
}
