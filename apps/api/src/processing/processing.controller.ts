import { Controller, HttpCode, Inject, Post, Sse, type MessageEvent } from "@nestjs/common";
import {
  PROCESSING_EVENT_NAME,
  retryTrackRoute,
  type ProcessingEvent,
  type RequestParams,
  type RetriedTrack,
} from "@linguastream/contracts";
import { Observable, interval, map, merge } from "rxjs";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { RateLimit } from "../http/rate-limit";
import { ValidParams } from "../http/valid-input.decorators";
import { ProcessingEvents } from "./processing-events";
import { ProcessingService } from "./processing.service";

export const HEARTBEAT_MS = 25_000;

const toMessage = (event: ProcessingEvent): MessageEvent => ({ type: PROCESSING_EVENT_NAME, data: event });

export function withCurrentState(
  live: Observable<ProcessingEvent>,
  loadCurrent: () => Promise<ProcessingEvent[]>,
): Observable<ProcessingEvent> {
  return new Observable((subscriber) => {
    let buffered: ProcessingEvent[] | null = [];
    const subscription = live.subscribe({
      next: (event) => (buffered ? buffered.push(event) : subscriber.next(event)),
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete(),
    });
    loadCurrent().then(
      (current) => {
        for (const event of [...current, ...(buffered ?? [])]) subscriber.next(event);
        buffered = null;
      },
      (err) => subscriber.error(err),
    );
    return () => subscription.unsubscribe();
  });
}

@Controller()
export class ProcessingController {
  constructor(
    @Inject(ProcessingService) private readonly processing: ProcessingService,
    @Inject(ProcessingEvents) private readonly events: ProcessingEvents,
  ) {}

  @Sse("processing/events")
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    const events = withCurrentState(this.events.forUser(user.id), () => this.processing.currentEvents(user.id));
    return merge(
      events.pipe(map(toMessage)),
      interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ comment: "keep-alive" }))),
    );
  }

  @Post("tracks/:trackId/retry")
  @HttpCode(202)
  @RateLimit(10)
  retry(
    @CurrentUser() user: AuthUser,
    @ValidParams(retryTrackRoute) params: RequestParams<typeof retryTrackRoute>,
  ): Promise<RetriedTrack> {
    return this.processing.retry(user.id, params.trackId);
  }
}
