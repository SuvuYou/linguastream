"use client";

import { AUTO_DETECT, LANGUAGES } from "@/helpers/const";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourceLanguageSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceLanguageSection({
  value,
  onChange,
}: SourceLanguageSectionProps) {
  return (
    <Field className="gap-2">
      <FieldLabel className="text-sm text-primary-foreground font-normal">
        Content source language
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-labelledby="source-language-label"
          variant="secondary"
          size="default"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={AUTO_DETECT}>Auto-detect</SelectItem>
          {LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
