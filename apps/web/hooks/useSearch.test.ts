import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSearch } from "@/hooks/useSearch";
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => vi.resetAllMocks());

describe("useSearch hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(
      () =>
        useSearch({
          enabled: true,
          query: "test",
          sourceLanguage: "en",
          translationLanguage: "de",
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: false }) as Promise<Response>,
    );

    const { result } = renderHook(
      () =>
        useSearch({
          enabled: true,
          query: "test",
          sourceLanguage: "en",
          translationLanguage: "de",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("returns search results", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: "1",
                  text: "hello",
                },
              ],
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(
      () =>
        useSearch({
          enabled: true,
          query: "hello",
          sourceLanguage: "en",
          translationLanguage: "de",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data?.results).toHaveLength(1);
      expect(result.current.data?.results[0].id).toBe("1");
    });
  });

  it("does not run when disabled", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    renderHook(
      () =>
        useSearch({
          enabled: false,
          query: "hello",
          sourceLanguage: "en",
          translationLanguage: "de",
        }),
      { wrapper: createWrapper() },
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
