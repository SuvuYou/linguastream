import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import useStudySessionRating from "@/hooks/useStudySessionRating";
import { createWrapper } from "@/helpers/tests/providers";

const invalidateQueries = vi.fn();

const createQueue = (overrides = {}) => ({
  sessionId: "session-1",
  currentCard: {
    id: "card-1",
  },
  dismissCard: vi.fn(),
  restoreCard: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useStudySessionRating", () => {
  it("returns initial stats", () => {
    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    expect(result.current.shouldShowBack).toBe(false);
    expect(result.current.stats).toEqual({
      ratingCounts: {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
      },
      reviewedCount: 0,
      isSubmitting: false,
      submitError: null,
    });
  });

  it("sets card back state", () => {
    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setShouldShowBack(true);
    });

    expect(result.current.shouldShowBack).toBe(true);
  });

  it("optimistically dismisses card and updates stats", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          reviewedCount: 1,
          totalDue: 9,
          progress: 10,
          completed: false,
        }),
    });

    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleRating(2);
    });

    expect(queue.dismissCard).toHaveBeenCalledWith("card-1");
    expect(result.current.stats.reviewedCount).toBe(1);
    expect(result.current.stats.ratingCounts[2]).toBe(1);
    expect(result.current.shouldShowBack).toBe(false);

    await waitFor(() => {
      expect(result.current.stats.isSubmitting).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/study/session/session-1/review",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: "card-1",
          rating: 2,
        }),
      }),
    );
  });

  it("does nothing without a current card", () => {
    global.fetch = vi.fn();

    const queue = createQueue({
      currentCard: null,
    });

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleRating(2);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(queue.dismissCard).not.toHaveBeenCalled();
    expect(result.current.stats.reviewedCount).toBe(0);
  });

  it("rolls back optimistic state when review fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleRating(1);
    });

    expect(result.current.stats.reviewedCount).toBe(1);
    expect(result.current.stats.ratingCounts[1]).toBe(1);

    await waitFor(() => {
      expect(queue.restoreCard).toHaveBeenCalledWith("card-1");
    });

    expect(result.current.stats.reviewedCount).toBe(0);
    expect(result.current.stats.ratingCounts[1]).toBe(0);
    expect(result.current.stats.submitError?.message).toBe(
      "Failed to submit review",
    );
  });

  it("treats duplicate review as a successful no-op", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({}),
    });

    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleRating(3);
    });

    await waitFor(() => {
      expect(result.current.stats.isSubmitting).toBe(false);
    });

    expect(queue.dismissCard).toHaveBeenCalledWith("card-1");
    expect(queue.restoreCard).not.toHaveBeenCalled();
    expect(result.current.stats.reviewedCount).toBe(1);
    expect(result.current.stats.ratingCounts[3]).toBe(1);
    expect(result.current.stats.submitError).toBeNull();
  });

  it("ignores rating while a review is pending", async () => {
    let resolveRequest!: (response: Response) => void;

    global.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const queue = createQueue();

    const { result } = renderHook(() => useStudySessionRating(queue as never), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleRating(2);
    });

    await waitFor(() => {
      expect(result.current.stats.isSubmitting).toBe(true);
    });

    act(() => {
      result.current.handleRating(3);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(queue.dismissCard).toHaveBeenCalledTimes(1);
    expect(result.current.stats.ratingCounts[2]).toBe(1);
    expect(result.current.stats.ratingCounts[3]).toBe(0);

    await act(async () => {
      resolveRequest({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });
});
