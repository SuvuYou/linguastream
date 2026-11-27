import { z } from "zod";
import { defineRoute } from "./route.js";

export const UsageSummary = z.object({
  day: z.iso.date(),
  transfer: z.object({
    used_characters: z.int().min(0),
    limit_characters: z.int().min(0),
    minutes_left: z.int().min(0),
  }),
  ai_calls: z.object({
    used: z.int().min(0),
    limit: z.int().min(0),
  }),
  paid_features_paused: z.boolean(),
  month_spend_usd: z.number().min(0).optional(),
  month_spend_cap_usd: z.number().min(0).optional(),
});

export type UsageSummary = z.infer<typeof UsageSummary>;

export const getUsageRoute = defineRoute({
  method: "GET",
  path: "/api/usage",
  response: UsageSummary,
});
