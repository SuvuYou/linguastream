"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { JOB_STATUS } from "@/helpers/const";

const POLL_INTERVAL_MS = 2000;

interface JobState {
  status: string | null;
  progress: number;
  logs: string[];
}

export function useJobPolling(
  mediaId: string,
  initialStatus: string | null,
  initialProgress: number | null,
  libraryQueryKey: unknown[],
) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef(false);

  const isTerminal =
    initialStatus === JOB_STATUS.DONE || initialStatus === JOB_STATUS.ERROR;

  const [jobState, setJobState] = useState<JobState>({
    status: initialStatus,
    progress: initialProgress ?? 0,
    logs: [],
  });

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${mediaId}`);
      if (!res.ok) return;
      const data = await res.json();

      setJobState({
        status: data.status,
        progress: data.progress ?? 0,
        logs: data.logs ?? [],
      });

      if (data.status === JOB_STATUS.DONE || data.status === JOB_STATUS.ERROR) {
        stopPolling();
        queryClient.invalidateQueries({ queryKey: libraryQueryKey });
      }
    } catch {
      // silently ignore network errors
    }
  }, [mediaId, libraryQueryKey, queryClient, stopPolling]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [poll]);

  useEffect(() => {
    if (isTerminal || !elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startPolling();
        } else {
          stopPolling();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
      stopPolling();
    };
  }, [isTerminal, startPolling, stopPolling]);

  return { jobState, elementRef };
}
