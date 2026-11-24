import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useDeckDetail } from "@/hooks/useDeckDetail";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useDeckDetail hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useDeckDetail("deck-1"), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("does not fetch when deckId is empty", () => {
    const fetchMock = vi.fn();

    global.fetch = fetchMock;

    const { result } = renderHook(() => useDeckDetail(""), {
      wrapper: createWrapper(),
    });

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

    const { result } = renderHook(() => useDeckDetail("deck-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch deck");
  });

  it("returns deck detail successfully", async () => {
    const response = {
      deck: {
        id: "deck-1",
        name: "German Basics",
        is_default: false,
      },
      availableLanguages: ["en", "de"],
    };

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useDeckDetail("deck-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(response);
  });

  it("calls the correct API endpoint", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              deck: {
                id: "deck-123",
                name: "Test Deck",
                is_default: true,
              },
              availableLanguages: [],
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(() => useDeckDetail("deck-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/decks/deck-123");
  });

  it("uses different deck ids independently", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              deck: {
                id: "deck-2",
                name: "Another Deck",
                is_default: false,
              },
              availableLanguages: ["de"],
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    const { rerender } = renderHook(({ deckId }) => useDeckDetail(deckId), {
      initialProps: {
        deckId: "deck-1",
      },
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/decks/deck-1");
    });

    rerender({
      deckId: "deck-2",
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/decks/deck-2");
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
