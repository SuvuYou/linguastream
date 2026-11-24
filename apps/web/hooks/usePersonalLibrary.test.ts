import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { usePersonalLibrary } from "@/hooks/usePersonalLibrary";
import { createWrapper } from "@/helpers/tests/providers";

vi.mock("@/hooks/useLibraryLanguages", () => ({
  useLibraryLanguages: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";

const mockUseLibraryLanguages = vi.mocked(useLibraryLanguages);
const mockUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => {
  vi.resetAllMocks();

  mockUseLibraryLanguages.mockReturnValue({
    source: { value: "en" },
    translation: { value: "de" },
    isLoading: false,
  } as ReturnType<typeof useLibraryLanguages>);

  mockUseZodSearchParams.mockReturnValue({
    params: {
      page: 1,
      type: "all",
      q: "",
    },
  } as ReturnType<typeof useZodSearchParams>);
});

describe("usePersonalLibrary", () => {
  it("does not fetch while languages are loading", () => {
    mockUseLibraryLanguages.mockReturnValue({
      source: { value: "" },
      translation: { value: "" },
      isLoading: true,
    } as ReturnType<typeof useLibraryLanguages>);

    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => usePersonalLibrary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch without both languages", () => {
    mockUseLibraryLanguages.mockReturnValue({
      source: { value: "en" },
      translation: { value: "" },
      isLoading: false,
    } as ReturnType<typeof useLibraryLanguages>);

    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { result } = renderHook(() => usePersonalLibrary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches personal library successfully", async () => {
    const response = {
      items: [{ id: "item-1" }],
      total: 1,
      pageCount: 1,
    };

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => usePersonalLibrary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(response);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/library-personal?page=1&src=en&trans=de",
    );
  });

  it("includes type and search query parameters", async () => {
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

    mockUseZodSearchParams.mockReturnValue({
      params: {
        page: 2,
        type: "video",
        q: "house",
      },
    } as ReturnType<typeof useZodSearchParams>);

    renderHook(() => usePersonalLibrary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/library-personal?page=2&type=video&q=house&src=en&trans=de",
      );
    });
  });

  it("handles fetch errors", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => usePersonalLibrary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch");
  });
});
