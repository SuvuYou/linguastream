import { z } from "zod";

/** Response of `GET /health` on the API. */
export const HealthResponse = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof HealthResponse>;
