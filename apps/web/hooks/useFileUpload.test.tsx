import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useFileUpload } from "@/hooks/useFileUpload";

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useFileUpload", () => {
  it("starts with no uploads", () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.fileUploads).toEqual({});
    expect(result.current.areFilesReady()).toBe(true);
  });

  it("uploads a file successfully", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ path: "/uploads/test.srt" }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    await act(async () => {
      await result.current.handleUploadFile("original", file);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/subtitles/upload-file",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );

    expect(result.current.fileUploads).toEqual({
      original: {
        file,
        status: "done",
        path: "/uploads/test.srt",
      },
    });
  });

  it("sets uploading state while request is pending", async () => {
    let resolve!: (response: Response) => void;

    global.fetch = vi.fn(
      () =>
        new Promise<Response>((res) => {
          resolve = res;
        }),
    );

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    act(() => {
      result.current.handleUploadFile("original", file);
    });

    await waitFor(() => {
      expect(result.current.fileUploads.original).toEqual({
        file,
        status: "uploading",
      });
    });

    await act(async () => {
      resolve({
        ok: true,
        json: () => Promise.resolve({ path: "/uploads/test.srt" }),
      } as Response);
    });
  });

  it("sets error state when upload fails", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "File too large" }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    await act(async () => {
      await result.current.handleUploadFile("original", file);
    });

    expect(result.current.fileUploads).toEqual({
      original: {
        file,
        status: "error",
        error: "File too large",
      },
    });
  });

  it("uses default error for non-Error failures", async () => {
    global.fetch = vi.fn(() => Promise.reject("failed"));

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    await act(async () => {
      await result.current.handleUploadFile("original", file);
    });

    expect(result.current.fileUploads.original).toEqual({
      file,
      status: "error",
      error: "Upload failed",
    });
  });

  it("extracts uploaded paths and checks readiness", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ path: "/uploads/test.srt" }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    await act(async () => {
      await result.current.handleUploadFile("original", file);
    });

    expect(result.current.extractPathsMap()).toEqual({
      original: "/uploads/test.srt",
    });
    expect(result.current.areFilesReady()).toBe(true);
    expect(result.current.areFilesReady(["original"])).toBe(true);
    expect(result.current.areFilesReady(["missing"])).toBe(false);
  });

  it("deletes an upload", async () => {
    global.fetch = vi.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ path: "/uploads/test.srt" }),
        }) as Promise<Response>,
    );

    const { result } = renderHook(() => useFileUpload());
    const file = new File(["content"], "test.srt");

    await act(async () => {
      await result.current.handleUploadFile("original", file);
    });

    act(() => {
      result.current.deleteKey("original");
    });

    expect(result.current.fileUploads).toEqual({});
    expect(result.current.extractPathsMap()).toEqual({});
  });
});
