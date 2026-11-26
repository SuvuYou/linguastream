import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@linguastream/contracts";
import { Public } from "../auth/public.decorator";

@Public()
@Controller("health")
export class HealthController {
  @Get()
  check(): HealthResponse {
    return { status: "ok" };
  }
}
