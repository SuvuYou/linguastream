"use client";

import FileChooser from "./FileChooser";

import type { FileUploadState } from "@/hooks/useFileUpload";

interface TranslationLanguage {
  code: string;
  label: string;
}

interface TranslationSubtitleRowProps {
  lang: TranslationLanguage;
  isChecked: boolean;
  wasExisting: boolean;
  onToggle: () => void;

  showUpload: boolean;

  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
}

export default function TranslationSubtitleRow({
  lang,
  isChecked,
  wasExisting,
  onToggle,

  showUpload,

  uploadState,
  onUpload,
}: TranslationSubtitleRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id={`lang-${lang.code}`}
          checked={isChecked}
          onChange={onToggle}
          className="accent-active-border"
        />

        <label
          htmlFor={`lang-${lang.code}`}
          className="text-sm text-primary-text cursor-pointer flex-1"
        >
          {lang.label}
        </label>

        {wasExisting && !isChecked && (
          <span className="text-xs text-red-400">Will be removed</span>
        )}

        {wasExisting && isChecked && (
          <span className="text-xs text-secondary-text">Existing</span>
        )}
      </div>

      {isChecked && showUpload && (
        <FileChooser uploadState={uploadState} onUpload={onUpload} />
      )}
    </div>
  );
}
