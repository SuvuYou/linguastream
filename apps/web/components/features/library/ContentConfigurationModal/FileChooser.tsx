"use client";

import { useRef } from "react";
import type { FileUploadState } from "@/hooks/useFileUpload";
import FileStatus from "@/components/features/library/ContentConfigurationModal/FileStatus";
import { Button } from "@/components/ui/button";

interface FileChooserProps {
  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
  size?: "sm" | "default";
}

export default function FileChooser({
  uploadState,
  onUpload,
  size = "default",
}: FileChooserProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size={size}
        onClick={() => inputRef.current?.click()}
        className="px-4"
      >
        {uploadState ? "Change" : "Choose file"}
      </Button>

      <FileStatus state={uploadState} />

      {uploadState?.status === "done" && (
        <span className="text-xs text-primary-foreground truncate max-w-30">
          {uploadState.file.name}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".srt,.vtt"
        className="hidden"
        data-testid="file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}
