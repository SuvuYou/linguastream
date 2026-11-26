"use client";

import {
  getLineWindowRoute,
  type Line,
  type VideoDetail,
} from "@linguastream/contracts";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { mergeLines, windowsAround } from "@/lib/watch/lines";

const FALLBACK_DURATION_MS = 3 * 60 * 60 * 1000;

export function useLineWindows(
  video: VideoDetail | undefined,
  startMs: number,
) {
  const ready = video?.track?.status === "ready";
  const [aroundMs] = useState(startMs);
  const windows = useMemo(
    () =>
      ready
        ? windowsAround(video?.duration_ms ?? FALLBACK_DURATION_MS, aroundMs)
        : [],
    [ready, video?.duration_ms, aroundMs],
  );

  return useQueries({
    queries: windows.map((w) => ({
      queryKey: ["lines", video?.id, w.fromMs, w.toMs],
      queryFn: () =>
        apiRequest(getLineWindowRoute, {
          params: { videoId: video!.id },
          query: { from_ms: w.fromMs, to_ms: w.toMs },
        }),
      staleTime: Infinity,
    })),
    combine: (results) => ({
      lines: mergeLines(results.map((r) => r.data?.lines)) as Line[],
      isLoading: results.length > 0 && results[0]!.isPending,
      isError: results.some((r) => r.isError),
      isComplete: results.every((r) => r.isSuccess),
    }),
  });
}
