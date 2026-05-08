import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentConfigurationModal from "@/components/features/library/ContentConfigurationModal/Modal";

vi.mock("@/hooks/useFileUpload", () => ({
  useFileUpload: vi.fn(),
}));

vi.mock("@/hooks/useLanguageSelectors", () => ({
  useLanguageSelectors: vi.fn(),
}));

vi.mock(
  "@/components/features/library/ContentConfigurationModal/SourceLanguageSection",
  () => ({
    SourceLanguageSection: () => <div>SourceLanguageSection</div>,
  }),
);

vi.mock(
  "@/components/features/library/ContentConfigurationModal/SourceSubtitlesSection",
  () => ({
    SourceSubtitlesSection: () => <div>SourceSubtitlesSection</div>,
  }),
);

vi.mock(
  "@/components/features/library/ContentConfigurationModal/TranslationSubtitlesSection",
  () => ({
    TranslationSubtitlesSection: () => <div>TranslationSubtitlesSection</div>,
  }),
);

import { useFileUpload } from "@/hooks/useFileUpload";
import { useLanguageSelectors } from "@/hooks/useLanguageSelectors";
import { createBaseLibraryItem } from "@/helpers/tests/mocks/useLibrary";

const mockUseFileUpload = vi.mocked(useFileUpload);
const mockUseLanguageSelectors = vi.mocked(useLanguageSelectors);

const setupMocks = () => {
  mockUseFileUpload.mockReturnValue({
    fileUploads: {},
    handleUploadFile: vi.fn(),
    deleteKey: vi.fn(),
    areFilesReady: vi.fn(() => true),
    extractPathsMap: vi.fn(() => ({})),
  });

  mockUseLanguageSelectors.mockReturnValue({
    data: {
      selectedSourceLang: "en",
      selectedTranslateLangs: new Set(["de"]),
      availableTranslationLangs: [],
      removedTranslationLangs: [],
    },
    actions: {
      setSelectedSourceLang: vi.fn(),
      toggleTranslateLang: vi.fn(),
    },
    checks: {
      isTranslationLanguageSelected: vi.fn(),
      isTranslationLanguageExisting: vi.fn(),
    },
  });
};

describe("ContentConfigurationModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupMocks();
  });

  it("renders modal content and title", () => {
    render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("renders all section components", () => {
    render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("SourceLanguageSection")).toBeInTheDocument();
    expect(screen.getByText("SourceSubtitlesSection")).toBeInTheDocument();
    expect(screen.getByText("TranslationSubtitlesSection")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(container.firstChild as HTMLElement);

    expect(onClose).toHaveBeenCalled();
  });

  it("does NOT close when clicking modal content", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByText("title"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("enables save button when ready", () => {
    render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    const saveButton = screen.getByRole("button", {
      name: /save/i,
    });

    expect(saveButton).toBeEnabled();
  });

  it("shows cancel button", () => {
    render(
      <ContentConfigurationModal
        item={createBaseLibraryItem()}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
});
