import { NOW_SEC, fakeFirebaseAuth, userRecord, type FakeFirebaseAuth } from "../test/auth-fakes";
import { RevocationCache } from "./revocation-cache";

const UID = "firebase-uid-1";

describe("RevocationCache", () => {
  let auth: FakeFirebaseAuth;
  let cache: RevocationCache;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW_SEC * 1000);
    auth = fakeFirebaseAuth(UID);
    cache = new RevocationCache(auth);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a token from a user whose sessions were never revoked", async () => {
    await expect(cache.check(UID, NOW_SEC)).resolves.toBeNull();
  });

  it("rejects a token issued before the sessions were revoked", async () => {
    auth.getUser.mockResolvedValue(
      userRecord({ tokensValidAfterTime: new Date((NOW_SEC + 10) * 1000).toUTCString() }),
    );
    await expect(cache.check(UID, NOW_SEC)).resolves.toBe("revoked");
  });

  it("accepts a token issued after the revocation", async () => {
    auth.getUser.mockResolvedValue(
      userRecord({ tokensValidAfterTime: new Date((NOW_SEC - 10) * 1000).toUTCString() }),
    );
    await expect(cache.check(UID, NOW_SEC)).resolves.toBeNull();
  });

  it("rejects a disabled user", async () => {
    auth.getUser.mockResolvedValue(userRecord({ disabled: true }));
    await expect(cache.check(UID, NOW_SEC)).resolves.toBe("disabled");
  });

  it("reports a user Firebase no longer knows", async () => {
    auth.getUser.mockRejectedValue(Object.assign(new Error("gone"), { code: "auth/user-not-found" }));
    await expect(cache.check(UID, NOW_SEC)).resolves.toBe("unknown-user");
  });

  it("passes other Firebase errors on", async () => {
    auth.getUser.mockRejectedValue(Object.assign(new Error("down"), { code: "app/network-error" }));
    await expect(cache.check(UID, NOW_SEC)).rejects.toThrow("down");
  });

  it("asks Firebase once per user within a minute", async () => {
    await cache.check(UID, NOW_SEC);
    vi.advanceTimersByTime(RevocationCache.TTL_MS - 1);
    await cache.check(UID, NOW_SEC);
    expect(auth.getUser).toHaveBeenCalledTimes(1);
  });

  it("asks again after a minute and sees a new revocation", async () => {
    await expect(cache.check(UID, NOW_SEC)).resolves.toBeNull();
    auth.getUser.mockResolvedValue(
      userRecord({ tokensValidAfterTime: new Date((NOW_SEC + 30) * 1000).toUTCString() }),
    );
    vi.advanceTimersByTime(RevocationCache.TTL_MS);
    await expect(cache.check(UID, NOW_SEC)).resolves.toBe("revoked");
    expect(auth.getUser).toHaveBeenCalledTimes(2);
  });

  it("asks again at once after forget()", async () => {
    await cache.check(UID, NOW_SEC);
    cache.forget(UID);
    await cache.check(UID, NOW_SEC);
    expect(auth.getUser).toHaveBeenCalledTimes(2);
  });

  it("caches each user separately", async () => {
    await cache.check(UID, NOW_SEC);
    await cache.check("firebase-uid-2", NOW_SEC);
    expect(auth.getUser.mock.calls).toEqual([[UID], ["firebase-uid-2"]]);
  });
});
