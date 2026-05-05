import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LibraryGrid from "@/components/features/library/LibraryGrid";
import userEvent from "@testing-library/user-event";
import { mockUseJobPolling } from "@/helpers/tests/mocks/useJobPolling";
import { mockUseLibrary } from "@/helpers/tests/mocks/useLibrary";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";
import { mockUseLanguages } from "@/helpers/tests/mocks/useLanguages";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useJobPolling", () => ({
  useJobPolling: vi.fn(),
}));

vi.mock("@/hooks/useLibrary", () => ({
  useLibrary: vi.fn(),
  DEFAULT_LIBRARY_RESPONSE: { items: [], total: 0, pageCount: 0 },
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

vi.mock("@/components/features/library/ContentConfigurationModal", () => ({
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess}>Mock Modal</button>
  ),
}));

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

beforeEach(() => vi.resetAllMocks());

describe("LibraryGrid", () => {
  it("shows skeleton when loading", () => {
    mockUseLanguages.loading();
    mockUseUser.loading();
    mockUseLibrary.loading();

    render(<LibraryGrid />);

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(12);
  });

  it("shows error state", () => {
    mockUseJobPolling.done();
    mockUseLanguages.error();
    mockUseUser.error();
    mockUseLibrary.error();

    render(<LibraryGrid />);

    expect(screen.getByText(/failed to load library/i)).toBeInTheDocument();
  });

  it("renders library items", () => {
    mockUseJobPolling.done();
    mockUseUser.base();
    mockUseLanguages.selected();
    mockUseLibrary.base();

    render(<LibraryGrid />);

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
    expect(screen.getByText("1 titles")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    mockUseUser.base();
    mockUseJobPolling.done();
    mockUseLibrary.base();
    mockUseLanguages.selected();

    render(<LibraryGrid />);

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
    expect(screen.getByText("1 titles")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    mockUseJobPolling.done();
    mockUseUser.base();
    mockUseLanguages.selected();
    mockUseLibrary.empty();

    render(<LibraryGrid />);

    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  it("shows add button for admin and unknown language", async () => {
    mockUseJobPolling.done();
    mockUseUser.admin();
    mockUseLanguages.selected();
    mockUseLibrary.base();

    render(<LibraryGrid />);

    expect(screen.getByText("Configure")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Configure"));

    expect(screen.getByText(/Mock Modal/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText("Mock Modal"));

    const modal = screen.queryByText(/Mock Modal/i);

    expect(modal).not.toBeInTheDocument();
  });
});
