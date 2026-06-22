"use client";

import { LANGUAGES } from "@/helpers/const";
import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useLanguages } from "@/hooks/useLanguages";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useAppStore } from "@/lib/initializations/store";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageFilter() {
  const searchParams = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);

  const languages = useLanguages();

  const { availableSourceLanguages, availableTranslationLanguages } = languages;

  const { setPreferredSourceLanguage, setPreferredTranslationLanguage } =
    useAppStore();

  const updateFilter = (type: "src" | "trans", value: string) => {
    if (type === "src") setPreferredSourceLanguage(value);
    if (type === "trans") setPreferredTranslationLanguage(value);

    searchParams.set({ [type]: value });
  };

  function getLabel(code: string) {
    return LANGUAGES.find((lang) => lang.code === code)?.label ?? code;
  }

  if (languages.isLoading || languages.isFetching) {
    return (
      <div
        className="flex items-center gap-3 px-4 h-full"
        role="status"
        aria-label="Loading languages"
      >
        <Skeleton className="h-9 w-46" />
        <Skeleton className="h-9 w-46" />
      </div>
    );
  }

  if (
    !languages.isError &&
    (availableSourceLanguages.length === 0 ||
      availableTranslationLanguages.length === 0)
  )
    return (
      <Empty className="p-4">
        <EmptyHeader>
          <EmptyTitle className="text-sm">
            No languages to select from
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );

  if (
    languages.isError ||
    !languages.selectedSourceLanguage ||
    !languages.selectedTranslationLanguage
  )
    return (
      <Empty className="p-4">
        <EmptyHeader>
          <EmptyTitle className="text-sm">Failed to load languages</EmptyTitle>
          <EmptyDescription>Please try refreshing the page.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  return (
    <div className="flex items-center h-full">
      <Field orientation="horizontal" className="px-1 w-auto">
        <Select
          value={languages.selectedSourceLanguage}
          onValueChange={(value) => updateFilter("src", value)}
        >
          <SelectTrigger
            id="content-language"
            size="default"
            className="*:text-xm min-h-auto"
          >
            <FieldLabel
              htmlFor="content-language"
              className="text-muted-foreground/50 pr-1"
            >
              Source:
            </FieldLabel>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableSourceLanguages.map((code) => (
              <SelectItem key={code} value={code}>
                {getLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field orientation="horizontal" className="px-1 w-auto">
        <Select
          value={languages.selectedTranslationLanguage || undefined}
          onValueChange={(value) => updateFilter("trans", value)}
        >
          <SelectTrigger
            id="translation-language"
            size="default"
            className="*:text-xm min-h-auto"
          >
            <FieldLabel
              htmlFor="translation-language"
              className="text-muted-foreground/50 pr-1"
            >
              Translations:
            </FieldLabel>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {availableTranslationLanguages.map((code) => (
              <SelectItem key={code} value={code}>
                {getLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
