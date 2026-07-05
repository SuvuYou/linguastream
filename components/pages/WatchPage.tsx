"use client";

import { useState } from "react";
import Player from "@/components/features/player/Player";
import SubtitleSidebar from "@/components/features/watch/SubtitleSidebar";
import { useWatchData } from "@/hooks/useWatchData";
import { useSubtitleTrack } from "@/hooks/useSubtitleTrack";
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

export default function WatchPage({
  mediaContentId,
}: {
  mediaContentId: string;
}) {
  const { params } = useZodSearchParams(WATCH_PAGE_PARAMS_SCHEMA);

  const { data, isLoading, isError } = useWatchData(mediaContentId);

  const [currentTimeMs, setCurrentTimeMs] = useState(params.t);

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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-secondary-text text-sm">
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

  return (
    <SidebarProvider>
      <section className="w-full h-[calc(100vh-1rem)] bg-background m-2 ml-0 p-2 rounded-r-lg flex flex-col overflow-hidden">
        <Header mediaContentId={mediaContentId} />
        <div className="flex overflow-hidden">
          <div className="flex flex-col flex-2 min-w-0 bg-background items-center justify-start pt-1">
            <Player
              streamUrl={data.streamUrl}
              title={data.title}
              sourceLines={sourceTracks.data ?? []}
              translationLines={translationTracks.data ?? []}
              translationLanguages={data.translationLanguages}
              activeTranslationLang={languages.translation.value}
              initialTimeMs={params.t}
              currentTimeMs={currentTimeMs}
              setCurrentTimeMs={setCurrentTimeMs}
            />
          </div>
        </div>
        <DetailsSection />
      </section>

      <SubtitleSidebar
        currentTimeMs={currentTimeMs}
        sourceLines={sourceTracks.data ?? []}
        translationLines={translationTracks.data ?? []}
      />

      <OverlayPlayer />
    </SidebarProvider>
  );
}
