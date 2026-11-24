import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SyncCard from "./SyncCard";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("SyncCard", () => {
  it("renders sync button", () => {
    render(<SyncCard />);

    expect(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    ).toBeInTheDocument();
  });

  it("calls sync API when clicked", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ synced: 5, total: 100 }),
    } as Response);

    render(<SyncCard />);

    await userEvent.click(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/sync-jellyfin", {
        method: "POST",
      });
    });
  });

  it("displays sync result", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ synced: 3, total: 50 }),
    } as Response);

    render(<SyncCard />);

    await userEvent.click(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    );

    expect(
      await screen.findByText(/3 new items synced \(50 total\)/i),
    ).toBeInTheDocument();
  });
});
