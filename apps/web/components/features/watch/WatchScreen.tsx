"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProcessingToasts from "@/components/features/processing/ProcessingToasts";
import { Sonner } from "@/components/ui/sonner";
import { useLineWindows } from "@/hooks/useLineWindows";
import { usePreferences, useUpdatePreferences } from "@/hooks/usePreferences";
import { useVideo } from "@/hooks/useVideo";
import { useRefreshOnProcessing } from "@/hooks/useVideoActions";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import {
  useSetWordStatus,
  useWordLookup,
  useWordStatuses,
} from "@/hooks/useWords";
import { ApiRequestError } from "@/lib/api/client";
import { lineTargets, type LineTargets } from "@/lib/watch/lines";
import { createPlaybackClock } from "@/lib/watch/playback-clock";
import {
  STATUS_LABELS,
  nextStatus,
  statusOf,
  type WordTarget,
} from "@/lib/watch/words";
import type {
  SubtitleVisibility,
  VideoDetail,
  WordStatus,
} from "@linguastream/contracts";
import ControlBar from "./ControlBar";
import TranscriptPanel, { trackState } from "./TranscriptPanel";
import TranslateButton from "./TranslateButton";
import VideoStage from "./VideoStage";
import WatchHeader from "./WatchHeader";
import WordDetails from "./WordDetails";
import WordPopup from "./WordPopup";

const TYPING_INPUTS = new Set([
  "text",
  "search",
  "email",
  "number",
  "password",
  "url",
  "tel",
]);

const LINE_KEYS: Record<string, keyof LineTargets> = {
  KeyA: "previous",
  KeyS: "repeat",
  KeyD: "next",
};

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el instanceof HTMLInputElement) return TYPING_INPUTS.has(el.type);
  return (
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    el.isContentEditable
  );
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
      <Sonner position="bottom-center" />
      <ProcessingToasts placement="bottom-right" />
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

function useWordPopup(
  video: VideoDetail,
  ready: boolean,
  player: { playing: boolean; toggle(): void },
) {
  const statuses = useWordStatuses(video.id, ready);
  const [target, setTarget] = useState<WordTarget | null>(null);
  const [pausedForWord, setPausedForWord] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const anchorRef = useRef<HTMLElement | null>(null);
  const lookup = useWordLookup(video.id, target);
  const { mutate: saveStatus } = useSetWordStatus(video.id);
  const { playing, toggle } = player;
  const [seenPlaying, setSeenPlaying] = useState(playing);
  if (playing !== seenPlaying) {
    setSeenPlaying(playing);
    if (playing && target) {
      if (!detailsOpen) setTarget(null);
      setPausedForWord(false);
    }
  }

  const close = useCallback(
    (resume: boolean) => {
      setTarget(null);
      setDetailsOpen(false);
      setPausedForWord(false);
      if (pausedForWord && resume) toggle();
    },
    [toggle, pausedForWord],
  );

  const select = useCallback(
    (next: WordTarget, element: HTMLElement) => {
      if (target && target.index === next.index && target.i === next.i) {
        if (!detailsOpen) close(true);
        return;
      }
      anchorRef.current = element;
      if (playing) {
        setPausedForWord(true);
        toggle();
      }
      setTarget(next);
    },
    [target, playing, toggle, close, detailsOpen],
  );

  const setStatus = useCallback(
    (lemma: string, status: WordStatus) => {
      saveStatus({ language: video.language, lemma, status });
      setAnnouncement(`${lemma}: ${STATUS_LABELS[status]}`);
    },
    [saveStatus, video.language],
  );

  const cycle = useCallback(
    (lemma: string) =>
      setStatus(lemma, nextStatus(statusOf(statuses, lemma) ?? "unknown")),
    [setStatus, statuses],
  );

  const status = target
    ? (statusOf(statuses, target.lemma) ?? lookup.data?.status ?? null)
    : null;

  const lemma = lookup.data?.lemma ?? target?.lemma ?? "";
  const changeStatus = (next: WordStatus) => target && setStatus(target.lemma, next);

  return {
    details:
      target && detailsOpen ? (
        <WordDetails
          key={`${target.index}-${target.i}`}
          lemma={lemma}
          status={status}
          lookup={lookup.data}
          isError={lookup.isError}
          onStatusChange={changeStatus}
          onClose={() => close(true)}
        />
      ) : null,
    words: {
      statuses,
      selected: target,
      pausedForWord,
      onSelect: select,
      onCycle: cycle,
    },
    popup: (
      <>
        <WordPopup
          anchorRef={anchorRef}
          open={target !== null && !detailsOpen}
          language={video.language}
          state={
            target && {
              lemma,
              status,
              lookup: lookup.data,
              isLoading: lookup.isPending,
              isError: lookup.isError,
            }
          }
          onStatusChange={changeStatus}
          onDetails={() => setDetailsOpen(true)}
          onClose={() => close(true)}
        />
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </>
    ),
  };
}

function Watch({ video, startMs }: { video: VideoDetail; startMs: number }) {
  useRefreshOnProcessing(video.id);
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
  const { toggle, jump } = player;
  const [followKey, setFollowKey] = useState(0);
  const visibility = usePreferences().subtitle_visibility;
  const { mutate: updatePreferences } = useUpdatePreferences();
  const setVisibility = useCallback(
    (change: Partial<SubtitleVisibility>) =>
      updatePreferences({ subtitle_visibility: change }),
    [updatePreferences],
  );
  const navigable = state === "ready" && player.status === "ready";
  const lineList = lines.lines;
  const { words, popup, details } = useWordPopup(
    video,
    state === "ready",
    player,
  );

  const jumpToLine = useCallback(
    (target: keyof LineTargets) => {
      const ms = lineTargets(lineList, clock.get())[target];
      if (ms === null) return;
      jump(ms);
      setFollowKey((key) => key + 1);
    },
    [clock, jump, lineList],
  );

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

  useEffect(() => {
    if (!navigable) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = LINE_KEYS[event.code];
      if (!target || event.repeat || isTyping(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();
      jumpToLine(target);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigable, jumpToLine]);

  return (
    <Layout
      header={
        <WatchHeader
          title={video.title}
          channelName={video.channel_name}
          durationMs={video.duration_ms}
          language={video.language}
          action={
            <TranslateButton
              videoId={video.id}
              translation={video.translation}
            />
          }
        />
      }
      stage={
        <>
          <VideoStage
            hostRef={hostRef}
            status={player.status}
            onToggle={toggle}
            visibility={visibility}
            lines={lines.lines}
            clock={clock}
            language={video.language}
            translationLanguage={video.translation_language}
            words={words}
          />
          {popup}
          <ControlBar
            player={player}
            clock={clock}
            fallbackDurationMs={video.duration_ms}
            lines={navigable ? lineList : null}
            onJumpToLine={jumpToLine}
            subtitles={{
              visibility,
              language: video.language,
              translationLanguage: video.translation_language,
              onChange: setVisibility,
            }}
          />
        </>
      }
      side={
        details ?? (
        <TranscriptPanel
          video={video}
          lines={lines.lines}
          state={state}
          clock={clock}
          followKey={followKey}
          visibility={visibility}
          statuses={words.statuses}
          onSeek={player.seek}
        />
        )
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
