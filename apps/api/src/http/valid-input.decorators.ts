import { Body, Param, Query } from "@nestjs/common";
import type { RouteContract } from "@linguastream/contracts";
import { ZodValidationPipe } from "./zod-validation.pipe";

function schemaOf(route: RouteContract, part: "body" | "query" | "params") {
  const schema = route[part];
  if (!schema) {
    throw new Error(`${route.method} ${route.path} has no ${part} schema in its contract`);
  }
  return schema;
}

export const ValidBody = (route: RouteContract) =>
  Body(new ZodValidationPipe(schemaOf(route, "body"), "body"));

export const ValidQuery = (route: RouteContract) =>
  Query(new ZodValidationPipe(schemaOf(route, "query"), "query"));

export const ValidParams = (route: RouteContract) =>
  Param(new ZodValidationPipe(schemaOf(route, "params"), "params"));
