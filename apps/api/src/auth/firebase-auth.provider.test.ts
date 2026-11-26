import type { FactoryProvider } from "@nestjs/common";
import { firebaseAuthProvider } from "./firebase-auth.provider";

describe("firebaseAuthProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("refuses to start without the Firebase Admin credentials", () => {
    vi.stubEnv("FIREBASE_ADMIN_PROJECT_ID", "");
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "");
    vi.stubEnv("FIREBASE_ADMIN_PRIVATE_KEY", "");

    const { useFactory } = firebaseAuthProvider as FactoryProvider;
    expect(() => useFactory()).toThrow(/FIREBASE_ADMIN_PROJECT_ID/);
  });
});
