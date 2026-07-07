import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AppSidebar from "./Navbar";
import { usePathname } from "next/navigation";
import React from "react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/features/signin/SignOutButton", () => ({
  default: () => <div data-testid="signout" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <div>{children}</div>,
  SidebarHeader: ({ children }: any) => <div>{children}</div>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  SidebarFooter: ({ children }: any) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedUsePathname = vi.mocked(usePathname);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("AppSidebar", () => {
  it("renders application title", () => {
    mockedUsePathname.mockReturnValue("/dashboard");

    render(<AppSidebar />);

    expect(screen.getByText("LinguaStream")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    mockedUsePathname.mockReturnValue("/dashboard");

    render(<AppSidebar />);

    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Decks")).toBeInTheDocument();
    expect(screen.getByText("Study")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("renders sign out button", () => {
    mockedUsePathname.mockReturnValue("/dashboard");

    render(<AppSidebar />);

    expect(screen.getByTestId("signout")).toBeInTheDocument();
  });

  it("marks the current route as active", () => {
    mockedUsePathname.mockReturnValue("/dashboard/study");

    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: /study/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not mark inactive routes as active", () => {
    mockedUsePathname.mockReturnValue("/dashboard/study");

    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: /library/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
