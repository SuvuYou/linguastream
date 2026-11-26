import type { Provider } from "@nestjs/common";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

export type FirebaseAuth = Pick<Auth, "verifyIdToken" | "verifySessionCookie" | "getUser">;

export const FIREBASE_AUTH = Symbol("FIREBASE_AUTH");

export const firebaseAuthProvider: Provider = {
  provide: FIREBASE_AUTH,
  useFactory: (): FirebaseAuth => {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY must be set (apps/api/.env)",
      );
    }

    if (!getApps().length) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }

    return getAuth();
  },
};
