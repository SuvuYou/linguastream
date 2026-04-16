import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "./Providers";

describe("Providrs", () => {
  it("renders children", () => {
    render(
      <Providers>
        <div data-testid="child" />
      </Providers>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
