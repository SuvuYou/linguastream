import { Module } from "@nestjs/common";
import { DictionaryModule } from "../dictionary/dictionary.module";
import { ProcessingModule } from "../processing/processing.module";
import { VideosController } from "./videos.controller";
import { VideosRepository } from "./videos.repository";
import { VideosService } from "./videos.service";

@Module({
  imports: [ProcessingModule, DictionaryModule],
  controllers: [VideosController],
  providers: [VideosRepository, VideosService],
})
export class VideosModule {}
