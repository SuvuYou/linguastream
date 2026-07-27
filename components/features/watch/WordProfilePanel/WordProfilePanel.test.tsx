import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import WordProfilePanel from "./WordProfilePanel";
import { useAppStore } from "@/lib/initializations/store";
import { useWordProfile } from "@/hooks/useWordProfile";
import { useWordDefinition } from "@/hooks/useWordDefinition";
import { useDeckSelection } from "@/hooks/useDeckSelection";
import { useSaveCard } from "@/hooks/useSaveCard";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/hooks/useWordProfile", () => ({
  useWordProfile: vi.fn(),
}));

vi.mock("@/hooks/useWordDefinition", () => ({
  useWordDefinition: vi.fn(),
}));

vi.mock("@/hooks/useDeckSelection", () => ({
  useDeckSelection: vi.fn(),
}));

vi.mock("@/hooks/useSaveCard", () => ({
  useSaveCard: vi.fn(),
}));

vi.mock("./WordDefinition", () => ({
  default: (props: any) => (
    <div data-testid="word-definition">
      {props.definition} {props.translation}
    </div>
  ),
}));

vi.mock("./WordForms", () => ({
  default: ({ wordForms }: any) => (
    <div data-testid="word-forms">{Object.keys(wordForms).length}</div>
  ),
}));

vi.mock("./LexicalFamily", () => ({
  default: ({ lexicalFamily }: any) => (
    <div data-testid="lexical-family">{lexicalFamily.length}</div>
  ),
}));

vi.mock("./WordCollocations", () => ({
  default: ({ collocations }: any) => (
    <div data-testid="word-collocations">{collocations.length}</div>
  ),
}));

vi.mock("./SaveToDeck", () => ({
  default: ({ handleSave, allowSave }: any) => (
    <>
      <div data-testid="allow-save">{String(allowSave)}</div>
      <button onClick={handleSave}>Save</button>
    </>
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const mockedUseWordProfile = vi.mocked(useWordProfile);
const mockedUseWordDefinition = vi.mocked(useWordDefinition);
const mockedUseDeckSelection = vi.mocked(useDeckSelection);
const mockedUseSaveCard = vi.mocked(useSaveCard);

describe("WordProfilePanel", () => {
  const save = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseAppStore.mockReturnValue({
      activeWord: {
        word: "Haus",
        context: "Das Haus ist groß.",
      },
    } as any);

    mockedUseWordProfile.mockReturnValue({
      isLoading: false,
      data: {
        id: "profile-1",
        part_of_speech: "noun",
        forms: { Plural: "Häuser" },
        lexical_family: ["häuslich"],
        collocations: ["Haus bauen"],
      },
    } as any);

    mockedUseWordDefinition.mockReturnValue({
      isLoading: false,
      data: {
        translation: "house",
        definition: "A building.",
      },
    } as any);

    mockedUseDeckSelection.mockReturnValue({
      decks: [],
      selectedDeckId: "deck-1",
      setSelectedDeckId: vi.fn(),
    } as any);

    mockedUseSaveCard.mockReturnValue({
      save,
      saved: false,
      isSaving: false,
      error: null,
      reset: vi.fn(),
    } as any);
  });

  it("shows placeholder when no active word", () => {
    mockedUseAppStore.mockReturnValue({
      activeWord: null,
    } as any);

    render(<WordProfilePanel />);

    expect(
      screen.getByText(/click a word in the subtitles/i),
    ).toBeInTheDocument();
  });

  it("renders active word and context", () => {
    render(<WordProfilePanel />);

    expect(screen.getByText("Haus")).toBeInTheDocument();
    expect(screen.getByText("Das Haus ist groß.")).toBeInTheDocument();
    expect(screen.getByText("noun")).toBeInTheDocument();
  });

  it("shows loading profile state", () => {
    mockedUseWordProfile.mockReturnValue({
      isLoading: true,
      data: null,
    } as any);

    render(<WordProfilePanel />);

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it("renders profile sections", () => {
    render(<WordProfilePanel />);

    expect(screen.getByTestId("word-definition")).toBeInTheDocument();
    expect(screen.getByTestId("word-forms")).toBeInTheDocument();
    expect(screen.getByTestId("lexical-family")).toBeInTheDocument();
    expect(screen.getByTestId("word-collocations")).toBeInTheDocument();
  });

  it("passes allowSave=true when everything is available", () => {
    render(<WordProfilePanel />);

    expect(screen.getByTestId("allow-save")).toHaveTextContent("true");
  });

  it("passes allowSave=false when profile is missing", () => {
    mockedUseWordProfile.mockReturnValue({
      isLoading: false,
      data: null,
    } as any);

    render(<WordProfilePanel />);

    expect(screen.getByTestId("allow-save")).toHaveTextContent("false");
  });

  it("calls save with correct payload", () => {
    render(<WordProfilePanel />);

    fireEvent.click(screen.getByText("Save"));

    expect(save).toHaveBeenCalledWith({
      activeWord: {
        word: "Haus",
        context: "Das Haus ist groß.",
      },
      profileId: "profile-1",
      definition: "A building.",
      wordTranslation: "house",
      deckId: "deck-1",
    });
  });
});
