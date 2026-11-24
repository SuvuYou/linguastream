import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useWordDefinition } from "@/hooks/useWordDefinition";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

const word = {
  word: "Haus",
  lang: "de",
  context: "Das Haus ist groß.",
} as never;

describe("useWordDefinition", () => {
  it("does not fetch when word is null", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => useWordDefinition(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch when required word data is missing", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(
      () =>
        useWordDefinition({
          word: "Haus",
          lang: "de",
          context: "",
        } as never),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches and returns the definition", async () => {
    const response = {
      translation: "house",
      definition: "A building for people to live in.",
      context_sentence: "The house is big.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const { result } = renderHook(() => useWordDefinition(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(response);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/definition?word=Haus&lang=de&context=Das%20Haus%20ist%20gro%C3%9F.",
    );
  });

  it("encodes special characters in word and context", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          translation: "house",
          definition: "definition",
          context_sentence: "sentence",
        }),
    });

    const specialWord = {
      word: "hello world?",
      lang: "en",
      context: "What's this?",
    } as never;

    renderHook(() => useWordDefinition(specialWord), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/definition?word=hello%20world%3F&lang=en&context=What's%20this%3F",
      );
    });
  });

  it("handles fetch errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useWordDefinition(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch definition");
  });
});
