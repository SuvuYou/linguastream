import type { RequestHandler } from "msw";
import { parseMockSetting } from "../config";
import { definitionHandlers } from "./definition";
import { extensionHandlers } from "./extension";
import { userHandlers } from "./user";
import { watchHandlers } from "./watch";

export const handlerGroups: Record<string, RequestHandler[]> = {
  user: userHandlers,
  definition: definitionHandlers,
  extension: extensionHandlers,
  watch: watchHandlers,
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
