import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useSaveCard } from "@/hooks/useSaveCard";
import type { SaveCardParams } from "@/hooks/useSaveCard";

const invalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");

  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries,
    }),
  };
});

const params: SaveCardParams = {
  lemma: "gehen",
  activeWord: {
    word: "geht",
    lang: "de",
    translationLang: "en",
    context: "Er geht nach Hause.",
    contextTranslation: "He goes home.",
    mediaContentId: "media-1",
    startMs: 1000,
    endMs: 2000,
  } as SaveCardParams["activeWord"],
  wordTranslation: "goes",
  profileId: "profile-1",
  definition: "to move from one place to another",
  deckId: "deck-1",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useSaveCard", () => {
  it("starts with default state", () => {
    const { result } = renderHook(() => useSaveCard());

    expect(result.current.saved).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("saves card successfully", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useSaveCard());

    await act(async () => {
      await result.current.save(params);
    });

    expect(fetch).toHaveBeenCalledWith("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deck_id: "deck-1",
        word: "geht",
        lemma: "gehen",
        source_language: "de",
        translation_language: "en",
        word_translation: "goes",
        context_text: "Er geht nach Hause.",
        context_translation: "He goes home.",
        media_content_id: "media-1",
        start_ms: 1000,
        end_ms: 2000,
        word_profile_id: "profile-1",
        contextual_definition: "to move from one place to another",
      }),
    });

    expect(result.current.saved).toBe(true);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBe(null);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["decks"],
    });
  });

  it("sets isSaving while request is pending", async () => {
    let resolve!: (response: Response) => void;

    global.fetch = vi.fn(
      () =>
        new Promise<Response>((res) => {
          resolve = res;
        }),
    );

    const { result } = renderHook(() => useSaveCard());

    act(() => {
      result.current.save(params);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    await act(async () => {
      resolve({ ok: true } as Response);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });

  it("handles API error", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: "Card already exists",
            }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useSaveCard());

    await act(async () => {
      await result.current.save(params);
    });

    expect(result.current.saved).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBe("Card already exists");
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("uses default error for non-Error failures", async () => {
    global.fetch = vi.fn(() => Promise.reject("network failure"));

    const { result } = renderHook(() => useSaveCard());

    await act(async () => {
      await result.current.save(params);
    });

    expect(result.current.error).toBe("Failed to save");
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saved).toBe(false);
  });

  it("resets state", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useSaveCard());

    await act(async () => {
      await result.current.save(params);
    });

    expect(result.current.saved).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.saved).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
