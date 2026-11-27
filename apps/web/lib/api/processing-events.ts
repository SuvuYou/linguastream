import {
  PROCESSING_EVENT_NAME,
  ProcessingEvent,
  processingEventsRoute,
} from "@linguastream/contracts";

type Subscriber = (event: ProcessingEvent) => void;

let shared: { source: EventSource; subscribers: Set<Subscriber> } | null =
  null;

function open() {
  const source = new EventSource(processingEventsRoute.path, {
    withCredentials: true,
  });
  const subscribers = new Set<Subscriber>();
  source.addEventListener(
    PROCESSING_EVENT_NAME,
    (message: MessageEvent<string>) => {
      let data: unknown;
      try {
        data = JSON.parse(message.data);
      } catch {
        return;
      }
      const parsed = ProcessingEvent.safeParse(data);
      if (parsed.success)
        for (const subscriber of [...subscribers]) subscriber(parsed.data);
    },
  );
  return { source, subscribers };
}

export function openProcessingEvents(onEvent: Subscriber): () => void {
  shared ??= open();
  const current = shared;
  current.subscribers.add(onEvent);
  return () => {
    current.subscribers.delete(onEvent);
    if (current.subscribers.size === 0 && shared === current) {
      current.source.close();
      shared = null;
    }
  };
}
