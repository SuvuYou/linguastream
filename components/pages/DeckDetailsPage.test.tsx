import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DeckDetailPage from "./DeckDetailsPage";
import { useDeckDetail } from "@/hooks/useDeckDetail";
import { useDeckCards } from "@/hooks/useDeckCards";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import { useRouter } from "next/navigation";

const pushMock = vi.fn();
const setMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/useDeckDetail", () => ({
  useDeckDetail: vi.fn(),
}));

vi.mock("@/hooks/useDeckCards", () => ({
  useDeckCards: vi.fn(),
}));

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

vi.mock("@/components/primitives/SearchBar", () => ({
  default: () => <div>SearchBar</div>,
}));

vi.mock("../features/deck-details/DeleteCardsAlert", () => ({
  DeleteCardsAlert: (props: any) => (
    <div>
      <div data-testid="selected-count">{props.selected.size}</div>
      <button onClick={props.reset}>Reset Selection</button>
    </div>
  ),
}));

vi.mock("../features/deck-details/SourceLanguageFilter", () => ({
  default: ({ source }: any) => (
    <button onClick={() => source.onChange?.("de")}>Language Filter</button>
  ),
}));

vi.mock("../features/deck-details/CardsList", () => ({
  default: ({ cards, cardSelection }: any) => (
    <div>
      <div data-testid="cards-count">{cards.length}</div>
      <button onClick={() => cardSelection.toggle("1")}>Toggle Card</button>
    </div>
  ),
}));

const mockedUseRouter = vi.mocked(useRouter);
const mockedUseDeckDetail = vi.mocked(useDeckDetail);
const mockedUseDeckCards = vi.mocked(useDeckCards);
const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

describe("DeckDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseRouter.mockReturnValue({
      push: pushMock,
    } as any);

    mockedUseZodSearchParams.mockReturnValue({
      params: {
        page: 0,
        q: "haus",
      },
      set: setMock,
    } as any);

    mockedUseDeckDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        deck: {
          name: "German",
          is_default: true,
        },
        availableLanguages: ["de", "en"],
      },
    } as any);

    mockedUseDeckCards.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        cards: [{ id: "1" }, { id: "2" }],
        pageCount: 5,
      },
    } as any);
  });

  it("shows loading state", () => {
    mockedUseDeckDetail.mockReturnValue({
      isLoading: true,
    } as any);

    const { container } = render(<DeckDetailPage deckId="deck-1" />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(5);
  });

  it("shows error state", () => {
    mockedUseDeckCards.mockReturnValue({
      isLoading: false,
      isError: true,
    } as any);

    render(<DeckDetailPage deckId="deck-1" />);

    expect(screen.getByText(/failed to load deck/i)).toBeInTheDocument();
  });

  it("renders deck information", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    expect(screen.getAllByText("German")).toHaveLength(2);
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("SearchBar")).toBeInTheDocument();
    expect(screen.getByTestId("cards-count")).toHaveTextContent("2");
  });

  it("navigates back to decks", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Decks" }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/decks");
  });

  it("starts study session", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    fireEvent.click(screen.getByRole("button", { name: /study deck/i }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/study?deckId=deck-1");
  });

  it("changes language and resets page", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    fireEvent.click(screen.getByText("Language Filter"));

    expect(setMock).toHaveBeenCalledWith({ page: 0 });
  });

  it("toggles selected cards", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    expect(screen.getByTestId("selected-count")).toHaveTextContent("0");

    fireEvent.click(screen.getByText("Toggle Card"));

    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");
  });

  it("passes correct params to useDeckCards", () => {
    render(<DeckDetailPage deckId="deck-1" />);

    expect(mockedUseDeckCards).toHaveBeenCalledWith({
      deckId: "deck-1",
      page: 0,
      lang: undefined,
      q: "haus",
    });
  });
});
