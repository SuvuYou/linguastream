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

interface LanguageFilterProps {
  source: {
    value: string | null;
    available: string[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    label?: string;
  };

  isLoading?: boolean;
  isError?: boolean;
}

export default function SourceLanguageFilter({
  source,
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
      </div>
    );
  }

  if (!isError && source.available.length === 0) {
    return (
      <Empty className="flex flex-row justify-start p-0">
        <Badge variant="warning">
          <InfoIcon className="size-4" />
          <EmptyTitle className="text-sm">No languages available</EmptyTitle>
        </Badge>
      </Empty>
    );
  }

  if (isError || !source.value) {
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
    </div>
  );
}
