import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import CardAccordionItem from "./CardAccordionItem";

vi.mock("@/components/features/player/PlayerSmall", () => ({
  __esModule: true,
  default: () => <div data-testid="player">Player</div>,
}));

vi.mock("@/components/ui/accordion", () => ({
  AccordionItem: ({ children }: any) => <div>{children}</div>,
  AccordionTrigger: ({ children }: any) => <div>{children}</div>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: any) => <>{children}</>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange}
      aria-label="Select card"
    />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock("@/helpers/language-helpers", () => ({
  getLanguageLabel: vi.fn(() => "English"),
}));

describe("CardAccordionItem", () => {
  const toggle = vi.fn();

  const baseCard = {
    id: "card-1",
    word: "laufen",
    word_translation: "run",
    source_language: "de",
    media_content_id: "media-1",
    start_ms: 1500,

    context_text: "Ich laufe jeden Tag.",
    context_translation: "I run every day.",

    contextual_definition: "to move quickly on foot",

    streamUrl: "/video.mp4",

    word_profile: {
      forms: {
        Present: "läuft",
        Past: "lief",
      },
      lexical_family: ["laufen", "Läufer"],
      collocations: ["schnell laufen", "weit laufen"],
    },
  };

  const selection = {
    selected: new Set<string>(),
    toggle,
  };

  it("renders basic card information", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByText("run")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Ich laufe jeden Tag.")).toBeInTheDocument();
  });

  it("renders definition", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByText("Definition")).toBeInTheDocument();
    expect(screen.getByText("to move quickly on foot")).toBeInTheDocument();
  });

  it("renders forms", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByText("Forms")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("läuft")).toBeInTheDocument();
    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByText("lief")).toBeInTheDocument();
  });

  it("renders lexical family and collocations", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByText("Lexical Family")).toBeInTheDocument();
    expect(screen.getByText("Läufer")).toBeInTheDocument();

    expect(screen.getByText("Collocations")).toBeInTheDocument();
    expect(screen.getByText("schnell laufen")).toBeInTheDocument();
    expect(screen.getByText("weit laufen")).toBeInTheDocument();
  });

  it("renders context translation", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByText("I run every day.")).toBeInTheDocument();
  });

  it("renders player when stream url exists", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByTestId("player")).toBeInTheDocument();
  });

  it("calls toggle when checkbox changes", async () => {
    const user = userEvent.setup();

    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(toggle).toHaveBeenCalledWith("card-1");
  });

  it("renders checked checkbox when selected", () => {
    render(
      <CardAccordionItem
        card={baseCard as any}
        cardSelection={{
          selected: new Set(["card-1"]),
          toggle,
        }}
      />,
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders external link", () => {
    render(
      <CardAccordionItem card={baseCard as any} cardSelection={selection} />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/watch/media-1?t=1500",
    );
  });

  it("does not render optional sections when data is missing", () => {
    render(
      <CardAccordionItem
        card={
          {
            ...baseCard,
            contextual_definition: null,
            context_translation: null,
            streamUrl: null,
            word_profile: {
              forms: {},
              lexical_family: [],
              collocations: [],
            },
          } as any
        }
        cardSelection={selection}
      />,
    );

    expect(screen.queryByText("Definition")).not.toBeInTheDocument();
    expect(screen.queryByText("Forms")).not.toBeInTheDocument();
    expect(screen.queryByText("Lexical Family")).not.toBeInTheDocument();
    expect(screen.queryByText("Collocations")).not.toBeInTheDocument();
    expect(screen.queryByTestId("player")).not.toBeInTheDocument();
    expect(screen.queryByText("I run every day.")).not.toBeInTheDocument();
  });
});
