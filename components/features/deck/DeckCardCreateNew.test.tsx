import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeckCardCreateNew from "./DeckCardCreateNew";

describe("DeckCardCreateNew", () => {
  it("renders add new deck text", () => {
    render(<DeckCardCreateNew onClick={vi.fn()} />);

    expect(screen.getByText("Add new deck")).toBeInTheDocument();
  });

  it("renders clickable card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<DeckCardCreateNew onClick={onClick} />);

    await user.click(screen.getByText("Add new deck"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls onClick when card is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    const { container } = render(<DeckCardCreateNew onClick={onClick} />);

    await user.click(container.firstChild as HTMLElement);

    expect(onClick).toHaveBeenCalledOnce();
  });
});
