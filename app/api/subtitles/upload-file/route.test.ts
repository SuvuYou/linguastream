import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import fs from "fs";
import { POST } from "./route";
import { mockGetCurrentUser } from "@/helpers/tests/mocks/getCurrentUser";

vi.mock("@/lib/firebase/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const mockedMkdirSync = vi.mocked(fs.mkdirSync);
const mockedWriteFileSync = vi.mocked(fs.writeFileSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST api/subtitles/upload", () => {
  it("returns 401 if user is unauthorized", async () => {
    mockGetCurrentUser.empty();

    const req = {
      formData: vi.fn(),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });

    expect(req.formData).not.toHaveBeenCalled();

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 if formData parsing fails", async () => {
    mockGetCurrentUser.base();

    const req = {
      formData: vi.fn().mockRejectedValue(new Error("invalid")),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "Invalid form data" });

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 if no file is provided", async () => {
    mockGetCurrentUser.base();

    const formData = new FormData();

    const req = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "No file provided" });

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 if uploaded value is not a File", async () => {
    mockGetCurrentUser.base();

    const formData = new FormData();
    formData.set("file", "not-a-file");

    const req = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: "No file provided" });

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid file extension", async () => {
    mockGetCurrentUser.base();

    const file = new File(["content"], "movie.mp4", {
      type: "video/mp4",
    });

    const formData = new FormData();
    formData.set("file", file);

    const req = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: "Invalid file type. Allowed: .srt, .vtt",
    });

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 if file is larger than 5MB", async () => {
    mockGetCurrentUser.base();

    const largeContent = new Uint8Array(5 * 1024 * 1024 + 1);

    const file = new File([largeContent], "subtitle.srt", {
      type: "application/x-subrip",
    });

    const formData = new FormData();
    formData.set("file", file);

    const req = {
      formData: vi.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      error: "File too large. Maximum size is 5MB.",
    });

    expect(mockedMkdirSync).not.toHaveBeenCalled();
    expect(mockedWriteFileSync).not.toHaveBeenCalled();
  });
});
