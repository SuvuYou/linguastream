import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CapturesModule } from "./captures/captures.module";
import { DefinitionModule } from "./definition/definition.module";
import { ExtensionModule } from "./extension/extension.module";
import { HealthController } from "./health/health.controller";
import { HttpModule } from "./http/http.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, HttpModule, UsersModule, DefinitionModule, ExtensionModule, CapturesModule],
  controllers: [HealthController],
})
export class AppModule {}
