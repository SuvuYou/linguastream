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

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-secondary-text">
        Translation subtitles
      </label>

      <div className="flex gap-2">
        {[
          TRANSLATE_METHODS.LIBRETRANSLATE,
          ...(isAdmin ? [TRANSLATE_METHODS.DEEPL] : []),
          TRANSLATE_METHODS.UPLOAD,
        ]
          .filter(
            (m) =>
              !(
                acquisitionMethod === SUBTITLE_ACQUISITION_METHODS.WHISPERX &&
                m === TRANSLATE_METHODS.UPLOAD
              ),
          )
          .map((method) => (
            <button
              key={method}
              onClick={() => setTranslateMethod(method)}
              className={`flex-1 px-3 py-2 text-xs border transition-colors ${
                effectiveTranslateMethod === method
                  ? "border-active-border text-primary-text"
                  : "border-primary-border text-secondary-text hover:text-primary-text"
              }`}
            >
              {TRANSLATE_METHOD_LABELS[method]}
            </button>
          ))}
      </div>

      <div className="flex flex-col gap-1 mt-1">
        {availableTranslationLangs.map((lang) => (
          <TranslationSubtitleRow
            key={lang.code}
            lang={lang}
            isChecked={isTranslationLanguageSelected(lang.code)}
            wasExisting={isTranslationLanguageExisting(lang.code)}
            onToggle={() => toggleTranslateLang(lang.code)}
            showUpload={effectiveTranslateMethod === TRANSLATE_METHODS.UPLOAD}
            uploadState={getUploadState(lang.code)}
            onUpload={(file) => onUploadFile(lang.code, file)}
          />
        ))}
      </div>
    </div>
  );
}
