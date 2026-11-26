"use client";

import type {
  SubtitleVisibility,
  TrackVisibility,
} from "@linguastream/contracts";
import { Captions, CaptionsOff, Contrast, Eye, EyeOff } from "lucide-react";
import { Popover, RadioGroup } from "radix-ui";

const OPTIONS = [
  { value: "show", label: "Show", Icon: Eye },
  { value: "blur", label: "Blur", Icon: Contrast },
  { value: "hide", label: "Hide", Icon: EyeOff },
] as const;

const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

function languageName(code: string) {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function TrackRow({
  name,
  value,
  onChange,
}: {
  name: string;
  value: TrackVisibility;
  onChange(value: TrackVisibility): void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-text-2">{name}</span>
      <RadioGroup.Root
        aria-label={name}
        value={value}
        onValueChange={(next) => onChange(next as TrackVisibility)}
        orientation="horizontal"
        className="grid grid-cols-3 gap-1.5"
      >
        {OPTIONS.map(({ value: option, label, Icon }) => (
          <RadioGroup.Item
            key={option}
            value={option}
            className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-raised-2/40 text-xs text-text-2 transition-colors hover:bg-raised-2 focus-visible:outline-2 focus-visible:outline-ring data-[state=checked]:border-[var(--a45)] data-[state=checked]:bg-tab-on data-[state=checked]:font-semibold data-[state=checked]:text-accent-text"
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            {label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}

export default function SubtitleVisibilityMenu({
  visibility,
  language,
  translationLanguage,
  disabled,
  triggerClassName,
  onChange,
}: {
  visibility: SubtitleVisibility;
  language: string;
  translationLanguage: string | null;
  disabled: boolean;
  triggerClassName: string;
  onChange(change: Partial<SubtitleVisibility>): void;
}) {
  const allHidden =
    visibility.original === "hide" &&
    (translationLanguage === null || visibility.translation === "hide");

  return (
    <Popover.Root>
      <Popover.Trigger
        disabled={disabled}
        aria-label="Subtitles: show, blur or hide each track"
        className={`${triggerClassName} data-[state=open]:bg-tab-on data-[state=open]:text-accent-text`}
      >
        {allHidden ? (
          <CaptionsOff className="size-5" />
        ) : (
          <Captions className="size-5" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={10}
          aria-label="Subtitle visibility"
          className="z-50 flex w-[260px] flex-col gap-3 rounded-[18px] border border-border bg-glass p-4 shadow-panel backdrop-blur-[22px] backdrop-saturate-[1.4] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none"
        >
          <TrackRow
            name={languageName(language)}
            value={visibility.original}
            onChange={(original) => onChange({ original })}
          />
          {translationLanguage && (
            <TrackRow
              name={languageName(translationLanguage)}
              value={visibility.translation}
              onChange={(translation) => onChange({ translation })}
            />
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
