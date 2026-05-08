import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SubtitleOverlay from "./SubtitleOverlay";

const baseSettings = {
  showSource: true,
  showTranslation: true,
  sourceFontSize: "medium" as "medium" | "small" | "large",
  translationFontSize: "small" as "medium" | "small" | "large",
  fontColor: "#fff",
  backgroundColor: "#000",
  fontOpacity: 1,
  backgroundOpacity: 1,
};

const sourceLines = [
  {
    index: 0,
    start_ms: 0,
    end_ms: 1000,
    text: "hello",
  },
  {
    index: 0,
    start_ms: 2000,
    end_ms: 3000,
    text: "world",
  },
];

const translationLines = [
  {
    index: 0,
    start_ms: 0,
    end_ms: 1000,
    text: "hallo",
  },
];

describe("SubtitleOverlay", () => {
  it("renders nothing when no active subtitles", () => {
    const { container } = render(
      <SubtitleOverlay
        currentTimeMs={5000}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders source subtitle when active", () => {
    render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={[]}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders translation subtitle when active", () => {
    render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={[]}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("hallo")).toBeInTheDocument();
  });

  it("renders both subtitles when enabled", () => {
    render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("hallo")).toBeInTheDocument();
  });

  it("hides source when showSource is false", () => {
    render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={{
          ...baseSettings,
          showSource: false,
        }}
      />,
    );

    expect(screen.queryByText("hello")).not.toBeInTheDocument();
    expect(screen.getByText("hallo")).toBeInTheDocument();
  });

  it("hides translation when showTranslation is false", () => {
    render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={{
          ...baseSettings,
          showTranslation: false,
        }}
      />,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.queryByText("hallo")).not.toBeInTheDocument();
  });

  it("respects time changes (binary search behavior)", () => {
    const { rerender } = render(
      <SubtitleOverlay
        currentTimeMs={500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();

    rerender(
      <SubtitleOverlay
        currentTimeMs={2500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={baseSettings}
      />,
    );

    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("returns null when no matching subtitle exists", () => {
    const { container } = render(
      <SubtitleOverlay
        currentTimeMs={1500}
        sourceLines={sourceLines}
        translationLines={translationLines}
        settings={{
          ...baseSettings,
          showSource: true,
          showTranslation: true,
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
