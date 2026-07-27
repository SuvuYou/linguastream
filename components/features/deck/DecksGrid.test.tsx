import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DecksGrid from "./DecksGrid";

vi.mock("./DeckCard", () => ({
  default: ({ deck }: { deck: { name: string } }) => (
    <div data-testid="deck-card">{deck.name}</div>
  ),
}));

vi.mock("./DeckCardCreateNew", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>Create New</button>
  ),
}));

describe("DecksGrid", () => {
  const onCreateNew = vi.fn();

  const deck = {
    id: "deck-1",
    name: "German",
    is_default: false,
    created_at: new Date().toISOString(),
    stats: {
      total: 10,
      due: 3,
      learned: 7,
      progress: 70,
    },
  };

  it("renders create new card when there are no decks", () => {
    render(<DecksGrid decks={[]} onCreateNew={onCreateNew} />);

    expect(
      screen.getByRole("button", { name: /create new/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("deck-card")).not.toBeInTheDocument();
  });

  it("renders create new card and all decks", () => {
    render(
      <DecksGrid
        decks={[deck, { ...deck, id: "deck-2", name: "Spanish" }]}
        onCreateNew={onCreateNew}
      />,
    );

    expect(
      screen.getByRole("button", { name: /create new/i }),
    ).toBeInTheDocument();

    const deckCards = screen.getAllByTestId("deck-card");

    expect(deckCards).toHaveLength(2);
    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("calls onCreateNew when create card is clicked", async () => {
    const user = userEvent.setup();

    render(<DecksGrid decks={[]} onCreateNew={onCreateNew} />);

    await user.click(screen.getByRole("button", { name: /create new/i }));

    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });

  it("renders only one create new card regardless of deck count", () => {
    render(
      <DecksGrid
        decks={[deck, { ...deck, id: "2" }, { ...deck, id: "3" }]}
        onCreateNew={onCreateNew}
      />,
    );

    expect(screen.getAllByRole("button", { name: /create new/i })).toHaveLength(
      1,
    );
  });
});
