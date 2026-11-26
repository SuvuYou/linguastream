import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { firebaseAuthProvider } from "./firebase-auth.provider";
import { RevocationCache } from "./revocation-cache";
import { UsersRepository } from "./users.repository";

@Module({
  providers: [
    firebaseAuthProvider,
    RevocationCache,
    UsersRepository,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [RevocationCache],
})
export class AuthModule {}
