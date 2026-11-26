import type { NestExpressApplication } from "@nestjs/platform-express";
import type { ApiError } from "@linguastream/contracts";
import { json, type NextFunction, type Request, type Response } from "express";

export const DEFAULT_BODY_LIMIT = "100kb";

export const LARGER_BODY_LIMITS: Record<string, string> = { "/api/captures": "8mb" };

export function applyBodyLimits(
  app: NestExpressApplication,
  larger: Record<string, string> = LARGER_BODY_LIMITS,
): void {
  for (const [path, limit] of Object.entries(larger)) {
    app.use(path, json({ limit }));
  }
  app.use(json({ limit: DEFAULT_BODY_LIMIT }));
  app.use(bodyParserErrors);
}

function bodyParserErrors(err: { type?: string }, _req: Request, res: Response, next: NextFunction) {
  if (err.type === "entity.too.large") {
    res.status(413).json({ error: "Request body too large" } satisfies ApiError);
    return;
  }
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON" } satisfies ApiError);
    return;
  }
  next(err);
}
