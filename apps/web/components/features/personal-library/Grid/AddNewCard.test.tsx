import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddNewCard from "./AddNewCard";

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <div onClick={onClick}>{children}</div>,
}));

describe("AddNewCard", () => {
  it("renders Add Content", () => {
    render(<AddNewCard onAdd={vi.fn()} />);

    expect(screen.getByText("Add Content")).toBeInTheDocument();
  });

  it("calls onAdd when clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<AddNewCard onAdd={onAdd} />);

    await user.click(screen.getByText("Add Content"));

    expect(onAdd).toHaveBeenCalledOnce();
  });
});
