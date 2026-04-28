import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubtitleSettings {
  showSource: boolean;
  showTranslation: boolean;
  sourceFontSize: "small" | "medium" | "large";
  translationFontSize: "small" | "medium" | "large";
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number; // 0-1
  fontOpacity: number; // 0-1
}

const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  showSource: true,
  showTranslation: true,
  sourceFontSize: "medium",
  translationFontSize: "small",
  fontColor: "#ffffff",
  backgroundColor: "#000000",
  backgroundOpacity: 0.6,
  fontOpacity: 1,
};

interface AppState {
  preferredSourceLanguage: string | null;
  setPreferredSourceLanguage: (language: string) => void;
  preferredTranslationLanguage: string | null;
  setPreferredTranslationLanguage: (language: string) => void;
  subtitleSettings: SubtitleSettings;
  setSubtitleSettings: (settings: Partial<SubtitleSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferredSourceLanguage: null,
      preferredTranslationLanguage: null,
      subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,

      setPreferredSourceLanguage: (language) =>
        set({ preferredSourceLanguage: language }),

      setPreferredTranslationLanguage: (language) =>
        set({ preferredTranslationLanguage: language }),

      setSubtitleSettings: (settings) =>
        set((state) => ({
          subtitleSettings: { ...state.subtitleSettings, ...settings },
        })),
    }),
    {
      name: "linguastream-store",
    },
  ),
);
