import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useDeckSelection } from "@/hooks/useDeckSelection";

import { useDecks } from "@/hooks/useDecks";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/hooks/useDecks", () => ({
  useDecks: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

const mockedUseDecks = vi.mocked(useDecks);
const mockedUseAppStore = vi.mocked(useAppStore);

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    preferredSourceLanguage: "en",
  } as ReturnType<typeof useAppStore>);
});

describe("useDeckSelection hook", () => {
  it("returns empty decks when data is not loaded", () => {
    mockedUseDecks.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useDecks>);

    const { result } = renderHook(() => useDeckSelection());

    expect(result.current.decks).toEqual([]);
    expect(result.current.defaultDeck).toBeNull();
    expect(result.current.selectedDeckId).toBeUndefined();
  });

  it("passes preferred source language to useDecks", () => {
    mockedUseDecks.mockReturnValue({
      data: {
        decks: [],
      },
    } as ReturnType<typeof useDecks>);

    renderHook(() => useDeckSelection());

    expect(useDecks).toHaveBeenCalledWith("en");
  });

  it("selects default deck when available", () => {
    mockedUseDecks.mockReturnValue({
      data: {
        decks: [
          {
            id: "deck-1",
            name: "German",
            is_default: false,
          },
          {
            id: "deck-2",
            name: "English",
            is_default: true,
          },
        ],
      },
    } as ReturnType<typeof useDecks>);

    const { result } = renderHook(() => useDeckSelection());

    expect(result.current.defaultDeck).toEqual({
      id: "deck-2",
      name: "English",
      is_default: true,
    });

    expect(result.current.selectedDeckId).toBe("deck-2");
  });

  it("falls back to first deck when no default exists", () => {
    mockedUseDecks.mockReturnValue({
      data: {
        decks: [
          {
            id: "deck-1",
            name: "German",
            is_default: false,
          },
          {
            id: "deck-2",
            name: "English",
            is_default: false,
          },
        ],
      },
    } as ReturnType<typeof useDecks>);

    const { result } = renderHook(() => useDeckSelection());

    expect(result.current.defaultDeck).toEqual({
      id: "deck-1",
      name: "German",
      is_default: false,
    });

    expect(result.current.selectedDeckId).toBe("deck-1");
  });

  it("allows selecting a deck manually", () => {
    mockedUseDecks.mockReturnValue({
      data: {
        decks: [
          {
            id: "deck-1",
            name: "German",
            is_default: true,
          },
          {
            id: "deck-2",
            name: "English",
            is_default: false,
          },
        ],
      },
    } as ReturnType<typeof useDecks>);

    const { result } = renderHook(() => useDeckSelection());

    act(() => {
      result.current.setSelectedDeckId("deck-2");
    });

    expect(result.current.selectedDeckId).toBe("deck-2");
  });

  it("keeps selected deck instead of default deck", () => {
    mockedUseDecks.mockReturnValue({
      data: {
        decks: [
          {
            id: "deck-1",
            name: "German",
            is_default: true,
          },
        ],
      },
    } as ReturnType<typeof useDecks>);

    const { result } = renderHook(() => useDeckSelection());

    act(() => {
      result.current.setSelectedDeckId("custom-deck");
    });

    expect(result.current.selectedDeckId).toBe("custom-deck");
  });
});
