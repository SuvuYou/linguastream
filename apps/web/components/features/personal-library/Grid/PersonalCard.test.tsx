import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PersonalCard from "./PersonalCard";
import { useJobPolling } from "@/hooks/useJobPolling";
import {
  JOB_STATUS,
  YOUTUBE_CONTENT_TYPE,
  UPLOAD_CONTENT_TYPE,
} from "@/helpers/const";

vi.mock("@/hooks/useJobPolling", () => ({
  useJobPolling: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("./DeleteMediaButton", () => ({
  DeleteMediaButton: () => <button>Delete</button>,
}));

const mockedUseJobPolling = vi.mocked(useJobPolling);

const baseItem = {
  id: "media-1",
  title: "Test Movie",
  type: YOUTUBE_CONTENT_TYPE,
  source_language: "en",
  youtube_video_id: "abc123",
  file_path: null,
  job_status: JOB_STATUS.DONE,
  job_progress: 100,
  thumbnailUrl: "https://example.com/thumb.jpg",
  subtitle_tracks: [],
};

describe("PersonalCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseJobPolling.mockReturnValue({
      jobState: {
        status: JOB_STATUS.DONE,
        progress: 100,
      },
      elementRef: { current: null },
    } as any);
  });

  it("renders title and thumbnail", () => {
    render(<PersonalCard item={baseItem} />);

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByAltText("Test Movie")).toBeInTheDocument();
  });

  it("links completed content to watch page", () => {
    render(<PersonalCard item={baseItem} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/watch/media-1");
  });

  it("shows YT badge for YouTube content", () => {
    render(<PersonalCard item={baseItem} />);

    expect(screen.getByText("YT")).toBeInTheDocument();
  });

  it("shows Upload badge for uploaded content", () => {
    render(<PersonalCard item={{ ...baseItem, type: UPLOAD_CONTENT_TYPE }} />);

    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("shows Uploaded file when upload has no thumbnail", () => {
    render(
      <PersonalCard
        item={{
          ...baseItem,
          type: UPLOAD_CONTENT_TYPE,
          thumbnailUrl: null,
        }}
      />,
    );

    expect(screen.getByText("Uploaded file")).toBeInTheDocument();
  });

  it("shows No thumbnail for YouTube content without thumbnail", () => {
    render(
      <PersonalCard
        item={{
          ...baseItem,
          thumbnailUrl: null,
        }}
      />,
    );

    expect(screen.getByText("No thumbnail")).toBeInTheDocument();
  });

  it("shows processing state", () => {
    mockedUseJobPolling.mockReturnValue({
      jobState: {
        status: JOB_STATUS.RUNNING,
        progress: 45,
      },
      elementRef: { current: null },
    } as any);

    render(
      <PersonalCard
        item={{
          ...baseItem,
          job_status: JOB_STATUS.RUNNING,
        }}
      />,
    );

    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("does not link errored content to watch page", () => {
    mockedUseJobPolling.mockReturnValue({
      jobState: {
        status: JOB_STATUS.ERROR,
        progress: 20,
      },
      elementRef: { current: null },
    } as any);

    render(
      <PersonalCard
        item={{
          ...baseItem,
          job_status: JOB_STATUS.ERROR,
        }}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });
});
