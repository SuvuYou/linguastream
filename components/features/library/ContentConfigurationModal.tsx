"use client";

import {
  AUTO_DETECT,
  LANGUAGES,
  SUBTITLE_ACQUISITION_METHOD,
} from "@/helpers/const";
import { FileUploadState, useFileUpload } from "@/hooks/useFileUpload";
import { useLanguageSelectors } from "@/hooks/useLanguageSelectors";
import { useUser } from "@/hooks/useUser";
import type { MergedContentItem } from "@/types";
import type { AcquisitionMethod } from "@prisma/client";
import { useState, useTransition, useRef } from "react";

type TranslateMethod = "libretranslate" | "deepl" | "upload";

interface ContentConfigurationModalProps {
  item: MergedContentItem;
  onClose: () => void;
  onSuccess: () => void;
}

function FileStatus({ state }: { state: FileUploadState | null }) {
  if (!state) return null;
  if (state.status === "uploading")
    return <span className="text-xs text-secondary-text">Uploading...</span>;
  if (state.status === "done")
    return <span className="text-xs text-active-border">✓ Ready</span>;
  if (state.status === "error")
    return <span className="text-xs text-red-400">{state.error}</span>;
  return null;
}

export default function ContentConfigurationModal({
  item,
  onClose,
  onSuccess,
}: ContentConfigurationModalProps) {
  const { id: mediaId, title } = item;

  const user = useUser();
  const isAdmin = user.data?.is_admin;

  const [acquisitionMethod, setAcquisitionMethod] = useState<AcquisitionMethod>(
    item.source_subtitle_acquisition_method ?? "upload",
  );

  const [translateMethod, setTranslateMethod] =
    useState<TranslateMethod>("libretranslate");

  const sourceFileUpload = useFileUpload();
  const translationsFileUpload = useFileUpload();

  const languageSelector = useLanguageSelectors({
    item,
    onToggleTranslate: (code) => translationsFileUpload.deleteKey(code),
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sourceFileRef = useRef<HTMLInputElement>(null);
  const translateFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const effectiveTranslateMethod: TranslateMethod =
    acquisitionMethod === "whisperx" && translateMethod === "upload"
      ? "libretranslate"
      : translateMethod;

  const allFileUploadsReady = (() => {
    if (acquisitionMethod === "upload" && !sourceFileUpload.areFilesReady())
      return false;

    if (
      effectiveTranslateMethod === "upload" &&
      !translationsFileUpload.areFilesReady([
        ...languageSelector.data.selectedTranslateLangs,
      ])
    )
      return false;

    return true;
  })();

  const canSubmit = !isPending && allFileUploadsReady;

  // ── submit ─────────────────────────────────────────────────────────────────

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

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border border-primary-border w-full max-w-md p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div>
          <div className="text-xs text-secondary-text mb-1">Configuration</div>
          <div className="text-sm font-medium truncate">{title}</div>
        </div>

        {/* section 1 — source language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary-text">
            Content language
          </label>
          <select
            value={languageSelector.data.selectedSourceLang}
            onChange={(e) =>
              languageSelector.actions.setSelectedSourceLang(e.target.value)
            }
            className="bg-background border border-primary-border text-sm text-primary-text px-3 py-2 outline-none"
          >
            <option value={AUTO_DETECT}>Auto-detect</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* section 2 — source subtitles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary-text">
            Source subtitles
          </label>
          <div className="flex gap-2">
            {SUBTITLE_ACQUISITION_METHOD.map((method) => (
              <button
                key={method.type}
                onClick={() => setAcquisitionMethod(method.type)}
                className={`flex-1 px-3 py-2 text-xs border transition-colors ${
                  acquisitionMethod === method.type
                    ? "border-active-border text-primary-text"
                    : "border-primary-border text-secondary-text hover:text-primary-text"
                }`}
              >
                {method.type === "upload"
                  ? "Upload file"
                  : "Generate with WhisperX"}
              </button>
            ))}
          </div>

          {acquisitionMethod === "upload" && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => sourceFileRef.current?.click()}
                  className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                >
                  {sourceFileUpload ? "Change file" : "Choose file"}
                </button>
                <FileStatus state={sourceFileUpload.fileUploads["source"]} />
                {sourceFileUpload.fileUploads["source"]?.status === "done" && (
                  <span className="text-xs text-secondary-text truncate max-w-35">
                    {sourceFileUpload.fileUploads["source"].file.name}
                  </span>
                )}
              </div>
              <input
                ref={sourceFileRef}
                type="file"
                accept=".srt,.vtt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) sourceFileUpload.handleUploadFile("source", file);
                }}
              />
            </div>
          )}

          {acquisitionMethod === "whisperx" && (
            <p className="text-xs text-secondary-text">
              Audio will be transcribed locally using WhisperX. This may take
              several minutes.
            </p>
          )}
        </div>

        {/* section 3 — translation subtitles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary-text">
            Translation subtitles
          </label>
          <div className="flex gap-2">
            {(
              [
                "libretranslate",
                ...(isAdmin ? ["deepl"] : []),
                "upload",
              ] as TranslateMethod[]
            )
              .filter(
                (m) => !(acquisitionMethod === "whisperx" && m === "upload"),
              )
              .map((method) => (
                <button
                  key={method}
                  onClick={() => setTranslateMethod(method)}
                  className={`flex-1 px-3 py-2 text-xs border transition-colors ${
                    effectiveTranslateMethod === method
                      ? "border-active-border text-primary-text"
                      : "border-primary-border text-secondary-text hover:text-primary-text"
                  }`}
                >
                  {method === "libretranslate"
                    ? "LibreTranslate"
                    : method === "deepl"
                      ? "DeepL"
                      : "Upload files"}
                </button>
              ))}
          </div>

          {/* language checkboxes */}
          <div className="flex flex-col gap-1 mt-1">
            {languageSelector.data.availableTranslationLangs.map((lang) => {
              const isChecked =
                languageSelector.checks.isTranslationLanguageSelected(
                  lang.code,
                );

              const wasExisting =
                languageSelector.checks.isTranslationLanguageExisting(
                  lang.code,
                );

              const uploadState =
                translationsFileUpload.fileUploads[lang.code] ?? null;

              return (
                <div key={lang.code}>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id={`lang-${lang.code}`}
                      checked={isChecked}
                      onChange={() =>
                        languageSelector.actions.toggleTranslateLang(lang.code)
                      }
                      className="accent-active-border"
                    />
                    <label
                      htmlFor={`lang-${lang.code}`}
                      className="text-sm text-primary-text cursor-pointer flex-1"
                    >
                      {lang.label}
                    </label>
                    {wasExisting && !isChecked && (
                      <span className="text-xs text-red-400">
                        Will be removed
                      </span>
                    )}
                    {wasExisting && isChecked && (
                      <span className="text-xs text-secondary-text">
                        Existing
                      </span>
                    )}
                  </div>

                  {/* per-language file picker when upload method selected */}
                  {isChecked && effectiveTranslateMethod === "upload" && (
                    <div className="ml-6 flex items-center gap-3 pb-1">
                      <button
                        onClick={() =>
                          translateFileRefs.current[lang.code]?.click()
                        }
                        className="text-xs px-3 py-1 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                      >
                        {uploadState ? "Change" : "Choose file"}
                      </button>
                      <FileStatus state={uploadState} />
                      {uploadState?.status === "done" && (
                        <span className="text-xs text-secondary-text truncate max-w-30">
                          {uploadState.file.name}
                        </span>
                      )}
                      <input
                        ref={(el) => {
                          translateFileRefs.current[lang.code] = el;
                        }}
                        type="file"
                        accept=".srt,.vtt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            translationsFileUpload.handleUploadFile(
                              lang.code,
                              file,
                            );
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
