import "./load-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./processing/worker.module";
import { waitForServices } from "./startup/wait-for-services";

async function bootstrap() {
  await waitForServices();
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
}
void bootstrap();
