"use client";

import {
  SUBTITLE_ACQUISITION_METHOD,
  SUBTITLE_ACQUISITION_METHODS,
} from "@/helpers/const";
import { FileUploadState } from "@/hooks/useFileUpload";
import { AcquisitionMethod } from "@prisma/client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FileChooser from "./FileChooser";
import { Badge } from "@/components/ui/badge";

interface SourceSubtitlesSectionProps {
  acquisitionMethod: AcquisitionMethod;
  onChangeMethod: (method: AcquisitionMethod) => void;
  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
  isExisting: boolean;
}

export function SourceSubtitlesSection({
  acquisitionMethod,
  onChangeMethod,
  uploadState,
  onUpload,
  isExisting,
}: SourceSubtitlesSectionProps) {
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
          <div className="flex flex-row-reverse items-start justify-start gap-2">
            <div className="mt-1.5 mb-4">
              <FileChooser uploadState={uploadState} onUpload={onUpload} />
            </div>
            {isExisting && (
              <Badge
                size="sm"
                variant="secondary"
                className="text-xs font-normal mt-2 "
              >
                Existing
              </Badge>
            )}
          </div>
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
