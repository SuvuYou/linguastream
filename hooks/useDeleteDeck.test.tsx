import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useDeleteDeck } from "@/hooks/useDeleteDeck";

beforeEach(() => {
  vi.resetAllMocks();
});

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useDeleteDeck hook", () => {
  it("deletes deck successfully", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    const queryClient = new QueryClient();

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate("deck-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/decks/deck-1", {
      method: "DELETE",
    });
  });

  it("optimistically removes deck from cache", async () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const queryClient = new QueryClient();

    queryClient.setQueryData(["decks"], {
      decks: [
        {
          id: "deck-1",
          name: "German",
          is_default: false,
        },
        {
          id: "deck-2",
          name: "English",
          is_default: true,
        },
      ],
    });

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate("deck-1");
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(["decks"])).toEqual({
        decks: [
          {
            id: "deck-2",
            name: "English",
            is_default: true,
          },
        ],
      });
    });
  });

  it("rolls back cache when deletion fails", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: "Cannot delete default deck",
            }),
        }) as Promise<Response>,
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    const previousData = {
      decks: [
        {
          id: "deck-1",
          name: "German",
          is_default: false,
        },
      ],
    };

    queryClient.setQueryData(["decks"], previousData);

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate("deck-1");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Cannot delete default deck");

    expect(queryClient.getQueryData(["decks"])).toEqual(previousData);
  });

  it("uses default error message when response has no body", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () => Promise.reject(new Error()),
        }) as Promise<Response>,
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate("deck-1");
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to delete deck");
  });

  it("invalidates decks query after mutation settles", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
        }) as Promise<Response>,
    );

    const queryClient = new QueryClient();

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteDeck(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate("deck-1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["decks"],
    });
  });
});
