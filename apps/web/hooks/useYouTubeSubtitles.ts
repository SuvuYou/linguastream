"use client";

import { SubtitleInfo } from "@/app/api/youtube/subtitles/route";
import { useQuery } from "@tanstack/react-query";

export function useYouTubeSubtitles(videoId: string | null) {
  return useQuery<SubtitleInfo>({
    queryKey: ["youtube-subtitles", videoId],
    queryFn: async () => {
      const res = await fetch(`/api/youtube/subtitles?videoId=${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch YouTube subtitles");
      return res.json();
    },
    enabled: !!videoId,
    staleTime: Infinity,
  });
}
