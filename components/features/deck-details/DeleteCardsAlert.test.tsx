import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteCardsAlert } from "@/components/features/deck-details/DeleteCardsAlert";
import { useDeleteCards } from "@/hooks/useDeleteCards";

vi.mock("@/hooks/useDeleteCards", () => ({
  useDeleteCards: vi.fn(),
}));

const mockedUseDeleteCards = vi.mocked(useDeleteCards);

describe("DeleteCardsAlert", () => {
  const mutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDeleteCards.mockReturnValue({
      mutate,
      isPending: false,
    } as any);
  });

  it("does not render selection bar when nothing is selected", () => {
    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set()}
        isOpen={false}
        setIsOpen={vi.fn()}
        reset={vi.fn()}
      />,
    );

    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("renders selection bar with selected count", () => {
    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1", "2"])}
        isOpen={false}
        setIsOpen={vi.fn()}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("calls reset when clear button is clicked", async () => {
    const reset = vi.fn();

    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1"])}
        isOpen={false}
        setIsOpen={vi.fn()}
        reset={reset}
      />,
    );

    const buttons = screen.getAllByRole("button");

    await userEvent.click(buttons[0]);

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("opens dialog when delete button is clicked", async () => {
    const setIsOpen = vi.fn();

    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1"])}
        isOpen={false}
        setIsOpen={setIsOpen}
        reset={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(setIsOpen).toHaveBeenCalledWith(true);
  });

  it("shows singular dialog text", () => {
    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1"])}
        isOpen
        setIsOpen={vi.fn()}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByText("Delete 1 word?")).toBeInTheDocument();
    expect(
      screen.getByText(/This permanently deletes the selected word/i),
    ).toBeInTheDocument();
  });

  it("shows plural dialog text", () => {
    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1", "2"])}
        isOpen
        setIsOpen={vi.fn()}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByText("Delete 2 words?")).toBeInTheDocument();
    expect(
      screen.getByText(/This permanently deletes the selected words/i),
    ).toBeInTheDocument();
  });

  it("deletes selected cards and resets on success", async () => {
    mutate.mockImplementation((_ids, options) => {
      options.onSuccess();
    });

    const reset = vi.fn();

    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1", "2"])}
        isOpen
        setIsOpen={vi.fn()}
        reset={reset}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const confirmButton = buttons[buttons.length - 1];

    await userEvent.click(confirmButton);

    expect(mutate).toHaveBeenCalledWith(
      ["1", "2"],
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows loading state while deleting", () => {
    mockedUseDeleteCards.mockReturnValue({
      mutate,
      isPending: true,
    } as any);

    render(
      <DeleteCardsAlert
        deckId="deck-1"
        selected={new Set(["1"])}
        isOpen
        setIsOpen={vi.fn()}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
  });
});
