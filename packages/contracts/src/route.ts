import { z } from "zod";

/** Error body every API route returns on failure (`{ error: "..." }`). */
export const ApiError = z.object({
  error: z.string(),
});

export type ApiError = z.infer<typeof ApiError>;

/**
 * A route contract: the method, the path and the response schema of one API route.
 * The web app's API client, its MSW mock handlers and the backend all use the same
 * object, so the URL and the response shape can't drift apart (D-087).
 */
export interface RouteContract<TResponse extends z.ZodType> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  response: TResponse;
}

export function defineRoute<TResponse extends z.ZodType>(
  route: RouteContract<TResponse>,
): RouteContract<TResponse> {
  return route;
}
