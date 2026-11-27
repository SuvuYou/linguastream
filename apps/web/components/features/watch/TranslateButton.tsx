"use client";

import type { VideoTranslation } from "@linguastream/contracts";
import { Languages, LoaderCircle } from "lucide-react";
import {
  useLiveTranslationProgress,
  useTranslateVideo,
} from "@/hooks/useVideoActions";
import { languageName } from "@/lib/language";
import { percentOf, progressLabel, remainingMs } from "@/lib/processing/eta";
import {
  TRANSLATION_FAILURE_MESSAGES,
  TRANSLATION_RETRYABLE,
} from "@/lib/processing/stages";

export default function TranslateButton({
  videoId,
  translation,
}: {
  videoId: string;
  translation: VideoTranslation;
}) {
  const translate = useTranslateVideo();
  const live = useLiveTranslationProgress(videoId);
  if (!translation || translation.status === "ready") return null;

  const busy =
    translation.status === "pending" ||
    translation.status === "processing" ||
    translate.isPending;
  const progress = live?.progress ?? translation.progress;
  const failure =
    translation.status === "failed" && !busy ? translation.error_code : null;

  if (busy) {
    const remaining = live ? remainingMs(live.start, live.last, live.progress.total) : null;
    return (
      <span
        role="status"
        className="flex shrink-0 items-center gap-2 rounded-md bg-raised px-3 py-2 text-[13px] text-text-2"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-4 animate-spin text-accent-text motion-reduce:animate-none"
        />
        <span className="font-semibold text-foreground">
          Translating{progress ? ` ${percentOf(progress)}%` : "…"}
        </span>
        {progress && (
          <span className="@max-[800px]:hidden">
            {progressLabel(progress, remaining)}
          </span>
        )}
      </span>
    );
  }

  if (failure && !TRANSLATION_RETRYABLE[failure]) {
    return (
      <p role="status" className="max-w-xs shrink text-xs text-text-2">
        {TRANSLATION_FAILURE_MESSAGES[failure]}
      </p>
    );
  }

  const label = translate.isError
    ? "Couldn't start. Try again"
    : failure
      ? "Translate again"
      : `Translate into ${languageName(translation.language)}`;

  return (
    <span className="flex shrink-0 items-center gap-3 text-[13px] font-semibold">
      {failure && (
        <span
          role="status"
          className="max-w-xs text-xs font-normal text-destructive @max-[800px]:sr-only"
        >
          Translation failed. {TRANSLATION_FAILURE_MESSAGES[failure]}
        </span>
      )}
      <button
        type="button"
        onClick={() => translate.mutate(videoId)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-raised px-3 text-foreground transition-colors hover:bg-raised-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Languages aria-hidden="true" className="size-4" />
        <span className="@max-[600px]:sr-only">{label}</span>
      </button>
    </span>
  );
}
