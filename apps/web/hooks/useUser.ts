import { getCurrentUserRoute, type CurrentUser } from "@linguastream/contracts";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export function useUser() {
  return useQuery<CurrentUser>({
    queryKey: ["user"],
    queryFn: () => apiRequest(getCurrentUserRoute),
    staleTime: Infinity,
  });
}
