import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/helpers/tests/providers";
import { useUser } from "@/hooks/useUser";

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("useUser hook", () => {
  it("returns the user from GET /api/user", async () => {
    mockFetch(200, {
      id: "u1",
      email: "test@example.com",
      display_name: null,
      native_language: "uk",
      learning_language: "de",
      is_admin: false,
    });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data?.id).toBe("u1"));
    expect(fetch).toHaveBeenCalledWith("/api/user", { method: "GET" });
  });

  it("errors when the response doesn't match the contract", async () => {
    mockFetch(200, { id: "u1", email: "test@example.com" });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.name).toBe("ApiContractError");
  });

  it("errors when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
