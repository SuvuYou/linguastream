import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TranslationSubtitleRow from "@/components/features/library/ContentConfigurationModal/TranslationSubtitleRow";

vi.mock(
  "@/components/features/library/ContentConfigurationModal/FileChooser",
  () => ({
    default: ({ uploadState }: { uploadState: { status: string } | null }) => (
      <div>Mock FileChooser {uploadState?.status}</div>
    ),
  }),
);

const baseProps = {
  lang: {
    code: "en",
    label: "English",
  },
  isChecked: false,
  wasExisting: false,
  onToggle: vi.fn(),
  showUpload: false,
  uploadState: null,
  onUpload: vi.fn(),
};

describe("TranslationSubtitleRow", () => {
  it("renders language label", () => {
    render(<TranslationSubtitleRow {...baseProps} />);

    expect(screen.getByText("English")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("id", "lang-en");
  });

  it("calls onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<TranslationSubtitleRow {...baseProps} onToggle={onToggle} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows 'Will be removed' when subtitle existed but is unchecked", () => {
    render(
      <TranslationSubtitleRow {...baseProps} wasExisting isChecked={false} />,
    );

    expect(screen.getByText(/will be removed/i)).toBeInTheDocument();
  });

  it("shows 'Existing' when subtitle existed and is checked", () => {
    render(<TranslationSubtitleRow {...baseProps} wasExisting isChecked />);

    expect(screen.getByText(/existing/i)).toBeInTheDocument();
  });

  it("does not show status labels when subtitle was not existing", () => {
    render(
      <TranslationSubtitleRow {...baseProps} wasExisting={false} isChecked />,
    );

    expect(screen.queryByText(/existing/i)).not.toBeInTheDocument();

    expect(screen.queryByText(/will be removed/i)).not.toBeInTheDocument();
  });

  it("renders FileChooser when checked and upload is enabled", () => {
    render(
      <TranslationSubtitleRow
        {...baseProps}
        isChecked
        showUpload
        uploadState={{ file: null as unknown as File, status: "done" }}
      />,
    );

    expect(screen.getByText(/mock filechooser done/i)).toBeInTheDocument();
  });

  it("does not render FileChooser when unchecked", () => {
    render(
      <TranslationSubtitleRow {...baseProps} isChecked={false} showUpload />,
    );

    expect(screen.queryByText(/mock filechooser/i)).not.toBeInTheDocument();
  });

  it("does not render FileChooser when upload is disabled", () => {
    render(
      <TranslationSubtitleRow {...baseProps} isChecked showUpload={false} />,
    );

    expect(screen.queryByText(/mock filechooser/i)).not.toBeInTheDocument();
  });
});
