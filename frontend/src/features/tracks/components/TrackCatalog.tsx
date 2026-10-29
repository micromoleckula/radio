import prettyMilliseconds from "pretty-ms";
import { useTracks } from "../hooks/useTracks";
import {
  DURATION_FORMAT_OPTIONS,
  MILLISECONDS_PER_SECOND,
} from "../../../shared/lib/constants";
import { useInfiniteScroll } from "../../../shared/hooks/useInfiniteScroll";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Notice } from "../../../shared/ui/Notice";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { usePlayerStore } from "../../player/store/player.store";
import { useAuthStore } from "../../auth/store/auth.store";
import { TrackCover } from "./TrackCover";
import { TrackPlaylistMenu } from "./TrackPlaylistMenu";

interface TrackCatalogProps {
  title: string;
  query?: string;
}

export const TrackCatalog = ({ title, query = "" }: TrackCatalogProps) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useTracks(query);
  const sentinelRef = useInfiniteScroll({
    enabled: hasNextPage && !isFetchNextPageError,
    isFetching: isFetchingNextPage,
    onLoadMore: () => fetchNextPage(),
  });
  const tracks = data?.pages.flatMap((page) => page.items) ?? [];
  const playTrack = usePlayerStore((state) => state.playTrack);
  const activeTrackId = usePlayerStore(
    (state) => state.queue[state.currentIndex]?.id,
  );
  const isAuthenticated = useAuthStore((state) => Boolean(state.token));
  const gridColumns = isAuthenticated
    ? "track-catalog-grid-authenticated sm:track-catalog-grid-authenticated-wide"
    : "track-catalog-grid-guest sm:track-catalog-grid-guest-wide";

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        description={
          query
            ? "A few good sounds, picked from your collection."
            : "Your collection, ready when you are."
        }
        eyebrow={query ? "Search" : "Your music"}
        title={title}
      />

      {isLoading && (
        <p className="rounded-lg border border-white-6 bg-white-2 px-4 py-3 text-sm text-zinc-400">
          Loading tracks...
        </p>
      )}

      {isError && !data && (
        <Notice tone="error">
          <div className="flex items-center justify-between gap-3">
            <span>{error.message}</span>
            <button
              className="shrink-0 rounded-full border border-red-300/20 px-3 py-1 text-xs hover:bg-red-300/10"
              onClick={() => void refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        </Notice>
      )}

      {!isLoading && !isError && tracks.length === 0 && (
        <EmptyState
          description={
            query
              ? "Try another title or artist name, or clear your search."
              : "Tracks added to your collection will show up here."
          }
          title={query ? "No matches this time" : "Your collection is waiting"}
        />
      )}

      {tracks.length > 0 && (
        <div className="rounded-xl border border-white-6 bg-white-2">
          <div
            className={`hidden ${gridColumns} gap-3 border-b border-border-muted px-2 py-2 text-caption font-semibold uppercase tracking-catalog text-zinc-600 sm:grid`}
          >
            <span />
            <span />
            <span>Track</span>
            <span className="text-right">Time</span>
            {isAuthenticated && <span />}
          </div>
          <div className="divide-y divide-white-5">
            {tracks.map((track, index) => (
              <article
                className={`group grid ${gridColumns} items-center gap-3 px-2 py-3 text-sm transition-colors hover:bg-white-4 sm:px-3`}
                key={track.id}
              >
                <button
                  aria-label={`Play ${track.title} by ${track.artist}`}
                  className={`text-center ${activeTrackId === track.id ? "text-emerald-400" : "text-zinc-500 group-hover:text-white"}`}
                  onClick={() => {
                    playTrack(track, tracks);
                  }}
                  type="button"
                >
                  {activeTrackId === track.id ? "▶" : index + 1}
                </button>
                <TrackCover
                  available={track.coverAvailable}
                  className="size-11 text-sm"
                  title={track.title}
                  trackId={track.id}
                />
                <div className="min-w-0">
                  <h2 className="truncate font-medium text-white">
                    {track.title}
                  </h2>
                  <p className="truncate text-zinc-400">
                    {track.artist}
                    {track.album ? ` · ${track.album}` : ""}
                  </p>
                </div>
                <time className="text-right tabular-nums text-zinc-500">
                  {prettyMilliseconds(
                    track.durationSeconds * MILLISECONDS_PER_SECOND,
                    DURATION_FORMAT_OPTIONS,
                  )}
                </time>
                {isAuthenticated && <TrackPlaylistMenu track={track} />}
              </article>
            ))}
          </div>
        </div>
      )}

      {hasNextPage && (
        <div
          className="py-3 text-center text-sm text-zinc-500"
          ref={sentinelRef}
          role="status"
          aria-live="polite"
        >
          {isFetchingNextPage && "Loading more tracks..."}
          {isFetchNextPageError && (
            <button
              className="text-emerald-300 hover:text-emerald-200"
              onClick={() => void fetchNextPage()}
              type="button"
            >
              Could not load more tracks. Try again.
            </button>
          )}
        </div>
      )}
    </section>
  );
};
