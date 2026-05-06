import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "./route";
import fs from "fs";
import { db } from "@/lib/initializations/db";
import { NextRequest } from "next/server";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";
import { mockDbMediaContent } from "@/helpers/tests/mocks/db.mediaContent";
import { JOB_STATUS } from "@/helpers/const";

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock("@/lib/initializations/db", () => ({
  db: {
    mediaContent: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

function mockParams(mediaId = "abc") {
  return {
    params: Promise.resolve({ mediaId }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/jobs/[mediaId]", () => {
  it("GET → 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", { method: "GET" });

    const res = await GET(req, mockParams());
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("GET → 404 if media not found", async () => {
    mockGetCurrentUser.base();
    mockDbMediaContent.findUnique.empty();

    const req = new NextRequest("http://localhost", { method: "GET" });

    const res = await GET(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("GET → 403 if not owner", async () => {
    mockGetCurrentUser.override({ id: "id1" });
    mockDbMediaContent.findUnique.override({ user_id: "id2" });

    const req = new NextRequest("http://localhost", { method: "GET" });

    const res = await GET(req, mockParams());

    expect(res.status).toBe(403);
  });

  it("GET → returns empty job state", async () => {
    mockGetCurrentUser.admin();
    mockDbMediaContent.findUnique.override({ job_status: null });

    const req = new NextRequest("http://localhost", { method: "GET" });

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(body).toEqual({
      status: null,
      progress: null,
      logs: [],
    });
  });

  it("GET → returns tailed logs", async () => {
    mockGetCurrentUser.admin();

    mockDbMediaContent.findUnique.base();

    vi.mocked(fs.readFileSync).mockReturnValue(
      Array.from({ length: 30 }, (_, i) => `line${i}`).join("\n"),
    );

    const req = new NextRequest("http://localhost", { method: "GET" });

    const res = await GET(req, mockParams());
    const body = await res.json();

    expect(body.status).toBe("done");
    expect(body.logs.length).toBe(20); // tail
    expect(body.logs[0]).toBe("line10"); // last 20
  });

  it("DELETE → 401 if no user", async () => {
    mockGetCurrentUser.empty();

    const req = new NextRequest("http://localhost", { method: "DELETE" });
    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(401);
  });

  it("DELETE → 404 if not found", async () => {
    mockGetCurrentUser.base();
    mockDbMediaContent.findUnique.empty();

    const req = new NextRequest("http://localhost", { method: "DELETE" });
    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(404);
  });

  it("DELETE → 403 if not owner", async () => {
    mockGetCurrentUser.base();

    mockDbMediaContent.findUnique.base();

    const req = new NextRequest("http://localhost", { method: "DELETE" });
    const res = await DELETE(req, mockParams());

    expect(res.status).toBe(403);
  });

  it("DELETE → 409 if job is running", async () => {
    mockGetCurrentUser.admin();
    mockDbMediaContent.findUnique.override({ job_status: JOB_STATUS.RUNNING });

    const req = new NextRequest("http://localhost", { method: "DELETE" });
    const res = await DELETE(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toMatch(/running/);
  });

  it("DELETE → resets job fields", async () => {
    mockGetCurrentUser.admin();

    mockDbMediaContent.findUnique.base();

    const req = new NextRequest("http://localhost", { method: "DELETE" });
    const res = await DELETE(req, mockParams());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);

    expect(db.mediaContent.update).toHaveBeenCalledWith({
      where: { id: "abc" },
      data: {
        job_status: null,
        job_progress: null,
        job_logs: null,
      },
    });
  });
});
