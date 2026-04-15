import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguages } from "./useLanguages";
import { renderHook, waitFor } from "@testing-library/react";
import { useAppStore } from "@/lib/initializations/store";
import { useZodSearchParams } from "./useZodSearchParams";
import { createWrapper } from "@/helpers/tests/providers";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("./useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => vi.resetAllMocks());

describe("useLangauges hook", () => {
  it("returns loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {}) as Promise<Response>);
    mockedUseAppStore.mockReturnValue({});
    mockedUseZodSearchParams.mockReturnValue({
      params: { src: "en", sub: "en" },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles fetch error", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: false }) as Promise<Response>,
    );

    mockedUseAppStore.mockReturnValue({
      preferredSourceLanguage: null,
      preferredSubtitleLanguage: null,
    });

    mockedUseZodSearchParams.mockReturnValue({
      params: { src: "en", sub: "en" },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("returns available languages from API", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              availableSourceLanguages: ["en", "de"],
              availableSubtitleLanguages: ["es"],
            }),
        }) as Promise<Response>,
    );

    mockedUseAppStore.mockReturnValue({
      preferredSourceLanguage: null,
      preferredSubtitleLanguage: null,
    });

    mockedUseZodSearchParams.mockReturnValue({
      params: {},
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.availableSourceLanguages).toEqual(["en", "de"]);
      expect(result.current.selectedSourceLanguage).toBe("en");
    });
  });

  it("uses source language from URL if valid", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              availableSourceLanguages: ["en", "de"],
              availableSubtitleLanguages: [],
            }),
        }) as Promise<Response>,
    );

    mockedUseAppStore.mockReturnValue({});
    mockedUseZodSearchParams.mockReturnValue({
      params: { src: "de" },
      set: vi.fn(),
      remove: vi.fn(),
    });

    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.selectedSourceLanguage).toBe("de");
    });
  });

  it("sets preferred source language if none in URL", async () => {
    const setMock = vi.fn();

    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              availableSourceLanguages: ["en"],
              availableSubtitleLanguages: [],
            }),
        }) as Promise<Response>,
    );

    mockedUseAppStore.mockReturnValue({
      preferredSourceLanguage: "en",
      preferredSubtitleLanguage: "en",
    });

    mockedUseZodSearchParams.mockReturnValue({
      params: {},
      set: setMock,
      remove: vi.fn(),
    });

    renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(setMock).toHaveBeenCalledWith({ src: "en" });
      expect(setMock).toHaveBeenCalledWith({ sub: "en" });
    });
  });
});
