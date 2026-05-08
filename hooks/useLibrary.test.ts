import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { createWrapper } from "@/helpers/tests/providers";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { mockUseLanguages } from "@/helpers/tests/mocks/useLanguages";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => vi.resetAllMocks());

describe("useLibrary hook", () => {
  it("calls fetch with correct query params", async () => {
    mockUseUser.admin();
    mockUseLanguages.selected();

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
    mockUseUser.admin();
    mockUseLanguages.selected();

    global.fetch = vi.fn(() => Promise.reject(new Error("fail")));

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(
      () =>
        useLibrary({
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
    mockUseUser.admin();
    mockUseLanguages.selected();

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
    mockUseUser.admin();
    mockUseLanguages.selected();

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
