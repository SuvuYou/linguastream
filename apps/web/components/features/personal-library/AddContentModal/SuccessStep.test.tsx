import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SuccessStep from "./SuccessStep";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe("SuccessStep", () => {
  it("renders processing message", () => {
    render(<SuccessStep onClose={vi.fn()} />);

    expect(
      screen.getByText("Subtitles are being processed in the background."),
    ).toBeInTheDocument();
  });

  it("renders Close button", () => {
    render(<SuccessStep onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("calls onClose when Close is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SuccessStep onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
