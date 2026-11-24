import type { RouteContract } from "@linguastream/contracts";
import type { JsonBodyType } from "msw";
import { http, HttpResponse } from "msw/http";
import type { z } from "zod";

/**
 * An MSW handler for a contract route. The path and method come from the contract,
 * and the fixture is checked against the contract's response schema on every call,
 * so a mock can never return a shape the real API wouldn't.
 */
export function mockRoute<TResponse extends z.ZodType>(
  route: RouteContract<TResponse>,
  fixture: z.input<TResponse> | (() => z.input<TResponse>),
) {
  const method = route.method.toLowerCase() as Lowercase<RouteContract<TResponse>["method"]>;

  return http[method](route.path, () => {
    const data = typeof fixture === "function" ? (fixture as () => z.input<TResponse>)() : fixture;
    const parsed = route.response.safeParse(data);

    if (!parsed.success) {
      return HttpResponse.json(
        { error: `Mock fixture for ${route.method} ${route.path} breaks its contract` },
        { status: 500 },
      );
    }

    return HttpResponse.json(parsed.data as JsonBodyType);
  });
}
