import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createPlaybackClock, useClockValue } from "./playback-clock";

describe("createPlaybackClock", () => {
  it("notifies only on change", () => {
    const clock = createPlaybackClock();
    const listener = vi.fn();
    clock.subscribe(listener);
    clock.set(100);
    clock.set(100);
    clock.set(200);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(clock.get()).toBe(200);
  });

  it("re-renders a component only when its selected value changes", () => {
    const clock = createPlaybackClock();
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useClockValue(clock, (ms) => Math.floor(ms / 1000));
    });
    act(() => clock.set(300));
    act(() => clock.set(900));
    expect(result.current).toBe(0);
    const before = renders;
    act(() => clock.set(1200));
    expect(result.current).toBe(1);
    expect(renders).toBe(before + 1);
  });
});
