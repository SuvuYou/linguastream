import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DetailsSection from "./DetailsSection";

vi.mock("@/components/features/watch/SubtitleSettings", () => ({
  default: () => <div>Subtitle Settings Panel</div>,
}));

vi.mock(
  "@/components/features/watch/WordProfilePanel/WordProfilePanel",
  () => ({
    default: () => <div>Word Profile Panel</div>,
  }),
);

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-value={value}>
      {children}
      <button onClick={() => onValueChange?.("subtitles")}>Subtitles</button>
      <button onClick={() => onValueChange?.("word-profile")}>
        Word Profile
      </button>
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
    onClick,
  }: {
    children: React.ReactNode;
    value: string;
    onClick?: () => void;
  }) => (
    <button data-value={value} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("DetailsSection", () => {
  it("does not show a panel initially", () => {
    render(<DetailsSection />);

    expect(
      screen.queryByText("Subtitle Settings Panel"),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("Word Profile Panel")).not.toBeInTheDocument();
  });

  it("opens subtitle settings", async () => {
    const user = userEvent.setup();

    render(<DetailsSection />);

    await user.click(screen.getByRole("button", { name: "Subtitles" }));

    expect(screen.getByText("Subtitle Settings Panel")).toBeInTheDocument();
  });

  it("opens word profile", async () => {
    const user = userEvent.setup();

    render(<DetailsSection />);

    await user.click(screen.getByRole("button", { name: "Word Profile" }));

    expect(screen.getByText("Word Profile Panel")).toBeInTheDocument();
  });

  it("closes the currently opened panel when clicked again", async () => {
    const user = userEvent.setup();

    render(<DetailsSection />);

    const subtitlesButton = screen.getByRole("button", {
      name: "Subtitles",
    });

    await user.click(subtitlesButton);
    expect(screen.getByText("Subtitle Settings Panel")).toBeInTheDocument();

    await user.click(subtitlesButton);

    expect(
      screen.queryByText("Subtitle Settings Panel"),
    ).not.toBeInTheDocument();
  });

  it("switches between panels", async () => {
    const user = userEvent.setup();

    render(<DetailsSection />);

    await user.click(screen.getByRole("button", { name: "Subtitles" }));

    expect(screen.getByText("Subtitle Settings Panel")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Word Profile" }));

    expect(
      screen.queryByText("Subtitle Settings Panel"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Word Profile Panel")).toBeInTheDocument();
  });
});
