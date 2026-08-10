"use client";

import Events from "@/events";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SubtitleLinePair } from "./SubtitleList";
import type { RefObject } from "react";
import React from "react";

interface Props {
  subtitlePair: SubtitleLinePair;
  forwardActiveRef: RefObject<HTMLTableRowElement | null>;
  listOrderIndex: number;
  isActive: boolean;
  shouldShowSourceLine: boolean;
  shouldShowTranslationLine: boolean;
  query: string;
}

function highlight(text: string, q: string) {
  if (!q.trim()) return <span>{text}</span>;

  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-highlight/50 p-1 rounded-[6px] text-primary-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  );
}

function formatTime(ms: number) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;

  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default React.memo(function SubtitleRow(props: Props) {
  const {
    query,
    isActive,
    subtitlePair,
    forwardActiveRef,
    listOrderIndex,
    shouldShowSourceLine,
    shouldShowTranslationLine,
  } = props;

  return (
    <TableRow
      id={`subtitle-row-${listOrderIndex}`}
      role="option"
      ref={isActive ? forwardActiveRef : undefined}
      onClick={() => Events.player.triggerJumpTo(subtitlePair.start_ms + 10)}
      className={cn(
        "border-none overflow-hidden cursor-pointer transition-colors rounded-xl hover:bg-background",
        isActive && "bg-primary/5 hover:bg-primary/10",
      )}
    >
      <TableCell
        className={cn(
          "w-16 pr-2 pl-5 py-4 align-top text-xs leading-6 text-primary-foreground tabular-nums rounded-l-xl rounded-bl-xs border-2 border-r-0 border-transparent border-b border-b-border",
          isActive && "border-primary/50 border-b-2",
        )}
      >
        {formatTime(subtitlePair.start_ms)}
      </TableCell>

      <TableCell
        className={cn(
          "pl-0 pr-3 py-4 align-top rounded-r-xl border-2 border-l-0 border-transparent border-b border-b-border",
          isActive && "border-primary/50 border-b-2",
        )}
      >
        {shouldShowSourceLine && subtitlePair.source && (
          <div
            className={cn(
              "text-lg text-primary-foreground text-wrap mb-2",
              isActive && "font-semibold",
            )}
          >
            {highlight(subtitlePair.source.text, query)}
          </div>
        )}
        {shouldShowTranslationLine && subtitlePair.translation && (
          <div
            className={cn(
              "text-sm text-muted-foreground/80 text-wrap",
              shouldShowSourceLine && subtitlePair.source && "mt-0.5",
              isActive && "text-primary",
            )}
          >
            {highlight(subtitlePair.translation.text, query)}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});
