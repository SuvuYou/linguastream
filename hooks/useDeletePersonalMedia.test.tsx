import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useDeletePersonalMedia } from "@/hooks/useDeletePersonalMedia";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useDeletePersonalMedia hook", () => {
  it("returns idle state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useDeletePersonalMedia(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isIdle).toBe(true);
  });

  it("returns loading state while deleting", async () => {
    let resolveRequest!: (value: Response | PromiseLike<Response>) => void;

    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );

    global.fetch = fetchMock;

    const { result } = renderHook(() => useDeletePersonalMedia(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("media-123");
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    await act(async () => {
      resolveRequest({
        ok: true,
        json: () =>
          Promise.resolve({
            deletedCount: 1,
          }),
      } as Response);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
