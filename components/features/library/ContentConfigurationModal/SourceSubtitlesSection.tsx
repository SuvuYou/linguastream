"use client";

import {
  SUBTITLE_ACQUISITION_METHOD,
  SUBTITLE_ACQUISITION_METHODS,
} from "@/helpers/const";
import { FileUploadState } from "@/hooks/useFileUpload";
import { AcquisitionMethod } from "@prisma/client";
import { useRef } from "react";
import FileStatus from "@/components/features/library/ContentConfigurationModal/FileStatus";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    <Field className="gap-2">
      <FieldLabel className="text-xs text-secondary-text font-normal">
        Source subtitles
      </FieldLabel>

      <Tabs
        value={acquisitionMethod}
        onValueChange={(value) => onChangeMethod(value as AcquisitionMethod)}
      >
        <TabsList className="w-full">
          {SUBTITLE_ACQUISITION_METHOD.map((method) => (
            <TabsTrigger
              key={method.type}
              value={method.type}
              className="flex-1 text-xs"
            >
              {method.type === SUBTITLE_ACQUISITION_METHODS.UPLOAD
                ? "Upload file"
                : "Generate with WhisperX"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={SUBTITLE_ACQUISITION_METHODS.UPLOAD}>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              {uploadState ? "Change file" : "Choose file"}
            </Button>

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
        </TabsContent>

        <TabsContent value={SUBTITLE_ACQUISITION_METHODS.WHISPERX}>
          <Alert>
            <AlertDescription className="text-xs">
              Audio will be transcribed locally using WhisperX. This may take
              several minutes.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </Field>
  );
}
