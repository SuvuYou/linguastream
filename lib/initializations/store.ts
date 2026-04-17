import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  preferredSourceLanguage: string | null;
  setPreferredSourceLanguage: (language: string) => void;
  preferredSubtitleLanguage: string | null;
  setPreferredSubtitleLanguage: (language: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      preferredSourceLanguage: null,
      preferredSubtitleLanguage: null,
      setPreferredSourceLanguage: (language) =>
        set({ preferredSourceLanguage: language }),
      setPreferredSubtitleLanguage: (language) =>
        set({ preferredSubtitleLanguage: language }),
    }),
    {
      name: "linguastream-store",
    },
  ),
);
