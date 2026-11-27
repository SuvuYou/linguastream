"use client";

import type { ProcessingEvent } from "@linguastream/contracts";
import { CircleAlert, CircleCheck, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import type { ProcessingToast as ToastState } from "@/hooks/useProcessingToasts";
import {
  FAILURE_MESSAGES,
  RETRYABLE,
  STAGES,
  stageStates,
} from "@/lib/processing/stages";
import { cn } from "@/lib/utils";

function heading(event: ProcessingEvent) {
  switch (event.type) {
    case "queued":
      return "Waiting to prepare";
    case "step":
      return "Preparing";
    case "ready":
      return "Ready:";
    case "failed":
      return "Couldn't prepare";
  }
}

function Icon({ event }: { event: ProcessingEvent }) {
  if (event.type === "ready")
    return (
      <CircleCheck
        className="size-4 shrink-0 text-accent-text"
        aria-hidden="true"
      />
    );
  if (event.type === "failed")
    return (
      <CircleAlert className="size-4 shrink-0 text-text-2" aria-hidden="true" />
    );
  return (
    <LoaderCircle
      className="size-4 shrink-0 animate-spin text-accent-text motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

const smallButton =
  "inline-flex h-8 items-center rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function ProcessingToast({
  toast,
  onDismiss,
  onRetry,
}: {
  toast: ToastState;
  onDismiss(): void;
  onRetry(): void;
}) {
  const { event } = toast;
  const states = stageStates(event);
  const failed = event.type === "failed";

  return (
    <div
      role={failed ? "alert" : "status"}
      className="pointer-events-auto flex flex-col gap-2 rounded-2xl border border-border bg-popup py-3 pr-2 pl-4 shadow-float backdrop-blur-[20px]"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5">
          <Icon event={event} />
        </span>
        <p
          className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-5 font-semibold"
          title={event.title}
        >
          {heading(event)}{" "}
          <span lang="de" className="break-words">
            “{event.title}”
          </span>
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="-mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {!failed && (
        <div className="flex flex-col gap-2 pr-2">
          <div className="grid grid-cols-4 gap-1" aria-hidden="true">
            {states.map((state, i) => (
              <span
                key={STAGES[i]!.label}
                className={cn(
                  "h-1 rounded-sm",
                  state === "done" && "bg-primary",
                  state === "current" && "bg-[var(--a45)]",
                  state === "todo" && "bg-foreground/12",
                )}
              />
            ))}
          </div>
          <ol className="flex justify-between text-xs text-text-3">
            {STAGES.map((stage, i) => (
              <li
                key={stage.label}
                aria-current={states[i] === "current" ? "step" : undefined}
                className={cn(states[i] === "current" && "text-accent-text")}
              >
                {stage.label}
                {states[i] === "done" && i < STAGES.length - 1 && (
                  <span aria-label=" done"> ✓</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {event.type === "ready" && (
        <div className="flex pr-2">
          <Link
            href={`/watch/${event.video_id}`}
            className={cn(
              smallButton,
              "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
            )}
          >
            Open video
          </Link>
        </div>
      )}

      {failed && (
        <div className="flex flex-col gap-2 pr-2">
          <p className="text-[13px] text-text-2">
            {toast.retryFailed
              ? "The retry didn't go through. Try again in a moment."
              : FAILURE_MESSAGES[event.error_code]}
          </p>
          {RETRYABLE[event.error_code] && (
            <div className="flex text-[13px] font-medium">
              <button
                type="button"
                onClick={onRetry}
                disabled={toast.retrying}
                className={cn(
                  smallButton,
                  "bg-raised-2 text-foreground hover:bg-raised disabled:opacity-60",
                )}
              >
                {toast.retrying ? "Retrying…" : "Retry"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
