"use client";

import {
  DEFAULT_PREFERENCES,
  getPreferencesRoute,
  updatePreferencesRoute,
  type RequestBody,
  type UserPreferences,
} from "@linguastream/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";

const KEY = ["preferences"];

export function usePreferences() {
  const query = useQuery({
    queryKey: KEY,
    queryFn: () => apiRequest(getPreferencesRoute),
    staleTime: Infinity,
  });
  return query.data ?? DEFAULT_PREFERENCES;
}

type PreferencesChange = RequestBody<typeof updatePreferencesRoute>;

function apply(
  current: UserPreferences,
  change: PreferencesChange,
): UserPreferences {
  return {
    subtitle_visibility: {
      ...current.subtitle_visibility,
      ...change.subtitle_visibility,
    },
  };
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (change: PreferencesChange) =>
      apiRequest(updatePreferencesRoute, { body: change }),
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<UserPreferences>(KEY);
      queryClient.setQueryData<UserPreferences>(
        KEY,
        apply(previous ?? DEFAULT_PREFERENCES, change),
      );
      return { previous };
    },
    onError: (_error, _change, context) => {
      queryClient.setQueryData(KEY, context?.previous);
      toast.error("Couldn't save the subtitle setting");
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(KEY, saved);
    },
  });
}
