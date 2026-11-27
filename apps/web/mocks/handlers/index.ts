import type { RequestHandler } from "msw";
import { parseMockSetting } from "../config";
import { definitionHandlers } from "./definition";
import { extensionHandlers } from "./extension";
import { libraryHandlers } from "./library";
import { preferencesHandlers } from "./preferences";
import { processingHandlers } from "./processing";
import { userHandlers } from "./user";
import { watchHandlers } from "./watch";

export const handlerGroups: Record<string, RequestHandler[]> = {
  user: userHandlers,
  definition: definitionHandlers,
  extension: extensionHandlers,
  watch: watchHandlers,
  preferences: preferencesHandlers,
  processing: processingHandlers,
  library: libraryHandlers,
};

export function selectHandlers(setting: string | undefined): RequestHandler[] {
  const selected = parseMockSetting(setting);
  if (selected === "all") return Object.values(handlerGroups).flat();

  return [...selected].flatMap((name) => {
    const group = handlerGroups[name];
    if (!group)
      console.warn(
        `[mocks] Unknown handler group "${name}" in NEXT_PUBLIC_API_MOCKS`,
      );
    return group ?? [];
  });
}
