import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosRepository } from "./videos.repository";

@Module({
  controllers: [VideosController],
  providers: [VideosRepository],
})
export class VideosModule {}
