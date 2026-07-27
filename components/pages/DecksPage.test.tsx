import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DecksPage from "./DecksPage";
import { useAppStore } from "@/lib/initializations/store";
import { useDecks } from "@/hooks/useDecks";
import { useLibraryLanguages } from "@/hooks/useLibraryLanguages";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/hooks/useDecks", () => ({
  useDecks: vi.fn(),
}));

vi.mock("@/hooks/useLibraryLanguages", () => ({
  useLibraryLanguages: vi.fn(),
}));

vi.mock("@/components/features/library/LanguageFilter", () => ({
  default: () => <div>Language Filter</div>,
}));

vi.mock("@/components/features/deck/DecksGrid", () => ({
  default: ({
    decks,
    onCreateNew,
  }: {
    decks: { name: string }[];
    onCreateNew: () => void;
  }) => (
    <>
      <div data-testid="deck-count">{decks.length}</div>
      <button onClick={onCreateNew}>Create Deck</button>
    </>
  ),
}));

vi.mock("@/components/features/deck/CreateDeckModal", () => ({
  default: ({
    isOpen,
    closeModal,
  }: {
    isOpen: boolean;
    closeModal: () => void;
  }) =>
    isOpen ? (
      <div>
        <div>Modal Open</div>
        <button onClick={closeModal}>Close Modal</button>
      </div>
    ) : null,
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseDecks = vi.mocked(useDecks);
const mockedUseLibraryLanguages = vi.mocked(useLibraryLanguages);

describe("DecksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAppStore.mockReturnValue({
      preferredSourceLanguage: "de",
    } as any);

    mockedUseDecks.mockReturnValue({
      data: {
        decks: [
          { id: "1", name: "German" },
          { id: "2", name: "Spanish" },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);

    mockedUseLibraryLanguages.mockReturnValue({
      source: {
        value: "de",
        available: ["de"],
      },
      translation: {
        value: "en",
        available: ["en"],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    } as any);
  });

  it("renders page title and language filter", () => {
    render(<DecksPage />);

    expect(screen.getByText("Decks")).toBeInTheDocument();
    expect(screen.getByText("Language Filter")).toBeInTheDocument();
  });

  it("shows loading skeletons", () => {
    mockedUseDecks.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<DecksPage />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("shows error state", () => {
    mockedUseDecks.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<DecksPage />);

    expect(screen.getByText(/failed to load decks/i)).toBeInTheDocument();
  });

  it("renders decks grid", () => {
    render(<DecksPage />);

    expect(screen.getByTestId("deck-count")).toHaveTextContent("2");
  });

  it("passes preferred language to useDecks", () => {
    render(<DecksPage />);

    expect(mockedUseDecks).toHaveBeenCalledWith("de");
  });

  it("opens and closes create deck modal", () => {
    render(<DecksPage />);

    fireEvent.click(screen.getByText("Create Deck"));

    expect(screen.getByText("Modal Open")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close Modal"));

    expect(screen.queryByText("Modal Open")).not.toBeInTheDocument();
  });
});
