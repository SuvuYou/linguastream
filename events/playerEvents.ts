import { createEventBus } from "@/events/eventBus";
import type { AppEvents } from "@/events";

export const PlayerEvents = createEventBus<AppEvents>();
