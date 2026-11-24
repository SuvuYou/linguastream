import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SaveToDeck from "./SaveToDeck";

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      aria-label="Deck"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

describe("SaveToDeck", () => {
  const decks = [
    { id: "1", name: "German" },
    { id: "2", name: "Spanish" },
  ] as any;

  const baseProps = {
    saver: {
      reset: vi.fn(),
      saved: false,
      isSaving: false,
      error: null,
    },
    handleSave: vi.fn(),
    decks,
    selectedDeckId: "1",
    allowSave: true,
    onSelectDeckId: vi.fn(),
  };

  it("renders deck selector and save button", () => {
    render(<SaveToDeck {...baseProps} />);

    expect(screen.getByLabelText("Deck")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to deck/i }),
    ).toBeInTheDocument();
  });

  it("renders all deck options", () => {
    render(<SaveToDeck {...baseProps} />);

    expect(screen.getByText("German")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });

  it("calls onSelectDeckId when deck changes", () => {
    render(<SaveToDeck {...baseProps} />);

    fireEvent.change(screen.getByLabelText("Deck"), {
      target: { value: "2" },
    });

    expect(baseProps.onSelectDeckId).toHaveBeenCalledWith("2");
  });

  it("calls handleSave", () => {
    render(<SaveToDeck {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /add to deck/i }));

    expect(baseProps.handleSave).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(
      <SaveToDeck
        {...baseProps}
        saver={{
          ...baseProps.saver,
          isSaving: true,
        }}
      />,
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("disables save button when saving is not allowed", () => {
    render(<SaveToDeck {...baseProps} allowSave={false} />);

    expect(screen.getByRole("button", { name: /add to deck/i })).toBeDisabled();
  });

  it("shows error message", () => {
    render(
      <SaveToDeck
        {...baseProps}
        saver={{
          ...baseProps.saver,
          error: "Something went wrong",
        }}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows saved state", () => {
    render(
      <SaveToDeck
        {...baseProps}
        saver={{
          ...baseProps.saver,
          saved: true,
        }}
      />,
    );

    expect(screen.getByText("Saved to deck")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add to deck/i }),
    ).not.toBeInTheDocument();
  });
});
