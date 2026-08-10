import { ActiveWord } from "@/lib/initializations/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

export interface SaveCardParams {
  lemma: string;
  activeWord: ActiveWord;
  wordTranslation: string;
  profileId: string;
  definition: string;
  deckId: string;
}

export function useSaveCard() {
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async ({
      lemma,
      activeWord,
      wordTranslation,
      profileId,
      definition,
      deckId,
    }: SaveCardParams) => {
      setError(null);
      setIsSaving(true);

      try {
        const res = await fetch("/api/cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deck_id: deckId,
            word: activeWord.word,
            lemma: lemma,
            source_language: activeWord.lang,
            translation_language: activeWord.translationLang,
            word_translation: wordTranslation,
            context_text: activeWord.context,
            context_translation: activeWord.contextTranslation,
            media_content_id: activeWord.mediaContentId,
            start_ms: activeWord.startMs,
            end_ms: activeWord.endMs,
            word_profile_id: profileId,
            contextual_definition: definition,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to save");
        }

        setSaved(true);
        queryClient.invalidateQueries({
          queryKey: ["decks"],
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setIsSaving(false);
      }
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    setSaved(false);
    setIsSaving(false);
    setError(null);
  }, []);

  return useMemo(
    () => ({
      save,
      reset,
      saved,
      isSaving,
      error,
    }),
    [save, reset, saved, isSaving, error],
  );
}
