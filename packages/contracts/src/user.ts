import { z } from "zod";
import { defineRoute } from "./route.js";

export const CurrentUser = z.object({
  id: z.string(),
  email: z.email(),
  display_name: z.string().nullable(),
  native_language: z.string(),
  learning_language: z.string(),
  is_admin: z.boolean(),
});

export type CurrentUser = z.infer<typeof CurrentUser>;

export const getCurrentUserRoute = defineRoute({
  method: "GET",
  path: "/api/user",
  response: CurrentUser,
});
