import {
  PROCESSING_EVENT_NAME,
  processingEventsRoute,
  retryTrackRoute,
  type ProcessingEvent,
} from "@linguastream/contracts";
import { sse } from "msw";
import { MOCK_PROCESSING_TRACKS, runEvents } from "../fixtures/processing";
import { mockRoute } from "../mockRoute";

export const MOCK_STEP_MS = 1_500;

type Send = (event: ProcessingEvent) => void;
let latest: Send | null = null;

function play(events: ProcessingEvent[]) {
  events.forEach((event, i) =>
    setTimeout(() => latest?.(event), (i + 1) * MOCK_STEP_MS),
  );
}

const TRANSLATE = 3;

let started = false;

export const processingHandlers = [
  sse<{ [PROCESSING_EVENT_NAME]: string }>(
    processingEventsRoute.path,
    ({ client }) => {
      const send: Send = (event) =>
        client.send({
          event: PROCESSING_EVENT_NAME,
          data: JSON.stringify(event),
        });
      latest = send;
      if (started) return;
      started = true;
      play(runEvents(MOCK_PROCESSING_TRACKS.succeeds));
      play(runEvents(MOCK_PROCESSING_TRACKS.failsOnce, 0, TRANSLATE));
    },
  ),
  mockRoute(retryTrackRoute, ({ params }) => {
    const track = Object.values(MOCK_PROCESSING_TRACKS).find(
      (t) => t.track_id === params.trackId,
    );
    if (!track) return undefined;
    play(runEvents(track, TRANSLATE));
    return { track_id: track.track_id, status: "pending" as const };
  }),
];
