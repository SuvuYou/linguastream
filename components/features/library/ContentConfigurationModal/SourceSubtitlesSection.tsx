"use client";

import {
  SUBTITLE_ACQUISITION_METHOD,
  SUBTITLE_ACQUISITION_METHODS,
} from "@/helpers/const";
import { FileUploadState } from "@/hooks/useFileUpload";
import { AcquisitionMethod } from "@prisma/client";
import { useRef } from "react";
import FileStatus from "@/components/features/library/ContentConfigurationModal/FileStatus";

interface SourceSubtitlesSectionProps {
  acquisitionMethod: AcquisitionMethod;
  onChangeMethod: (method: AcquisitionMethod) => void;
  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
}

export function SourceSubtitlesSection({
  acquisitionMethod,
  onChangeMethod,
  uploadState,
  onUpload,
}: SourceSubtitlesSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-secondary-text">Source subtitles</label>

      <div className="flex gap-2">
        {SUBTITLE_ACQUISITION_METHOD.map((method) => (
          <button
            key={method.type}
            onClick={() => onChangeMethod(method.type)}
            className={`flex-1 px-3 py-2 text-xs border transition-colors ${
              acquisitionMethod === method.type
                ? "border-active-border text-primary-text"
                : "border-primary-border text-secondary-text hover:text-primary-text"
            }`}
          >
            {method.type === SUBTITLE_ACQUISITION_METHODS.UPLOAD
              ? "Upload file"
              : "Generate with WhisperX"}
          </button>
        ))}
      </div>

      {acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.UPLOAD && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
            >
              {uploadState ? "Change file" : "Choose file"}
            </button>

            <FileStatus state={uploadState} />

            {uploadState?.status === "done" && (
              <span className="text-xs text-secondary-text truncate max-w-35">
                {uploadState.file.name}
              </span>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".srt,.vtt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </div>
      )}

      {acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX && (
        <p className="text-xs text-secondary-text">
          Audio will be transcribed locally using WhisperX. This may take
          several minutes.
        </p>
      )}
    </div>
  );
}
