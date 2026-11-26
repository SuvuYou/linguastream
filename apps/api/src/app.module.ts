import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DefinitionModule } from "./definition/definition.module";
import { HealthController } from "./health/health.controller";
import { HttpModule } from "./http/http.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, HttpModule, UsersModule, DefinitionModule],
  controllers: [HealthController],
})
export class AppModule {}
