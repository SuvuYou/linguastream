import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfigurationStep from "./ConfigurationStep";
import {
  SUBTITLE_ACQUISITION_METHODS,
  TRANSLATE_METHODS,
} from "@/helpers/const";

const mockSetSelectedSourceLang = vi.fn();
const mockHandleSubmit = vi.fn();
const mockOnSuccess = vi.fn();
const mockOnBack = vi.fn();

let mockSubmitState = {
  isPending: false,
  error: null as string | null,
};

vi.mock("@/hooks/useLanguageSelectors", () => ({
  useLanguageSelectors: () => ({
    data: {
      selectedSourceLang: "en",
      selectedTranslateLangs: new Set(["de"]),
      availableTranslationLangs: ["de", "fr"],
    },
    actions: {
      setSelectedSourceLang: mockSetSelectedSourceLang,
      toggleTranslateLang: vi.fn(),
    },
    checks: {
      isTranslationLanguageSelected: vi.fn(),
      isTranslationLanguageExisting: vi.fn(),
    },
  }),
}));

vi.mock("@/hooks/useFileUpload", () => ({
  useFileUpload: () => ({
    fileUploads: {},
    deleteKey: vi.fn(),
    handleUploadFile: vi.fn(),
  }),
}));

vi.mock("@/hooks/useYouTubeSubtitles", () => ({
  useYouTubeSubtitles: () => ({
    data: {
      allLanguages: ["en", "de"],
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useHandleContentSubmit", () => ({
  useHandleContentSubmit: () => ({
    ...mockSubmitState,
    handleSubmit: mockHandleSubmit,
  }),
}));

vi.mock(
  "@/components/features/library/ContentConfigurationModal/SourceLanguageSection",
  () => ({
    SourceLanguageSection: ({ value }: { value: string }) => (
      <div>Source language: {value}</div>
    ),
  }),
);

vi.mock(
  "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection",
  () => ({
    SourceSubtitlesSection: () => <div>Source subtitles</div>,
  }),
);

vi.mock(
  "@/components/features/library/ContentConfigurationModal/TranslationSubtitlesSection",
  () => ({
    TranslationSubtitlesSection: () => <div>Translation subtitles</div>,
  }),
);

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <span data-testid="spinner" />,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe("ConfigurationStep", () => {
  const meta = {
    title: "Test YouTube Video",
    videoId: "abc123",
    thumbnailUrl: "https://example.com/thumb.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitState = {
      isPending: false,
      error: null,
    };
  });

  it("renders video metadata and configuration sections", () => {
    render(
      <ConfigurationStep
        meta={meta}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText("Test YouTube Video")).toBeInTheDocument();
    expect(screen.getByAltText("Test YouTube Video")).toBeInTheDocument();
    expect(screen.getByText("Source language: en")).toBeInTheDocument();
    expect(screen.getByText("Source subtitles")).toBeInTheDocument();
    expect(screen.getByText("Translation subtitles")).toBeInTheDocument();
  });

  it("calls onBack when Back is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfigurationStep
        meta={meta}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(mockOnBack).toHaveBeenCalledOnce();
  });

  it("calls handleSubmit when Add to Library is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfigurationStep
        meta={meta}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add to Library" }));

    expect(mockHandleSubmit).toHaveBeenCalledOnce();
  });

  it("shows loading state while submitting", () => {
    mockSubmitState.isPending = true;

    render(
      <ConfigurationStep
        meta={meta}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText("Adding...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Adding/i })).toBeDisabled();
  });

  it("shows submit error", () => {
    mockSubmitState.error = "Failed to add video";

    render(
      <ConfigurationStep
        meta={meta}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText("Failed to add video")).toBeInTheDocument();
  });
});
