import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SubtitleRow from "./SubtitleRow";
import Events from "@/events";

vi.mock("@/events", () => ({
  default: {
    player: {
      triggerJumpTo: vi.fn(),
    },
  },
}));

vi.mock("@/components/ui/table", () => ({
  TableRow: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <tr onClick={onClick} {...props}>
      {children}
    </tr>
  ),
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  ),
}));

const pair = {
  source: {
    index: 0,
    start_ms: 65000,
    end_ms: 68000,
    text: "Hello world",
  },
  translation: {
    index: 0,
    start_ms: 65000,
    end_ms: 68000,
    text: "Hallo Welt",
  },
  start_ms: 65000,
  end_ms: 68000,
  index: 0,
} as any;

const baseProps = {
  subtitlePair: pair,
  forwardActiveRef: { current: null },
  listOrderIndex: 0,
  isActive: false,
  shouldShowSourceLine: true,
  shouldShowTranslationLine: true,
  query: "",
};

describe("SubtitleRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders source and translation", () => {
    render(<SubtitleRow {...baseProps} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByText("Hallo Welt")).toBeInTheDocument();
  });

  it("formats the start time", () => {
    render(<SubtitleRow {...baseProps} />);

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("hides source when disabled", () => {
    render(<SubtitleRow {...baseProps} shouldShowSourceLine={false} />);

    expect(screen.queryByText("Hello world")).not.toBeInTheDocument();
    expect(screen.getByText("Hallo Welt")).toBeInTheDocument();
  });

  it("hides translation when disabled", () => {
    render(<SubtitleRow {...baseProps} shouldShowTranslationLine={false} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.queryByText("Hallo Welt")).not.toBeInTheDocument();
  });

  it("highlights matching source text", () => {
    render(<SubtitleRow {...baseProps} query="world" />);

    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("highlights matching translation text", () => {
    render(<SubtitleRow {...baseProps} query="welt" />);

    expect(screen.getByText("Welt")).toBeInTheDocument();
  });

  it("marks the row as an option", () => {
    render(<SubtitleRow {...baseProps} />);

    expect(screen.getByRole("option")).toBeInTheDocument();
  });

  it("uses the list index for the row id", () => {
    render(<SubtitleRow {...baseProps} listOrderIndex={3} />);

    expect(screen.getByRole("option")).toHaveAttribute("id", "subtitle-row-3");
  });

  it("triggers a jump when clicked", async () => {
    const user = userEvent.setup();

    render(<SubtitleRow {...baseProps} />);

    await user.click(screen.getByRole("option"));

    expect(Events.player.triggerJumpTo).toHaveBeenCalledWith(65010);
  });

  it("applies active styling", () => {
    render(<SubtitleRow {...baseProps} isActive />);

    expect(screen.getByRole("option")).toHaveClass("bg-primary/5");
  });
});
