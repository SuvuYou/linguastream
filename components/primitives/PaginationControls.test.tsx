import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginationControls from "./PaginationControls";

describe("PaginationControls", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <PaginationControls page={0} pageCount={1} onPageChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("displays the current page using 1-based numbering", () => {
    render(
      <PaginationControls page={2} pageCount={5} onPageChange={vi.fn()} />,
    );

    expect(screen.getByRole("spinbutton")).toHaveValue(3);
  });

  describe("page input", () => {
    it("changes to the entered page when pressing Enter", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={0}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "4");
      await user.keyboard("{Enter}");

      expect(onPageChange).toHaveBeenCalledWith(3);
      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it("accepts the first page", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "1");
      await user.keyboard("{Enter}");

      expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it("accepts the last page", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={0}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "5");
      await user.keyboard("{Enter}");

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it("does not change the page for an empty input", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.keyboard("{Enter}");

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("does not change the page for a non-integer value", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "2.5");
      await user.keyboard("{Enter}");

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("does not change the page for a page below 1", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "0");
      await user.keyboard("{Enter}");

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("does not change the page for a page above pageCount", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      render(
        <PaginationControls
          page={2}
          pageCount={5}
          onPageChange={onPageChange}
        />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "6");
      await user.keyboard("{Enter}");

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe("input state", () => {
    it("updates the input value while typing", async () => {
      const user = userEvent.setup();

      render(
        <PaginationControls page={0} pageCount={5} onPageChange={vi.fn()} />,
      );

      const input = screen.getByRole("spinbutton");

      await user.clear(input);
      await user.type(input, "3");

      expect(input).toHaveValue(3);
    });
  });
});
