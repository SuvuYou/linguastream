import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import type { AuthUser } from "../auth/auth-user";

interface Entry {
  userId: string;
  firebaseUid: string;
  expiresAt: number;
}

const hash = (code: string) => createHash("sha256").update(code).digest("base64url");

@Injectable()
export class SignInCodes {
  static readonly TTL_MS = 2 * 60_000;

  private readonly byHash = new Map<string, Entry>();
  private readonly hashByUser = new Map<string, string>();

  issue(user: AuthUser): { code: string; expiresAt: Date } {
    this.sweep();
    const previous = this.hashByUser.get(user.id);
    if (previous) this.byHash.delete(previous);

    const code = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + SignInCodes.TTL_MS;
    this.byHash.set(hash(code), { userId: user.id, firebaseUid: user.firebaseUid, expiresAt });
    this.hashByUser.set(user.id, hash(code));
    return { code, expiresAt: new Date(expiresAt) };
  }

  redeem(code: string): string | null {
    this.sweep();
    const key = hash(code);
    const entry = this.byHash.get(key);
    if (!entry) return null;

    this.byHash.delete(key);
    this.hashByUser.delete(entry.userId);
    return entry.firebaseUid;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.byHash) {
      if (entry.expiresAt > now) continue;
      this.byHash.delete(key);
      if (this.hashByUser.get(entry.userId) === key) this.hashByUser.delete(entry.userId);
    }
  }
}
