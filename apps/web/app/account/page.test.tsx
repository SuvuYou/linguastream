import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Account from "./page";

describe("account content page", () => {
  it("should render the page", () => {
    render(<Account />);

    expect(screen.getByText(/Account/i)).toBeInTheDocument();
  });
});
