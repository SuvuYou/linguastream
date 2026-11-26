import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useWordDefinition } from "@/hooks/useWordDefinition";
import { createWrapper } from "@/helpers/tests/providers";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

const word = {
  word: "Haus",
  lang: "de",
  context: "Das Haus ist groß.",
} as never;

const definition = {
  translation: "house",
  definition: "A building for people to live in.",
  context_sentence: "Das Haus ist groß.",
};

describe("useWordDefinition", () => {
  it("does not fetch when word is null", () => {
    const fetchMock = mockFetch(200, definition);

    const { result } = renderHook(() => useWordDefinition(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch when required word data is missing", () => {
    const fetchMock = mockFetch(200, definition);

    const { result } = renderHook(
      () => useWordDefinition({ word: "Haus", lang: "de", context: "" } as never),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches the definition from GET /api/definition", async () => {
    const fetchMock = mockFetch(200, definition);

    const { result } = renderHook(() => useWordDefinition(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(definition));

    const [url] = fetchMock.mock.calls[0]!;
    const parsed = new URL(url as string, "http://localhost");
    expect(parsed.pathname).toBe("/api/definition");
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      word: "Haus",
      lang: "de",
      context: "Das Haus ist groß.",
    });
  });

  it("encodes special characters in word and context", async () => {
    const fetchMock = mockFetch(200, definition);
    const specialWord = { word: "hello world?&x=1", lang: "en", context: "What's this?" } as never;

    renderHook(() => useWordDefinition(specialWord), { wrapper: createWrapper() });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const parsed = new URL(fetchMock.mock.calls[0]![0] as string, "http://localhost");
    expect(parsed.searchParams.get("word")).toBe("hello world?&x=1");
    expect(parsed.searchParams.get("context")).toBe("What's this?");
  });

  it("surfaces the API's error message", async () => {
    mockFetch(502, { error: "Failed to generate definition" });

    const { result } = renderHook(() => useWordDefinition(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Failed to generate definition");
  });

  it("errors when the response doesn't match the contract", async () => {
    mockFetch(200, { translation: "house" });

    const { result } = renderHook(() => useWordDefinition(word), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.name).toBe("ApiContractError");
  });
});
