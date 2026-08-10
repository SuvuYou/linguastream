import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import useStudyQueue from "@/hooks/useStudyQueue";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useStudyQueue", () => {
  it("does not start a session when deckId is empty", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => useStudyQueue("", "en"), {
      wrapper: createWrapper(),
    });

    expect(result.current.sessionId).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates session and loads study cards", async () => {
    const cards = [
      {
        id: "card-1",
        word: "hello",
      },
      {
        id: "card-2",
        word: "world",
      },
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId: "session-1",
            deckTitle: "German",
            totalDue: 2,
            reviewedCount: 3,
            nextReviewAt: null,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cards,
            cursor: null,
            nextCursor: null,
          }),
      });

    const { result } = renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.currentCard).toEqual(cards[0]);
    });

    expect(result.current.sessionId).toBe("session-1");
    expect(result.current.studyDetails).toEqual({
      deckTitle: "German",
      totalDue: 2,
      nextReviewAt: null,
    });
    expect(result.current.initialReviewedCount).toBe(3);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/study/session",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          deckId: "deck-1",
          sourceLanguage: "en",
        }),
      }),
    );

    expect(fetch).toHaveBeenNthCalledWith(2, "/api/study/session/session-1?");
  });

  it("returns session error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe(
        "Failed to start study session",
      );
    });

    expect(result.current.currentCard).toBeNull();
  });

  it("returns cards fetch error", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId: "session-1",
            deckTitle: "German",
            totalDue: 1,
            reviewedCount: 0,
            nextReviewAt: null,
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { result } = renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe("Failed to fetch study cards");
    });
  });

  it("dismisses the current card", async () => {
    const cards = [
      { id: "card-1", word: "hello" },
      { id: "card-2", word: "world" },
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId: "session-1",
            deckTitle: "German",
            totalDue: 2,
            reviewedCount: 0,
            nextReviewAt: null,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cards,
            cursor: null,
            nextCursor: null,
          }),
      });

    const { result } = renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.currentCard?.id).toBe("card-1");
    });

    act(() => {
      result.current.dismissCard("card-1");
    });

    expect(result.current.currentCard?.id).toBe("card-2");
  });

  it("restores a dismissed card", async () => {
    const cards = [
      { id: "card-1", word: "hello" },
      { id: "card-2", word: "world" },
    ];

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId: "session-1",
            deckTitle: "German",
            totalDue: 2,
            reviewedCount: 0,
            nextReviewAt: null,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cards,
            cursor: null,
            nextCursor: null,
          }),
      });

    const { result } = renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.currentCard?.id).toBe("card-1");
    });

    act(() => {
      result.current.dismissCard("card-1");
    });

    expect(result.current.currentCard?.id).toBe("card-2");

    act(() => {
      result.current.restoreCard("card-1");
    });

    expect(result.current.currentCard?.id).toBe("card-1");
  });

  it("prefetches the next page when five or fewer cards remain", async () => {
    const cards = Array.from({ length: 5 }, (_, i) => ({
      id: `card-${i}`,
      word: `word-${i}`,
    }));

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            sessionId: "session-1",
            deckTitle: "German",
            totalDue: 10,
            reviewedCount: 0,
            nextReviewAt: null,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cards,
            cursor: null,
            nextCursor: 5,
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cards: [{ id: "card-5", word: "next" }],
            cursor: 5,
            nextCursor: null,
          }),
      });

    renderHook(() => useStudyQueue("deck-1", "en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "/api/study/session/session-1?cursor=5",
    );
  });
});
