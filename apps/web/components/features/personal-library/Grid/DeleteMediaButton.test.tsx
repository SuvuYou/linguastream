import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeleteMediaButton } from "./DeleteMediaButton";
import { useDeletePersonalMedia } from "@/hooks/useDeletePersonalMedia";

const mockMutate = vi.fn();

vi.mock("@/hooks/useDeletePersonalMedia", () => ({
  useDeletePersonalMedia: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const mockedUseDeletePersonalMedia = vi.mocked(useDeletePersonalMedia);

describe("DeleteMediaButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseDeletePersonalMedia.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    } as any);
  });

  it("renders delete confirmation", () => {
    render(<DeleteMediaButton mediaId="media-1" title="Test Movie" />);

    expect(screen.getByText('Delete "Test Movie"?')).toBeInTheDocument();

    expect(
      screen.getByText(
        "This permanently deletes the media. This can't be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("renders Delete button", () => {
    render(<DeleteMediaButton mediaId="media-1" title="Test Movie" />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("deletes media when confirmed", async () => {
    const user = userEvent.setup();

    render(<DeleteMediaButton mediaId="media-1" title="Test Movie" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(mockMutate).toHaveBeenCalledWith("media-1");
  });

  it("shows Deleting while deletion is pending", () => {
    mockedUseDeletePersonalMedia.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
    } as any);

    render(<DeleteMediaButton mediaId="media-1" title="Test Movie" />);

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });

  it("shows Deleting after successful deletion", () => {
    mockedUseDeletePersonalMedia.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: true,
    } as any);

    render(<DeleteMediaButton mediaId="media-1" title="Test Movie" />);

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });
});
