import type { Line } from "@linguastream/contracts";
import { memo } from "react";
import { cn } from "@/lib/utils";

function TranscriptLine({
  line,
  state,
  language,
  translationLanguage,
  onSeek,
  setRef,
}: {
  line: Line;
  state: "past" | "current" | "upcoming";
  language: string;
  translationLanguage: string | null;
  onSeek(ms: number): void;
  setRef(index: number, element: HTMLButtonElement | null): void;
}) {
  return (
    <button
      type="button"
      ref={(element) => setRef(line.index, element)}
      onClick={() => onSeek(line.start_ms)}
      aria-current={state === "current" ? "true" : undefined}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        state === "current" && "bg-cur-row hover:bg-cur-row",
      )}
    >
      <span
        lang={language}
        className={cn(
          "text-[13px] leading-[1.45] font-medium",
          state === "past" && "text-text-3",
          state === "current" && "font-semibold",
        )}
      >
        {line.text}
      </span>
      {line.translation && (
        <span
          lang={translationLanguage ?? undefined}
          className="text-[11.5px] leading-[1.4] text-text-3"
        >
          {line.translation}
        </span>
      )}
    </button>
  );
}

export default memo(TranscriptLine);
