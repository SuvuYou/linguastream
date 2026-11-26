import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "@/helpers/tests/providers";
import { MOCK_VIDEO_IDS, mockVideos } from "@/mocks/fixtures/watch";
import { useLineWindows } from "./useLineWindows";

function stubLines(fail?: (from: number) => boolean) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const from = Number(url.searchParams.get("from_ms"));
    const to = Number(url.searchParams.get("to_ms"));
    if (fail?.(from)) return new Response(JSON.stringify({ error: "boom" }), { status: 500 });
    const lines = mockVideos[MOCK_VIDEO_IDS.normal]!.lines.filter((l) => l.start_ms >= from && l.start_ms < to);
    return new Response(JSON.stringify({ from_ms: from, to_ms: to, lines }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("useLineWindows", () => {
  it("loads nothing until the track is ready", () => {
    const fetchMock = stubLines();
    const { result } = renderHook(() => useLineWindows(mockVideos[MOCK_VIDEO_IDS.preparing]!.video, 0), {
      wrapper: createWrapper(),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.lines).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("loads the playhead window first and merges every window in order", async () => {
    const fetchMock = stubLines();
    const { result } = renderHook(() => useLineWindows(mockVideos[MOCK_VIDEO_IDS.normal]!.video, 7 * 60_000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(String(fetchMock.mock.calls[0]![0])).toContain("from_ms=300000");
    expect(result.current.lines).toEqual(mockVideos[MOCK_VIDEO_IDS.normal]!.lines);
  });

  it("reports an error when a window fails and keeps the others", async () => {
    stubLines((from) => from === 0);
    const { result } = renderHook(() => useLineWindows(mockVideos[MOCK_VIDEO_IDS.normal]!.video, 7 * 60_000), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => expect(result.current.lines.length).toBeGreaterThan(0));
    expect(result.current.lines.every((l) => l.start_ms >= 300_000)).toBe(true);
    expect(result.current.isComplete).toBe(false);
  });
});
