"use client";

import { useState } from "react";
import Player from "@/components/features/player/Player";
import SubtitleSidebar from "@/components/features/watch/SubtitleSidebar";
import { useWatchData } from "@/hooks/useWatchData";
import { useSubtitleTrack } from "@/hooks/useSubtitleTrack";
import { useAppStore } from "@/lib/initializations/store";
import OverlayPlayer from "../features/overlay-player/OverlayPlayer";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { WATCH_PAGE_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import { ArrowLeft, CommandIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SubtitleSettingsPanel from "@/components/features/watch/SubtitleSettings";
import { useWatchLanguages } from "@/hooks/useWatchLanguages";

export default function WatchPage({
  mediaContentId,
}: {
  mediaContentId: string;
}) {
  const router = useRouter();

  const { setOverlayOpen } = useAppStore();

  const { params } = useZodSearchParams(WATCH_PAGE_PARAMS_SCHEMA);
  const [showSettings, setShowSettings] = useState(false);

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
        <div className="flex items-center h-12 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Button>

          {data.title && (
            <>
              <span className="px-4 text-sm font-medium truncate max-w-xs">
                {data.title}
              </span>
            </>
          )}

          <div className="flex items-center h-full">
            <LanguageFilter
              source={{ ...languages.source, disabled: true }}
              translation={languages.translation}
              isLoading={isLoading}
              isError={isError}
            />
          </div>

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOverlayOpen(true)}
              aria-label="Open overlay player"
            >
              <CommandIcon className="size-4" />
              <kbd className="text-xs text-secondary-text font-sans">K</kbd>
            </Button>
          </div>
        </div>

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

        <div className="">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings((v) => !v)}
            className="bg-background/80 text-xs"
            aria-expanded={showSettings}
            aria-controls="subtitle-settings-panel"
          >
            Subtitles
          </Button>
        </div>

        {showSettings && (
          <div
            id="subtitle-settings-panel"
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <SubtitleSettingsPanel />
          </div>
        )}
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
