import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useWatchLanguages } from "@/hooks/useWatchLanguages";
import { useAppStore } from "@/lib/initializations/store";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const setPreferredTranslationLanguage = vi.fn();
const setParams = vi.fn();

const mockUseAppStore = vi.mocked(useAppStore);
const mockUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => {
  vi.resetAllMocks();

  mockUseAppStore.mockReturnValue({
    preferredTranslationLanguage: "de",
    setPreferredTranslationLanguage,
  } as ReturnType<typeof useAppStore>);

  mockUseZodSearchParams.mockReturnValue({
    params: {
      trans: "fr",
    },
    set: setParams,
  } as ReturnType<typeof useZodSearchParams>);
});

describe("useWatchLanguages", () => {
  it("returns resolved source and translation languages", () => {
    const { result } = renderHook(() =>
      useWatchLanguages({
        sourceLanguage: "en",
        translationLanguages: ["de", "fr"],
      }),
    );

    expect(result.current.source).toEqual({
      value: "en",
      available: ["en"],
    });

    expect(result.current.translation.available).toEqual(["de", "fr"]);
    expect(result.current.translation.value).toBe("fr");
  });

  it("updates preferred translation language and URL param", () => {
    const { result } = renderHook(() =>
      useWatchLanguages({
        sourceLanguage: "en",
        translationLanguages: ["de", "fr"],
      }),
    );

    act(() => {
      result.current.translation.onChange("de");
    });

    expect(setPreferredTranslationLanguage).toHaveBeenCalledWith("de");
    expect(setParams).toHaveBeenCalledWith({
      trans: "de",
    });
  });

  it("exposes the resolved translation language from the URL param", () => {
    mockUseZodSearchParams.mockReturnValue({
      params: {
        trans: "de",
      },
      set: setParams,
    } as ReturnType<typeof useZodSearchParams>);

    const { result } = renderHook(() =>
      useWatchLanguages({
        sourceLanguage: "en",
        translationLanguages: ["de", "fr"],
      }),
    );

    expect(result.current.translation.value).toBe("de");
  });
});
