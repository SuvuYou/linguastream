import type { WordProfile } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubtitleSettings {
  showSource: boolean;
  showTranslation: boolean;
  sourceFontSize: "small" | "medium" | "large";
  translationFontSize: "small" | "medium" | "large";
  highlightFontColor: string;
  sourceFontColor: string;
  translationFontColor: string;
  sourceBackgroundColor: string;
  translationBackgroundColor: string;
  backgroundOpacity: number; // 0-1
  fontOpacity: number; // 0-1
}

const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  showSource: true,
  showTranslation: true,
  sourceFontSize: "medium",
  translationFontSize: "small",
  highlightFontColor: "#000000",
  sourceFontColor: "#ffffff",
  translationFontColor: "#ffffff",
  sourceBackgroundColor: "#000000",
  translationBackgroundColor: "#000000",
  backgroundOpacity: 0.6,
  fontOpacity: 1,
};

export interface ActiveWord {
  word: string;
  lang: string;
  translationLang: string;
  subtitleLineId: string; // key: `${start_ms}__${mediaContentId}`
  context: string;
  contextTranslation: string;
  mediaContentId: string;
  startMs: number;
  endMs: number;
}

interface AppState {
  preferredSourceLanguage: string | null;
  setPreferredSourceLanguage: (language: string) => void;
  preferredTranslationLanguage: string | null;
  setPreferredTranslationLanguage: (language: string) => void;
  subtitleSettings: SubtitleSettings;
  setSubtitleSettings: (settings: Partial<SubtitleSettings>) => void;
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  overlayOpen: boolean;
  setOverlayOpen: (v: boolean) => void;
  toggleOverlay: () => void;
  wordProfilesCache: Record<string, WordProfile>; // key: `${word}__${lang}`
  wordDefinitionsCache: Record<string, string>; // key: `${word}__${subtitleLineId}`
  setWordProfilesCache: (key: string, profile: WordProfile) => void;
  setWordDefinitionsCache: (key: string, definition: string) => void;
  activeWord: ActiveWord | null;
  setActiveWord: (word: ActiveWord | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => {
      return {
        preferredSourceLanguage: null,
        preferredTranslationLanguage: null,

        subtitleSettings: DEFAULT_SUBTITLE_SETTINGS,

        autoPlay: true,
        setAutoPlay: (v) => set({ autoPlay: v }),

        overlayOpen: false,
        setOverlayOpen: (v) => {
          set({ overlayOpen: v });
        },
        toggleOverlay: () =>
          set((state) => ({ overlayOpen: !state.overlayOpen })),

        setPreferredSourceLanguage: (language) =>
          set({ preferredSourceLanguage: language }),

        setPreferredTranslationLanguage: (language) =>
          set({ preferredTranslationLanguage: language }),

        setSubtitleSettings: (settings) =>
          set((state) => ({
            subtitleSettings: { ...state.subtitleSettings, ...settings },
          })),

        activeWord: null,
        setActiveWord: (word) => set({ activeWord: word }),

        wordProfilesCache: {},
        wordDefinitionsCache: {},

        setWordProfilesCache: (key, profile) =>
          set((state) => ({
            wordProfilesCache: { ...state.wordProfilesCache, [key]: profile },
          })),

        setWordDefinitionsCache: (key, definishion) =>
          set((state) => ({
            wordDefinitionsCache: {
              ...state.wordDefinitionsCache,
              [key]: definishion,
            },
          })),
      };
    },
    {
      name: "linguastream-store",
      partialize: (state) => {
        const {
          overlayOpen: _1,
          wordProfilesCache: _2,
          wordDefinitionsCache: _3,
          activeWord: _4,
          ...rest
        } = state;

        return {
          ...rest,
        };
      },
    },
  ),
);
