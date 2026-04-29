"use client";

import { useQuery } from "@tanstack/react-query";

export interface SubtitleLine {
  index: number;
  start_ms: number;
  end_ms: number;
  text: string;
}

async function fetchSubtitleTrack(
  mediaContentId: string,
  lang: string,
): Promise<SubtitleLine[]> {
  const res = await fetch(
    `/api/subtitles/track/${mediaContentId}?lang=${lang}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch subtitle track: ${lang}`);
  const data = await res.json();
  return data.lines;
}

export function useSubtitleTrack(
  mediaContentId: string,
  lang: string | null,
  enabled: boolean = true,
) {
  return useQuery<SubtitleLine[]>({
    queryKey: ["subtitle-track", mediaContentId, lang],
    queryFn: () => fetchSubtitleTrack(mediaContentId, lang!),
    enabled: enabled && !!lang,
    staleTime: Infinity,
  });
}
