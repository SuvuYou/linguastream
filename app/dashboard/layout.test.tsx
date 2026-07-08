import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

vi.mock("@/components/layout/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders Navbar", () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("wraps children with SidebarProvider", () => {
    render(
      <RootLayout>
        <div data-testid="child" />
      </RootLayout>,
    );

    const provider = screen.getByTestId("sidebar-provider");

    expect(provider).toContainElement(screen.getByTestId("child"));
  });

  it("renders the main element", () => {
    const { container } = render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(container.querySelector("main")).toBeInTheDocument();
  });
});
