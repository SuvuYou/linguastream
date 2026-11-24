import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StudyPage from "./StudyPage";
import { useAppStore } from "@/lib/initializations/store";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import useStudyQueue from "@/hooks/useStudyQueue";
import useStudySessionRating from "@/hooks/useStudySessionRating";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

vi.mock("@/hooks/useStudyQueue", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/useStudySessionRating", () => ({
  default: vi.fn(),
}));

vi.mock("@/components/features/study/StudyCard", () => ({
  default: (props: any) => (
    <div data-testid="study-card">
      <button onClick={() => props.handleRating(2)}>Rate</button>
    </div>
  ),
}));

vi.mock("@/components/features/study/SessionEmptyState", () => ({
  default: () => <div>Empty State</div>,
}));

vi.mock("@/components/features/study/SessionCompleteState", () => ({
  default: () => <div>Complete State</div>,
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);
const mockedUseStudyQueue = vi.mocked(useStudyQueue);
const mockedUseStudySessionRating = vi.mocked(useStudySessionRating);

describe("StudyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAppStore.mockReturnValue({
      preferredSourceLanguage: "de",
    } as any);

    mockedUseZodSearchParams.mockReturnValue({
      params: {
        deckId: "deck-1",
        src: "de",
      },
    } as any);

    mockedUseStudyQueue.mockReturnValue({
      isLoading: false,
      currentCard: {
        id: "1",
      },
      studyDetails: {
        totalDue: 10,
        deckTitle: "German",
        nextReviewAt: null,
      },
    } as any);

    mockedUseStudySessionRating.mockReturnValue({
      shouldShowBack: false,
      setShouldShowBack: vi.fn(),
      handleRating: vi.fn(),
      stats: {
        reviewedCount: 2,
        ratingCounts: {
          0: 0,
          1: 0,
          2: 2,
          3: 0,
        },
      },
    } as any);
  });

  it("shows loading state", () => {
    mockedUseStudyQueue.mockReturnValue({
      isLoading: true,
    } as any);

    mockedUseStudyQueue.mockReturnValue({
      isLoading: true,
      currentCard: {
        id: "1",
      },
      studyDetails: {
        totalDue: 10,
        deckTitle: "German",
        nextReviewAt: null,
      },
    } as any);

    const { container } = render(<StudyPage />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("shows empty state", () => {
    mockedUseStudyQueue.mockReturnValue({
      isLoading: false,
      studyDetails: {
        totalDue: 0,
        deckTitle: "German",
        nextReviewAt: null,
      },
    } as any);

    render(<StudyPage />);

    expect(screen.getByText("Empty State")).toBeInTheDocument();
  });

  it("shows complete state", () => {
    mockedUseStudySessionRating.mockReturnValue({
      shouldShowBack: false,
      setShouldShowBack: vi.fn(),
      handleRating: vi.fn(),
      stats: {
        reviewedCount: 5,
        ratingCounts: {},
      },
    } as any);

    mockedUseStudyQueue.mockReturnValue({
      isLoading: false,
      currentCard: { id: "1" },
      studyDetails: {
        totalDue: 5,
        deckTitle: "German",
        nextReviewAt: null,
      },
    } as any);

    render(<StudyPage />);

    expect(screen.getByText("Complete State")).toBeInTheDocument();
  });

  it("shows fallback skeleton when current card is missing", () => {
    mockedUseStudyQueue.mockReturnValue({
      isLoading: false,
      currentCard: null,
      studyDetails: {
        totalDue: 5,
        deckTitle: "German",
        nextReviewAt: null,
      },
    } as any);

    const { container } = render(<StudyPage />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders current study card and progress", () => {
    render(<StudyPage />);

    expect(screen.getByTestId("study-card")).toBeInTheDocument();
    expect(screen.getByText("Card 2 of 10")).toBeInTheDocument();
  });

  it("ends session", () => {
    render(<StudyPage />);

    fireEvent.click(screen.getByRole("button", { name: /end session/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/decks");
  });

  it("passes handleRating to StudyCard", () => {
    const handleRating = vi.fn();

    mockedUseStudySessionRating.mockReturnValue({
      shouldShowBack: false,
      setShouldShowBack: vi.fn(),
      handleRating,
      stats: {
        reviewedCount: 2,
        ratingCounts: {},
      },
    } as any);

    render(<StudyPage />);

    fireEvent.click(screen.getByText("Rate"));

    expect(handleRating).toHaveBeenCalledWith(2);
  });

  it("uses study queue hook with params", () => {
    render(<StudyPage />);

    expect(mockedUseStudyQueue).toHaveBeenCalledWith("deck-1", "de");
  });
});
