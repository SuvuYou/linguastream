"use client";

import { FileUploadState } from "@/hooks/useFileUpload";

export default function FileStatus({
  state,
}: {
  state: FileUploadState | null;
}) {
  if (!state) return null;
  if (state.status === "uploading")
    return <span className="text-xs text-secondary-text">Uploading...</span>;
  if (state.status === "done")
    return <span className="text-xs text-active-border">✓ Ready</span>;
  if (state.status === "error")
    return <span className="text-xs text-red-400">{state.error}</span>;
  return null;
}
