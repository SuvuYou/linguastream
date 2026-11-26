import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { HttpModule } from "./http/http.module";

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [HealthController],
})
export class AppModule {}
