import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import AddToLibraryModal from "./AddToLibraryModal";

beforeEach(() => vi.resetAllMocks());

describe("AddToLibraryModal", () => {
  it("renders modal with title", () => {
    render(
      <AddToLibraryModal
        jellyfinId="123"
        title="Movie Title"
        OnSuccess={vi.fn()}
        OnClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/adding to library/i)).toBeInTheDocument();
    expect(screen.getByText("Movie Title")).toBeInTheDocument();
  });

  it("changes source language", async () => {
    render(
      <AddToLibraryModal
        jellyfinId="123"
        title="Movie"
        OnSuccess={vi.fn()}
        OnClose={vi.fn()}
      />,
    );

    const select = screen.getByRole("combobox");

    await userEvent.selectOptions(select, "en");

    expect(select).toHaveValue("en");
  });

  it("submits and calls OnSuccess", async () => {
    const onSuccess = vi.fn();

    global.fetch = vi.fn(
      () => Promise.resolve({ ok: true }) as Promise<Response>,
    );

    render(
      <AddToLibraryModal
        jellyfinId="123"
        title="Movie"
        OnSuccess={onSuccess}
        OnClose={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];

      expect(url).toBe("/api/media-content");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/media-content",
        expect.objectContaining({
          method: "POST",
        }),
      );

      expect(options.body).toBe(
        JSON.stringify({
          title: "Movie",
          jellyfin_id: "123",
          source_language: "de",
        }),
      );

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error message on failure", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: async () => ({ message: "Failed" }),
        }) as Promise<Response>,
    );

    render(
      <AddToLibraryModal
        jellyfinId="123"
        title="Movie"
        OnSuccess={vi.fn()}
        OnClose={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByText(/failed/i)).toBeInTheDocument();
  });

  it("calls OnClose when cancel is clicked", async () => {
    const onClose = vi.fn();

    render(
      <AddToLibraryModal
        jellyfinId="123"
        title="Movie"
        OnSuccess={vi.fn()}
        OnClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
