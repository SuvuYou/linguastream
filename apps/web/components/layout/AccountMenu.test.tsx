import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { signOut } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@linguastream/contracts";
import type { UseQueryResult } from "@tanstack/react-query";
import { useUser } from "@/hooks/useUser";
import AccountMenu, { initials } from "./AccountMenu";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("firebase/auth", () => ({ signOut: vi.fn(async () => undefined) }));
vi.mock("@/lib/initializations/firebase/firebase", () => ({ auth: { name: "auth" } }));
vi.mock("@/hooks/useUser", () => ({ useUser: vi.fn() }));

const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(useUser).mockReturnValue({
    data: {
      id: "user-1",
      email: "lena.schmidt@example.com",
      display_name: null,
      native_language: "uk",
      learning_language: "de",
      is_admin: false,
    },
  } as UseQueryResult<CurrentUser>);
});

afterEach(() => vi.unstubAllGlobals());

describe("initials", () => {
  it("takes two letters from the name or the email", () => {
    expect(initials("Lena Schmidt", "x@example.com")).toBe("LS");
    expect(initials(null, "lena.schmidt@example.com")).toBe("LS");
    expect(initials("", "nazar@example.com")).toBe("NA");
    expect(initials(null, undefined)).toBe("?");
  });
});

describe("AccountMenu", () => {
  it("shows the account's email and signs out", async () => {
    render(<AccountMenu />);
    const trigger = screen.getByRole("button", { name: "Account" });
    expect(trigger).toHaveTextContent("LS");

    await userEvent.click(trigger);
    expect(await screen.findByText("lena.schmidt@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/auth/signin"));
    expect(signOut).toHaveBeenCalledWith({ name: "auth" });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("still offers sign out while the account is loading", async () => {
    vi.mocked(useUser).mockReturnValue({ data: undefined } as UseQueryResult<CurrentUser>);
    render(<AccountMenu />);
    await userEvent.click(screen.getByRole("button", { name: "Account" }));
    expect(await screen.findByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });
});
