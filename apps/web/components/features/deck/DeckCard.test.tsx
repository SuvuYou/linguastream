import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeckCard from "./DeckCard";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: () => ({
    preferredSourceLanguage: "de",
  }),
}));

vi.mock("./DeleteDeckButton", () => ({
  DeleteDeckButton: ({
    deckId,
    deckName,
  }: {
    deckId: string;
    deckName: string;
  }) => (
    <div data-testid="delete-button">
      {deckId}-{deckName}
    </div>
  ),
}));

const baseDeck = {
  id: "deck-1",
  name: "German",
  is_default: false,
  created_at: new Date(),
  stats: {
    total: 100,
    due: 20,
    learned: 80,
    progress: 80,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DeckCard", () => {
  it("renders deck name", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.getByText("German")).toBeInTheDocument();
  });

  it("shows default badge", () => {
    render(
      <DeckCard
        deck={{
          ...baseDeck,
          is_default: true,
        }}
      />,
    );

    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("does not show default badge for non-default deck", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.queryByText("Default")).not.toBeInTheDocument();
  });

  it("renders total cards", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.getByText("100 cards")).toBeInTheDocument();
  });

  it("renders due cards", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.getByText("20 due")).toBeInTheDocument();
  });

  it("hides due label when nothing is due", () => {
    render(
      <DeckCard
        deck={{
          ...baseDeck,
          stats: {
            ...baseDeck.stats,
            due: 0,
          },
        }}
      />,
    );

    expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
  });

  it("renders learned percentage", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.getByText("80% learned")).toBeInTheDocument();
  });

  it("disables study button when no cards are due", () => {
    render(
      <DeckCard
        deck={{
          ...baseDeck,
          stats: {
            ...baseDeck.stats,
            due: 0,
          },
        }}
      />,
    );

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toBeDisabled();
  });

  it("enables study button when cards are due", () => {
    render(<DeckCard deck={baseDeck} />);

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toBeEnabled();
  });

  it("navigates to study page", async () => {
    const user = userEvent.setup();

    render(<DeckCard deck={baseDeck} />);

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);

    expect(push).toHaveBeenCalledWith("/dashboard/study?deckId=deck-1&src=de");
  });

  it("navigates to deck details page", async () => {
    const user = userEvent.setup();

    render(<DeckCard deck={baseDeck} />);

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[1]);

    expect(push).toHaveBeenCalledWith("/dashboard/decks/deck-1");
  });

  it("renders delete button with deck props", () => {
    render(<DeckCard deck={baseDeck} />);

    expect(screen.getByTestId("delete-button")).toHaveTextContent(
      "deck-1-German",
    );
  });
});
