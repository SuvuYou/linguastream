import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import SignOutButton from "./SignOutButton";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/lib/initializations/firebase/firebase", () => ({
  auth: {},
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseRouter = vi.mocked(useRouter);

describe("SignOutButton", () => {
  it("renders sign out button", () => {
    render(<SignOutButton />);

    expect(
      screen.getByRole("button", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("signs out and redirects", async () => {
    const mockedPush = vi.fn();
    const mockedRefresh = vi.fn();

    global.fetch = vi.fn(
      () => Promise.resolve({ ok: true }) as Promise<Response>,
    );

    mockedUseRouter.mockReturnValue({
      push: mockedPush,
      refresh: mockedRefresh,
    } as unknown as AppRouterInstance);

    render(<SignOutButton />);

    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", {
        method: "DELETE",
      });

      expect(mockedPush).toHaveBeenCalledWith("/auth/signin");
      expect(mockedRefresh).toHaveBeenCalled();
    });
  });

  it("shows signing out state while pending", async () => {
    type resolveFunc = (value: Response | PromiseLike<Response>) => void;
    let resolvePromise: resolveFunc | null = null;

    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }) as Promise<Response>,
    );

    const mockedPush = vi.fn();

    mockedUseRouter.mockReturnValue({
      push: mockedPush,
      refresh: vi.fn(),
    } as unknown as AppRouterInstance);

    render(<SignOutButton />);

    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));

    expect(
      screen.getByRole("button", { name: /signing out/i }),
    ).toBeInTheDocument();

    (resolvePromise as unknown as resolveFunc)({ ok: true } as Response);

    await waitFor(() => {
      expect(mockedPush).toHaveBeenCalled();
    });
  });
});
