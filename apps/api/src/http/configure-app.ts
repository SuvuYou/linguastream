import type { NestExpressApplication } from "@nestjs/platform-express";
import { applyBodyLimits } from "./body-limits";

export function configureApp(
  app: NestExpressApplication,
  largerBodyLimits?: Record<string, string>,
): void {
  app.setGlobalPrefix("api");
  applyBodyLimits(app, largerBodyLimits);
}
