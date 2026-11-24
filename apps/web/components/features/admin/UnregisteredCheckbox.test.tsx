import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useZodSearchParams } from "@/hooks/useZodSearchParams";
import UnregisteredCheckbox from "./UnregisteredCheckbox";

vi.mock("@/hooks/useZodSearchParams", () => ({
  useZodSearchParams: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseZodSearchParams = vi.mocked(useZodSearchParams);

describe("UnregisteredCheckbox", () => {
  it("renders unchecked by default", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: { unreg: false },
      set: vi.fn(),
      remove: vi.fn(),
    });

    render(<UnregisteredCheckbox />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();
  });

  it("renders checked from params", () => {
    mockedUseZodSearchParams.mockReturnValue({
      params: { unreg: true },
      set: vi.fn(),
      remove: vi.fn(),
    });

    render(<UnregisteredCheckbox />);

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeChecked();
  });

  it("calls set when checked", async () => {
    const setMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { unreg: false },
      set: setMock,
      remove: vi.fn(),
    });

    render(<UnregisteredCheckbox />);

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(setMock).toHaveBeenCalledWith({ unreg: true });
  });

  it("calls set when unchecked", async () => {
    const removeMock = vi.fn();

    mockedUseZodSearchParams.mockReturnValue({
      params: { unreg: true },
      set: vi.fn(),
      remove: removeMock,
    });

    render(<UnregisteredCheckbox />);

    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);

    expect(removeMock).toHaveBeenCalledWith("unreg");
  });
});
