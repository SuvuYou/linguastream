import type {
  Line,
  TrackVisibility,
  WordStatus,
} from "@linguastream/contracts";
import { Fragment, memo } from "react";
import { cn } from "@/lib/utils";
import { splitToken, statusOf, type WordStatuses } from "@/lib/watch/words";

const TEXT_STATUS: Partial<Record<WordStatus, string>> = {
  unknown: "text-unknown",
  learning: "text-learning",
};

function ColouredText({
  line,
  statuses,
}: {
  line: Line;
  statuses: WordStatuses | undefined;
}) {
  if (!statuses || line.words.length === 0) return line.text;
  const last = line.words.length - 1;
  return line.words.map((word, n) => {
    const status = statusOf(statuses, word.lemma);
    const colour = status && TEXT_STATUS[status];
    const space = n < last ? " " : "";
    if (!colour)
      return (
        <Fragment key={word.i}>
          {word.text}
          {space}
        </Fragment>
      );
    const { before, core, after } = splitToken(word.text);
    return (
      <Fragment key={word.i}>
        {before}
        <span className={colour}>{core}</span>
        {after}
        {space}
      </Fragment>
    );
  });
}

const BLURRED =
  "blur-[5px] transition-[filter] duration-150 group-hover/line:blur-none group-focus-visible/line:blur-none motion-reduce:transition-none";

function TranscriptLine({
  line,
  state,
  language,
  translationLanguage,
  originalVisibility,
  translationVisibility,
  statuses,
  onSeek,
  setRef,
}: {
  line: Line;
  state: "past" | "current" | "upcoming";
  language: string;
  translationLanguage: string | null;
  originalVisibility: TrackVisibility;
  translationVisibility: TrackVisibility;
  statuses: WordStatuses | undefined;
  onSeek(ms: number): void;
  setRef(index: number, element: HTMLButtonElement | null): void;
}) {
  const showOriginal = originalVisibility !== "hide";
  const showTranslation =
    !!line.translation && translationVisibility !== "hide";

  return (
    <button
      type="button"
      ref={(element) => setRef(line.index, element)}
      onClick={() => onSeek(line.start_ms)}
      aria-current={state === "current" ? "true" : undefined}
      className={cn(
        "group/line flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        state === "current" && "bg-cur-row hover:bg-cur-row",
      )}
    >
      {showOriginal && (
        <span
          lang={language}
          className={cn(
            "text-[13px] leading-[1.45] font-medium",
            state === "past" && "text-text-3",
            state === "current" && "font-semibold",
            originalVisibility === "blur" && BLURRED,
          )}
        >
          <ColouredText line={line} statuses={statuses} />
        </span>
      )}
      {showTranslation && (
        <span
          lang={translationLanguage ?? undefined}
          className={cn(
            "text-[11.5px] leading-[1.4] text-text-3",
            translationVisibility === "blur" && BLURRED,
          )}
        >
          {line.translation}
        </span>
      )}
      {!showOriginal && !showTranslation && (
        <span className="text-[13px] text-text-3 italic">Hidden</span>
      )}
    </button>
  );
}

export default memo(TranscriptLine);
