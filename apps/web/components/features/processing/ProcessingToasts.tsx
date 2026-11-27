"use client";

import { useProcessingToasts } from "@/hooks/useProcessingToasts";
import { cn } from "@/lib/utils";
import ProcessingToast from "./ProcessingToast";

export const VISIBLE_TOASTS = 3;

export default function ProcessingToasts({
  placement = "bottom-left",
}: {
  placement?: "bottom-left" | "bottom-right";
}) {
  const { toasts, dismiss, retry } = useProcessingToasts();
  if (toasts.length === 0) return null;

  const visible = toasts.slice(-VISIBLE_TOASTS);
  const hidden = toasts.length - visible.length;

  return (
    <section
      aria-label="Video processing"
      className={cn(
        "pointer-events-none fixed bottom-5 z-50 flex w-[340px] max-w-[calc(100vw-2.5rem)] flex-col gap-2",
        placement === "bottom-left" ? "left-5" : "right-5",
      )}
    >
      {hidden > 0 && (
        <span className="self-start rounded-full bg-popup px-3 py-1 text-xs text-text-2 shadow-float backdrop-blur-[20px]">
          +{hidden} more
        </span>
      )}
      {visible.map((toast) => (
        <ProcessingToast
          key={toast.event.track_id}
          toast={toast}
          onDismiss={() => dismiss(toast.event.track_id)}
          onRetry={() => void retry(toast.event)}
        />
      ))}
    </section>
  );
}
