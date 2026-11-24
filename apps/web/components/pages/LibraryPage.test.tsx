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

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: () => <div data-testid="language-filter" />,
}));

vi.mock("@/components/features/library/LibraryGrid", () => ({
  default: () => <div data-testid="library-grid" />,
}));

vi.mock("@/components/features/admin/SyncCard", () => ({
  default: () => <div data-testid="sync-card" />,
}));

vi.mock("@/components/features/admin/ReindexCard", () => ({
  default: () => <div data-testid="reindex-card" />,
}));

vi.mock("@/components/features/admin/UnregisteredCheckbox", () => ({
  default: () => <div data-testid="unregistered-checkbox" />,
}));

vi.mock("@/components/primitives/SearchBar", () => ({
  default: () => <div data-testid="search-bar" />,
}));

const mockedUseUser = vi.mocked(useUser);
const mockedUseLibraryLanguages = vi.mocked(useLibraryLanguages);

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseUser.mockReturnValue({
    data: { is_admin: false },
  } as any);

  mockedUseLibraryLanguages.mockReturnValue({
    source: {},
    translation: {},
    isLoading: false,
    isFetching: false,
    isError: false,
  } as any);
});

describe("LibraryPage", () => {
  it("renders language filter", () => {
    render(<LibraryPage />);

    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
  });

  it("renders library grid", () => {
    render(<LibraryPage />);

    expect(screen.getByTestId("library-grid")).toBeInTheDocument();
  });

  it("renders admin controls for admin users", () => {
    mockedUseUser.mockReturnValue({
      data: { is_admin: true },
    } as any);

    render(<LibraryPage />);

    expect(screen.getByTestId("sync-card")).toBeInTheDocument();
    expect(screen.getByTestId("reindex-card")).toBeInTheDocument();
  });

  it("does not render admin controls for regular users", () => {
    render(<LibraryPage />);

    expect(screen.queryByTestId("sync-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reindex-card")).not.toBeInTheDocument();
  });

  it("does not render admin controls when user data is missing", () => {
    mockedUseUser.mockReturnValue({
      data: undefined,
    } as any);

    render(<LibraryPage />);

    expect(screen.queryByTestId("sync-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("reindex-card")).not.toBeInTheDocument();
  });
});
