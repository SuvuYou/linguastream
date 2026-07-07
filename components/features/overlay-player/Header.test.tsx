import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Header from "./Header";
import { useAppStore } from "@/lib/initializations/store";
import { useOverlayLanguages } from "@/hooks/useOverlayLanguages";

vi.mock("@/hooks/useOverlayLanguages", () => ({
  useOverlayLanguages: vi.fn(),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: () => <div data-testid="language-filter" />,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <button
      {...props}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
    />
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseOverlayLanguages = vi.mocked(useOverlayLanguages);

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    autoPlay: false,
    setAutoPlay: vi.fn(),
  });

  mockedUseOverlayLanguages.mockReturnValue({
    source: {
      value: "en",
      available: ["en"],
    },
    translation: {
      value: "de",
      available: ["de"],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Header", () => {
  it("renders search input", () => {
    render(
      <Header
        isOverlayOpen
        isSearchLoading={false}
        onSearchQueryChange={vi.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText(/search word uses/i),
    ).toBeInTheDocument();
  });

  it("renders language filter", () => {
    render(
      <Header
        isOverlayOpen
        isSearchLoading={false}
        onSearchQueryChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
  });

  it("shows loading spinner while searching", () => {
    const { container } = render(
      <Header isOverlayOpen isSearchLoading onSearchQueryChange={vi.fn()} />,
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("debounces search callback", () => {
    const onSearchQueryChange = vi.fn();

    render(
      <Header
        isOverlayOpen
        isSearchLoading={false}
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    const input = screen.getByPlaceholderText(/search word uses/i);

    fireEvent.change(input, {
      target: { value: "hello" },
    });

    expect(onSearchQueryChange).not.toHaveBeenCalledWith("hello");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearchQueryChange).toHaveBeenLastCalledWith("hello");
  });

  it("clears search when overlay is opened", () => {
    const onSearchQueryChange = vi.fn();

    const { rerender } = render(
      <Header
        isOverlayOpen={false}
        isSearchLoading={false}
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/search word uses/i), {
      target: { value: "hello" },
    });

    rerender(
      <Header
        isOverlayOpen
        isSearchLoading={false}
        onSearchQueryChange={onSearchQueryChange}
      />,
    );

    expect(screen.getByPlaceholderText(/search word uses/i)).toHaveValue("");

    expect(onSearchQueryChange).toHaveBeenCalledWith("");
  });

  it("toggles autoplay", () => {
    const setAutoPlay = vi.fn();

    mockedUseAppStore.mockReturnValue({
      autoPlay: false,
      setAutoPlay,
    });

    render(
      <Header
        isOverlayOpen
        isSearchLoading={false}
        onSearchQueryChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("autoplay-toggle"));

    expect(setAutoPlay).toHaveBeenCalledWith(true);
  });
});
