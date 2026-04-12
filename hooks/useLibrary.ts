import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "./useZodSearchParams";
import { useQuery } from "@tanstack/react-query";
import { LibraryResponse } from "@/types/library";

export function useLibrary() {
  const { params } = useZodSearchParams(PUBLIC_LIBRARY_PARAMS_SCHEMA);

  return useQuery<LibraryResponse>({
    queryKey: ["library", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.src) searchParams.set("src", params.src);
      if (params.sub) searchParams.set("sub", params.sub);
      if (params.unreg) searchParams.set("unreg", "true");
      searchParams.set("page", String(params.page));

      const response = await fetch(`/api/library?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch library");

      return response.json();
    },
  });
}

export const DEFAULT_LIBRARY_RESPONSE: LibraryResponse = {
  items: [],
  total: 0,
  pageCount: 0,
  activeSource: "",
  activeSubtitle: "",
  availableSource: [],
  availableSubtitle: [],
};
