import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useWordProfile } from "@/hooks/useWordProfile";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

const word = {
  word: "Haus",
  lang: "de",
  context: "Das Haus ist groß.",
} as never;

describe("useWordProfile", () => {
  it("does not fetch when word is null", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => useWordProfile(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch when word or language is missing", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(
      () =>
        useWordProfile({
          word: "",
          lang: "de",
          context: "Das Haus ist groß.",
        } as never),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and returns the word profile", async () => {
    const response = {
      id: "profile-1",
      word: "Haus",
      language: "de",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const { result } = renderHook(() => useWordProfile(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(response);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/word-profile?word=Haus&lang=de&context=Das%20Haus%20ist%20gro%C3%9F.",
    );
  });

  it("encodes word and context in the request", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "profile-1",
        }),
    });

    const specialWord = {
      word: "hello world?",
      lang: "en",
      context: "What's this?",
    } as never;

    renderHook(() => useWordProfile(specialWord), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/word-profile?word=hello%20world%3F&lang=en&context=What's%20this%3F",
      );
    });
  });

  it("handles fetch errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useWordProfile(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch word profile");
  });
});
