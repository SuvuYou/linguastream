import { createEventBus } from "./eventBus";

export type AppEvents = {
  "jump-to": { ms: number };
  overlay: { isOpen: boolean };
};

const AppEventsBus = createEventBus<AppEvents>();

const appEvents = {
  player: {
    triggerJumpTo: (ms: number) => AppEventsBus.trigger("jump-to", { ms }),
    onJumpTo: (callback: ({ ms }: { ms: number }) => void) =>
      AppEventsBus.on("jump-to", callback),
  },
};

export default appEvents;
