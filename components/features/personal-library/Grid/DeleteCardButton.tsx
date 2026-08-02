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
import { MouseEventHandler } from "react";
import { useDeletePersonalMedia } from "@/hooks/useDeletePersonalMedia";

export function DeleteCardButton({
  mediaId,
  title,
}: {
  mediaId: string;
  title: string;
}) {
  const deleteCard = useDeletePersonalMedia();

  const handleDeletion: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteCard.mutate(mediaId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="absolute top-2 right-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="bg-card/90! hover:bg-destructive/50! hover:text-secondary"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{title}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the media. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={handleDeletion}
            disabled={deleteCard.isPending}
          >
            {deleteCard.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
