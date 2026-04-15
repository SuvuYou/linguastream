import { beforeEach, describe, expect, it, vi } from "vitest";
import SignIn from "./page";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { getAuth } from "firebase-admin/auth";

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

beforeEach(() => vi.resetAllMocks());

const mockedUseRouter = vi.mocked(useRouter);

const mockedSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword);
const mockedCreateUserWithEmailAndPassword = vi.mocked(
  createUserWithEmailAndPassword,
);
const mockedGetAuth = vi.mocked(getAuth);

describe("auth/signin page", () => {
  it("renders sign in by default", () => {
    render(<SignIn />);

    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("toggles to sign up mode", async () => {
    render(<SignIn />);

    await userEvent.click(screen.getByText(/no account\? sign up/i));

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("handles sign in", async () => {
    const pushMock = vi.fn();
    const refreshMock = vi.fn();

    mockedUseRouter.mockReturnValue({
      push: pushMock,
      refresh: refreshMock,
    } as unknown as AppRouterInstance);

    const getIdTokenMock = vi.fn().mockResolvedValue("token");

    mockedSignInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: getIdTokenMock },
    } as unknown as UserCredential);

    global.fetch = vi.fn(
      () => Promise.resolve({ ok: true }) as Promise<Response>,
    );

    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "123456");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getIdTokenMock).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/session",
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(pushMock).toHaveBeenCalledWith("/");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("handles sign up", async () => {
    const getIdTokenMock = vi.fn().mockResolvedValue("token");

    mockedCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: getIdTokenMock },
    } as unknown as UserCredential);

    global.fetch = vi.fn(
      () => Promise.resolve({ ok: true }) as Promise<Response>,
    );

    render(<SignIn />);

    await userEvent.click(screen.getByText(/no account\? sign up/i));

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@test.com");
    await userEvent.type(
      screen.getByPlaceholderText("Password"),
      "123456{enter}",
    );

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(getIdTokenMock).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/session",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  it("shows error message", async () => {
    mockedSignInWithEmailAndPassword.mockRejectedValue(
      new Error("Invalid credentials"),
    );

    render(<SignIn />);

    await userEvent.type(screen.getByPlaceholderText("Email"), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "wrong");

    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
