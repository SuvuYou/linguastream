import {
  PROCESSING_EVENT_NAME,
  ProcessingEvent,
  processingEventsRoute,
} from "@linguastream/contracts";

export function openProcessingEvents(
  onEvent: (event: ProcessingEvent) => void,
): () => void {
  const source = new EventSource(processingEventsRoute.path, {
    withCredentials: true,
  });
  const listener = (message: MessageEvent<string>) => {
    let data: unknown;
    try {
      data = JSON.parse(message.data);
    } catch {
      return;
    }
    const parsed = ProcessingEvent.safeParse(data);
    if (parsed.success) onEvent(parsed.data);
  };
  source.addEventListener(PROCESSING_EVENT_NAME, listener);
  return () => {
    source.removeEventListener(PROCESSING_EVENT_NAME, listener);
    source.close();
  };
}
