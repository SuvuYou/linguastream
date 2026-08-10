import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Header from "./Header";
import { useAppStore } from "@/lib/initializations/store";
import { useWatchData } from "@/hooks/useWatchData";
import { useWatchLanguages } from "@/hooks/useWatchLanguages";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/hooks/useWatchData", () => ({
  useWatchData: vi.fn(),
}));

vi.mock("@/hooks/useWatchLanguages", () => ({
  useWatchLanguages: vi.fn(),
}));

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: ({
    isLoading,
    isError,
  }: {
    isLoading: boolean;
    isError: boolean;
  }) => (
    <div data-testid="language-filter">
      {isLoading ? "Loading" : isError ? "Error" : "Languages"}
    </div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseWatchData = vi.mocked(useWatchData);
const mockedUseWatchLanguages = vi.mocked(useWatchLanguages);

describe("Header", () => {
  const setOverlayOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAppStore.mockReturnValue({
      setOverlayOpen,
    } as any);

    mockedUseWatchData.mockReturnValue({
      data: {
        title: "Test Movie",
      },
      isLoading: false,
      isError: false,
    } as any);

    mockedUseWatchLanguages.mockReturnValue({
      source: { value: "en" },
      translation: { value: "de" },
    } as any);
  });

  it("renders media title", () => {
    render(<Header mediaContentId="media-1" />);

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("links to dashboard", () => {
    render(<Header mediaContentId="media-1" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/dashboard");
  });

  it("renders language filter", () => {
    render(<Header mediaContentId="media-1" />);

    expect(screen.getByTestId("language-filter")).toHaveTextContent(
      "Languages",
    );
  });

  it("passes loading state to language filter", () => {
    mockedUseWatchData.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    render(<Header mediaContentId="media-1" />);

    expect(screen.getByTestId("language-filter")).toHaveTextContent("Loading");
  });

  it("passes error state to language filter", () => {
    mockedUseWatchData.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<Header mediaContentId="media-1" />);

    expect(screen.getByTestId("language-filter")).toHaveTextContent("Error");
  });

  it("does not render title when data has no title", () => {
    mockedUseWatchData.mockReturnValue({
      data: {},
      isLoading: false,
      isError: false,
    } as any);

    render(<Header mediaContentId="media-1" />);

    expect(screen.queryByText("Test Movie")).not.toBeInTheDocument();
  });

  it("opens overlay player", async () => {
    const user = userEvent.setup();

    render(<Header mediaContentId="media-1" />);

    await user.click(
      screen.getByRole("button", { name: "Open overlay player" }),
    );

    expect(setOverlayOpen).toHaveBeenCalledWith(true);
  });
});
