import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useUser } from "@/hooks/useUser";
import LibraryPage from "./LibraryPage";
import { User } from "@prisma/client";
import { UseQueryResult } from "@tanstack/react-query";

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

const mockedUseUser = vi.mocked(useUser);

beforeEach(() => vi.resetAllMocks());

describe("LibraryPage", () => {
  it("renders base components", () => {
    mockedUseUser.mockReturnValue({
      data: null,
    } as unknown as UseQueryResult<User>);

    render(<LibraryPage />);

    expect(screen.getByTestId("searchbar")).toBeInTheDocument();
    expect(screen.getByTestId("language-filter")).toBeInTheDocument();
    expect(screen.getByTestId("library-grid")).toBeInTheDocument();

    expect(screen.queryByTestId("sync-button")).toBeNull();
    expect(screen.queryByTestId("unreg-checkbox")).toBeNull();
  });

  it("does not show admin controls for non-admin user", () => {
    mockedUseUser.mockReturnValue({
      data: { is_admin: false },
    } as unknown as UseQueryResult<User>);

    render(<LibraryPage />);

    expect(screen.queryByTestId("sync-button")).toBeNull();
    expect(screen.queryByTestId("unreg-checkbox")).toBeNull();
  });

  it("shows admin controls for admin user", () => {
    mockedUseUser.mockReturnValue({
      data: { is_admin: true },
    } as unknown as UseQueryResult<User>);

    render(<LibraryPage />);

    expect(screen.getByTestId("sync-button")).toBeInTheDocument();
    expect(screen.getByTestId("unreg-checkbox")).toBeInTheDocument();
  });
});
