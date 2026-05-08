import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchOverlay } from "@/hooks/useSearchOverlay";
import { useAppStore } from "@/lib/initializations/store";
import Events from "@/events";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/events", () => ({
  default: {
    overlay: {
      toggleOverlay: vi.fn(),
    },
  },
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedToggleOverlay = vi.mocked(Events.overlay.toggleOverlay);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useSearchOverlay", () => {
  it("returns overlay state from store", () => {
    mockedUseAppStore.mockReturnValue({
      overlayOpen: true,
      setOverlayOpen: vi.fn(),
    });

    const { result } = renderHook(() => useSearchOverlay());

    expect(result.current.isOpen).toBe(true);
  });

  it("opens overlay via open()", () => {
    const setOverlayOpen = vi.fn();

    mockedUseAppStore.mockReturnValue({
      overlayOpen: false,
      setOverlayOpen,
    });

    const { result } = renderHook(() => useSearchOverlay());

    act(() => {
      result.current.open();
    });

    expect(setOverlayOpen).toHaveBeenCalledWith(true);
    expect(mockedToggleOverlay).toHaveBeenCalledWith(true);
  });

  it("closes overlay via close()", () => {
    const setOverlayOpen = vi.fn();

    mockedUseAppStore.mockReturnValue({
      overlayOpen: true,
      setOverlayOpen,
    });

    const { result } = renderHook(() => useSearchOverlay());

    act(() => {
      result.current.close();
    });

    expect(setOverlayOpen).toHaveBeenCalledWith(false);
    expect(mockedToggleOverlay).toHaveBeenCalledWith(false);
  });

  it("toggles overlay with Ctrl+K keyboard shortcut", () => {
    const setOverlayOpen = vi.fn();

    mockedUseAppStore.mockReturnValue({
      overlayOpen: false,
      setOverlayOpen,
    });

    renderHook(() => useSearchOverlay());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
        }),
      );
    });

    expect(setOverlayOpen).toHaveBeenCalledWith(true);
    expect(mockedToggleOverlay).toHaveBeenCalledWith(true);
  });

  it("closes overlay with Escape key", () => {
    const setOverlayOpen = vi.fn();

    mockedUseAppStore.mockReturnValue({
      overlayOpen: true,
      setOverlayOpen,
    });

    renderHook(() => useSearchOverlay());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
        }),
      );
    });

    expect(setOverlayOpen).toHaveBeenCalledWith(false);
    expect(mockedToggleOverlay).toHaveBeenCalledWith(false);
  });
});
