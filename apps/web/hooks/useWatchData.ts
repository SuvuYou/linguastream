"use client";

import { useQuery } from "@tanstack/react-query";

export interface WatchData {
  id: string;
  title: string;
  type: string;
  streamUrl?: string;
  videoId?: string;
  sourceLanguage: string;
  translationLanguages: string[];
}

async function fetchWatchData(mediaContentId: string): Promise<WatchData> {
  const res = await fetch(`/api/watch/${mediaContentId}`);
  if (!res.ok) throw new Error("Failed to fetch watch data");
  return res.json();
}

export function useWatchData(mediaContentId: string, enabled = true) {
  return useQuery<WatchData>({
    queryKey: ["watch", mediaContentId],
    queryFn: async () => fetchWatchData(mediaContentId),
    staleTime: Infinity,
    enabled,
  });
}
