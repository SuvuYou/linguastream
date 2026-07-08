import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import SubtitleSettingsPanel from "./SubtitleSettings";
import { useAppStore } from "@/lib/initializations/store";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

vi.mock("@/components/ui/field", () => ({
  Field: ({ children }: any) => <div>{children}</div>,
  FieldLabel: ({ children }: any) => <label>{children}</label>,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button onClick={() => onCheckedChange(!checked)}>
      {checked ? "on" : "off"}
    </button>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button onClick={onClick ?? (() => {})} data-value={value}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange }: any) => (
    <input
      type="range"
      role="slider"
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);
const setSubtitleSettings = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings: {
      showSource: true,
      showTranslation: true,
      sourceFontSize: "medium",
      translationFontSize: "small",
      fontColor: "#ffffff",
      backgroundColor: "#000000",
      fontOpacity: 0.8,
      backgroundOpacity: 0.5,
    },
    setSubtitleSettings,
  });
});

describe("SubtitleSettingsPanel", () => {
  it("renders settings title", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText(/subtitle settings/i)).toBeInTheDocument();
    expect(screen.getByText(/show source/i)).toBeInTheDocument();
    expect(screen.getByText(/show translation/i)).toBeInTheDocument();
  });

  it("toggles source subtitles", () => {
    render(<SubtitleSettingsPanel />);

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      showSource: false,
    });
  });

  it("toggles translation subtitles", () => {
    render(<SubtitleSettingsPanel />);

    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      showTranslation: false,
    });
  });

  it("renders font size labels", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText(/source font size/i)).toBeInTheDocument();
    expect(screen.getByText(/translation font size/i)).toBeInTheDocument();
  });

  it("renders all font size options", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getAllByText("small")).toHaveLength(2);
    expect(screen.getAllByText("medium")).toHaveLength(2);
    expect(screen.getAllByText("large")).toHaveLength(2);
  });

  it("changes font color", () => {
    render(<SubtitleSettingsPanel />);

    const input = screen.getByDisplayValue("#ffffff");

    fireEvent.change(input, {
      target: { value: "#ff0000" },
    });

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      fontColor: "#ff0000",
    });
  });

  it("changes background color", () => {
    render(<SubtitleSettingsPanel />);

    const input = screen.getByDisplayValue("#000000");

    fireEvent.change(input, {
      target: { value: "#00ff00" },
    });

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      backgroundColor: "#00ff00",
    });
  });

  it("renders opacity percentages", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("changes font opacity", () => {
    render(<SubtitleSettingsPanel />);

    fireEvent.change(screen.getAllByRole("slider")[0], {
      target: { value: "0.3" },
    });

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      fontOpacity: 0.3,
    });
  });

  it("changes background opacity", () => {
    render(<SubtitleSettingsPanel />);

    fireEvent.change(screen.getAllByRole("slider")[1], {
      target: { value: "0.9" },
    });

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      backgroundOpacity: 0.9,
    });
  });
});
