import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardLayout from "./layout";

vi.mock("@/components/layout/TopNav", () => ({
  default: () => <header data-testid="top-nav" />,
}));

vi.mock("@/components/features/processing/ProcessingToasts", () => ({
  default: () => <section data-testid="processing-toasts" />,
}));

describe("DashboardLayout", () => {
  it("puts the page between the top navigation and the processing toasts", () => {
    const { container } = render(
      <DashboardLayout>
        <div data-testid="child">Hello</div>
      </DashboardLayout>,
    );

    const main = container.querySelector("main")!;
    expect(main).toContainElement(screen.getByTestId("child"));
    expect(screen.getByTestId("top-nav").compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByTestId("processing-toasts")).toBeInTheDocument();
  });
});
