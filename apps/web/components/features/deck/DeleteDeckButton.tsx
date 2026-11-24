"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteDeck } from "@/hooks/useDeleteDeck";
import { MouseEventHandler } from "react";

export function DeleteDeckButton({
  deckId,
  deckName,
}: {
  deckId: string;
  deckName: string;
}) {
  const deleteDeck = useDeleteDeck();

  const handleDeletion: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteDeck.mutate(deckId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="xs"
          onClick={(e) => e.stopPropagation()}
          className="h-full"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{deckName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the deck and every card inside it,
            including review history. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={handleDeletion}
            disabled={deleteDeck.isPending}
          >
            {deleteDeck.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
