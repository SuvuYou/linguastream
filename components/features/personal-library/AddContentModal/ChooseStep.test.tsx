import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChooseStep from "./ChooseStep";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe("ChooseStep", () => {
  it("renders upload and YouTube options", () => {
    render(<ChooseStep onYouTube={vi.fn()} />);

    expect(screen.getByText("Upload Files")).toBeInTheDocument();
    expect(screen.getByText("YouTube Link")).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("renders upload description", () => {
    render(<ChooseStep onYouTube={vi.fn()} />);

    expect(
      screen.getByText("Upload video files or subtitle files from your device"),
    ).toBeInTheDocument();
  });

  it("renders YouTube description", () => {
    render(<ChooseStep onYouTube={vi.fn()} />);

    expect(
      screen.getByText("Paste a YouTube link to add online content"),
    ).toBeInTheDocument();
  });

  it("calls onYouTube when YouTube option is clicked", async () => {
    const user = userEvent.setup();
    const onYouTube = vi.fn();

    render(<ChooseStep onYouTube={onYouTube} />);

    await user.click(screen.getByRole("button", { name: /youtube link/i }));

    expect(onYouTube).toHaveBeenCalledOnce();
  });
});
