import type { INestApplication } from "@nestjs/common";
import { SetWordStatus } from "@linguastream/contracts";
import request from "supertest";
import { TEST_WEB_ORIGIN, createTestApp } from "../test/auth-fakes";
import { VocabularyRepository } from "./vocabulary.repository";

describe("vocabulary API", () => {
  let app: INestApplication;
  let repo: { setStatus: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = { setStatus: vi.fn(async () => {}) };
    app = await createTestApp({ providers: [{ token: VocabularyRepository, value: repo }] });
  });

  afterEach(async () => {
    await app.close();
  });

  const put = (body: object, origin = TEST_WEB_ORIGIN) =>
    request(app.getHttpServer())
      .put("/api/vocabulary/status")
      .set("Cookie", "session=valid-session-cookie")
      .set("Origin", origin)
      .send(body);

  it("sets the user's status for a lemma", async () => {
    const res = await put({ language: "de", lemma: "Hund", status: "known" }).expect(200);
    expect(SetWordStatus.parse(res.body)).toEqual({ language: "de", lemma: "Hund", status: "known" });
    expect(repo.setStatus).toHaveBeenCalledWith("user-1", { language: "de", lemma: "Hund", status: "known" });
  });

  it("answers 400 for a bad status, 403 from another origin and 401 without a session", async () => {
    await put({ language: "de", lemma: "Hund", status: "mastered" }).expect(400);
    await put({ language: "de", lemma: "Hund", status: "known" }, "https://evil.example").expect(403);
    await request(app.getHttpServer())
      .put("/api/vocabulary/status")
      .send({ language: "de", lemma: "Hund", status: "known" })
      .expect(401);
    expect(repo.setStatus).not.toHaveBeenCalled();
  });
});
