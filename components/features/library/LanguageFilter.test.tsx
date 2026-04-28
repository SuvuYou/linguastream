import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useLanguages } from "@/hooks/useLanguages";
import LanguageFilter from "./LanguageFilter";

vi.mock("@/hooks/useLanguages", () => ({
  useLanguages: vi.fn(),
}));

const setPreferredSourceLanguage = vi.fn();
const setPreferredTranslationLanguage = vi.fn();

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: () => ({
    setPreferredSourceLanguage,
    setPreferredTranslationLanguage,
  }),
}));

const setMock = vi.fn();

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: () => ({
    set: setMock,
  }),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseLanguages = vi.mocked(useLanguages);

const DEFAULT_LANGUAGE_RESPONSE = {
  isError: false,
  isLoading: false,
  isFetching: false,
  selectedSourceLanguage: "",
  selectedTranslationLanguage: undefined,
  availableSourceLanguages: [],
  availableTranslationLanguages: [],
};

describe("LanguageFilter", () => {
  it("shows loading state", () => {
    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      isLoading: true,
    });

    render(<LanguageFilter />);

    expect(screen.getByText(/loading languages/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      isError: true,
    });

    render(<LanguageFilter />);

    expect(screen.getByText(/failed to load languages/i)).toBeInTheDocument();
  });

  it("updates filters when source language changes", async () => {
    const user = userEvent.setup();

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "de",
      availableSourceLanguages: ["en", "de"],
      availableTranslationLanguages: ["en", "de"],
    });

    render(<LanguageFilter />);

    const selects = screen.getAllByRole("combobox");

    await user.selectOptions(selects[0], "de");

    expect(setMock).toHaveBeenCalledWith({
      src: "de",
    });

    expect(setPreferredSourceLanguage).toHaveBeenCalledWith("de");
  });

  it("updates filters when translation language changes", async () => {
    const user = userEvent.setup();

    mockedUseLanguages.mockReturnValue({
      ...DEFAULT_LANGUAGE_RESPONSE,
      selectedSourceLanguage: "en",
      selectedTranslationLanguage: "de",
      availableSourceLanguages: ["en", "de"],
      availableTranslationLanguages: ["en", "de"],
    });

    render(<LanguageFilter />);

    const selects = screen.getAllByRole("combobox");

    await user.selectOptions(selects[1], "de");

    expect(setMock).toHaveBeenCalledWith({
      sub: "de",
    });

    expect(setPreferredTranslationLanguage).toHaveBeenCalledWith("de");
  });
});
