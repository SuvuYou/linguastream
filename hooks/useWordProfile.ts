"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/lib/initializations/store";
import type { WordProfile } from "@prisma/client";

interface UseWordProfileResult {
  profile: WordProfile | null;
  definition: string | null;
  isLoadingProfile: boolean;
  isLoadingDefinition: boolean;
  error: string | null;
  fetch: (
    word: string,
    lang: string,
    subtitleLineId: string,
    context: string,
  ) => Promise<void>;
  reset: () => void;
}

export function useWordProfile(): UseWordProfileResult {
  const {
    wordProfilesCache,
    wordDefinitionsCache,
    setWordProfilesCache,
    setWordDefinitionsCache,
  } = useAppStore();

  const [profile, setProfile] = useState<WordProfile | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (
      word: string,
      lang: string,
      subtitleLineId: string,
      context: string,
    ) => {
      setError(null);
      const profileKey = `${word}__${lang}`;
      const definitionKey = `${word}__${subtitleLineId}`;

      const cachedProfile = wordProfilesCache[profileKey];

      if (cachedProfile) {
        setProfile(cachedProfile);
      } else {
        setIsLoadingProfile(true);
        setProfile(null);

        try {
          const res = await window.fetch(
            `/api/word-profile?word=${encodeURIComponent(word)}&lang=${lang}`,
          );
          if (!res.ok) throw new Error("Failed to fetch word profile");
          const data: WordProfile = await res.json();
          setWordProfilesCache(profileKey, data);
          setProfile(data);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Failed to load word profile",
          );
        } finally {
          setIsLoadingProfile(false);
        }
      }

      const cachedDefinition = wordDefinitionsCache[definitionKey];
      if (cachedDefinition) {
        setDefinition(cachedDefinition);
      } else {
        setIsLoadingDefinition(true);
        setDefinition(null);
        try {
          const res = await window.fetch(
            `/api/definition?word=${encodeURIComponent(word)}&lang=${lang}&context=${encodeURIComponent(context)}`,
          );
          if (!res.ok) throw new Error("Failed to fetch definition");
          const data = await res.json();
          setWordDefinitionsCache(definitionKey, data.definition);
          setDefinition(data.definition);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Failed to load definition",
          );
        } finally {
          setIsLoadingDefinition(false);
        }
      }
    },
    [
      wordProfilesCache,
      wordDefinitionsCache,
      setWordProfilesCache,
      setWordDefinitionsCache,
    ],
  );

  const reset = useCallback(() => {
    setProfile(null);
    setDefinition(null);
    setError(null);
    setIsLoadingProfile(false);
    setIsLoadingDefinition(false);
  }, []);

  return {
    profile,
    definition,
    isLoadingProfile,
    isLoadingDefinition,
    error,
    fetch,
    reset,
  };
}
