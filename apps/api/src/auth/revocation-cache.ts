import { Inject, Injectable } from "@nestjs/common";
import { FIREBASE_AUTH, type FirebaseAuth } from "./firebase-auth.provider";

export type SessionProblem = "revoked" | "disabled" | "unknown-user";

interface Entry {
  validAfterMs: number;
  disabled: boolean;
  checkedAt: number;
}

@Injectable()
export class RevocationCache {
  static readonly TTL_MS = 60_000;

  private readonly entries = new Map<string, Entry>();

  constructor(@Inject(FIREBASE_AUTH) private readonly auth: FirebaseAuth) {}

  async check(uid: string, authTimeSec: number): Promise<SessionProblem | null> {
    const entry = await this.lookup(uid);
    if (!entry) return "unknown-user";
    if (entry.disabled) return "disabled";
    if (authTimeSec * 1000 < entry.validAfterMs) return "revoked";
    return null;
  }

  forget(uid: string): void {
    this.entries.delete(uid);
  }

  private async lookup(uid: string): Promise<Entry | null> {
    const cached = this.entries.get(uid);
    if (cached && Date.now() - cached.checkedAt < RevocationCache.TTL_MS) return cached;

    try {
      const user = await this.auth.getUser(uid);
      const entry: Entry = {
        validAfterMs: user.tokensValidAfterTime ? Date.parse(user.tokensValidAfterTime) : 0,
        disabled: user.disabled,
        checkedAt: Date.now(),
      };
      this.entries.set(uid, entry);
      return entry;
    } catch (err) {
      if ((err as { code?: string }).code === "auth/user-not-found") {
        this.entries.delete(uid);
        return null;
      }
      throw err;
    }
  }
}
