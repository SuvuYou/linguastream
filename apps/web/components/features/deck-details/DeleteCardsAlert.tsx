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
} from "@/components/ui/alert-dialog";
import { MouseEventHandler } from "react";
import { useDeleteCards } from "@/hooks/useDeleteCards";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteCardsAlert({
  deckId,
  selected,
  isOpen,
  setIsOpen,
  reset,
}: {
  deckId: string;
  selected: Set<string>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  reset: () => void;
}) {
  const deleteCards = useDeleteCards(deckId);

  const handleConfirmDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteCards.mutate(Array.from(selected), {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <>
      {selected.size > 0 && (
        <div className="sticky bottom-4 mx-auto w-fit flex items-center gap-1 rounded-full border border-border bg-background pl-4 shadow-lg">
          <span className="text-sm text-muted-foreground pr-1">
            {selected.size} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => reset()}
            className="h-full"
          >
            <X className="size-4" />
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setIsOpen(true)}
            className="h-full m-0"
          >
            <Trash2 className="size-4 mr-1" />
            Delete
          </Button>
        </div>
      )}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} word{selected.size === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the selected word
              {selected.size === 1 ? "" : "s"} and their review history. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteCards.isPending}
            >
              {deleteCards.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
