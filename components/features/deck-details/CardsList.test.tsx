import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import CardsList from "./CardsList";

vi.mock("@/components/features/deck-details/CardAccordionItem", () => ({
  default: ({ card }: { card: { word: string } }) => (
    <div data-testid="card-item">{card.word}</div>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion">{children}</div>
  ),
}));

describe("CardsList", () => {
  const cardSelection = {
    selected: new Set<string>(),
    toggle: vi.fn(),
  };

  const card = {
    id: "card-1",
    word: "laufen",
  };

  it("renders empty message when there are no cards", () => {
    render(
      <CardsList cards={[]} searchQuery="" cardSelection={cardSelection} />,
    );

    expect(screen.getByText("No cards in this deck yet.")).toBeInTheDocument();
  });

  it("renders search empty state", () => {
    render(
      <CardsList
        cards={[]}
        searchQuery="laufen"
        cardSelection={cardSelection}
      />,
    );

    expect(screen.getByText('No results for "laufen"')).toBeInTheDocument();
  });

  it("renders accordion when cards exist", () => {
    render(
      <CardsList
        cards={[card as any]}
        searchQuery=""
        cardSelection={cardSelection}
      />,
    );

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
  });

  it("renders all cards", () => {
    render(
      <CardsList
        cards={
          [
            card,
            { ...card, id: "card-2", word: "gehen" },
            { ...card, id: "card-3", word: "essen" },
          ] as any
        }
        searchQuery=""
        cardSelection={cardSelection}
      />,
    );

    expect(screen.getAllByTestId("card-item")).toHaveLength(3);

    expect(screen.getByText("laufen")).toBeInTheDocument();
    expect(screen.getByText("gehen")).toBeInTheDocument();
    expect(screen.getByText("essen")).toBeInTheDocument();
  });

  it("does not render accordion when there are no cards", () => {
    render(
      <CardsList cards={[]} searchQuery="" cardSelection={cardSelection} />,
    );

    expect(screen.queryByTestId("accordion")).not.toBeInTheDocument();
  });
});
