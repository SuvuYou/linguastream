import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useLanguageSelectors } from "./useLanguageSelectors";
import { AUTO_DETECT } from "@/helpers/const";

const item = {
  source_language: "en",
  subtitle_tracks: [{ language: "en" }, { language: "de" }, { language: "fr" }],
} as any;

describe("useLanguageSelectors", () => {
  it("uses the source language as default", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    expect(result.current.data.selectedSourceLang).toBe("en");
  });

  it("auto-selects translation languages", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    expect(result.current.data.selectedTranslateLangs).toEqual(
      new Set(["de", "fr"]),
    );
  });

  it("changes source language", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.setSelectedSourceLang("de");
    });

    expect(result.current.data.selectedSourceLang).toBe("de");
  });

  it("removes a translation language", () => {
    const onToggleTranslate = vi.fn();

    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate,
      }),
    );

    act(() => {
      result.current.actions.toggleTranslateLang("de");
    });

    expect(result.current.data.selectedTranslateLangs.has("de")).toBe(false);
    expect(onToggleTranslate).toHaveBeenCalledWith("de");
  });

  it("adds a translation language", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.toggleTranslateLang("es");
    });

    expect(result.current.data.selectedTranslateLangs.has("es")).toBe(true);
  });

  it("reports removed translation languages", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    act(() => {
      result.current.actions.toggleTranslateLang("de");
    });

    expect(result.current.data.removedTranslationLangs).toEqual(["de"]);
  });

  it("returns AUTO_DETECT when source language is unknown", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item: {
          ...item,
          source_language: "unknown",
        },
        onToggleTranslate: vi.fn(),
      }),
    );

    expect(result.current.data.selectedSourceLang).toBe(AUTO_DETECT);
  });

  it("checks whether the source language exists", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    expect(result.current.checks.isSourceLanguageExisting).toBe(true);
  });

  it("checks selected translation languages", () => {
    const { result } = renderHook(() =>
      useLanguageSelectors({
        item,
        onToggleTranslate: vi.fn(),
      }),
    );

    expect(result.current.checks.isTranslationLanguageSelected("de")).toBe(
      true,
    );

    expect(result.current.checks.isTranslationLanguageSelected("es")).toBe(
      false,
    );
  });
});
