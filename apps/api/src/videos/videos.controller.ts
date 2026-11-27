import { Controller, Delete, Get, HttpCode, Inject, NotFoundException, Post } from "@nestjs/common";
import {
  deleteVideoRoute,
  getWordPackRoute,
  type WordPack,
  getLineWindowRoute,
  getVideoRoute,
  listVideosRoute,
  translateVideoRoute,
  type TranslationRequested,
  type VideoDeleted,
  type ApiError,
  type LibraryPage,
  type LineWindow,
  type RequestParams,
  type RequestQuery,
  type VideoDetail,
} from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { RateLimit } from "../http/rate-limit";
import { ValidParams, ValidQuery } from "../http/valid-input.decorators";
import { VideosRepository, type VideoView } from "./videos.repository";
import { WordPackService } from "../dictionary/word-pack.service";
import { VideosService } from "./videos.service";

@Controller("videos")
export class VideosController {
  constructor(
    @Inject(VideosRepository) private readonly videos: VideosRepository,
    @Inject(VideosService) private readonly service: VideosService,
    @Inject(WordPackService) private readonly words: WordPackService,
  ) {}

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

  @Get(":videoId/words")
  async wordPack(
    @CurrentUser() user: AuthUser,
    @ValidParams(getWordPackRoute) params: RequestParams<typeof getWordPackRoute>,
  ): Promise<WordPack> {
    const pack = await this.words.build(user.id, params.videoId);
    if (!pack) throw new NotFoundException({ error: "Video not found" } satisfies ApiError);
    return pack;
  }

  @Post(":videoId/translation")
  @HttpCode(202)
  @RateLimit(10)
  translate(
    @CurrentUser() user: AuthUser,
    @ValidParams(translateVideoRoute) params: RequestParams<typeof translateVideoRoute>,
  ): Promise<TranslationRequested> {
    return this.service.requestTranslation(user.id, params.videoId);
  }

  @Delete(":videoId")
  @RateLimit(30)
  remove(
    @CurrentUser() user: AuthUser,
    @ValidParams(deleteVideoRoute) params: RequestParams<typeof deleteVideoRoute>,
  ): Promise<VideoDeleted> {
    return this.service.delete(user.id, params.videoId);
  }

  private async find(userId: string, videoId: string): Promise<VideoView> {
    const view = await this.videos.findVideo(userId, videoId);
    if (!view) throw new NotFoundException({ error: "Video not found" } satisfies ApiError);
    return view;
  }
}
