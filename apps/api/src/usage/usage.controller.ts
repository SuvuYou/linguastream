import { Controller, Get, Inject } from "@nestjs/common";
import type { UsageSummary } from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsersRepository } from "../users/users.repository";
import { UsageService } from "./usage.service";

@Controller("usage")
export class UsageController {
  constructor(
    @Inject(UsageService) private readonly usage: UsageService,
    @Inject(UsersRepository) private readonly users: UsersRepository,
  ) {}

  @Get()
  async summary(@CurrentUser() user: AuthUser): Promise<UsageSummary> {
    const profile = await this.users.findProfile(user.id);
    return this.usage.summary(user.id, profile?.isAdmin ?? false);
  }
}
