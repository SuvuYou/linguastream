import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { createWrapper } from "@/helpers/tests/providers";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { useUser } from "@/hooks/useUser";
import { UseQueryResult } from "@tanstack/react-query";
import { useLanguages } from "@/hooks/useLanguages";
import { User } from "@prisma/client";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const DEFAULT_LANGUAGE_RESPONSE = {
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: "",
  selectedTranslationLanguage: undefined,
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};

const mockedUseUser = vi.mocked(useUser);
const mockedUseLanguages = vi.mocked(useLanguages);
const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => vi.resetAllMocks());

describe("useLibrary hook", () => {
  it("calls fetch with correct query params", async () => {
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
    });

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
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
    });

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
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
    });

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
    mockedUseUser.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { is_admin: true },
    } as UseQueryResult<User>);

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "en",
    });

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
