import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LibraryCard from "./LibraryCard";
import { mockUseJobPolling } from "@/helpers/tests/mocks/useJobPolling";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";
import { JOB_STATUS } from "@/helpers/const";
import { createBaseLibraryItem } from "@/helpers/tests/mocks/useLibrary";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/hooks/useJobPolling", () => ({
  useJobPolling: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (
    props: React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
  ) => <img {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

beforeEach(() => {
  vi.resetAllMocks();

  mockUseUser.base();
  mockUseJobPolling.done();
});

describe("LibraryCard", () => {
  it("renders unavailable state when jellyfin item is missing", () => {
    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          jellyfinItem: undefined,
        }}
      />,
    );

    expect(screen.getByText(/no longer available/i)).toBeInTheDocument();

    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders media item", () => {
    render(<LibraryCard item={createBaseLibraryItem()} />);

    expect(screen.getByText("Movie 1")).toBeInTheDocument();

    expect(screen.getByText("Movie")).toBeInTheDocument();

    expect(screen.getByRole("link")).toHaveAttribute("href", "/watch/mediaId");

    expect(screen.getByAltText("Movie 1")).toBeInTheDocument();
  });

  it("shows processing state for pending jobs", () => {
    mockUseJobPolling.pending();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.PENDING,
        }}
      />,
    );

    expect(screen.getByText("0%")).toBeInTheDocument();

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows processing state for running jobs", () => {
    mockUseJobPolling.running();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.RUNNING,
        }}
      />,
    );

    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseJobPolling.error();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.ERROR,
        }}
      />,
    );

    expect(screen.getByText(/subtitle ingestion failed/i)).toBeInTheDocument();
  });

  it("shows configure button for admin", () => {
    mockUseUser.admin();

    render(
      <LibraryCard
        item={createBaseLibraryItem()}
        onOpenConfigModal={vi.fn()}
      />,
    );

    expect(screen.getByText("Configure")).toBeInTheDocument();
  });

  it("does not show configure button for non-admin", () => {
    mockUseUser.base();

    render(
      <LibraryCard
        item={createBaseLibraryItem()}
        onOpenConfigModal={vi.fn()}
      />,
    );

    expect(screen.queryByText("Configure")).not.toBeInTheDocument();
  });

  it("calls onOpenConfigModal when configure button is clicked", () => {
    mockUseUser.admin();

    const onOpenConfigModal = vi.fn();

    render(
      <LibraryCard
        item={createBaseLibraryItem()}
        onOpenConfigModal={onOpenConfigModal}
      />,
    );

    fireEvent.click(screen.getByText("Configure"));

    expect(onOpenConfigModal).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mediaId",
      }),
    );
  });

  it("shows reconfigure button during error state for admin", () => {
    mockUseUser.admin();
    mockUseJobPolling.error();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.ERROR,
        }}
        onOpenConfigModal={vi.fn()}
      />,
    );

    expect(screen.getByText("Reconfigure")).toBeInTheDocument();
  });

  it("calls onOpenConfigModal when reconfigure button is clicked", () => {
    mockUseUser.admin();
    mockUseJobPolling.error();

    const onOpenConfigModal = vi.fn();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.ERROR,
        }}
        onOpenConfigModal={onOpenConfigModal}
      />,
    );

    fireEvent.click(screen.getByText("Reconfigure"));

    expect(onOpenConfigModal).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mediaId",
      }),
    );
  });

  it("shows reset button for admin while processing", () => {
    mockUseUser.admin();
    mockUseJobPolling.running();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.RUNNING,
        }}
      />,
    );

    expect(screen.getByText("Reset job")).toBeInTheDocument();
  });

  it("does not show reset button for non-admin", () => {
    mockUseUser.base();
    mockUseJobPolling.running();

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.RUNNING,
        }}
      />,
    );

    expect(screen.queryByText("Reset job")).not.toBeInTheDocument();
  });

  it("calls resetJob when reset button is clicked", () => {
    mockUseUser.admin();

    mockUseJobPolling.override({
      jobState: {
        status: JOB_STATUS.RUNNING,
        progress: 50,
        logs: [],
      },
    });

    render(
      <LibraryCard
        item={{
          ...createBaseLibraryItem(),
          job_status: JOB_STATUS.RUNNING,
        }}
      />,
    );

    fireEvent.click(screen.getByText("Reset job"));

    expect(mockUseJobPolling.resetJobMock).toHaveBeenCalled();
  });
});
