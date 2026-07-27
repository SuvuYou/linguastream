import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardsPagination from "@/components/features/deck-details/CardsPagination";

describe("CardsPagination", () => {
  it("keeps page at 0 when previous is clicked on the first page", async () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={5} currentPage={0} setPage={setPage} />);

    const previous = screen.getByLabelText(/go to previous page/i);

    expect(previous).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(previous);

    expect(setPage).toHaveBeenCalledWith(0);
  });

  it("keeps page at the last page when next is clicked", async () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={5} currentPage={4} setPage={setPage} />);

    const next = screen.getByLabelText(/go to next page/i);

    expect(next).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(next);

    expect(setPage).toHaveBeenCalledWith(4);
  });

  it("does not render when there is only one page", () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={1} currentPage={0} setPage={setPage} />);

    expect(screen.queryByText(/page/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders current page information", () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={5} currentPage={2} setPage={setPage} />);

    expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
  });

  it("goes to the previous page", async () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={5} currentPage={2} setPage={setPage} />);

    const previous = screen.getByLabelText(/go to previous page/i);

    await userEvent.click(previous);

    expect(setPage).toHaveBeenCalledWith(1);
  });

  it("goes to the next page", async () => {
    const setPage = vi.fn();

    render(<CardsPagination pageCount={5} currentPage={2} setPage={setPage} />);

    const next = screen.getByLabelText(/go to next page/i);

    await userEvent.click(next);

    expect(setPage).toHaveBeenCalledWith(3);
  });
});
