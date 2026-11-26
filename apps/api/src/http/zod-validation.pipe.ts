import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ApiError } from "@linguastream/contracts";
import type { z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: z.ZodType,
    private readonly part: "body" | "query" | "params",
  ) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const problems = result.error.issues.map((issue) => {
      const field = [this.part, ...issue.path.map(String)].join(".");
      return `${field}: ${issue.message}`;
    });
    throw new BadRequestException({
      error: `Invalid request: ${problems.join("; ")}`,
    } satisfies ApiError);
  }
}
