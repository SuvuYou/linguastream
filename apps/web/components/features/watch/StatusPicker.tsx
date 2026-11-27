import type { WordStatus } from "@linguastream/contracts";
import { cn } from "@/lib/utils";
import { STATUS_CYCLE, STATUS_LABELS } from "@/lib/watch/words";

const DOT: Record<WordStatus, string | null> = {
  unknown: "bg-unknown",
  learning: "bg-learning",
  known: "bg-known",
  ignored: null,
};

const PRESSED: Record<WordStatus, string> = {
  unknown: "aria-pressed:bg-unknown aria-pressed:text-unknown-ink",
  learning: "aria-pressed:bg-learning aria-pressed:text-learning-ink",
  known: "aria-pressed:bg-known aria-pressed:text-known-ink",
  ignored: "aria-pressed:bg-raised-2 aria-pressed:text-foreground",
};

export default function StatusPicker({
  value,
  disabled,
  onChange,
}: {
  value: WordStatus | null;
  disabled?: boolean;
  onChange(status: WordStatus): void;
}) {
  return (
    <div role="group" aria-label="Status" className="grid grid-cols-4 gap-1 rounded-lg bg-inset p-1 text-xs">
      {STATUS_CYCLE.map((status) => {
        const dot = DOT[status];
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            aria-pressed={value === status}
            onClick={() => onChange(status)}
            className={cn(
              "group/status flex h-9 items-center justify-center gap-1 rounded-[calc(9px*var(--r))] text-xs text-text-2 transition-colors hover:bg-raised-2 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-pressed:font-semibold",
              PRESSED[status],
            )}
          >
            {dot && (
              <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full group-aria-pressed/status:hidden", dot)} />
            )}
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
