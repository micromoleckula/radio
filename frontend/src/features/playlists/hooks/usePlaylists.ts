import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/lib/queryKeys";
import { fetchPlaylists } from "../api";

export function usePlaylists(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.playlists,
    queryFn: ({ pageParam }) => fetchPlaylists(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    enabled,
    staleTime: 30_000,
  });
}
