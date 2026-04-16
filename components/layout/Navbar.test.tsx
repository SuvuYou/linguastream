import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import React from "react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
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

vi.mock("@/components/features/signin/SignOutButton", () => ({
  default: () => <div data-testid="signout" />,
}));

const mockedUsePathname = vi.mocked(usePathname);

beforeEach(() => vi.resetAllMocks());

describe("Navbar", () => {
  it("renders navigation links", () => {
    mockedUsePathname.mockReturnValue("/");

    render(<Navbar />);

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Decks")).toBeInTheDocument();
    expect(screen.getByText("Study")).toBeInTheDocument();
  });

  it("renders sign out button", () => {
    vi.mocked(usePathname).mockReturnValue("/");

    render(<Navbar />);

    expect(screen.getByTestId("signout")).toBeInTheDocument();
  });
});
