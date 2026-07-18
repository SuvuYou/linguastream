"use client";

import { Deck } from "@/hooks/useDecks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  saver: {
    reset: () => void;
    saved: boolean;
    isSaving: boolean;
    error: string | null;
  };
  handleSave: () => void;
  decks: Deck[];
  selectedDeckId: string;
  allowSave: boolean;
  onSelectDeckId: (deckId: string) => void;
}

export default function SaveToDeck({
  saver,
  handleSave,
  decks,
  selectedDeckId,
  onSelectDeckId,
  allowSave,
}: Props) {
  return (
    <div className="border-t border-primary-border px-4 py-3 shrink-0">
      {saver.error && (
        <p className="text-xs text-red-400 mb-2">{saver.error}</p>
      )}
      {saver.saved ? (
        <p className="text-xs text-active-border text-center">
          ✓ Saved to deck
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={selectedDeckId} onValueChange={onSelectDeckId}>
            <SelectTrigger className="flex-1 text-xs h-8">
              <SelectValue placeholder="Select deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((d) => (
                <SelectItem key={d.id} value={d.id} className="text-xs">
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saver.isSaving || !allowSave}
            className="text-xs h-8 shrink-0"
          >
            {saver.isSaving ? "Saving..." : "Add to deck"}
          </Button>
        </div>
      )}
    </div>
  );
}
