"use client";

import { useRef } from "react";
import type { FileUploadState } from "@/hooks/useFileUpload";
import FileStatus from "@/components/features/library/ContentConfigurationModal/FileStatus";

interface FileChooserProps {
  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
}

export default function FileChooser(props: FileChooserProps) {
  const { uploadState, onUpload } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="ml-6 flex items-center gap-3 pb-1">
      <button
        onClick={() => inputRef.current?.click()}
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
        ref={inputRef}
        type="file"
        accept=".srt,.vtt"
        className="hidden"
        data-testId="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}
