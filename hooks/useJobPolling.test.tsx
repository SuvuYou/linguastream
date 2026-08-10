import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, renderHook, waitFor, act } from "@testing-library/react";

import { useJobPolling } from "@/hooks/useJobPolling";
import { JOB_STATUS } from "@/helpers/const";
import { LIBRARY_QUERY_KEY } from "@/hooks/useLibrary";
import { createWrapper } from "@/helpers/tests/providers";

const invalidateQueries = vi.fn();
let observerCallback: IntersectionObserverCallback;

class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();

  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useJobPolling", () => {
  it("returns initial job state", () => {
    const { result } = renderHook(
      () => useJobPolling("media-1", "processing", 25),
      { wrapper: createWrapper() },
    );

    expect(result.current.jobState).toEqual({
      status: "processing",
      progress: 25,
      logs: [],
    });
  });

  it("uses zero when initial progress is null", () => {
    const { result } = renderHook(
      () => useJobPolling("media-1", "processing", null),
      { wrapper: createWrapper() },
    );

    expect(result.current.jobState.progress).toBe(0);
  });

  it("does not observe terminal jobs", () => {
    const { result } = renderHook(
      () => useJobPolling("media-1", JOB_STATUS.DONE, 100),
      { wrapper: createWrapper() },
    );

    expect(result.current.jobState.status).toBe(JOB_STATUS.DONE);
    expect(observerCallback).toBeUndefined();
  });

  it("stops polling when the element becomes invisible", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "processing",
          progress: 50,
          logs: [],
        }),
    });

    function TestComponent() {
      const { elementRef } = useJobPolling("media-1", "processing", 10);

      return <div ref={elementRef} />;
    }

    render(<TestComponent />, {
      wrapper: createWrapper(),
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("ignores failed requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    let hookResult: ReturnType<typeof useJobPolling> | undefined;

    function TestComponent() {
      hookResult = useJobPolling("media-1", "processing", 25);

      return <div ref={hookResult.elementRef} />;
    }

    render(<TestComponent />, {
      wrapper: createWrapper(),
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(hookResult?.jobState).toEqual({
      status: "processing",
      progress: 25,
      logs: [],
    });
  });
});
