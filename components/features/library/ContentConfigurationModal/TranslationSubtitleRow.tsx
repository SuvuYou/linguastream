"use client";

import FileChooser from "@/components/features/library/ContentConfigurationModal/FileChooser";
import type { FileUploadState } from "@/hooks/useFileUpload";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
        <Checkbox
          id={`lang-${lang.code}`}
          checked={isChecked}
          onCheckedChange={onToggle}
        />

        <Label
          htmlFor={`lang-${lang.code}`}
          className="text-sm text-primary-text font-normal cursor-pointer flex-1"
        >
          {lang.label}
        </Label>

        {wasExisting && !isChecked && (
          <Badge variant="destructive" className="text-xs font-normal">
            Will be removed
          </Badge>
        )}

        {wasExisting && isChecked && (
          <Badge variant="secondary" className="text-xs font-normal">
            Existing
          </Badge>
        )}
      </div>

      {isChecked && showUpload && (
        <FileChooser uploadState={uploadState} onUpload={onUpload} />
      )}
    </div>
  );
}
