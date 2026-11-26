import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import {
  defineRoute,
  type RequestBody,
  type RequestParams,
  type RequestQuery,
  type RouteContract,
} from "./route.js";

const saveWordRoute = defineRoute({
  method: "POST",
  path: "/api/words/:wordId",
  params: z.object({ wordId: z.string().max(64) }),
  query: z.object({ limit: z.coerce.number().int().default(10) }),
  body: z.object({ note: z.string().max(500) }),
  response: z.object({ ok: z.boolean() }),
});

const responseOnlyRoute = defineRoute({
  method: "GET",
  path: "/api/ping",
  response: z.object({ ok: z.boolean() }),
});

describe("defineRoute", () => {
  it("keeps the input schemas", () => {
    expect(saveWordRoute.body?.parse({ note: "hi", extra: 1 })).toEqual({ note: "hi" });
    expect(saveWordRoute.query?.parse({ limit: "5" })).toEqual({ limit: 5 });
    expect(responseOnlyRoute.body).toBeUndefined();
  });

  it("types the parsed input", () => {
    expectTypeOf<RequestBody<typeof saveWordRoute>>().toEqualTypeOf<{ note: string }>();
    expectTypeOf<RequestQuery<typeof saveWordRoute>>().toEqualTypeOf<{ limit: number }>();
    expectTypeOf<RequestParams<typeof saveWordRoute>>().toEqualTypeOf<{ wordId: string }>();
    expectTypeOf<RequestBody<typeof responseOnlyRoute>>().toBeNever();
  });

  it("fits where any route contract is accepted (the web API client)", () => {
    expectTypeOf(saveWordRoute).toExtend<RouteContract<z.ZodType>>();
    expectTypeOf(responseOnlyRoute).toExtend<RouteContract<z.ZodType>>();
  });
});
