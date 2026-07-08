import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LibraryPage from "./LibraryPage";
import { useUser } from "@/hooks/useUser";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useLibraryLanguages", () => ({
  useLibraryLanguages: vi.fn(),
}));

vi.mock("@/components/features/library/SearchBar", () => ({
  default: () => <div data-testid="searchbar" />,
}));

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: () => <div data-testid="language-filter" />,
}));

vi.mock("@/components/features/library/LibraryGrid", () => ({
  default: () => <div data-testid="library-grid" />,
}));

vi.mock("@/components/features/admin/UnregisteredCheckbox", () => ({
  default: () => <div data-testid="unregistered-checkbox" />,
}));

vi.mock("@/components/features/admin/SyncCard", () => ({
  default: () => <div data-testid="sync-card" />,
}));

vi.mock("@/components/features/admin/ReindexCard", () => ({
  default: () => <div data-testid="reindex-card" />,
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

const mockedUseUser = vi.mocked(useUser);
const mockedUseLibraryLanguages = vi.mocked(useLibraryLanguages);

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseLibraryLanguages.mockReturnValue({
    source: ["en"],
    translation: ["de"],
    isLoading: false,
    isFetching: false,
    isError: false,
  } as never);
});

describe("LibraryPage", () => {
  it("renders common components", () => {
    mockedUseUser.mockReturnValue({
      data: {
        is_admin: false,
      },
    } as never);

    render(<LibraryPage />);

    expect(screen.getByTestId("searchbar")).toBeInTheDocument();
    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
    expect(screen.getByTestId("library-grid")).toBeInTheDocument();
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("does not render admin controls for regular users", () => {
    mockedUseUser.mockReturnValue({
      data: {
        is_admin: false,
      },
    } as never);

    render(<LibraryPage />);

    expect(
      screen.queryByTestId("unregistered-checkbox"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("sync-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reindex-card")).not.toBeInTheDocument();
  });

  it("renders admin controls for admins", () => {
    mockedUseUser.mockReturnValue({
      data: {
        is_admin: true,
      },
    } as never);

    render(<LibraryPage />);

    expect(screen.getByTestId("unregistered-checkbox")).toBeInTheDocument();
    expect(screen.getByTestId("sync-card")).toBeInTheDocument();
    expect(screen.getByTestId("reindex-card")).toBeInTheDocument();
  });

  it("passes language data to LanguageFilter", () => {
    mockedUseUser.mockReturnValue({
      data: {
        is_admin: false,
      },
    } as never);

    render(<LibraryPage />);

    expect(mockedUseLibraryLanguages).toHaveBeenCalled();
  });
});
