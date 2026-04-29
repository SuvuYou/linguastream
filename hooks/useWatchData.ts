"use client";

import { useQuery } from "@tanstack/react-query";

export interface WatchData {
  id: string;
  title: string;
  streamUrl: string;
  sourceLanguage: string;
  translationLanguages: string[];
}

async function fetchWatchData(mediaContentId: string): Promise<WatchData> {
  const res = await fetch(`/api/watch/${mediaContentId}`);
  if (!res.ok) throw new Error("Failed to fetch watch data");
  return res.json();
}

export function useWatchData(mediaContentId: string) {
  return useQuery<WatchData>({
    queryKey: ["watch", mediaContentId],
    queryFn: () => fetchWatchData(mediaContentId),
    staleTime: Infinity,
  });
}
