import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWatchData } from "@/hooks/useWatchData";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useWatchData hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useWatchData("media1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("does not fetch when disabled", () => {
    global.fetch = vi.fn();

    renderHook(() => useWatchData("media1", false), {
      wrapper: createWrapper(),
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches watch data successfully", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "media1",
              title: "Test Movie",
              streamUrl: "https://video.mp4",
              sourceLanguage: "en",
              translationLanguages: ["de", "es"],
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useWatchData("media1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/watch/media1");
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: "media1",
        title: "Test Movie",
        streamUrl: "https://video.mp4",
        sourceLanguage: "en",
        translationLanguages: ["de", "es"],
      });
    });
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: false }) as Promise<Response>,
    );

    const { result } = renderHook(() => useWatchData("media1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
