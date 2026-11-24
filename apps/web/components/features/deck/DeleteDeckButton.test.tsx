import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { DeleteDeckButton } from "./DeleteDeckButton";

const mutate = vi.fn();

vi.mock("@/hooks/useDeleteDeck", () => ({
  useDeleteDeck: vi.fn(),
}));

vi.mock("@/components/ui/alert-dialog", () => {
  const AlertDialogContent = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  return {
    AlertDialog: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    AlertDialogTrigger: ({
      children,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
    }) => <>{children}</>,
    AlertDialogContent,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
      <h1>{children}</h1>
    ),
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
      <p>{children}</p>
    ),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
      <button>{children}</button>
    ),
    AlertDialogAction: ({
      children,
      onClick,
      disabled,
      className,
    }: {
      children: React.ReactNode;
      onClick?: React.MouseEventHandler<HTMLButtonElement>;
      disabled?: boolean;
      className?: string;
    }) => (
      <button onClick={onClick} disabled={disabled} className={className}>
        {children}
      </button>
    ),
  };
});

describe("DeleteDeckButton", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useDeleteDeck } = await import("@/hooks/useDeleteDeck");

    vi.mocked(useDeleteDeck).mockReturnValue({
      mutate,
      isPending: false,
    } as never);
  });

  it("renders delete confirmation text", () => {
    render(<DeleteDeckButton deckId="deck-1" deckName="German" />);

    expect(screen.getByText('Delete "German"?')).toBeInTheDocument();
    expect(
      screen.getByText(/permanently deletes the deck/i),
    ).toBeInTheDocument();
  });

  it("renders cancel and delete buttons", () => {
    render(<DeleteDeckButton deckId="deck-1" deckName="German" />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /^delete$/i }),
    ).toBeInTheDocument();
  });

  it("calls mutate when delete is confirmed", async () => {
    const user = userEvent.setup();

    render(<DeleteDeckButton deckId="deck-123" deckName="German" />);

    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(mutate).toHaveBeenCalledWith("deck-123");
  });

  it("shows deleting state", async () => {
    const { useDeleteDeck } = await import("@/hooks/useDeleteDeck");

    vi.mocked(useDeleteDeck).mockReturnValue({
      mutate,
      isPending: true,
    } as never);

    render(<DeleteDeckButton deckId="deck-1" deckName="German" />);

    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled();
  });
});
