import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Study from "./page";

describe("study page", () => {
  it("should render the page", () => {
    render(<Study />);

    expect(screen.getByText(/Study/i)).toBeInTheDocument();
  });
});
