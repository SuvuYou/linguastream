import { ApiError, type RouteContract } from "@linguastream/contracts";
import type { z } from "zod";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export class ApiContractError extends Error {
  constructor(
    readonly route: string,
    readonly issues: z.core.$ZodIssue[],
  ) {
    super(`Response of ${route} does not match its contract`);
    this.name = "ApiContractError";
  }
}

interface RequestOptions {
  params?: Record<string, string>;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

function buildUrl(path: string, { params, query }: RequestOptions): string {
  const filled = path.replace(/:(\w+)/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) throw new Error(`Missing path param "${name}" for ${path}`);
    return encodeURIComponent(value);
  });

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `${filled}?${qs}` : filled;
}

/**
 * Calls an API route described by a contract from `@linguastream/contracts` and
 * returns its response, validated against the contract's schema.
 */
export async function apiRequest<TResponse extends z.ZodType>(
  route: RouteContract<TResponse>,
  options: RequestOptions = {},
): Promise<z.infer<TResponse>> {
  const routeName = `${route.method} ${route.path}`;

  const res = await fetch(buildUrl(route.path, options), {
    method: route.method,
    ...(options.body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
    }),
  });

  const json: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const error = ApiError.safeParse(json);
    throw new ApiRequestError(
      res.status,
      error.success ? error.data.error : `${routeName} failed with ${res.status}`,
    );
  }

  const parsed = route.response.safeParse(json);
  if (!parsed.success) throw new ApiContractError(routeName, parsed.error.issues);

  return parsed.data;
}
