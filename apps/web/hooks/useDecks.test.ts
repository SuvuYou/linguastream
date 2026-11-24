import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useDecks } from "@/hooks/useDecks";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useDecks hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useDecks(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useDecks(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch decks");
  });

  it("returns decks successfully", async () => {
    const response = {
      decks: [
        {
          id: "deck-1",
          name: "German Basics",
          is_default: true,
          created_at: "2026-01-01",
          stats: {
            total: 100,
            due: 20,
            learned: 80,
            progress: 80,
          },
        },
      ],
    };

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useDecks(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(response);
  });

  it("calls the correct endpoint without source language", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              decks: [],
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(() => useDecks(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/decks?");
  });

  it("includes sourceLanguage query parameter", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              decks: [],
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(() => useDecks("de"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/decks?sourceLanguage=de");
  });

  it("refetches when source language changes", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              decks: [],
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    const { rerender } = renderHook(({ language }) => useDecks(language), {
      initialProps: {
        language: null,
      },
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/decks?");
    });

    rerender({
      language: "de",
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/decks?sourceLanguage=de");
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
