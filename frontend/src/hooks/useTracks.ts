import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "../shared/queryKeys";
import { fetchTracks } from "../shared/tracks";

export function useTracks(query = "") {
  const normalizedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: queryKeys.tracks(normalizedQuery),
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchTracks(normalizedQuery, pageParam),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
  });
}