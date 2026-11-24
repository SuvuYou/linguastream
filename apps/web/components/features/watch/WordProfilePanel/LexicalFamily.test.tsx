import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LexicalFamily from "./LexicalFamily";
import type { LexicalFamilyItem } from "@/types";

describe("LexicalFamily", () => {
  it("renders nothing when there are no lexical family items", () => {
    const { container } = render(<LexicalFamily lexicalFamily={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders the lexical family heading", () => {
    const lexicalFamily: LexicalFamilyItem[] = [
      {
        word: "decide",
        translation: "entscheiden",
      },
    ];

    render(<LexicalFamily lexicalFamily={lexicalFamily} />);

    expect(
      screen.getByText("Lexical Family", { exact: true }),
    ).toBeInTheDocument();
  });

  it("renders a lexical family item with its translation", () => {
    const lexicalFamily: LexicalFamilyItem[] = [
      {
        word: "decide",
        translation: "entscheiden",
      },
    ];

    render(<LexicalFamily lexicalFamily={lexicalFamily} />);

    expect(screen.getByText("decide -> entscheiden")).toBeInTheDocument();
  });

  it("renders all lexical family items", () => {
    const lexicalFamily: LexicalFamilyItem[] = [
      {
        word: "decide",
        translation: "entscheiden",
      },
      {
        word: "decision",
        translation: "Entscheidung",
      },
      {
        word: "decisive",
        translation: "entscheidend",
      },
    ];

    render(<LexicalFamily lexicalFamily={lexicalFamily} />);

    expect(screen.getByText("decide -> entscheiden")).toBeInTheDocument();

    expect(screen.getByText("decision -> Entscheidung")).toBeInTheDocument();

    expect(screen.getByText("decisive -> entscheidend")).toBeInTheDocument();
  });
});
