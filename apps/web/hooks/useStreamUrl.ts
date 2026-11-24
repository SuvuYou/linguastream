"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchStreamUrl(
  mediaContentId: string,
): Promise<{ streamUrl: string }> {
  const res = await fetch(`/api/watch/${mediaContentId}/stream`);
  if (!res.ok) throw new Error("Failed to fetch stream URL");
  return res.json();
}

export function useStreamUrl(mediaContentId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["stream", mediaContentId],
    queryFn: async () => fetchStreamUrl(mediaContentId!),
    enabled: enabled,
    staleTime: Infinity,
  });
}
