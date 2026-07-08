import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { SourceLanguageSection } from "@/components/features/library/ContentConfigurationModal/SourceLanguageSection";
import { AUTO_DETECT } from "@/helpers/const";

vi.mock("@/components/ui/select", () => {
  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    const options: { value: string; label: React.ReactNode }[] = [];

    React.Children.forEach(children, (child: any) => {
      if (!React.isValidElement(child)) return;

      if (child.type === SelectContent) {
        React.Children.forEach(child.props.children, (item: any) => {
          if (!React.isValidElement(item)) return;

          options.push({
            value: item.props.value,
            label: item.props.children,
          });
        });
      }
    });

    return (
      <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  const SelectValue = () => null;
  const SelectItem = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

describe("SourceLanguageSection", () => {
  const baseProps = {
    value: AUTO_DETECT,
    onChange: vi.fn(),
  };

  it("renders label", () => {
    render(<SourceLanguageSection {...baseProps} />);

    expect(screen.getByText(/content source language/i)).toBeInTheDocument();
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

    expect(onChange).toHaveBeenCalledWith("auto");
  });

  it("renders language options from constants", () => {
    render(<SourceLanguageSection {...baseProps} />);

    const options = screen.getAllByRole("option");

    expect(options.length).toBeGreaterThan(1);
  });
});
