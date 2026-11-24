import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useOverlayLanguages } from "@/hooks/useOverlayLanguages";
import { useAvailableLanguages } from "@/hooks/useAvailableLanguages";
import { useAppStore } from "@/lib/initializations/store";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { resolveLanguages } from "@/helpers/language-resolver";

vi.mock("@/hooks/useAvailableLanguages");
vi.mock("@/lib/initializations/store");
vi.mock("@/hooks/useZodSearchParams");
vi.mock("@/helpers/language-resolver");

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(useAvailableLanguages).mockReturnValue({
    data: {
      availableSourceLanguages: ["en", "ja"],
      availableTranslationLanguages: ["de", "fr"],
    },
    isLoading: false,
    isError: false,
  } as any);

  vi.mocked(useAppStore).mockReturnValue({
    preferredSourceLanguage: "en",
    preferredTranslationLanguage: "de",
  } as any);

  vi.mocked(useZodSearchParams).mockReturnValue({
    params: {
      src: "ja",
      trans: "fr",
    },
  } as any);

  vi.mocked(resolveLanguages)
    .mockReturnValueOnce({
      sourceLanguage: "ja",
      translationLanguage: "fr",
      availableSourceLanguages: ["en", "ja"],
      availableTranslationLanguages: ["de", "fr"],
    })
    .mockReturnValue({
      sourceLanguage: "en",
      translationLanguage: "de",
      availableSourceLanguages: ["en"],
      availableTranslationLanguages: ["de"],
    });
});

describe("useOverlayLanguages", () => {
  it("returns initial resolved languages", () => {
    const { result } = renderHook(() => useOverlayLanguages());

    expect(result.current.source.value).toBe("en");
    expect(result.current.translation.value).toBe("de");
  });

  it("returns available languages", () => {
    const { result } = renderHook(() => useOverlayLanguages());

    expect(result.current.source.available).toEqual(["en"]);
    expect(result.current.translation.available).toEqual(["de"]);
  });

  it("uses available languages from query", () => {
    renderHook(() => useOverlayLanguages());

    expect(resolveLanguages).toHaveBeenCalledWith(
      expect.objectContaining({
        availableSourceLanguages: ["en", "ja"],
        availableTranslationLanguages: ["de", "fr"],
        preferredSourceLanguage: "en",
        preferredTranslationLanguage: "de",
        sourceParam: "ja",
        translationParam: "fr",
      }),
    );
  });

  it("uses empty arrays when language query has no data", () => {
    vi.mocked(useAvailableLanguages).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    renderHook(() => useOverlayLanguages());

    expect(resolveLanguages).toHaveBeenCalledWith(
      expect.objectContaining({
        availableSourceLanguages: [],
        availableTranslationLanguages: [],
      }),
    );
  });

  it("changes source language", () => {
    const { result } = renderHook(() => useOverlayLanguages());

    act(() => {
      result.current.source.onChange("ja");
    });

    expect(result.current.source.value).toBe("en");
  });

  it("changes translation language", () => {
    const { result } = renderHook(() => useOverlayLanguages());

    act(() => {
      result.current.translation.onChange("fr");
    });

    expect(result.current.translation.value).toBe("de");
  });

  it("passes query state through", () => {
    vi.mocked(useAvailableLanguages).mockReturnValue({
      data: {
        availableSourceLanguages: [],
        availableTranslationLanguages: [],
      },
      isLoading: true,
      isError: false,
    } as any);

    const { result } = renderHook(() => useOverlayLanguages());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it("does not use URL params after initialization", () => {
    const { result } = renderHook(() => useOverlayLanguages());

    act(() => {
      result.current.source.onChange("ja");
    });

    expect(useZodSearchParams).toHaveBeenCalledTimes(1);
    expect(result.current.source.value).toBe("en");
  });
});
