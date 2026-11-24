import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SessionCompleteState from "./SessionCompleteState";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SessionCompleteState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const stats = {
    reviewedCount: 12,
    ratingCounts: {
      0: 2,
      1: 3,
      2: 4,
      3: 3,
    },
  } as const;

  it("renders completion state without next review", () => {
    render(
      <SessionCompleteState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: null,
        }}
        stats={stats}
      />,
    );

    expect(screen.getByText("All caught up!")).toBeInTheDocument();
    expect(screen.getByText("No cards due in German A1.")).toBeInTheDocument();

    expect(screen.getByText("12 cards reviewed")).toBeInTheDocument();

    expect(screen.getByText("Again: 2")).toBeInTheDocument();
    expect(screen.getByText("Hard: 3")).toBeInTheDocument();
    expect(screen.getByText("Good: 4")).toBeInTheDocument();
    expect(screen.getByText("Easy: 3")).toBeInTheDocument();

    expect(screen.queryByText(/Next review:/)).not.toBeInTheDocument();
  });

  it("renders next review date", () => {
    const date = "2026-07-27T12:00:00.000Z";

    render(
      <SessionCompleteState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: date,
        }}
        stats={stats}
      />,
    );

    expect(
      screen.getByText(`Next review: ${new Date(date).toLocaleString()}`),
    ).toBeInTheDocument();
  });

  it("navigates back to decks", () => {
    render(
      <SessionCompleteState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: null,
        }}
        stats={stats}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /back to decks/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/decks");
  });
});
