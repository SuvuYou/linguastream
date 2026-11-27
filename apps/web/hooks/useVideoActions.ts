"use client";

import {
  deleteVideoRoute,
  translateVideoRoute,
  type StepProgress,
} from "@linguastream/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ProgressSample } from "@/lib/processing/eta";
import { apiRequest } from "@/lib/api/client";
import { openProcessingEvents } from "@/lib/api/processing-events";
import { LIBRARY_QUERY_KEY } from "./useLibrary";

export function useTranslateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) =>
      apiRequest(translateVideoRoute, { params: { videoId } }),
    onSuccess: (_, videoId) => {
      void queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      void queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEY] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) =>
      apiRequest(deleteVideoRoute, { params: { videoId } }),
    onSuccess: (_, videoId) => {
      queryClient.removeQueries({ queryKey: ["video", videoId] });
      queryClient.removeQueries({ queryKey: ["lines", videoId] });
      void queryClient.invalidateQueries({ queryKey: [LIBRARY_QUERY_KEY] });
    },
  });
}

export function useRefreshOnProcessing(videoId: string) {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      openProcessingEvents((event) => {
        if (event.video_id !== videoId || event.type === "step") return;
        void queryClient.invalidateQueries({ queryKey: ["video", videoId] });
        void queryClient.invalidateQueries({ queryKey: ["lines", videoId] });
      }),
    [queryClient, videoId],
  );
}

export interface LiveProgress {
  progress: StepProgress;
  start: ProgressSample;
  last: ProgressSample;
}

export function useLiveTranslationProgress(videoId: string) {
  const [live, setLive] = useState<LiveProgress | null>(null);
  useEffect(
    () =>
      openProcessingEvents((event) => {
        if (event.video_id !== videoId) return;
        if (event.type !== "step" || !event.progress) {
          if (event.type !== "step") setLive(null);
          return;
        }
        const progress = event.progress;
        const sample = { at: Date.now(), done: progress.done };
        setLive((current) => ({
          progress,
          start:
            current && current.start.done <= sample.done ? current.start : sample,
          last: sample,
        }));
      }),
    [videoId],
  );
  return live;
}
