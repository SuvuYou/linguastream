import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileChooser from "@/components/features/library/ContentConfigurationModal/FileChooser";

vi.mock(
  "@/components/features/library/ContentConfigurationModal/FileStatus",
  () => ({
    default: ({ state }: { state: { status: string } | null }) => (
      <div>{state ? `Status: ${state.status}` : "No status"}</div>
    ),
  }),
);

describe("FileChooser", () => {
  it("renders choose file button when no upload state", () => {
    render(<FileChooser uploadState={null} onUpload={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /choose file/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("No status")).toBeInTheDocument();
  });

  it("renders change button when upload state exists", () => {
    render(
      <FileChooser
        uploadState={{
          file: null as unknown as File,
          status: "uploading",
        }}
        onUpload={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /change/i })).toBeInTheDocument();

    expect(screen.getByText("Status: uploading")).toBeInTheDocument();
  });

  it("shows uploaded file name when upload is done", () => {
    render(
      <FileChooser
        uploadState={{
          status: "done",
          file: new File(["test"], "subtitle.srt", {
            type: "text/plain",
          }),
        }}
        onUpload={vi.fn()}
      />,
    );

    expect(screen.getByText("subtitle.srt")).toBeInTheDocument();
  });

  it("calls onUpload when a file is selected", () => {
    const onUpload = vi.fn();

    render(<FileChooser uploadState={null} onUpload={onUpload} />);

    const input = screen.getByTestId("file-input");

    const file = new File(["subtitle"], "movie.srt", {
      type: "text/plain",
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(onUpload).toHaveBeenCalledWith(file);
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("does not call onUpload when no file is selected", () => {
    const onUpload = vi.fn();

    render(<FileChooser uploadState={null} onUpload={onUpload} />);

    const input = screen.getByTestId("file-input");

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    expect(onUpload).not.toHaveBeenCalled();
  });

  it("clicks hidden input when button is clicked", async () => {
    const user = userEvent.setup();

    render(<FileChooser uploadState={null} onUpload={vi.fn()} />);

    const input = screen.getByTestId("file-input");
    const clickSpy = vi.spyOn(input, "click");

    await user.click(screen.getByRole("button", { name: /choose file/i }));

    expect(clickSpy).toHaveBeenCalled();
  });
});
