import type { Type } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import type { Mock } from "vitest";
import { AppModule } from "../app.module";
import { FIREBASE_AUTH, type FirebaseAuth } from "../auth/firebase-auth.provider";
import { UsersRepository } from "../users/users.repository";
import { configureApp } from "../http/configure-app";
import { EXTENSION_ORIGIN, WEB_ORIGIN } from "../http/origin.guard";

export const TEST_WEB_ORIGIN = "http://localhost:3000";
export const TEST_EXTENSION_ORIGIN = "chrome-extension://testextensionid";

export type FakeFirebaseAuth = { [K in keyof FirebaseAuth]: Mock<FirebaseAuth[K]> };

export const NOW_SEC = 1_800_000_000;

export function decodedToken(uid: string, authTimeSec = NOW_SEC): DecodedIdToken {
  return { uid, auth_time: authTimeSec } as DecodedIdToken;
}

export function userRecord(fields: Partial<UserRecord> = {}): UserRecord {
  return { disabled: false, ...fields } as UserRecord;
}

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
    createCustomToken: vi.fn(async (forUid: string) => `custom-token-for-${forUid}`),
  };
}

export function fakeUsersRepository(users: Record<string, string> = { "firebase-uid-1": "user-1" }) {
  const ids = new Set(Object.values(users));
  return {
    findIdByFirebaseUid: vi.fn(async (firebaseUid: string) => users[firebaseUid] ?? null),
    findProfile: vi.fn(async (id: string) =>
      ids.has(id)
        ? { id, email: `${id}@linguastream.test`, displayName: null, nativeLanguage: "uk", learningLanguage: "de", isAdmin: false }
        : null,
    ),
  };
}

export async function createTestApp(
  options: {
    auth?: FakeFirebaseAuth;
    users?: Record<string, string>;
    controllers?: Type[];
    providers?: { token: unknown; value: unknown }[];
    largerBodyLimits?: Record<string, string>;
  } = {},
): Promise<NestExpressApplication> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  })
    .overrideProvider(FIREBASE_AUTH)
    .useValue(options.auth ?? fakeFirebaseAuth())
    .overrideProvider(UsersRepository)
    .useValue(fakeUsersRepository(options.users))
    .overrideProvider(WEB_ORIGIN)
    .useValue(TEST_WEB_ORIGIN)
    .overrideProvider(EXTENSION_ORIGIN)
    .useValue(TEST_EXTENSION_ORIGIN);
  for (const { token, value } of options.providers ?? []) {
    builder.overrideProvider(token).useValue(value);
  }
  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
  configureApp(app, options.largerBodyLimits);
  await app.init();
  return app;
}
