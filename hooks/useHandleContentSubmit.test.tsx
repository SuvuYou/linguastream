import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useHandleContentSubmit } from "@/hooks/useHandleContentSubmit";

const onSuccess = vi.fn();
const extractPathsMap = vi.fn();

const createArgs = (overrides = {}) => ({
  sourceLanguage: "en",
  translationLanguages: ["de"],
  acquisitionMethod: "youtube",
  translateMethod: "upload",
  videoId: "video-123",
  translationsFileUpload: { extractPathsMap },
  onSuccess,
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useHandleContentSubmit", () => {
  it("creates media and starts subtitle ingestion with uploaded files", async () => {
    extractPathsMap.mockReturnValue({
      de: "/uploads/german.srt",
    });

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "media-123" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

    const { result } = renderHook(() => useHandleContentSubmit(createArgs()));

    act(() => {
      result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("media-123");
    });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/youtube/info",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          url: "https://www.youtube.com/watch?v=video-123",
          sourceLang: "en",
        }),
      }),
    );

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/subtitles/media-123",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          sourceLang: "en",
          acquisitionMethod: "youtube",
          youtubeVideoId: "video-123",
          translateLangs: ["de"],
          translateMethod: "upload",
          removeLangs: [],
          translateFiles: {
            de: "/uploads/german.srt",
          },
        }),
      }),
    );
  });

  it("sets error when subtitle ingestion fails", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "media-123" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Ingestion failed",
          }),
      });

    const { result } = renderHook(() => useHandleContentSubmit(createArgs()));

    act(() => {
      result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Ingestion failed");
    });

    expect(onSuccess).toHaveBeenCalledWith("media-123");
  });
});
