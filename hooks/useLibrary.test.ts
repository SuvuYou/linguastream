import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { createWrapper } from "@/helpers/tests/providers";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => vi.resetAllMocks());

describe("useLibrary hook", () => {
  it("does not fetch when disabled", () => {
    global.fetch = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    renderHook(
      () =>
        useLibrary({
          enabled: false,
          selectedSourceLanguage: "en",
          selectedTranslationLanguage: "en",
        }),
      { wrapper: createWrapper() },
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("calls fetch with correct query params", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [],
              total: 0,
              pageCount: 0,
            }),
        }) as Promise<Response>,
    );

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "test", page: 2, unreg: true },
      set: vi.fn(),
      remove: vi.fn(),
    });

    renderHook(
      () =>
        useLibrary({
          enabled: true,
          selectedSourceLanguage: "en",
          selectedTranslationLanguage: "en",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const fetchMock = vi.mocked(global.fetch);
    const url = fetchMock.mock.calls[0][0];

    expect(url).toContain("q=test");
    expect(url).toContain("page=2");
    expect(url).toContain("unreg=true");
    expect(url).toContain("selectedSrc=en");
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("fail")));

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useLibrary({
          enabled: true,
          selectedSourceLanguage: "en",
          selectedTranslationLanguage: "en",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("returns library data", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [{ id: 1 }],
              total: 1,
              pageCount: 1,
            }),
        }) as Promise<Response>,
    );

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useLibrary({
          enabled: true,
          selectedSourceLanguage: "en",
          selectedTranslationLanguage: "en",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data?.total).toBe(1);
    });
  });

  it("updates query when params change", async () => {
    const params = { q: "a", page: 0, unreg: false };

    mockedUseZodSearchParams.mockImplementation(() => ({
      params,
      set: vi.fn(),
      remove: vi.fn(),
    }));

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DEFAULT_LIBRARY_RESPONSE),
        }) as Promise<Response>,
    );

    const { rerender } = renderHook(
      ({ q }) =>
        useLibrary({
          enabled: true,
          selectedSourceLanguage: q,
          selectedTranslationLanguage: "en",
        }),
      {
        wrapper: createWrapper(),
        initialProps: { q: "en" },
      },
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    rerender({ q: "de" });

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });
});
