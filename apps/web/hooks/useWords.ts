"use client";

import {
  getWordPackRoute,
  lookupWordRoute,
  setWordStatusRoute,
  type SetWordStatus,
  type WordLookup,
  type WordPack,
} from "@linguastream/contracts";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import type { WordStatuses, WordTarget } from "@/lib/watch/words";

const packKey = (videoId: string) => ["word-pack", videoId];
const lookupKey = (videoId: string) => ["word-lookup", videoId];

export function useWordStatuses(videoId: string, enabled: boolean): WordStatuses | undefined {
  const pack = useQuery({
    queryKey: packKey(videoId),
    queryFn: () => apiRequest(getWordPackRoute, { params: { videoId } }),
    enabled,
    staleTime: 5 * 60_000,
  });
  const words = pack.data?.words;
  return useMemo(
    () => (words ? new Map(words.map((word) => [word.lemma, word.status])) : undefined),
    [words],
  );
}

export function useWordLookup(videoId: string, target: WordTarget | null) {
  return useQuery({
    queryKey: [...lookupKey(videoId), target?.index, target?.i],
    queryFn: () =>
      apiRequest(lookupWordRoute, {
        params: { videoId, index: String(target!.index), i: String(target!.i) },
      }),
    enabled: target !== null,
    staleTime: 5 * 60_000,
  });
}

function writeStatus(queryClient: QueryClient, videoId: string, { lemma, status }: SetWordStatus) {
  queryClient.setQueryData<WordPack>(packKey(videoId), (pack) =>
    pack && {
      ...pack,
      words: pack.words.map((word) => (word.lemma === lemma ? { ...word, status } : word)),
    },
  );
  queryClient.setQueriesData<WordLookup>({ queryKey: lookupKey(videoId) }, (lookup) =>
    lookup && lookup.lemma === lemma ? { ...lookup, status } : lookup,
  );
}

export function useSetWordStatus(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (change: SetWordStatus) => apiRequest(setWordStatusRoute, { body: change }),
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: packKey(videoId) });
      const pack = queryClient.getQueryData<WordPack>(packKey(videoId));
      const lookups = queryClient.getQueriesData<WordLookup>({ queryKey: lookupKey(videoId) });
      writeStatus(queryClient, videoId, change);
      return { pack, lookups };
    },
    onError: (_error, _change, context) => {
      queryClient.setQueryData(packKey(videoId), context?.pack);
      for (const [key, data] of context?.lookups ?? []) queryClient.setQueryData(key, data);
      toast.error("Couldn't save the word's status");
    },
  });
}
