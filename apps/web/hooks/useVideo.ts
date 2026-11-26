"use client";

import { getVideoRoute } from "@linguastream/contracts";
import { useQuery } from "@tanstack/react-query";
import { ApiRequestError, apiRequest } from "@/lib/api/client";

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ["video", videoId],
    queryFn: () => apiRequest(getVideoRoute, { params: { videoId } }),
    retry: (count, error) =>
      !(error instanceof ApiRequestError && error.status < 500) && count < 2,
  });
}
