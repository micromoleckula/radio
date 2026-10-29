import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  enabled: boolean;
  isFetching: boolean;
  onLoadMore: () => Promise<unknown>;
}

export function useInfiniteScroll({
  enabled,
  isFetching,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const requestInFlightRef = useRef(false);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !enabled || isFetching) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !requestInFlightRef.current) {
          requestInFlightRef.current = true;
          void onLoadMoreRef.current().then(
            () => {
              requestInFlightRef.current = false;
            },
            () => {
              requestInFlightRef.current = false;
            },
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [enabled, isFetching]);

  return sentinelRef;
}
