"use client";

import {
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHOD_LABELS,
  TRANSLATE_METHODS,
  YOUTUBE_CONTENT_TYPE,
  LANGUAGES,
  type TranslationMethod,
} from "@/helpers/const";

import type { AcquisitionMethod } from "@prisma/client";
import type { FileUploadState } from "@/hooks/useFileUpload";
import { useUser } from "@/hooks/useUser";
import TranslationSubtitleRow from "@/components/features/library/ContentConfigurationModal/TranslationSubtitleRow";
import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TranslationLanguage {
  code: string;
  label: string;
}

interface TranslationSubtitlesSectionProps {
  contentType: string;
  acquisitionMethod: AcquisitionMethod;
  effectiveTranslateMethod: TranslationMethod;
  translateMethod: TranslationMethod;
  setTranslateMethod: (method: TranslationMethod) => void;

  availableTranslationLangs: TranslationLanguage[];
  // YouTube available langs for YT subtitles method
  youtubeAvailableLangs?: string[];

  isTranslationLanguageSelected: (code: string) => boolean;
  isTranslationLanguageExisting: (code: string) => boolean;
  toggleTranslateLang: (code: string) => void;

  getUploadState: (code: string) => FileUploadState | null;
  onUploadFile: (code: string, file: File) => void;
}

export function TranslationSubtitlesSection({
  contentType,
  acquisitionMethod,
  effectiveTranslateMethod,
  setTranslateMethod,
  availableTranslationLangs,
  youtubeAvailableLangs = [],
  isTranslationLanguageSelected,
  isTranslationLanguageExisting,
  toggleTranslateLang,
  getUploadState,
  onUploadFile,
}: TranslationSubtitlesSectionProps) {
  const user = useUser();
  const isAdmin = user.data?.is_admin;
  const isYouTube = contentType === YOUTUBE_CONTENT_TYPE;
  const isWhisperX =
    acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX;
  const isYTSubtitles =
    acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.YOUTUBE;

  const availableMethods = [
    ...(isYTSubtitles ? [TRANSLATE_METHODS.YOUTUBE] : []),
    TRANSLATE_METHODS.LIBRETRANSLATE,
    ...(isAdmin ? [TRANSLATE_METHODS.DEEPL] : []),
    ...(!isWhisperX && !isYouTube ? [TRANSLATE_METHODS.UPLOAD] : []),
  ];

  const ytSubtitleTranslationLangs = LANGUAGES.filter(
    (l) =>
      youtubeAvailableLangs.includes(l.code) &&
      availableTranslationLangs.some((a) => a.code === l.code),
  );

  return (
    <Field className="gap-2">
      <FieldLabel className="text-sm text-primary-foreground font-normal">
        Translation subtitles
      </FieldLabel>

      <Tabs
        value={effectiveTranslateMethod}
        onValueChange={(value) =>
          setTranslateMethod(value as TranslationMethod)
        }
      >
        <TabsList className="w-full">
          {availableMethods.map((method) => (
            <TabsTrigger key={method} value={method} className="flex-1 text-xs">
              {TRANSLATE_METHOD_LABELS[method]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* YouTube subtitles translation */}
        {isYTSubtitles && (
          <TabsContent value={TRANSLATE_METHODS.YOUTUBE}>
            {ytSubtitleTranslationLangs.length === 0 ? (
              <Alert>
                <AlertDescription className="text-xs">
                  No other subtitle languages available for this video.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-col gap-1 mt-1">
                {ytSubtitleTranslationLangs.map((lang) => (
                  <TranslationSubtitleRow
                    key={lang.code}
                    lang={lang}
                    isChecked={isTranslationLanguageSelected(lang.code)}
                    wasExisting={isTranslationLanguageExisting(lang.code)}
                    onToggle={() => toggleTranslateLang(lang.code)}
                    showUpload={false}
                    uploadState={null}
                    onUpload={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* LibreTranslate + DeepL + Upload — standard language list */}
        {[
          TRANSLATE_METHODS.LIBRETRANSLATE,
          TRANSLATE_METHODS.DEEPL,
          TRANSLATE_METHODS.UPLOAD,
        ]
          .filter((m) => availableMethods.includes(m))
          .map((method) => (
            <TabsContent key={method} value={method}>
              <div className="flex flex-col gap-1 mt-1">
                {availableTranslationLangs.map((lang) => (
                  <TranslationSubtitleRow
                    key={lang.code}
                    lang={lang}
                    isChecked={isTranslationLanguageSelected(lang.code)}
                    wasExisting={isTranslationLanguageExisting(lang.code)}
                    onToggle={() => toggleTranslateLang(lang.code)}
                    showUpload={
                      effectiveTranslateMethod === TRANSLATE_METHODS.UPLOAD
                    }
                    uploadState={getUploadState(lang.code)}
                    onUpload={(file) => onUploadFile(lang.code, file)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
      </Tabs>
    </Field>
  );
}
