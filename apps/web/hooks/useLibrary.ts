"use client";

import {
  listVideosRoute,
  retryTrackRoute,
  type LibraryVideo,
  type ProcessingEvent,
} from "@linguastream/contracts";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { openProcessingEvents } from "@/lib/api/processing-events";

export const LIBRARY_QUERY_KEY = "videos";

export function useLibrary(page: number, search: string) {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<Record<string, ProcessingEvent>>({});

  const videos = useQuery({
    queryKey: [LIBRARY_QUERY_KEY, page, search],
    queryFn: () =>
      apiRequest(listVideosRoute, {
        query: { page, q: search || undefined },
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(
    () =>
      openProcessingEvents((event) => {
        setEvents((current) => ({ ...current, [event.video_id]: event }));
        if (event.type !== "step")
          void queryClient.invalidateQueries({
            queryKey: [LIBRARY_QUERY_KEY],
          });
      }),
    [queryClient],
  );

  const retry = useMutation({
    mutationFn: ({ trackId }: { video: LibraryVideo; trackId: string }) =>
      apiRequest(retryTrackRoute, { params: { trackId } }),
    onSuccess: (_, { video, trackId }) =>
      setEvents((current) => ({
        ...current,
        [video.id]: {
          type: "queued",
          track_id: trackId,
          video_id: video.id,
          title: video.title,
        },
      })),
  });

  return { videos, events, retry };
}
