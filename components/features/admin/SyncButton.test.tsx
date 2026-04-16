import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import SyncButton from "./SyncButton";

beforeEach(() => vi.resetAllMocks());

describe("SyncButton", () => {
  it("renders sync button", () => {
    render(<SyncButton />);

    expect(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    ).toBeInTheDocument();
  });

  it("calls sync API when clicked", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          json: async () => ({ synced: 5, total: 100 }),
        }) as Promise<Response>,
    );

    render(<SyncButton />);

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
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          json: async () => ({ synced: 3, total: 50 }),
        }) as Promise<Response>,
    );

    render(<SyncButton />);

    await userEvent.click(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    );

    expect(
      await screen.findByText(/3 new items synced \(50 total\)/i),
    ).toBeInTheDocument();
  });

  it("shows syncing state while pending", async () => {
    type resolveFunc = (value: Response | PromiseLike<Response>) => void;
    let resolvePromise: resolveFunc | null = null;

    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }) as Promise<Response>,
    );

    render(<SyncButton />);

    await userEvent.click(
      screen.getByRole("button", { name: /sync jellyfin/i }),
    );

    expect(
      screen.getByRole("button", { name: /syncing/i }),
    ).toBeInTheDocument();

    (resolvePromise as unknown as resolveFunc)({
      json: async () => ({ synced: 1, total: 1 }),
    } as Response);

    await waitFor(() => {
      expect(screen.getByText(/1 new items synced/i)).toBeInTheDocument();
    });
  });
});
