import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Decks from "./page";

describe("decks list page", () => {
  it("should render the page", () => {
    render(<Decks />);

    expect(screen.getByText(/Decks list/i)).toBeInTheDocument();
  });
});
