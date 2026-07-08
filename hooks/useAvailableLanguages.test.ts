import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import {
  useAvailableLanguages,
  DEFAULT_LANGUAGES_RESPONSE,
} from "@/hooks/useAvailableLanguages";
import { createWrapper } from "@/helpers/tests/providers";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useAvailableLanguages hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);

    const { result } = renderHook(() => useAvailableLanguages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useAvailableLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Failed to fetch languages");
  });

  it("returns available languages", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              availableSourceLanguages: ["en", "ja"],
              availableTranslationLanguages: ["de", "fr"],
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useAvailableLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual({
      availableSourceLanguages: ["en", "ja"],
      availableTranslationLanguages: ["de", "fr"],
    });
  });

  it("calls the correct API endpoint", async () => {
    const fetchMock = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DEFAULT_LANGUAGES_RESPONSE),
        }) as Promise<Response>,
    );

    global.fetch = fetchMock;

    renderHook(() => useAvailableLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/languages");
  });

  it("exports the default empty response", () => {
    expect(DEFAULT_LANGUAGES_RESPONSE).toEqual({
      availableSourceLanguages: [],
      availableTranslationLanguages: [],
    });
  });
});
