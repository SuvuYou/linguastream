import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { URLStep } from "./URLStep";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

vi.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputGroupInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

describe("URLStep", () => {
  const onBack = vi.fn();
  const onNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and buttons", () => {
    render(<URLStep onBack={onBack} onNext={onNext} />);

    expect(screen.getByPlaceholderText(/youtube.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("disables Next when URL is empty", () => {
    render(<URLStep onBack={onBack} onNext={onNext} />);

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows error for invalid URL", async () => {
    const user = userEvent.setup();

    render(<URLStep onBack={onBack} onNext={onNext} />);

    await user.type(screen.getByRole("textbox"), "not a youtube url");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Invalid YouTube URL")).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("fetches metadata and calls onNext", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          title: "Test Video",
        }),
      }),
    );

    render(<URLStep onBack={onBack} onNext={onNext} />);

    await user.type(
      screen.getByRole("textbox"),
      "https://www.youtube.com/watch?v=abc123",
    );
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(fetch).toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledWith({
      title: "Test Video",
      videoId: "abc123",
      thumbnailUrl: "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
    });
  });

  it("shows error when metadata request fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    render(<URLStep onBack={onBack} onNext={onNext} />);

    await user.type(
      screen.getByRole("textbox"),
      "https://www.youtube.com/watch?v=abc123",
    );
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText(
        "Could not fetch video info. Check the URL and try again.",
      ),
    ).toBeInTheDocument();
  });

  it("calls onBack when Back is clicked", async () => {
    const user = userEvent.setup();

    render(<URLStep onBack={onBack} onNext={onNext} />);

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
