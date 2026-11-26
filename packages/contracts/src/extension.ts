import { z } from "zod";
import { defineRoute } from "./route.js";

export const ExtensionCode = z.object({
  code: z.string(),
  expires_at: z.iso.datetime(),
});

export type ExtensionCode = z.infer<typeof ExtensionCode>;

export const ExtensionToken = z.object({
  custom_token: z.string(),
});

export type ExtensionToken = z.infer<typeof ExtensionToken>;

export const createExtensionCodeRoute = defineRoute({
  method: "POST",
  path: "/api/extension/code",
  response: ExtensionCode,
});

export const exchangeExtensionCodeRoute = defineRoute({
  method: "POST",
  path: "/api/extension/token",
  body: z.object({ code: z.string().min(1).max(100) }),
  response: ExtensionToken,
});
