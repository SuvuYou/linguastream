import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LexicalFamily from "./LexicalFamily";

describe("LexicalFamily", () => {
  it("does not render when lexical family is empty", () => {
    render(<LexicalFamily lexicalFamily={[]} />);

    expect(screen.queryByText(/lexical family/i)).not.toBeInTheDocument();
  });

  it("renders heading and all lexical family words", () => {
    render(
      <LexicalFamily lexicalFamily={["run", "runner", "running", "ran"]} />,
    );

    expect(screen.getByText("Lexical Family")).toBeInTheDocument();

    expect(screen.getByText("run")).toBeInTheDocument();
    expect(screen.getByText("runner")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
    expect(screen.getByText("ran")).toBeInTheDocument();
  });

  it("renders the correct number of badges", () => {
    const words = ["run", "runner", "running"];

    render(<LexicalFamily lexicalFamily={words} />);

    expect(screen.getAllByText(/run|runner|running/)).toHaveLength(
      words.length,
    );
  });
});
