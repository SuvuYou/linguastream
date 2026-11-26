import { createExtensionCodeRoute } from "@linguastream/contracts";
import { mockRoute } from "../mockRoute";

export const extensionHandlers = [
  mockRoute(createExtensionCodeRoute, () => ({
    code: "mock-extension-code",
    expires_at: new Date(Date.now() + 2 * 60_000).toISOString(),
  })),
];
