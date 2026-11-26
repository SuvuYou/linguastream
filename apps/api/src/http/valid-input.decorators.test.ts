import { defineRoute } from "@linguastream/contracts";
import { z } from "zod";
import { ValidBody, ValidParams, ValidQuery } from "./valid-input.decorators";

describe("@Valid*() decorators", () => {
  it("refuse a contract without the matching schema, at startup", () => {
    const route = defineRoute({ method: "GET", path: "/api/ping", response: z.object({}) });
    expect(() => ValidBody(route)).toThrow("GET /api/ping has no body schema");
    expect(() => ValidQuery(route)).toThrow("no query schema");
    expect(() => ValidParams(route)).toThrow("no params schema");
  });
});
