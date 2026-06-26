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
import { SourceLanguageSection } from "@/components/features/library/ContentConfigurationModal/SourceLanguageSection";
import { SourceSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection";
import { TranslationSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/TranslationSubtitlesSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogDescription className="text-xs text-secondary-text">
            Configuration
          </DialogDescription>
          <DialogTitle className="text-sm font-medium truncate">
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="flex flex-col gap-6 px-6 py-6">
            <SourceLanguageSection
              value={languageSelector.data.selectedSourceLang}
              onChange={languageSelector.actions.setSelectedSourceLang}
            />

            <SourceSubtitlesSection
              acquisitionMethod={acquisitionMethod}
              onChangeMethod={setAcquisitionMethod}
              uploadState={sourceFileUpload.fileUploads["source"] ?? null}
              onUpload={(file) =>
                sourceFileUpload.handleUploadFile("source", file)
              }
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
                  .map(
                    (l) =>
                      LANGUAGES.find((lang) => lang.code === l)?.label ?? l,
                  )
                  .join(", ")}
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-400">
                {error}
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-primary-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <Spinner className="size-3.5" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
