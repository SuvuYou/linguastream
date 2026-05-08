type Handler<T> = (payload: T) => void;

type EventMap<TEvents> = {
  [K in keyof TEvents]?: Set<Handler<TEvents[K]>>;
};

export function createEventBus<TEvents extends Record<string, unknown>>() {
  const listeners: EventMap<TEvents> = {};

  return {
    on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>) {
      if (!listeners[event]) {
        listeners[event] = new Set();
      }

      listeners[event]!.add(handler);

      return () => {
        listeners[event]?.delete(handler);
      };
    },

    trigger<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
      listeners[event]?.forEach((handler) => handler(payload));
    },
  };
}
