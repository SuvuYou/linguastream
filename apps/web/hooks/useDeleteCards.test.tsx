import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useDeleteCards } from "@/hooks/useDeleteCards";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

beforeEach(() => {
  vi.resetAllMocks();
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useDeleteCards hook", () => {
  it("deletes cards successfully", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              deletedCount: 2,
            }),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    const { result } = renderHook(
      () => useDeleteCards("deck-1"),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(["card-1", "card-2"]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      deletedCount: 2,
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/cards", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardIds: ["card-1", "card-2"],
      }),
    });
  });

  it("handles API error with returned message", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: "Cards cannot be deleted",
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () => useDeleteCards("deck-1"),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(["card-1"]);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(
      "Cards cannot be deleted",
    );
  });

  it("handles API error without response body", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () => Promise.reject(new Error()),
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () => useDeleteCards("deck-1"),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(["card-1"]);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(
      "Failed to delete cards",
    );
  });

  it("invalidates deck queries after successful delete", async () => {
    const queryClient = new QueryClient();

    const invalidateSpy = vi.spyOn(
      queryClient,
      "invalidateQueries",
    );

    const wrapper = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              deletedCount: 1,
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () => useDeleteCards("deck-123"),
      {
        wrapper,
      },
    );

    result.current.mutate(["card-1"]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["deck-", { deckId: "deck-123" }],
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["decks"],
    });
  });
});