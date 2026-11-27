"use client";

import type { VideoTranslation } from "@linguastream/contracts";
import { Languages, LoaderCircle } from "lucide-react";
import { useTranslateVideo } from "@/hooks/useVideoActions";
import { languageName } from "@/lib/language";

export default function TranslateButton({
  videoId,
  translation,
}: {
  videoId: string;
  translation: VideoTranslation;
}) {
  const translate = useTranslateVideo();
  if (!translation || translation.status === "ready") return null;

  const busy =
    translation.status === "pending" ||
    translation.status === "processing" ||
    translate.isPending;
  const label = busy
    ? "Translating…"
    : translate.isError
      ? "Couldn't start. Try again"
      : translation.status === "failed"
        ? "Translation failed. Try again"
        : `Translate into ${languageName(translation.language)}`;

  return (
    <span className="shrink-0 text-[13px] font-semibold">
      <button
        type="button"
        disabled={busy}
        onClick={() => translate.mutate(videoId)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-raised px-3 text-foreground transition-colors hover:bg-raised-2 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {busy ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <Languages aria-hidden="true" className="size-4" />
        )}
        <span className="@max-[600px]:sr-only">{label}</span>
      </button>
    </span>
  );
}
