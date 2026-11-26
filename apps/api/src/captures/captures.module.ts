import { Module } from "@nestjs/common";
import { CapturesController } from "./captures.controller";
import { CapturesRepository } from "./captures.repository";
import { CapturesService } from "./captures.service";
import { minExtensionVersionProvider } from "./extension-version";

@Module({
  controllers: [CapturesController],
  providers: [CapturesService, CapturesRepository, minExtensionVersionProvider],
})
export class CapturesModule {}
