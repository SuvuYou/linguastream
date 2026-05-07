import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnimationTick } from "./useAnimationTick";

let rafCallbacks: ((time: number) => void)[] = [];
let id = 0;

beforeEach(() => {
  rafCallbacks = [];
  id = 0;

  vi.stubGlobal("requestAnimationFrame", (cb: (time: number) => void) => {
    rafCallbacks.push(cb);
    return ++id;
  });

  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useAnimationTick", () => {
  it("starts automatically and calls callback with delta time", () => {
    const cb = vi.fn();

    renderHook(() => useAnimationTick(cb, { autoStart: true }));

    act(() => {
      rafCallbacks[0](1000);
    });

    expect(cb).not.toHaveBeenCalled();

    act(() => {
      rafCallbacks[1](1016);
    });

    expect(cb).toHaveBeenCalledWith(16);
  });

  it("calls callback with correct delta over multiple frames", () => {
    const cb = vi.fn();

    renderHook(() => useAnimationTick(cb, { autoStart: true }));

    act(() => {
      rafCallbacks[0](1000);
      rafCallbacks[1](1016);
      rafCallbacks[2](1036);
    });

    expect(cb).toHaveBeenNthCalledWith(1, 16);
    expect(cb).toHaveBeenNthCalledWith(2, 20);
  });

  it("stops animation loop on unmount", () => {
    const cb = vi.fn();

    const { unmount } = renderHook(() =>
      useAnimationTick(cb, { autoStart: true }),
    );

    unmount();

    act(() => {
      if (rafCallbacks[0]) rafCallbacks[0](1000);
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it("does not start when autoStart is false", () => {
    const cb = vi.fn();

    renderHook(() => useAnimationTick(cb, { autoStart: false }));

    expect(rafCallbacks.length).toBe(0);
  });
});
