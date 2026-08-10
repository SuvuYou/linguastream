"use client";

import { Badge } from "@/components/ui/badge";
import { Empty, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoIcon, OctagonXIcon } from "lucide-react";
import { getLanguageLabel } from "@/helpers/language-helpers";

export interface LanguageFilterProps {
  source: {
    value: string | null;
    available: string[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    label?: string;
  };

  translation: {
    value: string | null;
    available: string[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    label?: string;
  };

  isLoading?: boolean;
  isError?: boolean;
}

export default function LanguageFilter({
  source,
  translation,
  isLoading = false,
  isError = false,
}: LanguageFilterProps) {
  if (isLoading) {
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
    !isError &&
    (source.available.length === 0 || translation.available.length === 0)
  ) {
    return (
      <Empty className="flex flex-row justify-start p-0">
        <Badge variant="warning">
          <InfoIcon className="size-4" />
          <EmptyTitle className="text-sm">No languages available</EmptyTitle>
        </Badge>
      </Empty>
    );
  }

  if (isError || !source.value || !translation.value) {
    return (
      <Empty className="flex flex-row justify-start p-0">
        <Badge variant="destructive">
          <OctagonXIcon className="size-4" />
          <EmptyTitle className="text-sm">Failed to load languages</EmptyTitle>
        </Badge>
      </Empty>
    );
  }

  return (
    <div className="flex items-center h-full">
      <Field orientation="horizontal" className="px-1 w-auto">
        <Select
          value={source.value}
          onValueChange={source.onChange}
          disabled={source.disabled}
        >
          <SelectTrigger
            id="source-language"
            size="default"
            className="*:text-sm min-h-auto"
          >
            <FieldLabel
              htmlFor="source-language"
              className="text-foreground/60 font-bold pr-1 cursor-pointer"
            >
              {source.label ?? "Source"}:
            </FieldLabel>

            <SelectValue />
          </SelectTrigger>

          <SelectContent position="popper">
            {source.available.map((code) => (
              <SelectItem key={code} value={code}>
                {getLanguageLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field orientation="horizontal" className="px-1 w-auto">
        <Select
          value={translation.value}
          onValueChange={translation.onChange}
          disabled={translation.disabled}
        >
          <SelectTrigger
            id="translation-language"
            size="default"
            className="*:text-sm min-h-auto"
          >
            <FieldLabel
              htmlFor="translation-language"
              className="text-foreground/60 font-bold pr-1 cursor-pointer"
            >
              {translation.label ?? "Translation"}:
            </FieldLabel>

            <SelectValue />
          </SelectTrigger>

          <SelectContent position="popper">
            {translation.available.map((code) => (
              <SelectItem key={code} value={code}>
                {getLanguageLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
