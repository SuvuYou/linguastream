import { describe, expect, it } from "vitest";
import { db } from "../src/client.js";

async function createVideoWithLine() {
  const user = await db.user.create({
    data: {
      firebase_uid: "uid-1",
      email: "learner@example.com",
      native_language: "en",
    },
  });

  const video = await db.mediaContent.create({
    data: {
      user_id: user.id,
      title: "Ein Tag in Hamburg",
      type: "youtube",
      source_language: "de",
    },
  });

  const track = await db.subtitleTrack.create({
    data: { media_content_id: video.id, language: "de", is_source: true },
  });

  await db.subtitleLine.create({
    data: {
      media_content_id: video.id,
      subtitle_track_id: track.id,
      index: 0,
      start_ms: 0,
      end_ms: 4000,
      text: "Heute zeige ich euch, wie man in Hamburg richtig frühstückt.",
    },
  });

  return video;
}

describe("deleting a video", () => {
  it("deletes its subtitle tracks and lines", async () => {
    const video = await createVideoWithLine();

    await db.mediaContent.delete({ where: { id: video.id } });

    expect(await db.subtitleTrack.count()).toBe(0);
    expect(await db.subtitleLine.count()).toBe(0);
  });
});

describe("resetDatabase", () => {
  it("starts each test with empty tables", async () => {
    await createVideoWithLine();
    expect(await db.mediaContent.count()).toBe(1);
  });

  it("removed the rows the previous test created", async () => {
    expect(await db.user.count()).toBe(0);
    expect(await db.mediaContent.count()).toBe(0);
    expect(await db.subtitleLine.count()).toBe(0);
  });
});
