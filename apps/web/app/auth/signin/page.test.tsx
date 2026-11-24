import { beforeEach, describe, expect, it, vi } from "vitest";
import SignIn from "./page";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}));

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
    refresh: refreshMock,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();

  global.fetch = vi.fn(
    () => Promise.resolve({ ok: true }) as Promise<Response>,
  );
});

const mockedSignIn = vi.mocked(signInWithEmailAndPassword);
const mockedSignUp = vi.mocked(createUserWithEmailAndPassword);
const mockedUseRouter = vi.mocked(useRouter);

function mockCredential(token = "token") {
  return {
    user: {
      getIdToken: vi.fn().mockResolvedValue(token),
    },
  } as any;
}

describe("SignIn", () => {
  it("renders sign in mode by default", () => {
    render(<SignIn />);

    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("switches between sign in and sign up modes", async () => {
    const user = userEvent.setup();

    render(<SignIn />);

    await user.click(
      screen.getByRole("button", {
        name: /no account\? sign up/i,
      }),
    );

    expect(screen.getByText("Create an account")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Create account",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /already have an account/i,
      }),
    );

    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });

  it("signs in successfully", async () => {
    const user = userEvent.setup();

    mockedSignIn.mockResolvedValue(mockCredential());

    render(<SignIn />);

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@test.com",
    );

    await user.type(screen.getByPlaceholderText("••••••••"), "password");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalled();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/session",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: "token",
        }),
      }),
    );

    expect(pushMock).toHaveBeenCalledWith("/");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("creates account successfully", async () => {
    const user = userEvent.setup();

    mockedSignUp.mockResolvedValue(mockCredential());

    render(<SignIn />);

    await user.click(
      screen.getByRole("button", {
        name: /no account\? sign up/i,
      }),
    );

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "new@test.com",
    );

    await user.type(screen.getByPlaceholderText("••••••••"), "password");

    await user.click(
      screen.getByRole("button", {
        name: "Create account",
      }),
    );

    await waitFor(() => {
      expect(mockedSignUp).toHaveBeenCalled();
    });

    expect(fetch).toHaveBeenCalled();
  });

  it("submits when pressing Enter in password field", async () => {
    const user = userEvent.setup();

    mockedSignIn.mockResolvedValue(mockCredential());

    render(<SignIn />);

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@test.com",
    );

    await user.type(screen.getByPlaceholderText("••••••••"), "password{enter}");

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalled();
    });
  });

  it("shows firebase error", async () => {
    const user = userEvent.setup();

    mockedSignIn.mockRejectedValue(new Error("Invalid credentials"));

    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid credentials",
      );
    });
  });

  it("shows fallback error for non Error exceptions", async () => {
    const user = userEvent.setup();

    mockedSignIn.mockRejectedValue("unknown");

    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong",
      );
    });
  });

  it("clears error when switching auth mode", async () => {
    const user = userEvent.setup();

    mockedSignIn.mockRejectedValue(new Error("Bad login"));

    render(<SignIn />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", {
        name: /no account\? sign up/i,
      }),
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses router instance", async () => {
    render(<SignIn />);

    expect(mockedUseRouter).toHaveBeenCalled();
  });
});
