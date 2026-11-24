import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";
import { useAvailableLanguages } from "@/hooks/useAvailableLanguages";
import { useAppStore } from "@/lib/initializations/store";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { resolveLanguages } from "@/helpers/language-resolver";

vi.mock("@/hooks/useAvailableLanguages");
vi.mock("@/lib/initializations/store");
vi.mock("@/hooks/useZodSearchParams");
vi.mock("@/helpers/language-resolver");

const mockSet = vi.fn();
const mockSetPreferredSourceLanguage = vi.fn();
const mockSetPreferredTranslationLanguage = vi.fn();

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
    setPreferredSourceLanguage: mockSetPreferredSourceLanguage,
    setPreferredTranslationLanguage: mockSetPreferredTranslationLanguage,
  } as any);

  vi.mocked(useZodSearchParams).mockReturnValue({
    params: {
      src: "ja",
      trans: "fr",
    },
    set: mockSet,
  } as any);

  vi.mocked(resolveLanguages).mockReturnValue({
    sourceLanguage: "ja",
    translationLanguage: "fr",
    availableSourceLanguages: ["en", "ja"],
    availableTranslationLanguages: ["de", "fr"],
  });
});

describe("useLibraryLanguages", () => {
  it("returns resolved languages", () => {
    const { result } = renderHook(() => useLibraryLanguages());

    expect(result.current.source.value).toBe("ja");
    expect(result.current.translation.value).toBe("fr");

    expect(result.current.source.available).toEqual(["en", "ja"]);
    expect(result.current.translation.available).toEqual(["de", "fr"]);
  });

  it("passes the correct arguments to resolveLanguages", () => {
    renderHook(() => useLibraryLanguages());

    expect(resolveLanguages).toHaveBeenCalledWith({
      availableSourceLanguages: ["en", "ja"],
      availableTranslationLanguages: ["de", "fr"],
      preferredSourceLanguage: "en",
      preferredTranslationLanguage: "de",
      sourceParam: "ja",
      translationParam: "fr",
    });
  });

  it("uses empty arrays when query data is undefined", () => {
    vi.mocked(useAvailableLanguages).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    renderHook(() => useLibraryLanguages());

    expect(resolveLanguages).toHaveBeenCalledWith({
      availableSourceLanguages: [],
      availableTranslationLanguages: [],
      preferredSourceLanguage: "en",
      preferredTranslationLanguage: "de",
      sourceParam: "ja",
      translationParam: "fr",
    });
  });

  it("updates the source language", () => {
    const { result } = renderHook(() => useLibraryLanguages());

    result.current.source.onChange("es");

    expect(mockSetPreferredSourceLanguage).toHaveBeenCalledWith("es");
    expect(mockSet).toHaveBeenCalledWith({
      src: "es",
    });
  });

  it("updates the translation language", () => {
    const { result } = renderHook(() => useLibraryLanguages());

    result.current.translation.onChange("it");

    expect(mockSetPreferredTranslationLanguage).toHaveBeenCalledWith("it");
    expect(mockSet).toHaveBeenCalledWith({
      trans: "it",
    });
  });

  it("preserves the underlying query state", () => {
    vi.mocked(useAvailableLanguages).mockReturnValue({
      data: {
        availableSourceLanguages: [],
        availableTranslationLanguages: [],
      },
      isLoading: true,
      isFetching: true,
      isError: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useLibraryLanguages());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});
