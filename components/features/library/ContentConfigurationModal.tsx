"use client";

import {
  AUTO_DETECT,
  LANGUAGES,
  SUBTITLE_ACQUISITION_METHOD,
  UNKNOWN_SOURCE_LANGUAGE,
} from "@/helpers/const";
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

interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  path?: string;
  error?: string;
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
  const { id: mediaId, title, source_language: currentSourceLanguage } = item;

  const user = useUser();
  const isAdmin = user.data?.is_admin;

  const existingTranslationLangs = item.subtitle_tracks
    .map((t) => t.subtitle_language)
    .filter((l) => l !== currentSourceLanguage);

  const [sourceLang, setSourceLang] = useState<string>(
    currentSourceLanguage && currentSourceLanguage !== UNKNOWN_SOURCE_LANGUAGE
      ? currentSourceLanguage
      : AUTO_DETECT,
  );

  const [sourceMethod, setSourceMethod] = useState<AcquisitionMethod>(
    item.source_subtitle_acquisition_method ?? "upload",
  );

  const [sourceFileUpload, setSourceFileUpload] =
    useState<FileUploadState | null>(null);

  const [translateMethod, setTranslateMethod] =
    useState<TranslateMethod>("libretranslate");

  const [selectedTranslateLangs, setSelectedTranslateLangs] = useState<
    Set<string>
  >(new Set(existingTranslationLangs));

  const [translateFileUploads, setTranslateFileUploads] = useState<
    Record<string, FileUploadState>
  >({});

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sourceFileRef = useRef<HTMLInputElement>(null);
  const translateFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const availableTranslateLangs = LANGUAGES.filter(
    (l) => l.code !== sourceLang,
  );

  const removedLangs = existingTranslationLangs.filter(
    (l) => !selectedTranslateLangs.has(l),
  );

  // if user switches source to whisperx and translate was upload, reset
  const effectiveTranslateMethod: TranslateMethod =
    sourceMethod === "whisperx" && translateMethod === "upload"
      ? "libretranslate"
      : translateMethod;

  const allFileUploadsReady = (() => {
    if (sourceMethod === "upload") {
      if (!sourceFileUpload || sourceFileUpload.status !== "done") return false;
    }
    if (effectiveTranslateMethod === "upload") {
      for (const lang of selectedTranslateLangs) {
        const u = translateFileUploads[lang];
        if (!u || u.status !== "done") return false;
      }
    }
    return true;
  })();

  const canSubmit = !isPending && allFileUploadsReady;

  // ── file upload ────────────────────────────────────────────────────────────

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/subtitles/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Upload failed");
    }

    const data = await res.json();
    return data.path as string;
  }

  async function handleSourceFileChange(file: File) {
    setSourceFileUpload({ file, status: "uploading" });

    try {
      const path = await uploadFile(file);
      setSourceFileUpload({ file, status: "done", path });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setSourceFileUpload({ file, status: "error", error: msg });
    }
  }

  async function handleTranslateFileChange(lang: string, file: File) {
    setTranslateFileUploads((prev) => ({
      ...prev,
      [lang]: { file, status: "uploading" },
    }));
    try {
      const path = await uploadFile(file);
      setTranslateFileUploads((prev) => ({
        ...prev,
        [lang]: { file, status: "done", path },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setTranslateFileUploads((prev) => ({
        ...prev,
        [lang]: { file, status: "error", error: msg },
      }));
    }
  }

  function toggleTranslateLang(code: string) {
    setSelectedTranslateLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);

        setTranslateFileUploads((u) => {
          const updated = { ...u };
          delete updated[code];

          return updated;
        });
      } else {
        next.add(code);
      }
      return next;
    });
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const translateFiles: Record<string, string> = {};
      for (const [lang, u] of Object.entries(translateFileUploads)) {
        if (u.path) translateFiles[lang] = u.path;
      }

      const res = await fetch(`/api/subtitles/${mediaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang,
          sourceMethod,
          sourceFile: sourceFileUpload?.path,
          videoFilePath:
            item.jellyfinItem?.MediaSources?.[0].Path ??
            item.file_path ??
            undefined,
          translateLangs: Array.from(selectedTranslateLangs),
          translateMethod: effectiveTranslateMethod,
          translateFiles,
          removeLangs: removedLangs,
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
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
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
                onClick={() => setSourceMethod(method.type)}
                className={`flex-1 px-3 py-2 text-xs border transition-colors ${
                  sourceMethod === method.type
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

          {sourceMethod === "upload" && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => sourceFileRef.current?.click()}
                  className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                >
                  {sourceFileUpload ? "Change file" : "Choose file"}
                </button>
                <FileStatus state={sourceFileUpload} />
                {sourceFileUpload?.status === "done" && (
                  <span className="text-xs text-secondary-text truncate max-w-35">
                    {sourceFileUpload.file.name}
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
                  if (file) handleSourceFileChange(file);
                }}
              />
            </div>
          )}

          {sourceMethod === "whisperx" && (
            <p className="text-xs text-secondary-text">
              Audio will be transcribed locally using WhisperX. This may take
              several minutes.
            </p>
          )}
        </div>

        {/* section 3 — translations */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-secondary-text">Translations</label>
          <div className="flex gap-2">
            {(
              [
                "libretranslate",
                ...(isAdmin ? ["deepl"] : []),
                "upload",
              ] as TranslateMethod[]
            )
              .filter((m) => !(sourceMethod === "whisperx" && m === "upload"))
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
            {availableTranslateLangs.map((lang) => {
              const isChecked = selectedTranslateLangs.has(lang.code);
              const wasExisting = existingTranslationLangs.includes(lang.code);
              const uploadState = translateFileUploads[lang.code] ?? null;

              return (
                <div key={lang.code}>
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id={`lang-${lang.code}`}
                      checked={isChecked}
                      onChange={() => toggleTranslateLang(lang.code)}
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
                          if (file) handleTranslateFileChange(lang.code, file);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {removedLangs.length > 0 && (
          <div className="text-xs text-red-400 border border-red-400/20 px-3 py-2">
            The following tracks will be permanently deleted:{" "}
            {removedLangs
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
