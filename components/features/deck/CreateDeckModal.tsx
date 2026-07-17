"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface DeckCreationState {
  deckName: string;
  isCreating: boolean;
  errorMessage: string | null;
}

interface Props {
  isOpen: boolean;
  state: DeckCreationState;
  setState: Dispatch<SetStateAction<DeckCreationState>>;
  closeModal: () => void;
}

export default function CreateDeckModal({
  isOpen,
  state,
  setState,
  closeModal,
}: Props) {
  const queryClient = useQueryClient();
  async function handleCreateDeck() {
    if (!state.deckName.trim()) return;

    setState((prev) => ({
      ...prev,
      isCreating: true,
      errorMessage: null,
    }));

    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.deckName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          errorMessage: data.error ?? "Failed to create deck",
        }));

        return;
      }

      closeModal();
      setState((prev) => ({ ...prev, deckName: "" }));
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    } finally {
      setState((prev) => ({ ...prev, isCreating: false }));
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Deck</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Label htmlFor="deck-name">Deck name</Label>
          <Input
            id="deck-name"
            value={state.deckName}
            onChange={(e) =>
              setState((prev) => ({ ...prev, deckName: e.target.value }))
            }
            placeholder="e.g. German Verbs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateDeck();
            }}
            autoFocus
          />
          {state.errorMessage && (
            <p className="text-xs text-red-400">{state.errorMessage}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateDeck}
            disabled={state.isCreating || !state.deckName.trim()}
          >
            {state.isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
