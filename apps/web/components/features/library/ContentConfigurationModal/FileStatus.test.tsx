import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FileStatus from "@/components/features/library/ContentConfigurationModal/FileStatus";

describe("FileStatus", () => {
  it("renders nothing when state is null", () => {
    const { container } = render(<FileStatus state={null} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders uploading state", () => {
    render(
      <FileStatus
        state={{
          file: null as unknown as File,
          status: "uploading",
        }}
      />,
    );

    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it("renders done state", () => {
    render(
      <FileStatus
        state={{
          file: null as unknown as File,
          status: "done",
        }}
      />,
    );

    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <FileStatus
        state={{
          file: null as unknown as File,
          status: "error",
          error: "Upload failed",
        }}
      />,
    );

    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it("renders nothing for unknown status", () => {
    const { container } = render(
      <FileStatus
        state={{
          file: null as unknown as File,
          status: "idle" as never,
        }}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
