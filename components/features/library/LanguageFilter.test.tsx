import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import LanguageFilter from "./LanguageFilter";
import { mockUseLanguages } from "@/helpers/tests/mocks/useLanguages";

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

describe("LanguageFilter", () => {
  it("shows loading state", () => {
    mockUseLanguages.loading();

    render(<LanguageFilter />);

    expect(screen.getByText(/loading languages/i)).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseLanguages.error();

    render(<LanguageFilter />);

    expect(screen.getByText(/failed to load languages/i)).toBeInTheDocument();
  });

  it("updates filters when source language changes", async () => {
    const user = userEvent.setup();

    mockUseLanguages.selected();

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

    mockUseLanguages.selected();

    render(<LanguageFilter />);

    const selects = screen.getAllByRole("combobox");

    await user.selectOptions(selects[1], "en");

    expect(setMock).toHaveBeenCalledWith({
      trans: "en",
    });

    expect(setPreferredTranslationLanguage).toHaveBeenCalledWith("en");
  });
});
