import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LanguageFilter from "./LanguageFilter";

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      data-testid="select"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

vi.mock("@/components/ui/field", () => ({
  Field: ({ children }: any) => <div>{children}</div>,
  FieldLabel: ({ children }: any) => <label>{children}</label>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/empty", () => ({
  Empty: ({ children }: any) => <div>{children}</div>,
  EmptyTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div>Loading languages</div>,
}));

const onSourceChange = vi.fn();
const onTranslationChange = vi.fn();

const baseProps = {
  source: {
    value: "en",
    available: ["en", "de"],
    onChange: onSourceChange,
  },
  translation: {
    value: "de",
    available: ["de", "en"],
    onChange: onTranslationChange,
  },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("LanguageFilter", () => {
  it("shows loading state", () => {
    render(<LanguageFilter {...baseProps} isLoading />);

    expect(screen.getAllByText(/loading languages/i)).toHaveLength(2);
  });

  it("shows error state", () => {
    render(<LanguageFilter {...baseProps} isError />);

    expect(screen.getByText(/failed to load languages/i)).toBeInTheDocument();
  });

  it("shows empty state when no languages are available", () => {
    render(
      <LanguageFilter
        source={{ ...baseProps.source, available: [] }}
        translation={{ ...baseProps.translation, available: [] }}
      />,
    );

    expect(screen.getByText(/no languages available/i)).toBeInTheDocument();
  });

  it("renders both selects", () => {
    render(<LanguageFilter {...baseProps} />);

    expect(screen.getAllByTestId("select")).toHaveLength(2);
  });

  it("calls source onChange", () => {
    render(<LanguageFilter {...baseProps} />);

    fireEvent.change(screen.getAllByTestId("select")[0], {
      target: { value: "de" },
    });

    expect(onSourceChange).toHaveBeenCalledWith("de");
  });

  it("calls translation onChange", () => {
    render(<LanguageFilter {...baseProps} />);

    fireEvent.change(screen.getAllByTestId("select")[1], {
      target: { value: "en" },
    });

    expect(onTranslationChange).toHaveBeenCalledWith("en");
  });

  it("renders custom labels", () => {
    render(
      <LanguageFilter
        source={{ ...baseProps.source, label: "Input" }}
        translation={{ ...baseProps.translation, label: "Output" }}
      />,
    );

    expect(screen.getByText("Input:")).toBeInTheDocument();
    expect(screen.getByText("Output:")).toBeInTheDocument();
  });
});
