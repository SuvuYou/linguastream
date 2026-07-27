import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useDeckCards } from "@/hooks/useDeckCards";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useDeckCards hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(
      () =>
        useDeckCards({
          deckId: "deck-1",
          page: 1,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("does not fetch when deckId is empty", () => {
    const fetchMock = vi.fn();

    global.fetch = fetchMock;

    const { result } = renderHook(
      () =>
        useDeckCards({
          deckId: "",
          page: 1,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () =>
        useDeckCards({
          deckId: "deck-1",
          page: 1,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch deck cards");
  });

  it("returns deck cards successfully", async () => {
    const response = {
      cards: [
        {
          id: "card-1",
          word: "hello",
          source_language: "en",
          translation_language: "de",
          word_translation: "hallo",
          context_text: "Hello world",
          context_translation: "Hallo Welt",
          contextual_definition: null,
          media_content_id: "media-1",
          start_ms: 0,
          end_ms: 1000,
          next_review: "2026-01-01",
          interval_days: 1,
          ease_factor: 2.5,
          repetitions: 0,
          streamUrl: null,
          word_profile: null,
        },
      ],
      total: 1,
      pageCount: 1,
    };

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () =>
        useDeckCards({
          deckId: "deck-1",
          page: 1,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(response);
  });

  it("calls correct API endpoint with required params", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cards: [],
              total: 0,
              pageCount: 0,
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(
      () =>
        useDeckCards({
          deckId: "deck-123",
          page: 2,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/decks/deck-123/cards?page=2&limit=50",
    );
  });

  it("includes optional lang and q params", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cards: [],
              total: 0,
              pageCount: 0,
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(
      () =>
        useDeckCards({
          deckId: "deck-123",
          page: 3,
          lang: "de",
          q: "haus",
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/decks/deck-123/cards?page=3&limit=50&lang=de&q=haus",
    );
  });
});
