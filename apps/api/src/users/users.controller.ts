import { Controller, Get, UnauthorizedException } from "@nestjs/common";
import type { ApiError, CurrentUser as CurrentUserResponse } from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { UsersRepository } from "./users.repository";

@Controller("user")
export class UsersController {
  constructor(private readonly users: UsersRepository) {}

  @Get()
  async me(@CurrentUser() user: AuthUser): Promise<CurrentUserResponse> {
    const profile = await this.users.findProfile(user.id);

    if (!profile) throw new UnauthorizedException({ error: "Unauthorized" } satisfies ApiError);

    return {
      id: profile.id,
      email: profile.email,
      display_name: profile.displayName,
      native_language: profile.nativeLanguage,
      learning_language: profile.learningLanguage,
      is_admin: profile.isAdmin,
    };
  }
}
