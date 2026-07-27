import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import WordCollocations from "./WordCollocations";

describe("WordCollocations", () => {
  it("does not render when there are no collocations", () => {
    render(<WordCollocations collocations={[]} />);

    expect(screen.queryByText(/collocations/i)).not.toBeInTheDocument();
  });

  it("renders heading and all collocations", () => {
    render(
      <WordCollocations
        collocations={["make a decision", "take a break", "strong coffee"]}
      />,
    );

    expect(screen.getByText("Collocations")).toBeInTheDocument();

    expect(screen.getByText("make a decision")).toBeInTheDocument();
    expect(screen.getByText("take a break")).toBeInTheDocument();
    expect(screen.getByText("strong coffee")).toBeInTheDocument();
  });

  it("renders the correct number of collocations", () => {
    const collocations = ["make a decision", "take a break", "strong coffee"];

    render(<WordCollocations collocations={collocations} />);

    expect(screen.getByText("make a decision")).toBeInTheDocument();
    expect(screen.getByText("take a break")).toBeInTheDocument();
    expect(screen.getByText("strong coffee")).toBeInTheDocument();

    expect(
      screen.getAllByText(/make a decision|take a break|strong coffee/),
    ).toHaveLength(collocations.length);
  });
});
