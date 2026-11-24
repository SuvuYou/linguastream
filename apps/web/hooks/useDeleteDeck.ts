"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Deck } from "@/hooks/useDecks";

async function deleteDeck(deckId: string): Promise<void> {
  const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete deck");
  }
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeck,
    onMutate: async (deckId: string) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      const previous = queryClient.getQueriesData<{ decks: Deck[] }>({
        queryKey: ["decks"],
      });

      queryClient.setQueriesData<{ decks: Deck[] }>(
        { queryKey: ["decks"] },
        (old) =>
          old ? { decks: old.decks.filter((d) => d.id !== deckId) } : old,
      );

      return { previous };
    },
    onError: (_err, _deckId, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });
}
