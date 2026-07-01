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

export default function WatchPage({
  mediaContentId,
}: {
  mediaContentId: string;
}) {
  const router = useRouter();

  const {
    preferredTranslationLanguage,
    setPreferredTranslationLanguage,
    subtitleSettings,
    setOverlayOpen,
  } = useAppStore();

  const { params } = useZodSearchParams(WATCH_PAGE_PARAMS_SCHEMA);

  const { data, isLoading, isError } = useWatchData(mediaContentId);

  const [currentTimeMs, setCurrentTimeMs] = useState(params.t);

  const activeTranslationLang = (() => {
    if (!data) return null;
    if (
      preferredTranslationLanguage &&
      data.translationLanguages.includes(preferredTranslationLanguage)
    )
      return preferredTranslationLanguage;
    return data.translationLanguages[0] ?? null;
  })();

  const sourceTracks = useSubtitleTrack(
    mediaContentId,
    data?.sourceLanguage ?? null,
    !!data,
  );

  const translationTracks = useSubtitleTrack(
    mediaContentId,
    activeTranslationLang,
    !!activeTranslationLang,
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
      <section className="flex w-full flex-col bg-background m-2 ml-0 p-2 rounded-r-lg">
        <div>
          <div className="flex flex-col flex-1 overflow-hidden">
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
                <LanguageFilter />
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

            <div className="flex flex-1 overflow-hidden">
              <div className="flex flex-col flex-2 min-w-0 bg-background items-center justify-start pt-1">
                <Player
                  streamUrl={data.streamUrl}
                  title={data.title}
                  sourceLines={sourceTracks.data ?? []}
                  translationLines={translationTracks.data ?? []}
                  translationLanguages={data.translationLanguages}
                  activeTranslationLang={activeTranslationLang}
                  initialTimeMs={params.t}
                  currentTimeMs={currentTimeMs}
                  onTranslationLangChange={setPreferredTranslationLanguage}
                  setCurrentTimeMs={setCurrentTimeMs}
                />
              </div>
            </div>
          </div>

          <OverlayPlayer />
        </div>
      </section>
      <SubtitleSidebar
        currentTimeMs={currentTimeMs}
        sourceLines={sourceTracks.data ?? []}
        translationLines={translationTracks.data ?? []}
        settings={subtitleSettings}
      />
    </SidebarProvider>
  );
}
