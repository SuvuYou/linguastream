"use client";

import { retryTrackRoute, type ProcessingEvent } from "@linguastream/contracts";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { apiRequest } from "@/lib/api/client";
import { openProcessingEvents } from "@/lib/api/processing-events";

export const READY_HIDE_MS = 8_000;

export interface ProcessingToast {
  event: ProcessingEvent;
  retrying: boolean;
  retryFailed: boolean;
}

type Action =
  | { type: "event"; event: ProcessingEvent }
  | { type: "dismiss"; trackId: string }
  | { type: "retry"; trackId: string }
  | { type: "retryFailed"; trackId: string };

type State = ProcessingToast[];

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "event": {
      const toast = {
        event: action.event,
        retrying: false,
        retryFailed: false,
      };
      const index = state.findIndex(
        (t) => t.event.track_id === action.event.track_id,
      );
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
    () => openProcessingEvents((event) => dispatch({ type: "event", event })),
    [],
  );

  useEffect(() => {
    const pending = timers.current;
    for (const { event } of toasts) {
      const id = event.track_id;
      if (event.type === "ready" && !pending.has(id)) {
        pending.set(
          id,
          setTimeout(() => {
            pending.delete(id);
            dispatch({ type: "dismiss", trackId: id });
          }, READY_HIDE_MS),
        );
      }
      if (event.type !== "ready" && pending.has(id)) {
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

  return { toasts, dismiss, retry };
}
