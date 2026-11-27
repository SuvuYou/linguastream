"use client";

import type { WordLookup, WordStatus } from "@linguastream/contracts";
import { X } from "lucide-react";
import { Popover } from "radix-ui";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isWorthLearning } from "@/lib/watch/words";
import StatusPicker from "./StatusPicker";

export interface WordPopupState {
  lemma: string;
  status: WordStatus | null;
  lookup: WordLookup | undefined;
  isLoading: boolean;
  isError: boolean;
}

function Rank({ rank, status }: { rank: number; status: WordStatus | null }) {
  const worth = status !== null && isWorthLearning(rank, status);
  return (
    <span
      title={worth ? "Worth learning: common, not known yet" : "Frequency rank"}
      className={cn(
        "flex items-center gap-1 rounded-xs px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
        worth ? "bg-[var(--a14)] text-accent-text" : "text-text-3",
      )}
    >
      {worth && <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />}#{rank}
    </span>
  );
}

function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="rounded-xs bg-raised px-1.5 py-0.5 text-[11px] text-text-2">
      {children}
    </span>
  );
}

function Body({ state, language }: { state: WordPopupState; language: string }) {
  const { lookup } = state;
  if (state.isError)
    return <p className="text-sm text-text-2">Couldn&apos;t load this word. Close and click it again.</p>;
  if (!lookup)
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  if (!lookup.gloss)
    return <p className="text-sm text-text-3">No dictionary entry for this word yet.</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-2 text-base">
      <span lang={lookup.gloss_language ?? undefined}>{lookup.gloss}</span>
      {lookup.ai && lookup.entries.length === 0 && (
        <Pill title="Not in the dictionary; written by AI">AI</Pill>
      )}
      {lookup.ai && lookup.ai.parts.length > 1 && (
        <span lang={language} className="text-[13px] text-text-3">
          {lookup.ai.parts.join(" + ")}
        </span>
      )}
    </p>
  );
}

export default function WordPopup({
  anchorRef,
  open,
  language,
  state,
  onStatusChange,
  onClose,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  language: string;
  state: WordPopupState | null;
  onStatusChange(status: WordStatus): void;
  onClose(): void;
}) {
  const lookup = state?.lookup;
  const pos = lookup?.entries[0]?.pos ?? lookup?.ai?.pos ?? null;

  return (
    <Popover.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLElement>} />
      <Popover.Portal>
        {state && (
          <Popover.Content
            side="top"
            align="center"
            sideOffset={14}
            collisionPadding={12}
            aria-label={`Word: ${state.lemma}`}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("[data-word]")
              )
                event.preventDefault();
            }}
            className="z-50 flex w-[min(336px,calc(100vw-24px))] flex-col gap-2.5 rounded-2xl border border-border bg-popup p-4 text-sm text-foreground shadow-float backdrop-blur-[20px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
          >
            <div className="flex items-center gap-1.5">
              <span lang={language} className="min-w-0 truncate text-xl font-bold">
                {state.lemma}
              </span>
              {pos && <Pill>{pos}</Pill>}
              <span className="ml-auto flex items-center gap-0.5">
                {lookup?.rank != null && <Rank rank={lookup.rank} status={state.status} />}
                <Popover.Close
                  aria-label="Close"
                  className="flex size-7 items-center justify-center rounded-sm text-text-3 transition-colors hover:bg-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="size-[15px]" />
                </Popover.Close>
              </span>
            </div>
            <Body state={state} language={language} />
            <StatusPicker value={state.status} onChange={onStatusChange} />
            <Button disabled title="Saving words comes next" className="w-full">
              Save word · coming soon
            </Button>
          </Popover.Content>
        )}
      </Popover.Portal>
    </Popover.Root>
  );
}
