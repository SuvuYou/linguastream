import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TranslationSubtitlesSection } from "@/components/features/library/ContentConfigurationModal/TranslationSubtitlesSection";

import {
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHODS,
} from "@/helpers/const";
import { mockUseUser } from "@/helpers/tests/mocks/useUser";

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}));

vi.mock(
  "@/components/features/library/ContentConfigurationModal/TranslationSubtitleRow",
  () => ({
    default: ({
      lang,
      isChecked,
      wasExisting,
      showUpload,
      onToggle,
    }: {
      lang: { code: string; label: string };
      isChecked: boolean;
      wasExisting: boolean;
      showUpload: boolean;
      onToggle: () => void;
    }) => (
      <div data-testid={`row-${lang.code}`}>
        <span>{lang.label}</span>
        <span>{isChecked ? "checked" : "unchecked"}</span>
        <span>{wasExisting ? "existing" : "new"}</span>
        <span>{showUpload ? "upload" : "no-upload"}</span>

        <button onClick={onToggle}>Toggle {lang.code}</button>
      </div>
    ),
  }),
);

const baseProps = {
  acquisitionMethod: SUBTITLE_ACQUISITION_METHODS.UPLOAD,
  effectiveTranslateMethod: TRANSLATE_METHODS.LIBRETRANSLATE,
  translateMethod: TRANSLATE_METHODS.LIBRETRANSLATE,
  setTranslateMethod: vi.fn(),

  availableTranslationLangs: [
    {
      code: "en",
      label: "English",
    },
    {
      code: "de",
      label: "German",
    },
  ],

  isTranslationLanguageSelected: vi.fn((code: string) => code === "en"),
  isTranslationLanguageExisting: vi.fn((code: string) => code === "de"),
  toggleTranslateLang: vi.fn(),
  getUploadState: vi.fn(() => null),
  onUploadFile: vi.fn(),
};

describe("TranslationSubtitlesSection", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockUseUser.base();
  });

  it("renders translation method buttons for regular user", () => {
    render(<TranslationSubtitlesSection {...baseProps} />);

    expect(screen.getByText(/translation subtitles/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /libretranslate/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /upload/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /deepl/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders deepl button for admin", () => {
    mockUseUser.admin();

    render(<TranslationSubtitlesSection {...baseProps} />);

    expect(
      screen.getByRole("button", {
        name: /deepl/i,
      }),
    ).toBeInTheDocument();
  });

  it("hides upload button for whisperx acquisition method", () => {
    render(
      <TranslationSubtitlesSection
        {...baseProps}
        acquisitionMethod={SUBTITLE_ACQUISITION_METHODS.WHISPERX}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /upload/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("calls setTranslateMethod when method button is clicked", async () => {
    const user = userEvent.setup();
    const setTranslateMethod = vi.fn();

    render(
      <TranslationSubtitlesSection
        {...baseProps}
        setTranslateMethod={setTranslateMethod}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /upload/i,
      }),
    );

    expect(setTranslateMethod).toHaveBeenCalledWith(TRANSLATE_METHODS.UPLOAD);
  });

  it("renders translation rows", () => {
    render(<TranslationSubtitlesSection {...baseProps} />);

    expect(screen.getByTestId("row-en")).toBeInTheDocument();

    expect(screen.getByTestId("row-de")).toBeInTheDocument();
  });

  it("passes selected and existing states to rows", () => {
    render(<TranslationSubtitlesSection {...baseProps} />);

    const englishRow = screen.getByTestId("row-en");
    const germanRow = screen.getByTestId("row-de");

    expect(englishRow).toHaveTextContent("checked");
    expect(englishRow).toHaveTextContent("new");

    expect(germanRow).toHaveTextContent("unchecked");
    expect(germanRow).toHaveTextContent("existing");
  });

  it("shows upload mode when effective method is upload", () => {
    render(
      <TranslationSubtitlesSection
        {...baseProps}
        effectiveTranslateMethod={TRANSLATE_METHODS.UPLOAD}
      />,
    );

    expect(screen.getAllByText("upload")).toHaveLength(2);
  });

  it("calls toggleTranslateLang when row toggle is clicked", async () => {
    const user = userEvent.setup();
    const toggleTranslateLang = vi.fn();

    render(
      <TranslationSubtitlesSection
        {...baseProps}
        toggleTranslateLang={toggleTranslateLang}
      />,
    );

    await user.click(screen.getByText("Toggle en"));

    expect(toggleTranslateLang).toHaveBeenCalledWith("en");
  });
});
