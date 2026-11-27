import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { ApiError, TranslationRequested, VideoDeleted } from "@linguastream/contracts";
import { ProcessingService } from "../processing/processing.service";
import { VideosRepository } from "./videos.repository";

const notFound = () => new NotFoundException({ error: "Video not found" } satisfies ApiError);

@Injectable()
export class VideosService {
  constructor(
    @Inject(VideosRepository) private readonly videos: VideosRepository,
    @Inject(ProcessingService) private readonly processing: ProcessingService,
  ) {}

  async requestTranslation(userId: string, videoId: string): Promise<TranslationRequested> {
    const view = await this.videos.findVideo(userId, videoId);
    if (!view) throw notFound();
    const translation = view.detail.translation;
    if (!view.trackId || !translation) {
      throw new ConflictException({ error: "This video can't be translated yet" } satisfies ApiError);
    }
    if (translation.status === "ready") {
      throw new ConflictException({ error: "This video is already translated" } satisfies ApiError);
    }
    await this.videos.markTranslationPending(view.trackId, translation.language);
    await this.processing.enqueueTranslation(view.trackId);
    return { video_id: videoId, translation: { language: translation.language, status: "pending" } };
  }

  async delete(userId: string, videoId: string): Promise<VideoDeleted> {
    if (!(await this.videos.deleteVideo(userId, videoId))) throw notFound();
    return { video_id: videoId, deleted: true };
  }
}
