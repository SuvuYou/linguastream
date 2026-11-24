"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteCards(
  cardIds: string[],
): Promise<{ deletedCount: number }> {
  const res = await fetch("/api/cards", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardIds }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete cards");
  }
  return res.json();
}

export function useDeleteCards(deckId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-", { deckId }] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
