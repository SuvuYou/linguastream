import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ReindexCard from "./ReindexCard";
import * as React from "react";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useTransition: vi.fn(),
  };
});

const mockedUseTransition = vi.mocked(React.useTransition);

beforeEach(() => {
  vi.resetAllMocks();

  mockedUseTransition.mockImplementation(() => [
    false,
    (cb: () => void | Promise<void>) => {
      void cb();
    },
  ]);
});

describe("ReindexCard", () => {
  it("renders reindex button", () => {
    render(<ReindexCard />);

    expect(
      screen.getByRole("button", {
        name: /reindex subtitles/i,
      }),
    ).toBeInTheDocument();
  });

  it("calls reindex API when clicked", async () => {
    global.fetch = vi.fn(
      () => Promise.resolve({ ok: true }) as Promise<Response>,
    );

    render(<ReindexCard />);

    await userEvent.click(
      screen.getByRole("button", {
        name: /reindex subtitles/i,
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/reindex", {
      method: "POST",
    });
  });

  it("disables button while reindexing", () => {
    mockedUseTransition.mockReturnValue([true, vi.fn()] as ReturnType<
      typeof React.useTransition
    >);

    render(<ReindexCard />);

    expect(
      screen.getByRole("button", {
        name: /reindexing/i,
      }),
    ).toBeDisabled();

    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
