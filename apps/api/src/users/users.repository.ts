import { Injectable } from "@nestjs/common";
import { db } from "@linguastream/db";

@Injectable()
export class UsersRepository {
  async findIdByFirebaseUid(firebaseUid: string): Promise<string | null> {
    const user = await db.user.findUnique({ where: { firebaseUid }, select: { id: true } });
    return user?.id ?? null;
  }

  async findProfile(id: string) {
    return db.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, nativeLanguage: true, learningLanguage: true, isAdmin: true },
    });
  }
}
