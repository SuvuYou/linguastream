import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardAccordionItem from "./CardAccordionItem";
import type { DeckDetailCard } from "@/hooks/useDeckCards";

vi.mock("@/helpers/language-helpers", () => ({
  getLanguageLabel: vi.fn((language: string) => {
    const labels: Record<string, string> = {
      en: "English",
      de: "German",
      fr: "French",
    };

    return labels[language] ?? language;
  }),
}));

vi.mock("@/components/features/player/PlayerSmall", () => ({
  default: vi.fn(({ streamUrl, mediaItem }) => (
    <div data-testid="player-small">
      <span>{streamUrl}</span>
      <span>{mediaItem.media_title}</span>
    </div>
  )),
}));

vi.mock("../player/YouTubePlayerSmall", () => ({
  default: vi.fn(({ videoId, mediaItem }) => (
    <div data-testid="youtube-player-small">
      <span>{videoId}</span>
      <span>{mediaItem.media_title}</span>
    </div>
  )),
}));

vi.mock("@/components/ui/accordion", () => ({
  AccordionItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-item">{children}</div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">{children}</div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    onClick,
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    onClick: (event: React.MouseEvent) => void;
  }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(event) => {
        onClick(event);
        onCheckedChange(!checked);
      }}
    />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    target,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    onClick?: (event: React.MouseEvent) => void;
  }) => (
    <a href={href} target={target} onClick={onClick}>
      {children}
    </a>
  ),
}));

function createCard(overrides: Partial<DeckDetailCard> = {}): DeckDetailCard {
  return {
    id: "card-1",
    lemma: "Haus",
    word: "Haus",
    word_translation: "house",
    source_language: "en",
    media_content_id: "media-1",
    start_ms: 12345,
    context_text: "This is a Haus in Berlin.",
    context_translation: "Das ist ein Haus in Berlin.",
    contextual_definition: "A building where people live.",
    streamUrl: null,
    videoId: null,
    word_profile: null,
    ...overrides,
  } as DeckDetailCard;
}

function renderCard(
  cardOverrides: Partial<DeckDetailCard> = {},
  selected = false,
) {
  const toggle = vi.fn();

  const card = createCard(cardOverrides);

  render(
    <CardAccordionItem
      card={card}
      cardSelection={{
        selected: new Set(selected ? [card.id] : []),
        toggle,
      }}
    />,
  );

  return { card, toggle };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CardAccordionItem", () => {
  it("renders the basic card information", () => {
    renderCard();

    expect(screen.getByText("house")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders the checkbox as selected when the card is selected", () => {
    renderCard({}, true);

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("renders the checkbox as unselected when the card is not selected", () => {
    renderCard();

    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("toggles card selection when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const { toggle } = renderCard();

    await user.click(screen.getByRole("checkbox"));

    expect(toggle).toHaveBeenCalledWith("card-1");
  });

  it("renders a link to the media at the card timestamp", () => {
    renderCard();

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("href", "/watch/media-1?t=12345");

    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders the contextual definition", () => {
    renderCard({
      contextual_definition: "A building where people live.",
    });

    expect(screen.getByText("Definition")).toBeInTheDocument();
    expect(
      screen.getByText("A building where people live."),
    ).toBeInTheDocument();
  });

  it("does not render the definition section when there is no definition", () => {
    renderCard({
      contextual_definition: null,
    });

    expect(screen.queryByText("Definition")).not.toBeInTheDocument();
  });

  it("renders word forms", () => {
    renderCard({
      word_profile: {
        forms: {
          plural: "Häuser",
          diminutive: "Häuschen",
        },
        lexical_family: [],
        collocations: [],
      },
    });

    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("plural")).toBeInTheDocument();
    expect(screen.getByText("Häuser")).toBeInTheDocument();
    expect(screen.getByText("diminutive")).toBeInTheDocument();
    expect(screen.getByText("Häuschen")).toBeInTheDocument();
  });

  it("does not render forms when the forms object is empty", () => {
    renderCard({
      word_profile: {
        forms: {},
        lexical_family: [],
        collocations: [],
      },
    });

    expect(screen.queryByText("Forms")).not.toBeInTheDocument();
  });

  it("renders the lexical family", () => {
    renderCard({
      word_profile: {
        forms: {},
        lexical_family: [
          {
            word: "Häuser",
            translation: "houses",
          },
          {
            word: "häuslich",
            translation: "domestic",
          },
        ],
        collocations: [],
      },
    });

    expect(screen.getByText("Lexical Family")).toBeInTheDocument();

    expect(screen.getByText("Häuser -> houses")).toBeInTheDocument();

    expect(screen.getByText("häuslich -> domestic")).toBeInTheDocument();
  });

  it("does not render lexical family when it is empty", () => {
    renderCard({
      word_profile: {
        forms: {},
        lexical_family: [],
        collocations: [],
      },
    });

    expect(screen.queryByText("Lexical Family")).not.toBeInTheDocument();
  });

  it("renders collocations", () => {
    renderCard({
      word_profile: {
        forms: {},
        lexical_family: [],
        collocations: [
          {
            phrase: "ein Haus bauen",
            translation: "build a house",
          },
          {
            phrase: "zu Hause",
            translation: "at home",
          },
        ],
      },
    });

    expect(screen.getByText("Collocations")).toBeInTheDocument();

    expect(
      screen.getByText("ein Haus bauen -> build a house"),
    ).toBeInTheDocument();

    expect(screen.getByText("zu Hause -> at home")).toBeInTheDocument();
  });

  it("does not render profile sections when there is no word profile", () => {
    renderCard({
      word_profile: null,
    });

    expect(screen.queryByText("Forms")).not.toBeInTheDocument();

    expect(screen.queryByText("Lexical Family")).not.toBeInTheDocument();

    expect(screen.queryByText("Collocations")).not.toBeInTheDocument();
  });

  it("renders the context translation when available", () => {
    renderCard({
      context_translation: "Das ist ein Haus.",
    });

    expect(screen.getByText("Das ist ein Haus.")).toBeInTheDocument();
  });

  it("does not render context translation when unavailable", () => {
    renderCard({
      context_translation: null,
    });

    expect(
      screen.queryByText("Das ist ein Haus in Berlin."),
    ).not.toBeInTheDocument();
  });

  it("renders the small player for stream content", () => {
    renderCard({
      streamUrl: "https://example.com/stream.m3u8",
    });

    expect(screen.getByTestId("player-small")).toBeInTheDocument();

    expect(
      screen.getByText("https://example.com/stream.m3u8"),
    ).toBeInTheDocument();
  });

  it("does not render the small player without a stream URL", () => {
    renderCard({
      streamUrl: null,
      videoId: null,
    });

    expect(screen.queryByTestId("player-small")).not.toBeInTheDocument();
  });

  it("renders the YouTube player for YouTube content", () => {
    renderCard({
      videoId: "youtube-123",
    });

    expect(screen.getByTestId("youtube-player-small")).toBeInTheDocument();

    expect(screen.getByText("youtube-123")).toBeInTheDocument();
  });

  it("does not render the YouTube player without a video id", () => {
    renderCard({
      streamUrl: null,
      videoId: null,
    });

    expect(
      screen.queryByTestId("youtube-player-small"),
    ).not.toBeInTheDocument();
  });

  it("renders the word highlighted in the context", () => {
    renderCard({
      word: "Berlin",
      context_text: "Ich sehe ein Berlin.",
    });

    const highlighted = screen.getByText("Berlin");

    expect(highlighted.tagName).toBe("MARK");
  });

  it("highlights the word case-insensitively", () => {
    renderCard({
      word: "Berlin",
      context_text: "Ich sehe ein Berlin.",
    });

    const highlighted = screen.getByText("Berlin");

    expect(highlighted.tagName).toBe("MARK");
  });

  it("renders the full context when the word is empty", () => {
    renderCard({
      word: "",
      context_text: "This is some context.",
    });

    expect(screen.getByText("This is some context.")).toBeInTheDocument();
  });

  it("passes adapted media data to the stream player", () => {
    renderCard({
      word: "Haus",
      context_text: "Ich sehe ein Haus.",
      context_translation: "I see a house.",
      streamUrl: "stream-url",
    });

    expect(screen.getByTestId("player-small")).toBeInTheDocument();
  });

  it("renders both players when both media sources are present", () => {
    renderCard({
      streamUrl: "stream-url",
      videoId: "youtube-123",
    });

    expect(screen.getByTestId("player-small")).toBeInTheDocument();

    expect(screen.getByTestId("youtube-player-small")).toBeInTheDocument();
  });
});
