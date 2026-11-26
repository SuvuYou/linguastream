"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { formatTime } from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";

const STEP_MS = 5000;

export default function SeekBar({
  clock,
  durationMs,
  disabled,
  onSeek,
}: {
  clock: PlaybackClock;
  durationMs: number;
  disabled: boolean;
  onSeek(ms: number): void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const valueMs = useClockValue(clock, (ms) => Math.floor(ms / 250) * 250);
  const share = durationMs > 0 ? Math.min(1, valueMs / durationMs) : 0;

  const msAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * durationMs);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || durationMs <= 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    onSeek(msAt(event.clientX));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    onSeek(msAt(event.clientX));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const keys: Record<string, number> = {
      ArrowLeft: valueMs - STEP_MS,
      ArrowRight: valueMs + STEP_MS,
      Home: 0,
      End: durationMs,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSeek(Math.min(durationMs, Math.max(0, next)));
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(durationMs / 1000)}
      aria-valuenow={Math.round(valueMs / 1000)}
      aria-valuetext={`${formatTime(valueMs)} of ${formatTime(durationMs)}`}
      aria-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
      className="group relative mx-2 mt-0.5 flex h-5 basis-full cursor-pointer touch-none items-center rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-ring aria-disabled:cursor-default"
    >
      <span className="absolute inset-x-0 h-1 rounded-full bg-foreground/12" />
      <span className="absolute left-0 h-1 rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
      <span
        className="absolute size-3 -translate-x-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ left: `${share * 100}%` }}
      />
    </div>
  );
}
