import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WordCollocations from "./WordCollocations";
import type { CollocationItem } from "@/types";

describe("WordCollocations", () => {
  it("renders nothing when there are no collocations", () => {
    const { container } = render(<WordCollocations collocations={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders the collocations heading", () => {
    const collocations: CollocationItem[] = [
      {
        phrase: "make a decision",
        translation: "eine Entscheidung treffen",
      },
    ];

    render(<WordCollocations collocations={collocations} />);

    expect(
      screen.getByText("Collocations", { exact: true }),
    ).toBeInTheDocument();
  });

  it("renders a collocation with its translation", () => {
    const collocations: CollocationItem[] = [
      {
        phrase: "make a decision",
        translation: "eine Entscheidung treffen",
      },
    ];

    render(<WordCollocations collocations={collocations} />);

    expect(
      screen.getByText("make a decision -> eine Entscheidung treffen"),
    ).toBeInTheDocument();
  });

  it("renders all collocations", () => {
    const collocations: CollocationItem[] = [
      {
        phrase: "make a decision",
        translation: "eine Entscheidung treffen",
      },
      {
        phrase: "take a break",
        translation: "eine Pause machen",
      },
      {
        phrase: "strong coffee",
        translation: "starker Kaffee",
      },
    ];

    render(<WordCollocations collocations={collocations} />);

    expect(
      screen.getByText("make a decision -> eine Entscheidung treffen"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("take a break -> eine Pause machen"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("strong coffee -> starker Kaffee"),
    ).toBeInTheDocument();
  });
});
