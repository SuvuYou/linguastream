"use client";

import { LANGUAGES } from "@/helpers/const";
import type { SubtitleSettings } from "@/lib/initializations/store";

interface SubtitleSettingsPanelProps {
  settings: SubtitleSettings;
  translationLanguages: string[];
  activeTranslationLang: string | null;
  onSettingsChange: (s: Partial<SubtitleSettings>) => void;
  onTranslationLangChange: (lang: string) => void;
}

function getLangLabel(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

type FontSize = "small" | "medium" | "large";
const FONT_SIZES: FontSize[] = ["small", "medium", "large"];

export default function SubtitleSettingsPanel({
  settings,
  translationLanguages,
  activeTranslationLang,
  onSettingsChange,
  onTranslationLangChange,
}: SubtitleSettingsPanelProps) {
  return (
    <div className="absolute bottom-14 right-0 w-72 bg-background border border-primary-border p-4 flex flex-col gap-4 z-20 shadow-xl">
      <div className="text-xs text-secondary-text font-medium uppercase tracking-wider">
        Subtitle Settings
      </div>

      {/* toggles */}
      <div className="flex flex-col gap-2">
        <Toggle
          label="Show source"
          value={settings.showSource}
          onChange={(v) => onSettingsChange({ showSource: v })}
        />
        <Toggle
          label="Show translation"
          value={settings.showTranslation}
          onChange={(v) => onSettingsChange({ showTranslation: v })}
        />
      </div>

      {/* translation language switcher */}
      {translationLanguages.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">
            Translation language
          </label>
          <select
            value={activeTranslationLang ?? ""}
            onChange={(e) => onTranslationLangChange(e.target.value)}
            className="bg-background border border-primary-border text-xs text-primary-text px-2 py-1.5 outline-none"
          >
            {translationLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {getLangLabel(lang)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* font sizes */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">
            Source font size
          </label>
          <FontSizePicker
            value={settings.sourceFontSize}
            onChange={(v) => onSettingsChange({ sourceFontSize: v })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">
            Translation font size
          </label>
          <FontSizePicker
            value={settings.translationFontSize}
            onChange={(v) => onSettingsChange({ translationFontSize: v })}
          />
        </div>
      </div>

      {/* colors */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-secondary-text">Font color</label>
          <input
            type="color"
            value={settings.fontColor}
            onChange={(e) => onSettingsChange({ fontColor: e.target.value })}
            className="w-full h-8 bg-background border border-primary-border cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-secondary-text">
            Background color
          </label>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) =>
              onSettingsChange({ backgroundColor: e.target.value })
            }
            className="w-full h-8 bg-background border border-primary-border cursor-pointer"
          />
        </div>
      </div>

      {/* opacities */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">
            Font opacity{" "}
            <span className="text-primary-text">
              {Math.round(settings.fontOpacity * 100)}%
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.fontOpacity}
            onChange={(e) =>
              onSettingsChange({ fontOpacity: parseFloat(e.target.value) })
            }
            className="w-full accent-active-border"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">
            Background opacity{" "}
            <span className="text-primary-text">
              {Math.round(settings.backgroundOpacity * 100)}%
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.backgroundOpacity}
            onChange={(e) =>
              onSettingsChange({
                backgroundOpacity: parseFloat(e.target.value),
              })
            }
            className="w-full accent-active-border"
          />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-primary-text">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors relative ${
          value ? "bg-active-border" : "bg-primary-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all ${
            value ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function FontSizePicker({
  value,
  onChange,
}: {
  value: FontSize;
  onChange: (v: FontSize) => void;
}) {
  return (
    <div className="flex gap-1">
      {FONT_SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`flex-1 py-1 text-xs border transition-colors capitalize ${
            value === size
              ? "border-active-border text-primary-text"
              : "border-primary-border text-secondary-text hover:text-primary-text"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
