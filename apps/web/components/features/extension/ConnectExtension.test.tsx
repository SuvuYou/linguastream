import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ConnectExtension from "./ConnectExtension";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const EXTENSION_ID = "kboemeffohobecdiilicpinijpchenbf";

function mockCodeRoute(status = 201) {
  const body =
    status === 201
      ? { code: "one-time-code", expires_at: "2026-11-26T12:02:00.000Z" }
      : { error: status === 401 ? "Unauthorized" : "Internal server error" };
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockExtension(response: unknown, lastError?: { message: string }) {
  const runtime = {
    lastError: undefined as { message: string } | undefined,
    sendMessage: vi.fn((_id: string, _msg: unknown, callback: (res: unknown) => void) => {
      runtime.lastError = lastError;
      callback(response);
    }),
  };
  vi.stubGlobal("chrome", { runtime });
  return runtime;
}

beforeEach(() => {
  replaceMock.mockReset();
  vi.stubEnv("NEXT_PUBLIC_EXTENSION_ID", EXTENSION_ID);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("ConnectExtension", () => {
  it("gets a code and hands it to the extension once", async () => {
    const fetchMock = mockCodeRoute();
    const runtime = mockExtension({ ok: true });

    render(<ConnectExtension />);

    expect(await screen.findByText(/extension connected/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/extension/code", { method: "POST" });
    expect(runtime.sendMessage).toHaveBeenCalledTimes(1);
    expect(runtime.sendMessage.mock.calls[0]![0]).toBe(EXTENSION_ID);
    expect(runtime.sendMessage.mock.calls[0]![1]).toEqual({ type: "connect", code: "one-time-code" });
  });

  it("says the extension isn't installed when the page can't reach it", async () => {
    mockCodeRoute();

    render(<ConnectExtension />);

    expect(await screen.findByText(/isn't installed/i)).toBeInTheDocument();
  });

  it("says the extension isn't installed when Chrome reports no receiver", async () => {
    mockCodeRoute();
    mockExtension(undefined, { message: "Could not establish connection. Receiving end does not exist." });

    render(<ConnectExtension />);

    expect(await screen.findByText(/isn't installed/i)).toBeInTheDocument();
  });

  it("shows a failure when the extension refuses the code, and retries with a new one", async () => {
    const fetchMock = mockCodeRoute();
    const runtime = mockExtension({ ok: false, error: "Unauthorized" });

    render(<ConnectExtension />);
    expect(await screen.findByText(/couldn't connect/i)).toBeInTheDocument();

    runtime.sendMessage.mockImplementation((_id, _msg, callback) => callback({ ok: true }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText(/extension connected/i)).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it("clears a dead session and signs in again, coming back here", async () => {
    const fetchMock = mockCodeRoute(401);
    const runtime = mockExtension({ ok: true });

    render(<ConnectExtension />);

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/auth/signin?next=%2Fextension%2Fconnect"),
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/session", { method: "DELETE" });
    expect(runtime.sendMessage).not.toHaveBeenCalled();
  });

  it("says the server isn't reachable when the API fails", async () => {
    mockCodeRoute(500);
    mockExtension({ ok: true });

    render(<ConnectExtension />);

    expect(await screen.findByText(/server isn't reachable/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("says the server isn't reachable when the request can't be sent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    mockExtension({ ok: true });

    render(<ConnectExtension />);

    expect(await screen.findByText(/server isn't reachable/i)).toBeInTheDocument();
  });
});
