import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LibraryPage from "./LibraryPage";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
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

vi.mock("@/components/features/admin/SyncButton", () => ({
  default: () => <div data-testid="sync-button" />,
}));

vi.mock("@/components/features/admin/UnregisteredCheckbox", () => ({
  default: () => <div data-testid="unreg-checkbox" />,
}));

beforeEach(() => vi.resetAllMocks());

describe("LibraryPage", () => {
  it("renders base components", () => {
    mockUseUser.base();

    render(<LibraryPage />);

    expect(screen.getByTestId("searchbar")).toBeInTheDocument();
    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
    expect(screen.getByTestId("library-grid")).toBeInTheDocument();

    expect(screen.queryByTestId("sync-button")).toBeNull();
    expect(screen.queryByTestId("unreg-checkbox")).toBeNull();
  });

  it("does not show admin controls for non-admin user", () => {
    mockUseUser.base();

    render(<LibraryPage />);

    expect(screen.queryByTestId("sync-button")).toBeNull();
    expect(screen.queryByTestId("unreg-checkbox")).toBeNull();
  });

  it("shows admin controls for admin user", () => {
    mockUseUser.admin();

    render(<LibraryPage />);

    expect(screen.getByTestId("sync-button")).toBeInTheDocument();
    expect(screen.getByTestId("unreg-checkbox")).toBeInTheDocument();
  });
});
