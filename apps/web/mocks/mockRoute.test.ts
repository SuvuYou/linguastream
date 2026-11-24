import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { defineRoute, getCurrentUserRoute } from "@linguastream/contracts";
import { setupServer } from "msw/node";
import { z } from "zod";
import { mockRoute } from "./mockRoute";
import { mockUser } from "./fixtures/user";
import { selectHandlers } from "./handlers";

const server = setupServer();
const BASE = "http://localhost";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("mockRoute", () => {
  it("serves a fixture that matches the contract", async () => {
    const route = defineRoute({
      method: "GET",
      path: `${BASE}/api/things/:id`,
      response: z.object({ id: z.string() }),
    });
    server.use(mockRoute(route, { id: "t1" }));

    const res = await fetch(`${BASE}/api/things/42`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "t1" });
  });

  it("answers 500 when the fixture breaks the contract", async () => {
    const route = defineRoute({
      method: "POST",
      path: `${BASE}/api/things`,
      response: z.object({ id: z.string() }),
    });
    server.use(mockRoute(route, () => ({ id: 1 }) as unknown as { id: string }));

    const res = await fetch(`${BASE}/api/things`, { method: "POST" });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: `Mock fixture for POST ${BASE}/api/things breaks its contract`,
    });
  });
});

describe("handler groups", () => {
  it("the user group serves the mock user for GET /api/user", async () => {
    server.use(...selectHandlers("user"));

    // Handlers use relative paths, like the app; resolve against the page origin.
    const res = await fetch(new URL(getCurrentUserRoute.path, location.origin));

    expect(await res.json()).toEqual(mockUser);
  });

  it("selects every group for all, and nothing for unknown names", () => {
    expect(selectHandlers("all").length).toBeGreaterThan(0);
    expect(selectHandlers("nope")).toEqual([]);
  });
});
