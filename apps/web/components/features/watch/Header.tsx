"use client";

import { useAppStore } from "@/lib/initializations/store";
import { Button } from "@/components/ui/button";
import LanguageFilter from "@/components/features/library/LanguageFilter";
import { ArrowLeft, CommandIcon } from "lucide-react";
import { useWatchLanguages } from "@/hooks/useWatchLanguages";
import { useWatchData } from "@/hooks/useWatchData";
import Link from "next/link";

export default function Header({ mediaContentId }: { mediaContentId: string }) {
  const { setOverlayOpen } = useAppStore();

  const { data, isLoading, isError } = useWatchData(mediaContentId);

  const languages = useWatchLanguages(data);

  return (
    <div className="flex items-center h-12 shrink-0">
      <Button variant="ghost" size="sm" aria-label="Go back">
        <Link href={"/dashboard"}>
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      {data?.title && (
        <>
          <span className="px-4 text-lg font-medium truncate max-w-xs text-primary-foreground">
            {data.title}
          </span>
        </>
      )}

      <div className="flex items-center h-full">
        <LanguageFilter
          source={{ ...languages.source, disabled: true }}
          translation={languages.translation}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOverlayOpen(true)}
          aria-label="Open overlay player"
        >
          <CommandIcon className="size-4" />
          <kbd className="text-xs text-secondary-foreground font-sans">K</kbd>
        </Button>
      </div>
    </div>
  );
}
