import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import StudyCard from "./StudyCard";
import { calculateNextReview } from "@/lib/algorithms/sm2";

vi.mock("@/lib/algorithms/sm2", () => ({
  calculateNextReview: vi.fn(),
}));

const mockedCalculateNextReview = vi.mocked(calculateNextReview);

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const card = {
  id: "1",
  word: "Haus",
  word_translation: "House",
  context_text: "Das Haus ist groß.",
  context_translation: "The house is big.",
  contextual_definition: "A building for people to live in.",
  source_language: "de",
  translation_language: "en",
  media_content_id: "media-1",
  start_ms: 12345,
  repetitions: 2,
  interval_days: 5,
  ease_factor: 2.5,
} as any;

describe("StudyCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedCalculateNextReview.mockReturnValue({
      interval_days: 7,
      repetitions: 3,
      ease_factor: 2.5,
    } as any);
  });

  it("renders front side", () => {
    render(
      <StudyCard
        card={card}
        shouldShowBack={false}
        handleRating={vi.fn()}
        setShouldShowBack={vi.fn()}
      />,
    );

    expect(screen.getByText("Haus")).toBeInTheDocument();
    expect(screen.getByText("Das Haus ist groß.")).toBeInTheDocument();
    expect(screen.getByText("de → en")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show answer/i }),
    ).toBeInTheDocument();
  });

  it("shows back when requested", () => {
    render(
      <StudyCard
        card={card}
        shouldShowBack
        handleRating={vi.fn()}
        setShouldShowBack={vi.fn()}
      />,
    );

    expect(screen.getByText("House")).toBeInTheDocument();
    expect(
      screen.getByText("A building for people to live in."),
    ).toBeInTheDocument();
    expect(screen.getByText("The house is big.")).toBeInTheDocument();
  });

  it("calls setShouldShowBack", () => {
    const setShouldShowBack = vi.fn();

    render(
      <StudyCard
        card={card}
        shouldShowBack={false}
        handleRating={vi.fn()}
        setShouldShowBack={setShouldShowBack}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /show answer/i }));

    expect(setShouldShowBack).toHaveBeenCalledWith(true);
  });

  it("calls handleRating with each rating", () => {
    const handleRating = vi.fn();

    render(
      <StudyCard
        card={card}
        shouldShowBack
        handleRating={handleRating}
        setShouldShowBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /again/i }));
    expect(handleRating).toHaveBeenLastCalledWith(0);

    fireEvent.click(screen.getByRole("button", { name: /hard/i }));
    expect(handleRating).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    expect(handleRating).toHaveBeenLastCalledWith(2);

    fireEvent.click(screen.getByRole("button", { name: /easy/i }));
    expect(handleRating).toHaveBeenLastCalledWith(3);
  });

  it("calculates next interval for every rating", () => {
    render(
      <StudyCard
        card={card}
        shouldShowBack
        handleRating={vi.fn()}
        setShouldShowBack={vi.fn()}
      />,
    );

    expect(mockedCalculateNextReview).toHaveBeenCalledTimes(4);

    expect(mockedCalculateNextReview).toHaveBeenNthCalledWith(
      1,
      {
        repetitions: 2,
        interval_days: 5,
        ease_factor: 2.5,
      },
      0,
    );
  });

  it("renders watch link", () => {
    render(
      <StudyCard
        card={card}
        shouldShowBack
        handleRating={vi.fn()}
        setShouldShowBack={vi.fn()}
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/watch/media-1?t=12345",
    );
  });

  it("hides optional fields when absent", () => {
    render(
      <StudyCard
        card={{
          ...card,
          contextual_definition: null,
          context_translation: null,
        }}
        shouldShowBack
        handleRating={vi.fn()}
        setShouldShowBack={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("A building for people to live in."),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("The house is big.")).not.toBeInTheDocument();
  });
});
