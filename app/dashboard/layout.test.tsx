import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

vi.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "geist-sans",
  }),
  Geist_Mono: () => ({
    variable: "geist-mono",
  }),
}));

vi.mock("@/components/layout/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock("@/components/layout/Providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

describe("layout page", () => {
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

  it("wraps children with Providers", () => {
    render(
      <RootLayout>
        <div data-testid="child" />
      </RootLayout>,
    );

    const providers = screen.getByTestId("providers");

    expect(providers).toContainElement(screen.getByTestId("child"));
  });
});
