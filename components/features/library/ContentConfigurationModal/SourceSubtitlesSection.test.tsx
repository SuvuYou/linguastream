import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SourceSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection";

import { SUBTITLE_ACQUISITION_METHODS } from "@/helpers/const";

vi.mock(
  "@/components/features/library/ContentConfigurationModal/FileStatus",
  () => ({
    default: ({ state }: { state: { status: string } | null }) => (
      <div>{state ? `Status: ${state.status}` : "No status"}</div>
    ),
  }),
);

const baseProps = {
  acquisitionMethod: SUBTITLE_ACQUISITION_METHODS.UPLOAD,
  onChangeMethod: vi.fn(),
  uploadState: null,
  onUpload: vi.fn(),
};

describe("SourceSubtitlesSection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders acquisition method buttons", () => {
    render(<SourceSubtitlesSection {...baseProps} />);

    expect(screen.getByText(/source subtitles/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /upload file/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /generate with whisperx/i,
      }),
    ).toBeInTheDocument();
  });

  it("calls onChangeMethod when upload button is clicked", async () => {
    const user = userEvent.setup();
    const onChangeMethod = vi.fn();

    render(
      <SourceSubtitlesSection {...baseProps} onChangeMethod={onChangeMethod} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /upload file/i,
      }),
    );

    expect(onChangeMethod).toHaveBeenCalledWith(
      SUBTITLE_ACQUISITION_METHODS.UPLOAD,
    );
  });

  it("calls onChangeMethod when whisperx button is clicked", async () => {
    const user = userEvent.setup();
    const onChangeMethod = vi.fn();

    render(
      <SourceSubtitlesSection {...baseProps} onChangeMethod={onChangeMethod} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /generate with whisperx/i,
      }),
    );

    expect(onChangeMethod).toHaveBeenCalledWith(
      SUBTITLE_ACQUISITION_METHODS.WHISPERX,
    );
  });

  it("shows upload controls when acquisition method is upload", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        acquisitionMethod={SUBTITLE_ACQUISITION_METHODS.UPLOAD}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /choose file/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("No status")).toBeInTheDocument();
  });

  it("shows change file button when upload state exists", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        uploadState={{
          file: null as unknown as File,
          status: "uploading",
        }}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /change file/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Status: uploading")).toBeInTheDocument();
  });

  it("shows uploaded file name when upload is done", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        uploadState={{
          status: "done",
          file: new File(["subtitle"], "movie.srt", {
            type: "text/plain",
          }),
        }}
      />,
    );

    expect(screen.getByText("movie.srt")).toBeInTheDocument();
  });

  it("calls onUpload when a file is selected", () => {
    const onUpload = vi.fn();

    render(<SourceSubtitlesSection {...baseProps} onUpload={onUpload} />);

    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

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

    render(<SourceSubtitlesSection {...baseProps} onUpload={onUpload} />);

    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    expect(onUpload).not.toHaveBeenCalled();
  });

  it("clicks hidden input when choose file button is clicked", async () => {
    const user = userEvent.setup();

    render(<SourceSubtitlesSection {...baseProps} />);

    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

    const clickSpy = vi.spyOn(input, "click");

    await user.click(
      screen.getByRole("button", {
        name: /choose file/i,
      }),
    );

    expect(clickSpy).toHaveBeenCalled();
  });

  it("shows whisperx description when whisperx method is selected", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        acquisitionMethod={SUBTITLE_ACQUISITION_METHODS.WHISPERX}
      />,
    );

    expect(
      screen.getByText(/audio will be transcribed locally/i),
    ).toBeInTheDocument();
  });

  it("does not show upload controls in whisperx mode", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        acquisitionMethod={SUBTITLE_ACQUISITION_METHODS.WHISPERX}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /choose file/i,
      }),
    ).not.toBeInTheDocument();
  });
});
