import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAppStore } from "@/lib/initializations/store";
import SubtitleSettingsPanel from "./SubtitleSettings";

vi.mock("@/lib/initializations/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    value,
    onValueChange,
  }: {
    value: number[];
    onValueChange: (value: number[]) => void;
  }) => (
    <input
      type="range"
      role="slider"
      value={value[0]}
      min={0}
      max={1}
      step={0.01}
      onChange={(e) => onValueChange([Number(e.target.value)])}
    />
  ),
}));

const mockedUseAppStore = vi.mocked(useAppStore);

const setSubtitleSettings = vi.fn();

const subtitleSettings = {
  showSource: true,
  showTranslation: false,
  sourceFontSize: "medium",
  translationFontSize: "small",
  highlightFontColor: "#ffff00",
  sourceFontColor: "#ffffff",
  sourceBackgroundColor: "#000000",
  translationFontColor: "#ffffff",
  translationBackgroundColor: "#000000",
  fontOpacity: 0.8,
  backgroundOpacity: 0.5,
};

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseAppStore.mockReturnValue({
    subtitleSettings,
    setSubtitleSettings,
  } as ReturnType<typeof useAppStore>);
});

describe("SubtitleSettingsPanel", () => {
  it("renders the settings controls", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText("Subtitle Settings")).toBeInTheDocument();

    expect(screen.getByLabelText("Show source")).toBeInTheDocument();
    expect(screen.getByLabelText("Show translation")).toBeInTheDocument();

    expect(screen.getByText("Source font size")).toBeInTheDocument();
    expect(screen.getByText("Translation font size")).toBeInTheDocument();

    expect(screen.getByText("Highlight Font")).toBeInTheDocument();
    expect(screen.getByText("Source Font")).toBeInTheDocument();
    expect(screen.getByText("Source BG")).toBeInTheDocument();
    expect(screen.getByText("Translation Font")).toBeInTheDocument();
    expect(screen.getByText("Translation BG")).toBeInTheDocument();

    expect(screen.getByText("Font opacity")).toBeInTheDocument();
    expect(screen.getByText("Background opacity")).toBeInTheDocument();
  });

  it("renders switches with the current visibility settings", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByRole("switch", { name: "Show source" })).toBeChecked();

    expect(
      screen.getByRole("switch", { name: "Show translation" }),
    ).not.toBeChecked();
  });

  it("updates source visibility", async () => {
    const user = userEvent.setup();

    render(<SubtitleSettingsPanel />);

    await user.click(screen.getByRole("switch", { name: "Show source" }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      showSource: false,
    });
  });

  it("updates translation visibility", async () => {
    const user = userEvent.setup();

    render(<SubtitleSettingsPanel />);

    await user.click(screen.getByRole("switch", { name: "Show translation" }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      showTranslation: true,
    });
  });

  it("updates source font size", async () => {
    const user = userEvent.setup();

    render(<SubtitleSettingsPanel />);

    const largeTabs = screen.getAllByRole("tab", { name: "large" });

    await user.click(largeTabs[0]);

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      sourceFontSize: "large",
    });
  });

  it("updates translation font size", async () => {
    const user = userEvent.setup();

    render(<SubtitleSettingsPanel />);

    const largeTabs = screen.getAllByRole("tab", { name: "large" });

    await user.click(largeTabs[1]);

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      translationFontSize: "large",
    });
  });

  it("renders color inputs with current values", () => {
    render(<SubtitleSettingsPanel />);

    const colorInputs = screen.getAllByDisplayValue(/#[0-9a-fA-F]{6}/);

    expect(colorInputs).toHaveLength(5);

    expect(screen.getByDisplayValue("#ffff00")).toBeInTheDocument();

    expect(screen.getAllByDisplayValue("#ffffff")).toHaveLength(2);

    expect(screen.getAllByDisplayValue("#000000")).toHaveLength(2);
  });

  it("updates highlight font color", async () => {
    const user = userEvent.setup();

    render(<SubtitleSettingsPanel />);

    const input = screen.getByDisplayValue("#ffff00");

    await user.click(input);

    // jsdom does not provide a native color picker, so trigger the
    // change event directly.
    await userEvent.setup();

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(input, "#ff0000");

    input.dispatchEvent(new Event("change", { bubbles: true }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      highlightFontColor: "#ff0000",
    });
  });

  it("updates source font color", () => {
    render(<SubtitleSettingsPanel />);

    const inputs = screen.getAllByDisplayValue("#ffffff");

    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));

    // The native color input needs its value changed before dispatching.
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[0], "#ff0000");

    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      sourceFontColor: "#ff0000",
    });
  });

  it("updates source background color", () => {
    render(<SubtitleSettingsPanel />);

    const inputs = screen.getAllByDisplayValue("#000000");

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[0], "#333333");

    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      sourceBackgroundColor: "#333333",
    });
  });

  it("updates translation font color", () => {
    render(<SubtitleSettingsPanel />);

    const inputs = screen.getAllByDisplayValue("#ffffff");

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[1], "#00ff00");

    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      translationFontColor: "#00ff00",
    });
  });

  it("updates translation background color", () => {
    render(<SubtitleSettingsPanel />);

    const inputs = screen.getAllByDisplayValue("#000000");

    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(inputs[1], "#222222");

    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));

    expect(setSubtitleSettings).toHaveBeenCalledWith({
      translationBackgroundColor: "#222222",
    });
  });

  it("renders font opacity as a percentage", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("renders background opacity as a percentage", () => {
    render(<SubtitleSettingsPanel />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
