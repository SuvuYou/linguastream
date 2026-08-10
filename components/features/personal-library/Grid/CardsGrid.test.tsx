import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CardsGrid from "./CardsGrid";
import { usePersonalLibrary } from "@/hooks/usePersonalLibrary";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";

vi.mock("@/hooks/usePersonalLibrary", () => ({
  DEFAULT_LIBRARY_RESPONSE: {
    items: [],
    pageCount: 0,
  },
  usePersonalLibrary: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

vi.mock("./PersonalCard", () => ({
  default: ({ item }: { item: { id: string; title: string } }) => (
    <div>{item.title}</div>
  ),
}));

vi.mock("./AddNewCard", () => ({
  default: ({ onAdd }: { onAdd: () => void }) => (
    <button onClick={onAdd}>Add Content</button>
  ),
}));

vi.mock("@/components/features/library/LibrarySkeleton", () => ({
  default: () => <div data-testid="library-skeleton" />,
}));

vi.mock("@/components/primitives/PaginationControls", () => ({
  default: ({
    page,
    pageCount,
    onPageChange,
  }: {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <span>
        Page {page} of {pageCount}
      </span>
      <button onClick={() => onPageChange(page + 1)}>Next page</button>
    </div>
  ),
}));

vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const mockedUsePersonalLibrary = vi.mocked(usePersonalLibrary);
const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

describe("CardsGrid", () => {
  const openAddModal = vi.fn();
  const setParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseZodSearchParams.mockReturnValue({
      params: { page: 0 },
      set: setParams,
    } as any);
  });

  it("renders library cards", () => {
    mockedUsePersonalLibrary.mockReturnValue({
      data: {
        items: [
          { id: "1", title: "Movie One" },
          { id: "2", title: "Movie Two" },
        ],
        pageCount: 1,
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    expect(screen.getByText("Movie One")).toBeInTheDocument();
    expect(screen.getByText("Movie Two")).toBeInTheDocument();
  });

  it("renders skeleton while loading", () => {
    mockedUsePersonalLibrary.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    expect(screen.getByTestId("library-skeleton")).toBeInTheDocument();
  });

  it("renders skeleton while languages are loading", () => {
    mockedUsePersonalLibrary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    render(<CardsGrid isLanguagesLoading openAddModal={openAddModal} />);

    expect(screen.getByTestId("library-skeleton")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockedUsePersonalLibrary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    expect(screen.getByText("Failed to load library")).toBeInTheDocument();
    expect(
      screen.getByText("Please try refreshing the page."),
    ).toBeInTheDocument();
  });

  it("calls openAddModal when Add Content is clicked", async () => {
    const user = userEvent.setup();

    mockedUsePersonalLibrary.mockReturnValue({
      data: {
        items: [],
        pageCount: 0,
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    await user.click(screen.getByRole("button", { name: "Add Content" }));

    expect(openAddModal).toHaveBeenCalledOnce();
  });

  it("renders pagination when there are multiple pages", () => {
    mockedUsePersonalLibrary.mockReturnValue({
      data: {
        items: [],
        pageCount: 3,
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    expect(screen.getByText("Page 0 of 3")).toBeInTheDocument();
  });

  it("changes page through pagination", async () => {
    const user = userEvent.setup();

    mockedUsePersonalLibrary.mockReturnValue({
      data: {
        items: [],
        pageCount: 3,
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <CardsGrid isLanguagesLoading={false} openAddModal={openAddModal} />,
    );

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(setParams).toHaveBeenCalledWith({ page: 1 });
  });
});
