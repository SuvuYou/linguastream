"use client";

import {
  SUBTITLE_ACQUISITION_METHODS,
  YOUTUBE_CONTENT_TYPE,
} from "@/helpers/const";
import { FileUploadState } from "@/hooks/useFileUpload";
import { AcquisitionMethod } from "@prisma/client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import FileChooser from "./FileChooser";

interface SourceSubtitlesSectionProps {
  contentType: string;
  acquisitionMethod: AcquisitionMethod;
  onChangeMethod: (method: AcquisitionMethod) => void;
  uploadState: FileUploadState | null;
  onUpload: (file: File) => void;
  isExisting: boolean;
  youtubeSubtitlesLoading?: boolean;
  youtubeSubtitlesAvailable?: string[];
}

export function SourceSubtitlesSection({
  contentType,
  acquisitionMethod,
  onChangeMethod,
  uploadState,
  onUpload,
  isExisting,
  youtubeSubtitlesLoading,
  youtubeSubtitlesAvailable,
}: SourceSubtitlesSectionProps) {
  const isYouTube = contentType === YOUTUBE_CONTENT_TYPE;

  const tabs = isYouTube
    ? [
        {
          value: SUBTITLE_ACQUISITION_METHODS.YOUTUBE,
          label: "YouTube Subtitles",
        },
        {
          value: SUBTITLE_ACQUISITION_METHODS.WHISPERX,
          label: "Generate with WhisperX",
        },
      ]
    : [
        { value: SUBTITLE_ACQUISITION_METHODS.UPLOAD, label: "Upload file" },
        {
          value: SUBTITLE_ACQUISITION_METHODS.WHISPERX,
          label: "Generate with WhisperX",
        },
      ];

  return (
    <Field className="gap-2">
      <FieldLabel className="text-sm text-primary-foreground font-normal">
        Source subtitles
      </FieldLabel>

      <Tabs
        value={acquisitionMethod}
        onValueChange={(value) => onChangeMethod(value as AcquisitionMethod)}
      >
        <TabsList className="w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 text-xs"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {!isYouTube && (
          <TabsContent value={SUBTITLE_ACQUISITION_METHODS.UPLOAD}>
            <div className="flex flex-row-reverse items-start justify-start gap-2">
              <div className="mt-1.5 mb-4">
                <FileChooser uploadState={uploadState} onUpload={onUpload} />
              </div>
              {isExisting && (
                <Badge
                  size="sm"
                  variant="secondary"
                  className="text-xs font-normal mt-2"
                >
                  Existing
                </Badge>
              )}
            </div>
          </TabsContent>
        )}

        {isYouTube && (
          <TabsContent value={SUBTITLE_ACQUISITION_METHODS.YOUTUBE}>
            {youtubeSubtitlesLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-secondary-text">
                <Spinner className="size-3" />
                Checking available subtitles...
              </div>
            ) : youtubeSubtitlesAvailable &&
              youtubeSubtitlesAvailable.length > 0 ? (
              <Alert>
                <AlertDescription className="text-xs">
                  {youtubeSubtitlesAvailable.length} subtitle language
                  {youtubeSubtitlesAvailable.length !== 1
                    ? "s"
                    : ""} available: {youtubeSubtitlesAvailable.join(", ")}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  No subtitles available for this video. Use WhisperX instead.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        )}

        <TabsContent value={SUBTITLE_ACQUISITION_METHODS.WHISPERX}>
          <Alert>
            <AlertDescription className="text-xs">
              {isYouTube
                ? "Audio will be downloaded from YouTube and transcribed locally using WhisperX. This may take several minutes."
                : "Audio will be transcribed locally using WhisperX. This may take several minutes."}
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </Field>
  );
}
