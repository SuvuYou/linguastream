import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import WordForms from "./WordForms";

describe("WordForms", () => {
  it("does not render when there are no word forms", () => {
    render(<WordForms wordForms={{}} />);

    expect(screen.queryByText(/forms/i)).not.toBeInTheDocument();
  });

  it("renders heading and all word forms", () => {
    render(
      <WordForms
        wordForms={{
          Infinitive: "gehen",
          Past: "ging",
          Participle: "gegangen",
        }}
      />,
    );

    expect(screen.getByText("Forms")).toBeInTheDocument();

    expect(screen.getByText("Infinitive")).toBeInTheDocument();
    expect(screen.getByText("gehen")).toBeInTheDocument();

    expect(screen.getByText("Past")).toBeInTheDocument();
    expect(screen.getByText("ging")).toBeInTheDocument();

    expect(screen.getByText("Participle")).toBeInTheDocument();
    expect(screen.getByText("gegangen")).toBeInTheDocument();
  });

  it("renders the correct number of labels and values", () => {
    const wordForms = {
      Infinitive: "gehen",
      Past: "ging",
      Participle: "gegangen",
    };

    render(<WordForms wordForms={wordForms} />);

    expect(Object.keys(wordForms)).toHaveLength(3);

    for (const [label, value] of Object.entries(wordForms)) {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });
});
