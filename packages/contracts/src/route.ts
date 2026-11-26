import { z } from "zod";

export const ApiError = z.object({
  error: z.string(),
});

export type ApiError = z.infer<typeof ApiError>;

type OptionalSchema = z.ZodType | undefined;

export interface RouteContract<
  TResponse extends z.ZodType = z.ZodType,
  TBody extends OptionalSchema = OptionalSchema,
  TQuery extends OptionalSchema = OptionalSchema,
  TParams extends OptionalSchema = OptionalSchema,
> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  response: TResponse;
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

export function defineRoute<
  TResponse extends z.ZodType,
  TBody extends OptionalSchema = undefined,
  TQuery extends OptionalSchema = undefined,
  TParams extends OptionalSchema = undefined,
>(
  route: RouteContract<TResponse, TBody, TQuery, TParams>,
): RouteContract<TResponse, TBody, TQuery, TParams> {
  return route;
}

type InputOf<T> = T extends z.ZodType ? z.output<T> : never;

export type RequestBody<R extends RouteContract> = InputOf<R["body"]>;

export type RequestQuery<R extends RouteContract> = InputOf<R["query"]>;

export type RequestParams<R extends RouteContract> = InputOf<R["params"]>;
