import { Controller, Inject, Put } from "@nestjs/common";
import { setWordStatusRoute, type RequestBody, type SetWordStatus } from "@linguastream/contracts";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { ValidBody } from "../http/valid-input.decorators";
import { VocabularyRepository } from "./vocabulary.repository";

@Controller("vocabulary")
export class VocabularyController {
  constructor(@Inject(VocabularyRepository) private readonly vocabulary: VocabularyRepository) {}

  @Put("status")
  async setStatus(
    @CurrentUser() user: AuthUser,
    @ValidBody(setWordStatusRoute) body: RequestBody<typeof setWordStatusRoute>,
  ): Promise<SetWordStatus> {
    await this.vocabulary.setStatus(user.id, body);
    return body;
  }
}
