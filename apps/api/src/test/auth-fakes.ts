import type { INestApplication, Type } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import type { Mock } from "vitest";
import { AppModule } from "../app.module";
import { FIREBASE_AUTH, type FirebaseAuth } from "../auth/firebase-auth.provider";
import { UsersRepository } from "../auth/users.repository";

export type FakeFirebaseAuth = { [K in keyof FirebaseAuth]: Mock<FirebaseAuth[K]> };

export const NOW_SEC = 1_800_000_000;

export function decodedToken(uid: string, authTimeSec = NOW_SEC): DecodedIdToken {
  return { uid, auth_time: authTimeSec } as DecodedIdToken;
}

export function userRecord(fields: Partial<UserRecord> = {}): UserRecord {
  return { disabled: false, ...fields } as UserRecord;
}

/**
 * Firebase that knows one ID token and one session cookie, both for `uid`, and a user
 * whose sessions were never revoked.
 */
export function fakeFirebaseAuth(uid = "firebase-uid-1"): FakeFirebaseAuth {
  return {
    verifyIdToken: vi.fn(async (token: string) => {
      if (token === "valid-id-token") return decodedToken(uid);
      throw Object.assign(new Error("invalid"), { code: "auth/argument-error" });
    }),
    verifySessionCookie: vi.fn(async (cookie: string) => {
      if (cookie === "valid-session-cookie") return decodedToken(uid);
      throw Object.assign(new Error("invalid"), { code: "auth/argument-error" });
    }),
    getUser: vi.fn(async () => userRecord()),
  };
}

export function fakeUsersRepository(users: Record<string, string> = { "firebase-uid-1": "user-1" }) {
  return {
    findIdByFirebaseUid: vi.fn(async (firebaseUid: string) => users[firebaseUid] ?? null),
  };
}

/** The real AppModule (guard included) with Firebase and the users table faked. */
export async function createTestApp(
  options: { auth?: FakeFirebaseAuth; controllers?: Type[] } = {},
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  })
    .overrideProvider(FIREBASE_AUTH)
    .useValue(options.auth ?? fakeFirebaseAuth())
    .overrideProvider(UsersRepository)
    .useValue(fakeUsersRepository())
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
