import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchBar from "./SearchBar";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

const set = vi.fn();
const remove = vi.fn();

function mockParams(q?: string) {
  mockedUseZodSearchParams.mockReturnValue({
    params: q ? { q } : {},
    set,
    remove,
  } as ReturnType<typeof useZodSearchParams>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockParams();
});

describe("SearchBar", () => {
  it("renders the search input", () => {
    render(<SearchBar />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
  });

  it("renders the provided placeholder", () => {
    render(<SearchBar placeholder="Search library..." />);

    expect(
      screen.getByPlaceholderText("Search library..."),
    ).toBeInTheDocument();
  });

  it("uses the query from URL params as the initial value", () => {
    mockParams("existing query");

    render(<SearchBar />);

    expect(screen.getByTestId("search-bar")).toHaveValue("existing query");
  });

  it("starts with an empty query when no URL query exists", () => {
    render(<SearchBar />);

    expect(screen.getByTestId("search-bar")).toHaveValue("");
  });

  it("updates the input immediately", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const input = screen.getByTestId("search-bar");

    await user.type(input, "hello");

    expect(input).toHaveValue("hello");
  });

  it("sets the query after 300ms", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const input = screen.getByTestId("search-bar");

    await user.type(input, "hello");

    await waitFor(() => {
      expect(set).toHaveBeenCalledWith({
        q: "hello",
      });
    });

    expect(set).toHaveBeenCalledWith({
      page: 0,
    });
  });

  it("removes the query when the input is cleared", async () => {
    const user = userEvent.setup();

    mockParams("hello");

    render(<SearchBar />);

    const input = screen.getByTestId("search-bar");

    await user.clear(input);

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith("q");
    });

    expect(set).toHaveBeenCalledWith({
      page: 0,
    });
  });

  it("resets the page when the search changes", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const input = screen.getByTestId("search-bar");

    await user.type(input, "test");

    await waitFor(() => {
      expect(set).toHaveBeenCalledWith({
        page: 0,
      });
    });
  });

  it("debounces rapid changes", async () => {
    const user = userEvent.setup();

    render(<SearchBar />);

    const input = screen.getByTestId("search-bar");

    await user.type(input, "a");

    await new Promise((resolve) => setTimeout(resolve, 200));

    await user.type(input, "b");

    await waitFor(() => {
      expect(set).toHaveBeenCalledWith({
        q: "ab",
      });
    });

    expect(set.mock.calls.filter(([value]) => value?.q === "ab")).toHaveLength(
      1,
    );

    expect(set).toHaveBeenCalledWith({
      page: 0,
    });
  });

  it("shows the clear button when a query exists", () => {
    mockParams("hello");

    render(<SearchBar />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("clears the query when the clear button is clicked", async () => {
    const user = userEvent.setup();

    mockParams("hello");

    render(<SearchBar />);

    const button = screen.getByRole("button");

    await user.click(button);

    expect(screen.getByTestId("search-bar")).toHaveValue("");

    await waitFor(() => {
      expect(remove).toHaveBeenCalledWith("q");
    });

    expect(set).toHaveBeenCalledWith({
      page: 0,
    });
  });

  it("does not show the clear button while pending", () => {
    mockParams("hello");

    render(<SearchBar />);

    expect(screen.getByTestId("search-bar")).not.toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
