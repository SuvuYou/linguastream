import { PUBLIC_LIBRARY_PARAMS_SCHEMA } from "@/helpers/params-schema";
import { useZodSearchParams } from "./useZodSearchParams";
import { useQuery } from "@tanstack/react-query";

export function useLibrary() {
  const { params: searchParams } = useZodSearchParams(
    PUBLIC_LIBRARY_PARAMS_SCHEMA,
  );

  return useQuery({
    queryKey: ["library", searchParams],
    queryFn: async () => {
      const response = await fetch(`/api/library?${searchParams}`);

      if (!response.ok) throw new Error("Failed to fetch library");

      return response.json();
    },
  });
}
