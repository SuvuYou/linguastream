"use client";

import { LANGUAGES } from "@/helpers/const";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

export default function LanguageFilter() {
  const { data, isLoading, isFetching, isError } = useLibrary();

  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);

  const {
    activeSource: selectedSourceLanguage,
    activeSubtitle: selectedSubtitleLanguage,
    availableSource: availableSourceLanguages,
    availableSubtitle: availableSubtitleLanguages,
  } = data || DEFAULT_LIBRARY_RESPONSE;

  const { setPreferredSourceLanguage, setPreferredSubtitleLanguage } =
    useAppStore();

  console.log("selectedSourceLanguage", selectedSourceLanguage);

  useEffect(() => {
    setPreferredSourceLanguage(selectedSourceLanguage);
    setPreferredSubtitleLanguage(selectedSubtitleLanguage);
  }, [
    selectedSourceLanguage,
    selectedSubtitleLanguage,
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

  if (isError) {
    return (
      <div className="p-12 text-center text-sm text-secondary-text">
        Failed to load library.
      </div>
    );
  }

  if (isLoading || isFetching) {
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
          value={selectedSourceLanguage}
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
          value={getLabel(selectedSubtitleLanguage)}
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
