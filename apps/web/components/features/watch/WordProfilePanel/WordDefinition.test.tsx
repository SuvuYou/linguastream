import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import WordDefinition from "./WordDefinition";

describe("WordDefinition", () => {
  it("shows loading state", () => {
    render(<WordDefinition isLoading definition={null} translation={null} />);

    expect(screen.getByText("Generating definition...")).toBeInTheDocument();
  });

  it("renders nothing when there is no definition", () => {
    const { container } = render(
      <WordDefinition isLoading={false} definition={null} translation={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders translation and definition", () => {
    render(
      <WordDefinition
        isLoading={false}
        translation="house"
        definition="A building for people to live in."
      />,
    );

    expect(screen.getByText("Translation")).toBeInTheDocument();
    expect(screen.getByText("Definition")).toBeInTheDocument();

    expect(screen.getByText("house")).toBeInTheDocument();
    expect(
      screen.getByText("A building for people to live in."),
    ).toBeInTheDocument();
  });

  it("renders null translation", () => {
    render(
      <WordDefinition
        isLoading={false}
        translation={null}
        definition="A building for people to live in."
      />,
    );

    expect(screen.getByText("Definition")).toBeInTheDocument();
    expect(
      screen.getByText("A building for people to live in."),
    ).toBeInTheDocument();
  });
});
