import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SearchBar from "./SearchBar";

vi.mock("@/hooks/useZodSearchParams");

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("SearchBar", () => {
  it("renders with initial query", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "test" },
      set: vi.fn(),
      remove: vi.fn(),
    } as any);

    render(<SearchBar />);

    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });

  it("renders empty input when there is no query", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: {},
      set: vi.fn(),
      remove: vi.fn(),
    } as any);

    render(<SearchBar />);

    expect(
      screen.getByPlaceholderText(/search words in this deck/i),
    ).toHaveValue("");
  });

  it("updates query param after debounce and resets page", () => {
    const setMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: {},
      set: setMock,
      remove: vi.fn(),
    } as any);

    render(<SearchBar />);

    const input = screen.getByPlaceholderText(/search words in this deck/i);

    fireEvent.change(input, { target: { value: "hello" } });

    expect(setMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(setMock).toHaveBeenNthCalledWith(1, { q: "hello" });
    expect(setMock).toHaveBeenNthCalledWith(2, { page: 0 });
  });

  it("debounces multiple changes", () => {
    const setMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: {},
      set: setMock,
      remove: vi.fn(),
    } as any);

    render(<SearchBar />);

    const input = screen.getByPlaceholderText(/search words in this deck/i);

    fireEvent.change(input, { target: { value: "hello" } });

    vi.advanceTimersByTime(100);

    fireEvent.change(input, { target: { value: "hello2" } });

    vi.advanceTimersByTime(299);

    expect(setMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(setMock).toHaveBeenNthCalledWith(1, { q: "hello2" });
    expect(setMock).toHaveBeenNthCalledWith(2, { page: 0 });
  });

  it("removes query param when input is cleared", () => {
    const setMock = vi.fn();
    const removeMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "test" },
      set: setMock,
      remove: removeMock,
    } as any);

    render(<SearchBar />);

    const input = screen.getByDisplayValue("test");

    fireEvent.change(input, { target: { value: "" } });

    vi.advanceTimersByTime(300);

    expect(removeMock).toHaveBeenCalledWith("q");
    expect(setMock).toHaveBeenCalledWith({ page: 0 });
  });
});
