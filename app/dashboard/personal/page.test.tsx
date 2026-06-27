import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PersonalLibrary from "./page";

describe("personal library page", () => {
  it("should render the page", () => {
    render(<PersonalLibrary />);

    expect(screen.getByText(/Personal library/i)).toBeInTheDocument();
  });
});
