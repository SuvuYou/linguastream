import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SessionEmptyState from "./SessionEmptyState";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SessionEmptyState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state without next review", () => {
    render(
      <SessionEmptyState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: null,
        }}
      />,
    );

    expect(screen.getByText("No cards for review")).toBeInTheDocument();
    expect(screen.getByText("No cards due in German A1.")).toBeInTheDocument();

    expect(screen.queryByText(/Next review:/)).not.toBeInTheDocument();
  });

  it("renders next review date", () => {
    const date = "2026-07-27T12:00:00.000Z";

    render(
      <SessionEmptyState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: date,
        }}
      />,
    );

    expect(
      screen.getByText(`Next review: ${new Date(date).toLocaleString()}`),
    ).toBeInTheDocument();
  });

  it("navigates back to decks", () => {
    render(
      <SessionEmptyState
        studyDetails={{
          deckTitle: "German A1",
          nextReviewAt: null,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /back to decks/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/decks");
  });
});
