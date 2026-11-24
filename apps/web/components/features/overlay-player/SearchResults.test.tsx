import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchResults from "./SearchResults";

// Mock UI components
vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children, className }: any) => (
    <div data-testid="empty" className={className}>
      {children}
    </div>
  ),
  EmptyHeader: ({ children }: any) => <div>{children}</div>,
  EmptyTitle: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: (props: any) => <div data-testid="spinner" {...props} />,
}));

vi.mock("@/components/ui/item", () => {
  const React = require("react");

  const Item = React.forwardRef(
    ({ children, className, ...props }: any, ref: any) => (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    ),
  );

  Item.displayName = "Item";

  return {
    Item,
    ItemContent: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    ItemTitle: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    ItemDescription: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  };
});

vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | false | undefined | null)[]) =>
    classes.filter(Boolean).join(" "),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

const results = [
  {
    id: "1",
    media_title: "Movie A",
    start_ms: 65000,
    source_text: "Hello world",
    translation_text: "Hola mundo",
  },
  {
    id: "2",
    media_title: "Movie B",
    start_ms: 120000,
    source_text: "Goodbye",
    translation_text: null,
  },
];

const queryResult: any = {
  data: {
    results,
  },
  isLoading: false,
};

function renderComponent(overrides = {}) {
  const onSelect = vi.fn();

  const utils = render(
    <SearchResults
      searchQuery="hello"
      searchResults={queryResult}
      selectedItem={null}
      onSelect={onSelect}
      {...overrides}
    />,
  );

  return {
    ...utils,
    onSelect,
  };
}

describe("SearchResults", () => {
  it("renders empty state for blank query", () => {
    render(
      <SearchResults
        searchQuery=""
        searchResults={queryResult}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/start typing to search/i)).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(
      <SearchResults
        searchQuery="hello"
        searchResults={{
          ...queryResult,
          isLoading: true,
        }}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders no results state", () => {
    render(
      <SearchResults
        searchQuery="missing"
        searchResults={{
          ...queryResult,
          data: {
            results: [],
          },
        }}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("renders all results", () => {
    renderComponent();

    expect(screen.getByText("Movie A")).toBeInTheDocument();
    expect(screen.getByText("Movie B")).toBeInTheDocument();

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Goodbye")).toBeInTheDocument();

    expect(screen.getByText("Hola mundo")).toBeInTheDocument();

    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
  });

  it("calls onSelect when clicking an item", async () => {
    const user = userEvent.setup();

    const { onSelect } = renderComponent();

    await user.click(screen.getByText("Hello world"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(results[0]);
  });

  it("marks the selected item", () => {
    renderComponent({
      selectedItem: results[1],
    });

    const options = screen.getAllByRole("option");

    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("focuses the first result on ArrowDown", () => {
    renderComponent();

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-0",
    );
  });

  it("focuses the last result on ArrowUp when nothing is focused", () => {
    renderComponent();

    fireEvent.keyDown(window, {
      key: "ArrowUp",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-1",
    );
  });

  it("moves focus between items", () => {
    renderComponent();

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-0",
    );

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-1",
    );

    fireEvent.keyDown(window, {
      key: "ArrowUp",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-0",
    );
  });

  it("does not move past the last result", () => {
    renderComponent();

    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-1",
    );
  });

  it("does not move above the first result", () => {
    renderComponent();

    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowUp" });
    fireEvent.keyDown(window, { key: "ArrowUp" });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-0",
    );
  });

  it("selects the focused item on Enter", () => {
    const { onSelect } = renderComponent();

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    fireEvent.keyDown(window, {
      key: "Enter",
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(results[0]);
  });

  it("clears focus when the search query changes", () => {
    const { rerender } = render(
      <SearchResults
        searchQuery="hello"
        searchResults={queryResult}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-activedescendant",
      "search-result-0",
    );

    rerender(
      <SearchResults
        searchQuery="goodbye"
        searchResults={queryResult}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("listbox")).not.toHaveAttribute(
      "aria-activedescendant",
    );
  });

  it("calls scrollIntoView when focus changes", () => {
    const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView");

    renderComponent();

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(scrollSpy).toHaveBeenCalledWith({
      block: "nearest",
      behavior: "smooth",
    });
  });

  it("does nothing on Enter when no item is focused", () => {
    const { onSelect } = renderComponent();

    fireEvent.keyDown(window, {
      key: "Enter",
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("ignores keyboard navigation when there are no results", () => {
    render(
      <SearchResults
        searchQuery="hello"
        searchResults={{
          ...queryResult,
          data: { results: [] },
        }}
        selectedItem={null}
        onSelect={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, {
      key: "ArrowDown",
    });

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });
});
