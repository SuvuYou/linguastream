import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  defineRoute,
  getCurrentUserRoute,
  getLineWindowRoute,
  getVideoRoute,
  getWordDefinitionRoute,
} from "@linguastream/contracts";
import { setupServer } from "msw/node";
import { z } from "zod";
import { mockRoute } from "./mockRoute";
import { mockWordDefinition } from "./fixtures/definition";
import { mockUser } from "./fixtures/user";
import { MOCK_VIDEO_IDS, mockVideos } from "./fixtures/watch";
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

  it("passes params and the URL to a fixture function and answers 404 for undefined", async () => {
    const route = defineRoute({
      method: "GET",
      path: `${BASE}/api/things/:id`,
      response: z.object({ id: z.string(), q: z.string() }),
    });
    server.use(
      mockRoute(route, ({ params, url }) =>
        params.id === "known" ? { id: params.id, q: url.searchParams.get("q") ?? "" } : undefined,
      ),
    );

    const found = await fetch(`${BASE}/api/things/known?q=hi`);
    const missing = await fetch(`${BASE}/api/things/other`);

    expect(await found.json()).toEqual({ id: "known", q: "hi" });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ error: "Not found" });
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

  it("the definition group serves the mock definition for GET /api/definition", async () => {
    server.use(...selectHandlers("definition"));

    const url = new URL(getWordDefinitionRoute.path, location.origin);
    url.search = new URLSearchParams({ word: "Haus", lang: "de", context: "Das Haus" }).toString();
    const res = await fetch(url);

    expect(await res.json()).toEqual(mockWordDefinition);
  });

  it("selects every group for all, and nothing for unknown names", () => {
    expect(selectHandlers("all").length).toBeGreaterThan(0);
    expect(selectHandlers("nope")).toEqual([]);
  });

  it("the watch group serves videos and the lines inside a window", async () => {
    server.use(...selectHandlers("watch"));
    const id = MOCK_VIDEO_IDS.normal;

    const video = await fetch(new URL(getVideoRoute.path.replace(":videoId", id), location.origin));
    const window = await fetch(
      new URL(`${getLineWindowRoute.path.replace(":videoId", id)}?from_ms=60000&to_ms=120000`, location.origin),
    );
    const missing = await fetch(
      new URL(getVideoRoute.path.replace(":videoId", "0190f3c2-7d1a-7c00-8a00-00000000dead"), location.origin),
    );

    expect(await video.json()).toEqual(mockVideos[id]!.video);
    const body = await window.json();
    expect(body.lines.length).toBeGreaterThan(0);
    expect(body.lines.every((l: { start_ms: number }) => l.start_ms >= 60000 && l.start_ms < 120000)).toBe(true);
    expect(missing.status).toBe(404);
  });
});
