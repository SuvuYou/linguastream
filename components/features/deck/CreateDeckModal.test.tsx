import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import CreateDeckModal from "./CreateDeckModal";

const invalidateQueries = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries,
  }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => <>{children}</>,
  DialogHeader: ({ children }: any) => <>{children}</>,
  DialogTitle: ({ children }: any) => <h1>{children}</h1>,
  DialogFooter: ({ children }: any) => <>{children}</>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe("CreateDeckModal", () => {
  const setState = vi.fn();
  const closeModal = vi.fn();

  const baseState = {
    deckName: "German",
    isCreating: false,
    errorMessage: null,
  };

  function renderComponent(state = baseState) {
    render(
      <CreateDeckModal
        isOpen
        state={state}
        setState={setState}
        closeModal={closeModal}
      />,
    );
  }

  it("renders title and input", () => {
    renderComponent();

    expect(screen.getByText("New Deck")).toBeInTheDocument();
    expect(screen.getByLabelText(/deck name/i)).toHaveValue("German");
  });

  it("shows error message", () => {
    renderComponent({
      ...baseState,
      errorMessage: "Already exists",
    });

    expect(screen.getByText("Already exists")).toBeInTheDocument();
  });

  it("calls closeModal when Cancel is clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(closeModal).toHaveBeenCalledOnce();
  });

  it("updates deck name when typing", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.type(screen.getByLabelText(/deck name/i), "A");

    expect(setState).toHaveBeenCalled();
  });

  it("disables Create button while creating", () => {
    renderComponent({
      ...baseState,
      isCreating: true,
    });

    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
  });

  it("disables Create button for empty name", () => {
    renderComponent({
      ...baseState,
      deckName: "   ",
    });

    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("creates a deck successfully", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    renderComponent();

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(fetch).toHaveBeenCalledWith("/api/decks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "German",
      }),
    });

    await waitFor(() => {
      expect(closeModal).toHaveBeenCalled();
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["decks"],
      });
    });
  });

  it("shows server error when request fails", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Duplicate deck",
      }),
    } as Response);

    renderComponent();

    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(setState).toHaveBeenCalled();
    });

    expect(closeModal).not.toHaveBeenCalled();
  });

  it("submits when Enter is pressed", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response);

    renderComponent();

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
