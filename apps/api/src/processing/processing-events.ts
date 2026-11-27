import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import { ProcessingEvent } from "@linguastream/contracts";
import { QueueEvents } from "bullmq";
import { Observable, Subject, concatMap, filter, from } from "rxjs";
import { ProcessingRepository } from "./processing.repository";
import { PROCESSING_QUEUE, blockingConnection } from "./queue-config";
import type { PublishedEvent } from "./track-processor";

function readPublished(data: unknown): PublishedEvent | null {
  if (typeof data !== "object" || data === null) return null;
  const { user_id, event } = data as Partial<PublishedEvent>;
  if (
    typeof user_id !== "string" ||
    typeof event !== "object" ||
    event === null
  )
    return null;
  const parsed = ProcessingEvent.safeParse({ ...event, title: "" });
  return parsed.success ? { user_id, event } : null;
}

@Injectable()
export class ProcessingEvents implements OnModuleDestroy {
  private readonly logger = new Logger(ProcessingEvents.name);
  private readonly published = new Subject<PublishedEvent>();
  private queueEvents?: QueueEvents;

  constructor(
    @Inject(ProcessingRepository)
    private readonly repository: ProcessingRepository,
  ) {}

  forUser(userId: string): Observable<ProcessingEvent> {
    this.listen();
    const titles = new Map<string, string>();
    return this.published.pipe(
      filter((published) => published.user_id === userId),
      concatMap(({ event }) => from(this.withTitle(event, titles))),
      filter((event): event is ProcessingEvent => event !== null),
    );
  }

  async whenListening(): Promise<void> {
    this.listen();
    await this.queueEvents!.waitUntilReady();
  }

  async onModuleDestroy(): Promise<void> {
    this.published.complete();
    await this.queueEvents?.close();
  }

  private async withTitle(
    event: PublishedEvent["event"],
    titles: Map<string, string>,
  ): Promise<ProcessingEvent | null> {
    let title = titles.get(event.track_id);
    if (title === undefined) {
      const track = await this.repository
        .findTrack(event.track_id)
        .catch(() => null);
      if (!track) return null;
      title = track.title;
      titles.set(event.track_id, title);
    }
    return { ...event, title } as ProcessingEvent;
  }

  private listen(): void {
    if (this.queueEvents) return;
    this.queueEvents = new QueueEvents(PROCESSING_QUEUE, {
      connection: blockingConnection(),
    });
    this.queueEvents.on("progress", ({ data }) => {
      const published = readPublished(data);
      if (published) this.published.next(published);
    });
    this.queueEvents.on("error", (err) =>
      this.logger.error(`Queue events error: ${err.name}`),
    );
  }
}
