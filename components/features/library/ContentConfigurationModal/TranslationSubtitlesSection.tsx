"use client";

import {
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHOD_LABELS,
  TRANSLATE_METHODS,
  type TranslationMethod,
} from "@/helpers/const";

import type { AcquisitionMethod } from "@prisma/client";
import type { FileUploadState } from "@/hooks/useFileUpload";
import { useUser } from "@/hooks/useUser";
import TranslationSubtitleRow from "@/components/features/library/ContentConfigurationModal/TranslationSubtitleRow";
import { Field, FieldLabel } from "@/components/ui/field";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TranslationLanguage {
  code: string;
  label: string;
}

interface TranslationSubtitlesSectionProps {
  acquisitionMethod: AcquisitionMethod;
  effectiveTranslateMethod: TranslationMethod;
  translateMethod: TranslationMethod;
  setTranslateMethod: (method: TranslationMethod) => void;

  availableTranslationLangs: TranslationLanguage[];

  isTranslationLanguageSelected: (code: string) => boolean;
  isTranslationLanguageExisting: (code: string) => boolean;
  toggleTranslateLang: (code: string) => void;

  getUploadState: (code: string) => FileUploadState | null;
  onUploadFile: (code: string, file: File) => void;
}

export function TranslationSubtitlesSection({
  acquisitionMethod,
  effectiveTranslateMethod,
  setTranslateMethod,

  availableTranslationLangs,

  isTranslationLanguageSelected,
  isTranslationLanguageExisting,
  toggleTranslateLang,

  getUploadState,
  onUploadFile,
}: TranslationSubtitlesSectionProps) {
  const user = useUser();
  const isAdmin = user.data?.is_admin;

  const availableMethods = [
    TRANSLATE_METHODS.LIBRETRANSLATE,
    ...(isAdmin ? [TRANSLATE_METHODS.DEEPL] : []),
    TRANSLATE_METHODS.UPLOAD,
  ].filter(
    (m) =>
      !(
        acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX &&
        m === TRANSLATE_METHODS.UPLOAD
      ),
  );

  return (
    <Field className="gap-2">
      <FieldLabel className="text-xs text-secondary-text font-normal">
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

        {availableMethods.map((method) => (
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
