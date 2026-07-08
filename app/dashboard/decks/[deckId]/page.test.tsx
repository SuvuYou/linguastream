import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Deck from "./page";

describe("deck page", () => {
  it("should render the page", async () => {
    const Component = await Deck({
      params: Promise.resolve({ deckId: "deck id" }),
    });

    render(Component);

    expect(screen.getByText(/Deck deck id/i)).toBeInTheDocument();
  });
});
