import { PlayerEvents } from "@/events/playerEvents";

export type AppEvents = { "jump-to": { ms: number } };

const appEvents = {
  player: {
    triggerJumpTo: (ms: number) => PlayerEvents.trigger("jump-to", { ms }),
    onJumpTo: (callback: ({ ms }: { ms: number }) => void) =>
      PlayerEvents.on("jump-to", callback),
  },
};

export default appEvents;
