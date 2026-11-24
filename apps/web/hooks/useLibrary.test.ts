import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { createWrapper } from "@/helpers/tests/providers";
import { DEFAULT_LIBRARY_RESPONSE, useLibrary } from "@/hooks/useLibrary";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useLibrary", () => {
  it("calls fetch with correct query params", async () => {
    mockUseUser.admin();

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
          areLanguagesSelected: true,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const url = vi.mocked(global.fetch).mock.calls[0][0] as string;

    expect(url).toContain("q=test");
    expect(url).toContain("page=2");
    expect(url).toContain("unreg=true");
    expect(url).toContain("selectedSrc=en");
    expect(url).toContain("selectedTrans=en");
  });

  it("handles fetch error", async () => {
    mockUseUser.admin();

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
          areLanguagesSelected: true,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("returns library data", async () => {
    mockUseUser.admin();

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
          areLanguagesSelected: true,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.data?.total).toBe(1);
    });
  });

  it("refetches when selected source language changes", async () => {
    mockUseUser.admin();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "a", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DEFAULT_LIBRARY_RESPONSE),
        }) as Promise<Response>,
    );

    const { rerender } = renderHook(
      ({ src }) =>
        useLibrary({
          selectedSourceLanguage: src,
          selectedTranslationLanguage: "en",
          areLanguagesSelected: true,
        }),
      {
        wrapper: createWrapper(),
        initialProps: { src: "en" },
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    rerender({ src: "de" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("does not fetch when languages are not selected", () => {
    mockUseUser.base();

    global.fetch = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    renderHook(
      () =>
        useLibrary({
          selectedSourceLanguage: "",
          selectedTranslationLanguage: "",
          areLanguagesSelected: false,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches for admin when unregistered filter is enabled even if languages are not selected", async () => {
    mockUseUser.admin();

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DEFAULT_LIBRARY_RESPONSE),
        }) as Promise<Response>,
    );

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "", page: 0, unreg: true },
      set: vi.fn(),
      remove: vi.fn(),
    });

    renderHook(
      () =>
        useLibrary({
          selectedSourceLanguage: "",
          selectedTranslationLanguage: "",
          areLanguagesSelected: false,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
