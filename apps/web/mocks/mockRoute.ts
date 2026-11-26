import type { RouteContract } from "@linguastream/contracts";
import type { JsonBodyType } from "msw";
import { http, HttpResponse } from "msw/http";
import type { z } from "zod";

export interface MockRequest {
  params: Record<string, string>;
  url: URL;
  body: unknown;
}

/**
 * An MSW handler for a contract route. The path and method come from the contract,
 * and the fixture is checked against the contract's response schema on every call,
 * so a mock can never return a shape the real API wouldn't.
 */
export function mockRoute<TResponse extends z.ZodType>(
  route: RouteContract<TResponse>,
  fixture:
    | z.input<TResponse>
    | ((request: MockRequest) => z.input<TResponse> | undefined),
) {
  const method = route.method.toLowerCase() as Lowercase<
    RouteContract<TResponse>["method"]
  >;

  return http[method](route.path, async ({ params, request }) => {
    let body: unknown;
    if (route.body) {
      const parsedBody = route.body.safeParse(
        await request.json().catch(() => undefined),
      );
      if (!parsedBody.success)
        return HttpResponse.json(
          { error: "Invalid request body" },
          { status: 400 },
        );
      body = parsedBody.data;
    }
    const data =
      typeof fixture === "function"
        ? (fixture as (request: MockRequest) => z.input<TResponse> | undefined)(
            {
              params: params as Record<string, string>,
              url: new URL(request.url),
              body,
            },
          )
        : fixture;
    if (data === undefined)
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    const parsed = route.response.safeParse(data);

    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: `Mock fixture for ${route.method} ${route.path} breaks its contract`,
        },
        { status: 500 },
      );
    }

    return HttpResponse.json(parsed.data as JsonBodyType);
  });
}
