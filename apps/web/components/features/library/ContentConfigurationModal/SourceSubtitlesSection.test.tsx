import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SourceSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection";

import { SUBTITLE_ACQUISITION_METHODS } from "@/helpers/const";

vi.mock(
  "@/components/features/library/ContentConfigurationModal/FileChooser",
  () => ({
    default: ({
      uploadState,
      onUpload,
    }: {
      uploadState: { status: string } | null;
      onUpload: (file: File) => void;
    }) => (
      <div data-testid="file-chooser">
        <div>{uploadState ? `Status: ${uploadState.status}` : "No status"}</div>

        <button
          onClick={() =>
            onUpload(
              new File(["subtitle"], "movie.srt", {
                type: "text/plain",
              }),
            )
          }
        >
          Upload
        </button>
      </div>
    ),
  }),
);

const baseProps = {
  acquisitionMethod: SUBTITLE_ACQUISITION_METHODS.UPLOAD,
  onChangeMethod: vi.fn(),
  uploadState: null,
  onUpload: vi.fn(),
  isExisting: false,
};

describe("SourceSubtitlesSection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders acquisition method tabs", () => {
    render(<SourceSubtitlesSection {...baseProps} />);

    expect(screen.getByText(/source subtitles/i)).toBeInTheDocument();

    expect(
      screen.getByRole("tab", {
        name: /upload file/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", {
        name: /generate with whisperx/i,
      }),
    ).toBeInTheDocument();
  });

  it("calls onChangeMethod when whisperx tab is clicked", async () => {
    const user = userEvent.setup();
    const onChangeMethod = vi.fn();

    render(
      <SourceSubtitlesSection {...baseProps} onChangeMethod={onChangeMethod} />,
    );

    await user.click(
      screen.getByRole("tab", {
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

    expect(screen.getByTestId("file-chooser")).toBeInTheDocument();
    expect(screen.getByText("No status")).toBeInTheDocument();
  });

  it("shows existing badge when subtitles already exist", () => {
    render(<SourceSubtitlesSection {...baseProps} isExisting />);

    expect(screen.getByText("Existing")).toBeInTheDocument();
  });

  it("does not show existing badge when subtitles do not exist", () => {
    render(<SourceSubtitlesSection {...baseProps} />);

    expect(screen.queryByText("Existing")).not.toBeInTheDocument();
  });

  it("passes upload state to FileChooser", () => {
    render(
      <SourceSubtitlesSection
        {...baseProps}
        uploadState={{
          file: null as unknown as File,
          status: "uploading",
        }}
      />,
    );

    expect(screen.getByText("Status: uploading")).toBeInTheDocument();
  });

  it("passes onUpload to FileChooser", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();

    render(<SourceSubtitlesSection {...baseProps} onUpload={onUpload} />);

    await user.click(screen.getByRole("button", { name: /upload/i }));

    expect(onUpload).toHaveBeenCalledTimes(1);

    expect(onUpload.mock.calls[0][0]).toBeInstanceOf(File);
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

    expect(screen.queryByTestId("file-chooser")).not.toBeInTheDocument();
  });
});
