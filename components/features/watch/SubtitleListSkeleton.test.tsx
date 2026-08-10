import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import SubtitleListSkeleton from "./SubtitleListSkeleton";

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe("SubtitleListSkeleton", () => {
  it("renders six skeleton items", () => {
    render(<SubtitleListSkeleton />);

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(6);
  });

  it("renders a skeleton inside each item", () => {
    render(<SubtitleListSkeleton />);

    expect(screen.getAllByTestId("skeleton")).toHaveLength(6);
  });

  it("applies the expected skeleton size", () => {
    render(<SubtitleListSkeleton />);

    expect(screen.getAllByTestId("skeleton")[0]).toHaveClass("w-full", "h-22");
  });
});
