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
import { Check } from "lucide-react";

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
        <p className="text-sm text-red-400 mb-2">{saver.error}</p>
      )}
      {saver.saved ? (
        <div className="flex items-center justify-center gap-2">
          <Check className="size-5" />
          <p className="text-sm text-primary-foreground text-center">
            Saved to deck
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={selectedDeckId} onValueChange={onSelectDeckId}>
            <SelectTrigger
              className="flex-1 text-sm p-2 h-auto"
              variant="outline"
            >
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
            size="default"
            variant="secondary"
            onClick={handleSave}
            disabled={saver.isSaving || !allowSave}
            className="text-sm p-2 px-6 shrink-0 h-auto"
          >
            {saver.isSaving ? "Saving..." : "Add to deck"}
          </Button>
        </div>
      )}
    </div>
  );
}
