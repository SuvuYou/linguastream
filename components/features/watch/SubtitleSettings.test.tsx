import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import SubtitleSettingsPanel from "./SubtitleSettings";

const onSettingsChange = vi.fn();

const baseSettings = {
  showSource: true,
  showTranslation: true,
  sourceFontSize: "medium" as "medium" | "small" | "large",
  translationFontSize: "small" as "medium" | "small" | "large",
  fontColor: "#ffffff",
  backgroundColor: "#000000",
  fontOpacity: 0.8,
  backgroundOpacity: 0.5,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SubtitleSettingsPanel", () => {
  it("renders settings title", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    expect(screen.getByText(/subtitle settings/i)).toBeInTheDocument();
    expect(screen.getByText("Show source")).toBeInTheDocument();
    expect(screen.getByText("Show translation")).toBeInTheDocument();
  });

  it("toggles source subtitles", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(onSettingsChange).toHaveBeenCalledWith({
      showSource: false,
    });
  });

  it("toggles translation subtitles", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(onSettingsChange).toHaveBeenCalledWith({
      showTranslation: false,
    });
  });

  it("renders font size labels", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    expect(screen.getByText(/source font size/i)).toBeInTheDocument();

    expect(screen.getByText(/translation font size/i)).toBeInTheDocument();
  });

  it("changes source font size", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const largeButtons = screen.getAllByText("large");

    fireEvent.click(largeButtons[0]);

    expect(onSettingsChange).toHaveBeenCalledWith({
      sourceFontSize: "large",
    });
  });

  it("changes translation font size", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const mediumButtons = screen.getAllByText("medium");

    fireEvent.click(mediumButtons[1]);

    expect(onSettingsChange).toHaveBeenCalledWith({
      translationFontSize: "medium",
    });
  });

  it("changes font color", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const colorInputs = screen.getAllByDisplayValue("#ffffff");

    fireEvent.change(colorInputs[0], {
      target: {
        value: "#ff0000",
      },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      fontColor: "#ff0000",
    });
  });

  it("changes background color", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const colorInputs = screen.getAllByDisplayValue("#000000");

    fireEvent.change(colorInputs[0], {
      target: {
        value: "#00ff00",
      },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      backgroundColor: "#00ff00",
    });
  });

  it("renders opacity percentages", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    expect(screen.getByText("80%")).toBeInTheDocument();

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("changes font opacity", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const sliders = screen.getAllByRole("slider");

    fireEvent.change(sliders[0], {
      target: {
        value: "0.3",
      },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      fontOpacity: 0.3,
    });
  });

  it("changes background opacity", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    const sliders = screen.getAllByRole("slider");

    fireEvent.change(sliders[1], {
      target: {
        value: "0.9",
      },
    });

    expect(onSettingsChange).toHaveBeenCalledWith({
      backgroundOpacity: 0.9,
    });
  });

  it("renders all font size options", () => {
    render(
      <SubtitleSettingsPanel
        settings={baseSettings}
        onSettingsChange={onSettingsChange}
      />,
    );

    expect(screen.getAllByText("small")).toHaveLength(2);

    expect(screen.getAllByText("medium")).toHaveLength(2);

    expect(screen.getAllByText("large")).toHaveLength(2);
  });
});
