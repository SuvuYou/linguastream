import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceLanguageFilter from "@/components/features/deck-details/SourceLanguageFilter";

vi.mock("@/helpers/language-helpers", () => ({
  getLanguageLabel: vi.fn(
    (code: string) =>
      ({
        en: "English",
        de: "German",
        fr: "French",
      })[code] ?? code,
  ),
}));

describe("SourceLanguageFilter", () => {
  it("shows loading skeleton", () => {
    render(
      <SourceLanguageFilter
        isLoading
        source={{
          value: null,
          available: [],
        }}
      />,
    );

    expect(
      screen.getByRole("status", { name: /loading languages/i }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no languages are available", () => {
    render(
      <SourceLanguageFilter
        source={{
          value: null,
          available: [],
        }}
      />,
    );

    expect(screen.getByText(/no languages available/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(
      <SourceLanguageFilter
        isError
        source={{
          value: "en",
          available: ["en"],
        }}
      />,
    );

    expect(screen.getByText(/failed to load languages/i)).toBeInTheDocument();
  });

  it("shows error when selected language is missing", () => {
    render(
      <SourceLanguageFilter
        source={{
          value: null,
          available: ["en"],
        }}
      />,
    );

    expect(screen.getByText(/failed to load languages/i)).toBeInTheDocument();
  });

  it("renders selected language", () => {
    render(
      <SourceLanguageFilter
        source={{
          value: "en",
          available: ["en", "de"],
        }}
      />,
    );

    expect(screen.getByText("Source:")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("uses custom label", () => {
    render(
      <SourceLanguageFilter
        source={{
          value: "en",
          available: ["en"],
          label: "Audio",
        }}
      />,
    );

    expect(screen.getByText("Audio:")).toBeInTheDocument();
  });

  it("disables the select", () => {
    render(
      <SourceLanguageFilter
        source={{
          value: "en",
          available: ["en"],
          disabled: true,
        }}
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
