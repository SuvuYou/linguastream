import { Controller, Get, Inject, NotFoundException } from "@nestjs/common";
import {
  getLineWindowRoute,
  getVideoRoute,
  listVideosRoute,
  type ApiError,
  type LibraryPage,
  type LineWindow,
  type RequestParams,
  type RequestQuery,
  type VideoDetail,
} from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { ValidParams, ValidQuery } from "../http/valid-input.decorators";
import { VideosRepository, type VideoView } from "./videos.repository";

@Controller("videos")
export class VideosController {
  constructor(@Inject(VideosRepository) private readonly videos: VideosRepository) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @ValidQuery(listVideosRoute) query: RequestQuery<typeof listVideosRoute>,
  ): Promise<LibraryPage> {
    return this.videos.listVideos(user.id, query.page, query.q);
  }

  @Get(":videoId")
  async video(
    @CurrentUser() user: AuthUser,
    @ValidParams(getVideoRoute) params: RequestParams<typeof getVideoRoute>,
  ): Promise<VideoDetail> {
    return (await this.find(user.id, params.videoId)).detail;
  }

  @Get(":videoId/lines")
  async lines(
    @CurrentUser() user: AuthUser,
    @ValidParams(getLineWindowRoute) params: RequestParams<typeof getLineWindowRoute>,
    @ValidQuery(getLineWindowRoute) query: RequestQuery<typeof getLineWindowRoute>,
  ): Promise<LineWindow> {
    const { trackId, translationId } = await this.find(user.id, params.videoId);
    const lines = trackId ? await this.videos.linesInWindow(trackId, translationId, query.from_ms, query.to_ms) : [];
    return { from_ms: query.from_ms, to_ms: query.to_ms, lines };
  }

  private async find(userId: string, videoId: string): Promise<VideoView> {
    const view = await this.videos.findVideo(userId, videoId);
    if (!view) throw new NotFoundException({ error: "Video not found" } satisfies ApiError);
    return view;
  }
}
