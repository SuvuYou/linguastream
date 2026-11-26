import "./load-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { applyBodyLimits } from "./http/body-limits";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  applyBodyLimits(app);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
