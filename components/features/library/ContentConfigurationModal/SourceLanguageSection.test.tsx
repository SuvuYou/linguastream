import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourceLanguageSection } from "@/components/features/library/ContentConfigurationModal/SourceLanguageSection";
import { AUTO_DETECT } from "@/helpers/const";

describe("SourceLanguageSection", () => {
  const baseProps = {
    value: AUTO_DETECT,
    onChange: vi.fn(),
  };

  it("renders label", () => {
    render(<SourceLanguageSection {...baseProps} />);

    expect(screen.getByText(/content language/i)).toBeInTheDocument();
  });

  it("renders auto-detect option", () => {
    render(<SourceLanguageSection {...baseProps} />);

    expect(
      screen.getByRole("option", {
        name: /auto-detect/i,
      }),
    ).toBeInTheDocument();
  });

  it("select has correct initial value", () => {
    render(<SourceLanguageSection {...baseProps} value="en" />);

    const select = screen.getByRole("combobox");

    expect(select).toHaveValue("en");
  });

  it("calls onChange when selection changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SourceLanguageSection {...baseProps} onChange={onChange} />);

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "auto");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBe("auto");
  });

  it("renders language options from constants", () => {
    render(<SourceLanguageSection {...baseProps} />);

    const options = screen.getAllByRole("option");

    // at least auto-detect + some languages
    expect(options.length).toBeGreaterThan(1);
  });
});
