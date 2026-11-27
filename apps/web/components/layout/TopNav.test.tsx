import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TopNav from "./TopNav";

const nav = vi.hoisted(() => ({ pathname: "/dashboard/personal" }));

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
}));

vi.mock("./AccountMenu", () => ({
  default: () => <button type="button">Account</button>,
}));

describe("TopNav", () => {
  it("links the logo and the signed-in pages", () => {
    render(<TopNav />);
    expect(screen.getByRole("link", { name: "LinguaStream, go to the library" })).toHaveAttribute(
      "href",
      "/dashboard/personal",
    );
    const links = within(screen.getByRole("navigation", { name: "Main" })).getAllByRole("link");
    expect(links.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["Library", "/dashboard/personal"],
      ["Decks", "/dashboard/decks"],
      ["Study", "/dashboard/study"],
    ]);
    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument();
  });

  it.each([
    ["/dashboard/personal", "Library"],
    ["/dashboard/decks", "Decks"],
    ["/dashboard/decks/0190f3c2-7d1a-7c00-8a00-000000000001", "Decks"],
    ["/dashboard/study", "Study"],
  ])("marks the current page on %s", (pathname, label) => {
    nav.pathname = pathname;
    render(<TopNav />);
    const current = screen.getAllByRole("link").filter((l) => l.getAttribute("aria-current") === "page");
    expect(current.map((l) => l.textContent)).toEqual([label]);
  });

  it("doesn't mark a page whose path only starts with the same letters", () => {
    nav.pathname = "/dashboard/decksx";
    render(<TopNav />);
    expect(screen.getAllByRole("link").filter((l) => l.hasAttribute("aria-current"))).toEqual([]);
  });
});
