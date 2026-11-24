"use client";

import { useState } from "react";
import {
  AUTO_DETECT,
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHODS,
  YOUTUBE_CONTENT_TYPE,
  type TranslationMethod,
} from "@/helpers/const";

import { useLanguageSelectors } from "@/hooks/useLanguageSelectors";
import { useFileUpload } from "@/hooks/useFileUpload";
import { SourceSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection";
import { TranslationSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/TranslationSubtitlesSection";
import { SourceLanguageSection } from "@/components/features/library/ContentConfigurationModal/SourceLanguageSection";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import type { AcquisitionMethod } from "@prisma/client";
import { useYouTubeSubtitles } from "@/hooks/useYouTubeSubtitles";
import Image from "next/image";
import { useHandleContentSubmit } from "@/hooks/useHandleContentSubmit";

interface YouTubeMetadata {
  title: string;
  videoId: string;
  thumbnailUrl: string;
}

export default function ConfigurationStep({
  meta,
  onBack,
  onSuccess,
}: {
  meta: YouTubeMetadata;
  onBack: () => void;
  onSuccess: (mediaId: string) => void;
}) {
  const [acquisitionMethod, setAcquisitionMethod] = useState<AcquisitionMethod>(
    SUBTITLE_ACQUISITION_METHODS.YOUTUBE as AcquisitionMethod,
  );
  const [translateMethod, setTranslateMethod] = useState<TranslationMethod>(
    TRANSLATE_METHODS.YOUTUBE,
  );

  const translationsFileUpload = useFileUpload();

  const languageSelector = useLanguageSelectors({
    item: { source_language: AUTO_DETECT, subtitle_tracks: [] },
    onToggleTranslate: (code) => translationsFileUpload.deleteKey(code),
  });

  const ytSubtitles = useYouTubeSubtitles(meta.videoId);

  const effectiveTranslateMethod: TranslationMethod =
    acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX &&
    translateMethod === TRANSLATE_METHODS.UPLOAD
      ? TRANSLATE_METHODS.LIBRETRANSLATE
      : translateMethod;

  const handleContentSubmit = useHandleContentSubmit({
    sourceLanguage: languageSelector.data.selectedSourceLang,
    translationLanguages: Array.from(
      languageSelector.data.selectedTranslateLangs,
    ),
    acquisitionMethod,
    translateMethod,
    videoId: meta.videoId,
    ytSubtitlesInfo: ytSubtitles.data,
    translationsFileUpload,
    onSuccess,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-4 px-1 pt-2">
        <Image
          src={meta.thumbnailUrl}
          alt={meta.title}
          className="w-full h-24 shrink-0 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
          width={1}
          height={1}
          unoptimized
        />
        <span className="text-sm text-primary-foreground font-medium truncate max-w-98">
          {meta.title}
        </span>
      </div>

      <Separator />

      <SourceLanguageSection
        value={languageSelector.data.selectedSourceLang}
        onChange={languageSelector.actions.setSelectedSourceLang}
      />

      <SourceSubtitlesSection
        contentType={YOUTUBE_CONTENT_TYPE}
        acquisitionMethod={acquisitionMethod}
        onChangeMethod={setAcquisitionMethod}
        uploadState={null}
        onUpload={() => {}}
        isExisting={false}
        youtubeSubtitlesLoading={ytSubtitles.isLoading}
        youtubeSubtitlesAvailable={ytSubtitles.data?.allLanguages}
      />

      <TranslationSubtitlesSection
        contentType={YOUTUBE_CONTENT_TYPE}
        acquisitionMethod={acquisitionMethod}
        effectiveTranslateMethod={effectiveTranslateMethod}
        translateMethod={translateMethod}
        setTranslateMethod={setTranslateMethod}
        availableTranslationLangs={
          languageSelector.data.availableTranslationLangs
        }
        youtubeAvailableLangs={ytSubtitles.data?.allLanguages}
        isTranslationLanguageSelected={
          languageSelector.checks.isTranslationLanguageSelected
        }
        isTranslationLanguageExisting={
          languageSelector.checks.isTranslationLanguageExisting
        }
        toggleTranslateLang={languageSelector.actions.toggleTranslateLang}
        getUploadState={(code) =>
          translationsFileUpload.fileUploads[code] ?? null
        }
        onUploadFile={(code, file) =>
          translationsFileUpload.handleUploadFile(code, file)
        }
      />

      {handleContentSubmit.error && (
        <p className="text-xs text-red-400">{handleContentSubmit.error}</p>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={handleContentSubmit.isPending}
        >
          Back
        </Button>
        <Button
          onClick={handleContentSubmit.handleSubmit}
          disabled={handleContentSubmit.isPending}
        >
          {handleContentSubmit.isPending ? (
            <>
              <Spinner className="size-3.5 mr-2" />
              Adding...
            </>
          ) : (
            "Add to Library"
          )}
        </Button>
      </div>
    </div>
  );
}
