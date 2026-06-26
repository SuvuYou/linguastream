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
      <FieldLabel
        htmlFor="source-language"
        className="text-xs text-secondary-text font-normal"
      >
        Content language
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="source-language" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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
