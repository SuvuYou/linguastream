"use client";

import {
  PROCESSING_STEPS,
  retryTrackRoute,
  translateVideoRoute,
  type ProcessingEvent,
  type TranslationErrorCode,
} from "@linguastream/contracts";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { apiRequest } from "@/lib/api/client";
import { openProcessingEvents } from "@/lib/api/processing-events";
import type { ProgressSample } from "@/lib/processing/eta";

export const READY_HIDE_MS = 8_000;

export interface ProcessingToast {
  event: ProcessingEvent;
  retrying: boolean;
  retryFailed: boolean;
  progressStart: ProgressSample | null;
  progressLast: ProgressSample | null;
  translationError: TranslationErrorCode | null;
}

type Action =
  | { type: "event"; event: ProcessingEvent; at: number }
  | { type: "dismiss"; trackId: string }
  | { type: "retry"; trackId: string }
  | { type: "retryFailed"; trackId: string };

type State = ProcessingToast[];

function nextToast(
  previous: ProcessingToast | undefined,
  event: ProcessingEvent,
  at: number,
): ProcessingToast {
  const progress = event.type === "step" ? event.progress : undefined;
  const sample = progress ? { at, done: progress.done } : null;
  const keepStart =
    sample &&
    previous?.progressStart &&
    previous.progressStart.done <= sample.done;
  return {
    event,
    retrying: false,
    retryFailed: false,
    progressStart: keepStart ? previous.progressStart : sample,
    progressLast: sample,
    translationError:
      event.type === "translation_failed"
        ? event.error_code
        : event.type === "ready"
          ? (previous?.translationError ?? null)
          : null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "event": {
      const index = state.findIndex(
        (t) => t.event.track_id === action.event.track_id,
      );
      const toast = nextToast(state[index], action.event, action.at);
      if (index === -1) return [...state, toast];
      return state.map((t, i) => (i === index ? toast : t));
    }
    case "dismiss":
      return state.filter((t) => t.event.track_id !== action.trackId);
    case "retry":
      return state.map((t) =>
        t.event.track_id === action.trackId
          ? { ...t, retrying: true, retryFailed: false }
          : t,
      );
    case "retryFailed":
      return state.map((t) =>
        t.event.track_id === action.trackId
          ? { ...t, retrying: false, retryFailed: true }
          : t,
      );
  }
}

export function useProcessingToasts() {
  const [toasts, dispatch] = useReducer(reducer, []);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(
    () =>
      openProcessingEvents((event) =>
        dispatch({ type: "event", event, at: Date.now() }),
      ),
    [],
  );

  useEffect(() => {
    const pending = timers.current;
    for (const { event, translationError } of toasts) {
      const id = event.track_id;
      const finished = event.type === "ready" && !translationError;
      if (finished && !pending.has(id)) {
        pending.set(
          id,
          setTimeout(() => {
            pending.delete(id);
            dispatch({ type: "dismiss", trackId: id });
          }, READY_HIDE_MS),
        );
      }
      if (!finished && pending.has(id)) {
        clearTimeout(pending.get(id));
        pending.delete(id);
      }
    }
  }, [toasts]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const dismiss = useCallback((trackId: string) => {
    clearTimeout(timers.current.get(trackId));
    timers.current.delete(trackId);
    dispatch({ type: "dismiss", trackId });
  }, []);

  const retry = useCallback(async (event: ProcessingEvent) => {
    dispatch({ type: "retry", trackId: event.track_id });
    try {
      await apiRequest(retryTrackRoute, {
        params: { trackId: event.track_id },
      });
      dispatch({
        type: "event",
        at: Date.now(),
        event: {
          type: "queued",
          track_id: event.track_id,
          video_id: event.video_id,
          title: event.title,
        },
      });
    } catch {
      dispatch({ type: "retryFailed", trackId: event.track_id });
    }
  }, []);

  const retryTranslation = useCallback(async (event: ProcessingEvent) => {
    dispatch({ type: "retry", trackId: event.track_id });
    try {
      await apiRequest(translateVideoRoute, {
        params: { videoId: event.video_id },
      });
      dispatch({
        type: "event",
        at: Date.now(),
        event: {
          type: "step",
          track_id: event.track_id,
          video_id: event.video_id,
          title: event.title,
          step: "translate",
          step_index: PROCESSING_STEPS.indexOf("translate"),
          step_count: PROCESSING_STEPS.length,
        },
      });
    } catch {
      dispatch({ type: "retryFailed", trackId: event.track_id });
    }
  }, []);

  return { toasts, dismiss, retry, retryTranslation };
}
