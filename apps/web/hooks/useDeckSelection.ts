import { useMemo, useState } from "react";
import { useDecks } from "./useDecks";
import { useAppStore } from "@/lib/initializations/store";

export function useDeckSelection() {
  const { preferredSourceLanguage } = useAppStore();
  const { data: decksData } = useDecks(preferredSourceLanguage);

  const decks = useMemo(() => decksData?.decks ?? [], [decksData?.decks]);

  const defaultDeck = useMemo(
    () => decks.find((d) => d.is_default) ?? decks[0] ?? null,
    [decks],
  );

  const [selectedDeck, setSelectedDeckId] = useState<string | null>(null);

  const selectedDeckId = selectedDeck ?? defaultDeck?.id;

  return {
    decks,
    defaultDeck,
    selectedDeckId,
    setSelectedDeckId,
  };
}
