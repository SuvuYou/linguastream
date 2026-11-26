import { db } from "@linguastream/db";
import { gunzipSync, gzipSync } from "node:zlib";
import { CapturesRepository, type NewCapture } from "./captures.repository";

const repo = new CapturesRepository();

let n = 0;
async function user() {
  n++;
  return db.user.create({
    data: { firebaseUid: `uid-${n}`, email: `learner-${n}@example.com`, nativeLanguage: "uk", learningLanguage: "de" },
  });
}

function capture(userId: string, fields: Partial<NewCapture> = {}): NewCapture {
  return {
    userId,
    youtubeVideoId: "4Ja5iJtYOPw",
    youtubeTrackId: "a.de",
    contentHash: "a".repeat(64),
    processingVersion: 1,
    title: "Ein Tag in Hamburg",
    language: "de",
    isAutoCaptions: true,
    rawJson3: new Uint8Array(gzipSync('{"events":[]}')),
    ...fields,
  };
}

describe("CapturesRepository (Postgres)", () => {
  it("creates the video and a pending track", async () => {
    const u = await user();
    const { track, created } = await repo.create(capture(u.id));

    expect(created).toBe(true);
    expect(track.status).toBe("pending");
    const stored = await db.track.findUniqueOrThrow({ where: { id: track.trackId }, include: { video: true } });
    expect(stored.video).toMatchObject({ userId: u.id, youtubeVideoId: "4Ja5iJtYOPw", title: "Ein Tag in Hamburg", language: "de" });
    expect(gunzipSync(stored.rawJson3).toString()).toBe('{"events":[]}');
  });

  it("reuses the user's video for a second track and updates its title", async () => {
    const u = await user();
    const first = await repo.create(capture(u.id));
    const second = await repo.create(capture(u.id, { youtubeTrackId: ".de", contentHash: "b".repeat(64), title: "Neuer Titel" }));

    expect(second.track.videoId).toBe(first.track.videoId);
    expect(await db.video.count()).toBe(1);
    expect((await db.video.findFirstOrThrow()).title).toBe("Neuer Titel");
  });

  it("returns the existing track instead of a duplicate", async () => {
    const u = await user();
    const first = await repo.create(capture(u.id));
    const again = await repo.create(capture(u.id));

    expect(again).toEqual({ track: first.track, created: false });
    expect(await db.track.count()).toBe(1);
  });

  it("finds a track only for its own user", async () => {
    const a = await user();
    const b = await user();
    await repo.create(capture(a.id));
    const key = { youtubeVideoId: "4Ja5iJtYOPw", youtubeTrackId: "a.de", contentHash: "a".repeat(64), processingVersion: 1 };

    expect(await repo.findTrack({ ...key, userId: a.id })).not.toBeNull();
    expect(await repo.findTrack({ ...key, userId: b.id })).toBeNull();
    expect(await repo.findTrack({ ...key, userId: a.id, processingVersion: 2 })).toBeNull();
  });

  it("checks the blocklist by video ID", async () => {
    await db.blockedVideo.create({ data: { youtubeVideoId: "blocked-1", reason: "notice" } });
    expect(await repo.isBlocked("blocked-1")).toBe(true);
    expect(await repo.isBlocked("4Ja5iJtYOPw")).toBe(false);
  });
});
