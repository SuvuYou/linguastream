import "./load-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./processing/worker.module";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
}
void bootstrap();
