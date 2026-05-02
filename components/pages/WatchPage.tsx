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
import { useSearchOverlay } from "@/hooks/useSearchOverlay";

export default function WatchPage({
  mediaContentId,
}: {
  mediaContentId: string;
}) {
  const {
    preferredTranslationLanguage,
    setPreferredTranslationLanguage,
    subtitleSettings,
  } = useAppStore();

  const { isOpen, close } = useSearchOverlay();

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
      <div className="flex items-center justify-center h-64 text-secondary-text text-sm">
        Loading...
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex items-center justify-center h-64 text-secondary-text text-sm">
        Failed to load video.
      </div>
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col flex-2 min-w-0 bg-black items-center justify-start pt-1">
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

      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <SubtitleSidebar
          currentTimeMs={currentTimeMs}
          sourceLines={sourceTracks.data ?? []}
          translationLines={translationTracks.data ?? []}
          settings={subtitleSettings}
        />
      </div>

      <OverlayPlayer isOpen={isOpen} onCloseIconPress={close} />
    </div>
  );
}
