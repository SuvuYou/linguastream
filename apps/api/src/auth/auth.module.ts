import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { FIREBASE_AUTH, firebaseAuthProvider } from "./firebase-auth.provider";
import { RevocationCache } from "./revocation-cache";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  providers: [
    firebaseAuthProvider,
    RevocationCache,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [RevocationCache, FIREBASE_AUTH],
})
export class AuthModule {}
