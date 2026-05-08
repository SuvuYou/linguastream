"use client";

import { AUTO_DETECT, LANGUAGES } from "@/helpers/const";

interface SourceLanguageSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceLanguageSection({
  value,
  onChange,
}: SourceLanguageSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-secondary-text">Content language</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-primary-border text-sm text-primary-text px-3 py-2 outline-none"
      >
        <option value={AUTO_DETECT}>Auto-detect</option>

        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
