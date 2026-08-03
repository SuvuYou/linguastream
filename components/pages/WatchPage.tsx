"use client";

import { useState } from "react";
import Player from "@/components/features/player/Player";

import SubtitleSidebar from "@/components/features/watch/SubtitleSidebar";
import { useWatchData } from "@/hooks/useWatchData";
import { SubtitleLine, useSubtitleTrack } from "@/hooks/useSubtitleTrack";
import OverlayPlayer from "@/components/features/overlay-player/OverlayPlayer";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { WATCH_PAGE_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useWatchLanguages } from "@/hooks/useWatchLanguages";
import DetailsSection from "@/components/features/watch/DetailsSection";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import Header from "@/components/features/watch/Header";
import { useAppStore } from "@/lib/initializations/store";
import { YOUTUBE_CONTENT_TYPE } from "@/helpers/const";
import YouTubePlayer from "@/components/features/player/YouTubePlayer";

export default function WatchPage({
  mediaContentId,
}: {
  mediaContentId: string;
}) {
  const { params } = useZodSearchParams(WATCH_PAGE_PARAMS_SCHEMA);

  const { data, isLoading, isError } = useWatchData(mediaContentId);

  const [currentTimeMs, setCurrentTimeMs] = useState(params.t);

  const { activeWord, setActiveWord } = useAppStore();

  const languages = useWatchLanguages(data);

  const sourceTracks = useSubtitleTrack(
    mediaContentId,
    data?.sourceLanguage ?? null,
    !!data,
  );

  const translationTracks = useSubtitleTrack(
    mediaContentId,
    languages.translation.value,
    !!languages.translation.value,
  );

  function handleSubtitleWordClick(
    clean: string,
    line: SubtitleLine,
    contextTranslation: string,
    contextLines: SubtitleLine[],
  ) {
    if (
      activeWord?.word === clean &&
      activeWord?.subtitleLineId === `${line.start_ms}__${mediaContentId}`
    ) {
      setActiveWord(null);
      return;
    }

    setActiveWord({
      word: clean,
      lang: languages.source.value!,
      translationLang: languages.translation.value!,
      subtitleLineId: `${line.start_ms}__${mediaContentId}`,
      context: contextLines.map((item) => item.text).join(" "),
      contextTranslation,
      mediaContentId,
      startMs: line.start_ms,
      endMs: line.end_ms,
    });
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-secondary-foreground text-sm">
        <Spinner className="size-4" />
        Loading...
      </div>
    );

  if (isError || !data)
    return (
      <Empty className="h-64 justify-center">
        <EmptyHeader>
          <EmptyTitle>Failed to load video</EmptyTitle>
          <EmptyDescription>Please try refreshing the page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  const isYouTube = data.type === YOUTUBE_CONTENT_TYPE;

  const sharedPlayerProps = {
    initialTimeMs: params.t,
    currentTimeMs,
    sourceLines: sourceTracks.data ?? [],
    translationLines: translationTracks.data ?? [],
    translationLanguages: data.translationLanguages,
    activeTranslationLang: languages.translation.value,
    setCurrentTimeMs,
    handleSubtitleWordClick,
  };

  return (
    <SidebarProvider>
      <section className="w-full h-[calc(100vh-1rem)] bg-background m-2 ml-0 p-2 rounded-r-lg flex flex-col overflow-hidden">
        <Header mediaContentId={mediaContentId} />
        <div className="flex overflow-hidden">
          <div className="flex flex-col flex-2 min-w-0 bg-background items-center justify-start pt-1">
            {isYouTube && data.videoId ? (
              <YouTubePlayer
                videoId={data.videoId}
                title={data.title}
                {...sharedPlayerProps}
              />
            ) : (
              <Player
                streamUrl={data.streamUrl!}
                title={data.title}
                {...sharedPlayerProps}
              />
            )}
          </div>
        </div>
        <DetailsSection />
      </section>

      <SubtitleSidebar
        currentTimeMs={currentTimeMs}
        sourceLines={sourceTracks.data ?? []}
        translationLines={translationTracks.data ?? []}
        isLoading={sourceTracks.isLoading || translationTracks.isLoading}
      />

      <OverlayPlayer />
    </SidebarProvider>
  );
}
