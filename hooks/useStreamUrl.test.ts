import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStreamUrl } from "@/hooks/useStreamUrl";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useStreamUrl hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useStreamUrl("123"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("does not run when mediaContentId is null", () => {
    global.fetch = vi.fn();

    const { result } = renderHook(() => useStreamUrl(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches stream URL correctly", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              streamUrl: "https://example.com/video.mp4",
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useStreamUrl("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/watch/abc123/stream");
    });

    await waitFor(() => {
      expect(result.current.data?.streamUrl).toBe(
        "https://example.com/video.mp4",
      );
    });
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: false }) as Promise<Response>,
    );

    const { result } = renderHook(() => useStreamUrl("abc123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
