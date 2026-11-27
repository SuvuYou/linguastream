import type { INestApplication } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { WordLookup } from "@linguastream/contracts";
import request from "supertest";
import { createTestApp } from "../test/auth-fakes";
import { WordLookupService } from "./word-lookup.service";

const VIDEO_ID = "0190f3c2-7d1a-7c00-8a00-000000000001";

const RESULT: WordLookup = {
  video_id: VIDEO_ID,
  line_index: 4,
  line: { text: "Der Hund läuft.", translation: null },
  word: { i: 1, text: "Hund", pos: "NOUN", morph: null },
  language: "de",
  native_language: "uk",
  lemma: "Hund",
  status: "unknown",
  rank: 812,
  gloss: "dog",
  gloss_language: "en",
  entries: [],
  forms: [{ form: "Hunde", pos: "noun", tags: ["nominative", "plural"] }],
  ai: null,
};

describe("word lookup API", () => {
  let app: INestApplication;
  let lookups: { lookup: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    lookups = { lookup: vi.fn(async ({ userId, i }: { userId: string; i: number }) => (userId === "user-1" && i === 1 ? RESULT : null)) };
    app = await createTestApp({ providers: [{ token: WordLookupService, value: lookups }] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  const get = (path: string) => request(app.getHttpServer()).get(path).set("Authorization", "Bearer valid-id-token");

  it("returns the lookup with its timing", async () => {
    const res = await get(`/api/videos/${VIDEO_ID}/lines/4/words/1`).expect(200);
    expect(WordLookup.parse(res.body)).toEqual(RESULT);
    expect(res.headers["server-timing"]).toMatch(/^lookup;dur=\d+$/);
    expect(lookups.lookup).toHaveBeenCalledWith({ userId: "user-1", videoId: VIDEO_ID, index: 4, i: 1 });
  });

  it("warns when a lookup goes over budget, without the word", async () => {
    const warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    lookups.lookup.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 220));
      return RESULT;
    });
    await get(`/api/videos/${VIDEO_ID}/lines/4/words/1`).expect(200);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^Word lookup took \d+ ms \(budget 200 ms\)$/));
  });

  it("answers 404 for an unknown word, 400 for bad input and 401 without a session", async () => {
    await get(`/api/videos/${VIDEO_ID}/lines/4/words/2`).expect(404);
    await get(`/api/videos/${VIDEO_ID}/lines/-1/words/1`).expect(400);
    await get(`/api/videos/nope/lines/4/words/1`).expect(400);
    await request(app.getHttpServer()).get(`/api/videos/${VIDEO_ID}/lines/4/words/1`).expect(401);
  });
});
