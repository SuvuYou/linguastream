import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import SearchBar from "./SearchBar";

vi.mock("@/hooks/useZodSearchParams");

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

describe("SearchBar", () => {
  it("renders with initial query", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "test" },
      set: vi.fn(),
      remove: vi.fn(),
    });

    render(<SearchBar />);

    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });

  it("updates query param after debounce", async () => {
    const setMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "" },
      set: setMock,
      remove: vi.fn(),
    });

    render(<SearchBar />);

    const input = screen.getByPlaceholderText(/search by title/i);

    fireEvent.change(input, { target: { value: "hello" } });

    vi.advanceTimersByTime(10);

    fireEvent.change(input, { target: { value: "hello2" } });

    expect(setMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(setMock).toHaveBeenCalledWith({ q: "hello2" });
  });

  it("removes query param when input is cleared", async () => {
    const removeMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { q: "test" },
      set: vi.fn(),
      remove: removeMock,
    });

    render(<SearchBar />);

    const input = screen.getByDisplayValue("test");

    fireEvent.change(input, { target: { value: "" } });

    vi.advanceTimersByTime(300);

    expect(removeMock).toHaveBeenCalledWith("q");
  });
});
