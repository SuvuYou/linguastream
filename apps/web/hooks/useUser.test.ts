import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/helpers/tests/providers";
import { useUser } from "@/hooks/useUser";

beforeEach(() => vi.resetAllMocks());

describe("useUser hook", () => {
  it("returns user data", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "u1",
              email: "test@example.com",
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data?.id).toBe("u1");
    });
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("fail")));

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
