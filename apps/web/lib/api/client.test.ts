import { afterEach, describe, expect, it, vi } from "vitest";
import { defineRoute } from "@linguastream/contracts";
import { z } from "zod";
import { ApiContractError, ApiRequestError, apiRequest } from "./client";

const itemRoute = defineRoute({
  method: "GET",
  path: "/api/items/:id",
  response: z.object({ id: z.string(), count: z.number() }),
});

const createRoute = defineRoute({
  method: "POST",
  path: "/api/items",
  response: z.object({ id: z.string() }),
});

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("fills path params and query, and returns the validated body", async () => {
    const fetchMock = mockFetch(200, { id: "a b", count: 2 });

    const result = await apiRequest(itemRoute, {
      params: { id: "a b" },
      query: { page: 1, q: undefined },
    });

    expect(result).toEqual({ id: "a b", count: 2 });
    expect(fetchMock).toHaveBeenCalledWith("/api/items/a%20b?page=1", { method: "GET" });
  });

  it("sends a JSON body", async () => {
    const fetchMock = mockFetch(200, { id: "new" });

    await apiRequest(createRoute, { body: { name: "x" } });

    expect(fetchMock).toHaveBeenCalledWith("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
  });

  it("throws ApiRequestError with the server's message on an error status", async () => {
    mockFetch(401, { error: "Unauthorized" });

    await expect(apiRequest(itemRoute, { params: { id: "1" } })).rejects.toMatchObject({
      name: "ApiRequestError",
      status: 401,
      message: "Unauthorized",
    });
  });

  it("throws ApiRequestError with a fallback message when the error body is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("oops", { status: 500 })));

    const error = await apiRequest(itemRoute, { params: { id: "1" } }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.message).toBe("GET /api/items/:id failed with 500");
  });

  it("throws ApiContractError when the response doesn't match the contract", async () => {
    mockFetch(200, { id: "1", count: "two" });

    const error = await apiRequest(itemRoute, { params: { id: "1" } }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiContractError);
    expect(error.route).toBe("GET /api/items/:id");
    expect(error.issues[0].path).toEqual(["count"]);
  });

  it("throws before fetching when a path param is missing", async () => {
    const fetchMock = mockFetch(200, {});

    await expect(apiRequest(itemRoute)).rejects.toThrow('Missing path param "id"');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
