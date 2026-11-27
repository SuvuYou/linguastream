"use client";

import type { LibraryVideo } from "@linguastream/contracts";
import { Ellipsis, Languages, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languageName } from "@/lib/language";

interface Props {
  video: LibraryVideo;
  canTranslate: boolean;
  deleting: boolean;
  deleteFailed: boolean;
  onTranslate: () => void;
  onDelete: () => void;
}

export default function VideoCardMenu({
  video,
  canTranslate,
  deleting,
  deleteFailed,
  onTranslate,
  onDelete,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const translation = video.translation;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions: ${video.title}`}
          className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-md bg-black/70 text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Ellipsis aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem asChild>
            <Link href={`/watch/${video.id}`}>
              <Play className="size-4" />
              Open
            </Link>
          </DropdownMenuItem>
          {canTranslate && translation && (
            <DropdownMenuItem onSelect={onTranslate}>
              <Languages className="size-4" />
              {translation.status === "failed"
                ? "Translate again"
                : `Translate into ${languageName(translation.language)}`}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 className="size-4" />
            Delete from library
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              “{video.title}” and its subtitles and translations are removed
              from your library. Words you saved from it keep their examples.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteFailed && (
            <p role="alert" className="text-sm text-destructive">
              Couldn&apos;t delete the video. Try again.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
