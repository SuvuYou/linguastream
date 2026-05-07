import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSubtitleTrack } from "@/hooks/useSubtitleTrack";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useSubtitleTrack hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useSubtitleTrack("media1", "en"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("does not run when lang is null", () => {
    global.fetch = vi.fn();

    const { result } = renderHook(() => useSubtitleTrack("media1", null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches subtitle track correctly", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              lines: [
                {
                  index: 0,
                  start_ms: 0,
                  end_ms: 1000,
                  text: "hello",
                },
              ],
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useSubtitleTrack("media1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/subtitles/media1?lang=en",
      );
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          index: 0,
          start_ms: 0,
          end_ms: 1000,
          text: "hello",
        },
      ]);
    });
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: false }) as Promise<Response>,
    );

    const { result } = renderHook(() => useSubtitleTrack("media1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("respects enabled flag", () => {
    global.fetch = vi.fn();

    renderHook(() => useSubtitleTrack("media1", "en", false), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
