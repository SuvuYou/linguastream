import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CapturesModule } from "./captures/captures.module";
import { DefinitionModule } from "./definition/definition.module";
import { ExtensionModule } from "./extension/extension.module";
import { HealthController } from "./health/health.controller";
import { HttpModule } from "./http/http.module";
import { ProcessingModule } from "./processing/processing.module";
import { UsersModule } from "./users/users.module";
import { VideosModule } from "./videos/videos.module";

@Module({
  imports: [AuthModule, HttpModule, UsersModule, DefinitionModule, ExtensionModule, CapturesModule, ProcessingModule, VideosModule],
  controllers: [HealthController],
})
export class AppModule {}
