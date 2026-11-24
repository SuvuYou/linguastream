import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import SourceUploadFilter from "./SourceUploadFilter";
import { YOUTUBE_CONTENT_TYPE, UPLOAD_CONTENT_TYPE } from "@/helpers/const";

vi.mock("@/components/ui/select", () => {
  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  const Select = ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
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
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
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
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

describe("SourceUploadFilter", () => {
  const baseProps = {
    type: {
      value: "all" as const,
      onChange: vi.fn(),
    },
  };

  it("renders all source options", () => {
    render(<SourceUploadFilter {...baseProps} />);

    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "YouTube" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Uploads" })).toBeInTheDocument();
  });

  it("calls onChange when source changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SourceUploadFilter
        type={{
          value: "all",
          onChange,
        }}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      YOUTUBE_CONTENT_TYPE,
    );

    expect(onChange).toHaveBeenCalledWith(YOUTUBE_CONTENT_TYPE);
  });

  it("disables select when disabled", () => {
    render(<SourceUploadFilter type={{ ...baseProps.type, disabled: true }} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders skeleton while loading", () => {
    render(<SourceUploadFilter {...baseProps} isLoading />);

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("renders error state", () => {
    render(<SourceUploadFilter {...baseProps} isError />);

    expect(screen.getByText("Failed to load")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
