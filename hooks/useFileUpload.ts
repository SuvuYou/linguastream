import { useState } from "react";

export interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  path?: string;
  error?: string;
}
export function useFileUpload() {
  const [fileUploads, setFileUploads] = useState<
    Record<string, FileUploadState>
  >({});

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/subtitles/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Upload failed");
    }

    const data = await res.json();
    return data.path as string;
  }

  async function handleUploadFile(key: string, file: File) {
    setFileUploads((prev) => ({
      ...prev,
      [key]: { file, status: "uploading" },
    }));

    try {
      const path = await uploadFile(file);
      setFileUploads((prev) => ({
        ...prev,
        [key]: { file, status: "done", path },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setFileUploads((prev) => ({
        ...prev,
        [key]: { file, status: "error", error: msg },
      }));
    }
  }

  function extractPathsMap() {
    const pathsMap: Record<string, string> = {};

    for (const [key, upload] of Object.entries(fileUploads)) {
      if (upload.path) pathsMap[key] = upload.path;
    }

    return pathsMap;
  }

  return { fileUploads, setFileUploads, handleUploadFile, extractPathsMap };
}
