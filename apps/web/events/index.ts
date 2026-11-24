import { createEventBus } from "./eventBus";

export type AppEvents = {
  "jump-to": { ms: number };
  "word-select": { state: "select" | "deselect" };
};

const AppEventsBus = createEventBus<AppEvents>();

const appEvents = {
  player: {
    triggerJumpTo: (ms: number) => AppEventsBus.trigger("jump-to", { ms }),
    onJumpTo: (callback: ({ ms }: { ms: number }) => void) =>
      AppEventsBus.on("jump-to", callback),
  },
  subtitles: {
    triggerSelectWord: (state: "select" | "deselect") =>
      AppEventsBus.trigger("word-select", { state }),
    onSelectWord: (
      callback: ({ state }: { state: "select" | "deselect" }) => void,
    ) => AppEventsBus.on("word-select", callback),
  },
};

export default appEvents;
