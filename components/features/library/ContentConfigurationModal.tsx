"use client";

import {
  LANGUAGES,
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHODS,
  TranslationMethod,
} from "@/helpers/const";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useLanguageSelectors } from "@/hooks/useLanguageSelectors";
import type { MergedContentItem } from "@/types";
import type { AcquisitionMethod } from "@prisma/client";
import { useState, useTransition } from "react";
import { SourceLanguageSection } from "./ContentConfigurationModal/SourceLanguageSection";
import { SourceSubtitlesSection } from "./ContentConfigurationModal/SourceSubtitlesSection";
import { TranslationSubtitlesSection } from "./ContentConfigurationModal/TranslationSubtitlesSection";

interface ContentConfigurationModalProps {
  item: MergedContentItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContentConfigurationModal({
  item,
  onClose,
  onSuccess,
}: ContentConfigurationModalProps) {
  const { id: mediaId, title } = item;

  const [acquisitionMethod, setAcquisitionMethod] = useState<AcquisitionMethod>(
    item.source_subtitle_acquisition_method ??
      SUBTITLE_ACQUISITION_METHODS.UPLOAD,
  );

  const [translateMethod, setTranslateMethod] = useState<TranslationMethod>(
    TRANSLATE_METHODS.LIBRETRANSLATE,
  );

  const sourceFileUpload = useFileUpload();
  const translationsFileUpload = useFileUpload();

  const languageSelector = useLanguageSelectors({
    item,
    onToggleTranslate: (code) => translationsFileUpload.deleteKey(code),
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectiveTranslateMethod: TranslationMethod =
    acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX &&
    translateMethod === TRANSLATE_METHODS.UPLOAD
      ? TRANSLATE_METHODS.LIBRETRANSLATE
      : translateMethod;

  const allFileUploadsReady = (() => {
    if (
      acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.UPLOAD &&
      !sourceFileUpload.areFilesReady()
    )
      return false;

    if (
      effectiveTranslateMethod === TRANSLATE_METHODS.UPLOAD &&
      !translationsFileUpload.areFilesReady([
        ...languageSelector.data.selectedTranslateLangs,
      ])
    )
      return false;

    return true;
  })();

  const canSubmit = !isPending && allFileUploadsReady;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const translateFiles = translationsFileUpload.extractPathsMap();

      const res = await fetch(`/api/subtitles/${mediaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang: languageSelector.data.selectedSourceLang,
          acquisitionMethod,
          sourceFile: sourceFileUpload.fileUploads["source"]?.path,
          videoFilePath:
            item.jellyfinItem?.MediaSources?.[0].Path ??
            item.file_path ??
            undefined,
          translateLangs: Array.from(
            languageSelector.data.selectedTranslateLangs,
          ),
          translateMethod: effectiveTranslateMethod,
          removeLangs: languageSelector.data.removedTranslationLangs,
          ...(translateFiles && Object.entries(translateFiles).length > 0
            ? { translateFiles }
            : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      onSuccess();
    });
  }

  return (
    <div
      className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-primary-border w-full max-w-md p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-xs text-secondary-text mb-1">Configuration</div>
          <div className="text-sm font-medium truncate">{title}</div>
        </div>

        <SourceLanguageSection
          value={languageSelector.data.selectedSourceLang}
          onChange={languageSelector.actions.setSelectedSourceLang}
        />

        <SourceSubtitlesSection
          acquisitionMethod={acquisitionMethod}
          onChangeMethod={setAcquisitionMethod}
          uploadState={sourceFileUpload.fileUploads["source"] ?? null}
          onUpload={(file) => sourceFileUpload.handleUploadFile("source", file)}
        />

        <TranslationSubtitlesSection
          acquisitionMethod={acquisitionMethod}
          effectiveTranslateMethod={effectiveTranslateMethod}
          translateMethod={translateMethod}
          setTranslateMethod={setTranslateMethod}
          availableTranslationLangs={
            languageSelector.data.availableTranslationLangs
          }
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

        {languageSelector.data.removedTranslationLangs.length > 0 && (
          <div className="text-xs text-red-400 border border-red-400/20 px-3 py-2">
            The following tracks will be permanently deleted:{" "}
            {languageSelector.data.removedTranslationLangs
              .map((l) => LANGUAGES.find((lang) => lang.code === l)?.label ?? l)
              .join(", ")}
          </div>
        )}

        {error && <div className="text-xs text-red-400">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-secondary-text hover:text-primary-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm bg-active-border text-background font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
