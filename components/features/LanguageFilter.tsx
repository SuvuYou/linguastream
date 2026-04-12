"use client";

import { LANGUAGES } from "@/helpers/const";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { DEFAULT_LANGUAGES_RESPONSE, useLanguages } from "@/hooks/useLanguages";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

export default function LanguageFilter() {
  const languages = useLanguages();

  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);

  const { availableSourceLanguages, availableSubtitleLanguages } =
    languages.data || DEFAULT_LANGUAGES_RESPONSE;

  const { setPreferredSourceLanguage, setPreferredSubtitleLanguage } =
    useAppStore();

  useEffect(() => {
    if (languages.selectedSourceLanguage)
      setPreferredSourceLanguage(languages.selectedSourceLanguage);
    if (languages.selectedSubtitleLanguage)
      setPreferredSubtitleLanguage(languages.selectedSubtitleLanguage);
  }, [
    languages.selectedSourceLanguage,
    languages.selectedSubtitleLanguage,
    setPreferredSourceLanguage,
    setPreferredSubtitleLanguage,
  ]);

  const updateFilter = (type: "src" | "sub", value: string) => {
    if (type === "src") setPreferredSourceLanguage(value);
    if (type === "sub") setPreferredSubtitleLanguage(value);

    searchParams.set({ [type]: value });
  };

  function getLabel(code: string) {
    return LANGUAGES.find((lang) => lang.code === code)?.label ?? code;
  }

  if (languages.isError) {
    return (
      <div className="p-12 text-center text-sm text-secondary-text">
        Failed to load languages.
      </div>
    );
  }

  if (languages.isLoading || languages.isFetching) {
    return (
      <div className="p-12 text-center text-sm text-secondary-text">
        Loading languages...
      </div>
    );
  }

  return (
    <div className="flex items-center h-full divide-x divide-primary-border">
      <div className="flex items-center gap-2 px-4 h-full">
        <span className="text-xs text-secondary-text">Content</span>
        <select
          value={languages.selectedSourceLanguage || ""}
          onChange={(e) => updateFilter("src", e.target.value)}
          className="bg-transparent text-xs text-active-border outline-none cursor-pointer"
        >
          {availableSourceLanguages.map((code) => (
            <option key={code} value={code} className="bg-background">
              {getLabel(code)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 px-4 h-full">
        <span className="text-xs text-secondary-text">Subtitles</span>
        <select
          value={languages.selectedSubtitleLanguage || ""}
          onChange={(e) => updateFilter("sub", e.target.value)}
          className="bg-transparent text-xs text- outline-none cursor-pointer"
        >
          {availableSubtitleLanguages.map((code) => (
            <option key={code} value={code} className="bg-background">
              {getLabel(code)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
