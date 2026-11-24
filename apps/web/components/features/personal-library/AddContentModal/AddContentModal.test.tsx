import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AddContentModal from "./AddContentModal";

const mockInvalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }) =>
    open ? (
      <div>
        <button onClick={() => onOpenChange(false)}>Close dialog</button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("./ChooseStep", () => ({
  default: ({ onYouTube }: { onYouTube: () => void }) => (
    <button onClick={onYouTube}>YouTube</button>
  ),
}));

vi.mock("./URLStep", () => ({
  URLStep: ({
    onBack,
    onNext,
  }: {
    onBack: () => void;
    onNext: (meta: {
      title: string;
      videoId: string;
      thumbnailUrl: string;
    }) => void;
  }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button
        onClick={() =>
          onNext({
            title: "Test video",
            videoId: "abc123",
            thumbnailUrl: "thumbnail.jpg",
          })
        }
      >
        Next
      </button>
    </div>
  ),
}));

vi.mock("./ConfigurationStep", () => ({
  default: ({
    onBack,
    onSuccess,
  }: {
    onBack: () => void;
    onSuccess: (mediaId: string) => void;
  }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={() => onSuccess("media-1")}>Success</button>
    </div>
  ),
}));

vi.mock("./SuccessStep", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>Done</button>
  ),
}));

describe("AddContentModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders choose step initially", () => {
    render(<AddContentModal isOpen onClose={vi.fn()} />);

    expect(screen.getByText("Add Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "YouTube" })).toBeInTheDocument();
  });

  it("moves from choose to URL step", async () => {
    const user = userEvent.setup();

    render(<AddContentModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "YouTube" }));

    expect(screen.getByText("YouTube Link")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("moves from URL to configuration step", async () => {
    const user = userEvent.setup();

    render(<AddContentModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "YouTube" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Configure Subtitles")).toBeInTheDocument();
  });

  it("moves to success and invalidates library", async () => {
    const user = userEvent.setup();

    render(<AddContentModal isOpen onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "YouTube" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Success" }));

    expect(screen.getByText("Content Added")).toBeInTheDocument();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["personal-library"],
    });
  });

  it("closes and resets the modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<AddContentModal isOpen onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "YouTube" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Success" }));
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("does not render when closed", () => {
    render(<AddContentModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText("Add Content")).not.toBeInTheDocument();
  });
});
