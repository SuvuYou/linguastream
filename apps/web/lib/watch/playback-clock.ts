import { useSyncExternalStore } from "react";

export interface PlaybackClock {
  get(): number;
  set(ms: number): void;
  subscribe(listener: () => void): () => void;
}

export function createPlaybackClock(initialMs = 0): PlaybackClock {
  let ms = initialMs;
  const listeners = new Set<() => void>();
  return {
    get: () => ms,
    set(next) {
      if (next === ms) return;
      ms = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useClockValue<T extends string | number | boolean | null>(
  clock: PlaybackClock,
  select: (ms: number) => T,
): T {
  return useSyncExternalStore(
    clock.subscribe,
    () => select(clock.get()),
    () => select(clock.get()),
  );
}
