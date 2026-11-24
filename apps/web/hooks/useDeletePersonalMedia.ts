"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteMedia(mediaId: string): Promise<{ deletedCount: number }> {
  const res = await fetch("/api/media-content", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mediaId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete media");
  }
  return res.json();
}

export function useDeletePersonalMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-library"] });
    },
  });
}
