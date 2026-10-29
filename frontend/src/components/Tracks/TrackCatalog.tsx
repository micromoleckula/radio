import { useTracks } from "../../hooks/useTracks";
import { formatTime } from "../../shared/formatTime";
import { EmptyState } from "../Ui/EmptyState";
import { Notice } from "../Ui/Notice";
import { PageHeader } from "../Ui/PageHeader";
import { usePlayerStore } from "../../store/player.store";
import { useAuthStore } from "../../store/auth.store";
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
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useTracks(query);
  const tracks = data?.pages.flatMap((page) => page.items) ?? [];
  const playTrack = usePlayerStore((state) => state.playTrack);
  const activeTrackId = usePlayerStore(
    (state) => state.queue[state.currentIndex]?.id,
  );
  const isAuthenticated = useAuthStore((state) => Boolean(state.token));
  const gridColumns = isAuthenticated
    ? "grid-cols-[2rem_2.75rem_minmax(0,1fr)_3.25rem_2rem] sm:grid-cols-[2rem_2.75rem_minmax(0,1fr)_5rem_2rem]"
    : "grid-cols-[2rem_2.75rem_minmax(0,1fr)_3.25rem] sm:grid-cols-[2rem_2.75rem_minmax(0,1fr)_5rem]";

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
        <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
          Loading tracks...
        </p>
      )}

      {isError && (
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
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.015]">
          <div
            className={`hidden ${gridColumns} gap-3 border-b border-white/[0.06] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:grid`}
          >
            <span />
            <span />
            <span>Track</span>
            <span className="text-right">Time</span>
            {isAuthenticated && <span />}
          </div>
          <div className="divide-y divide-white/[0.05]">
            {tracks.map((track, index) => (
              <article
                className={`group grid ${gridColumns} items-center gap-3 px-2 py-3 text-sm transition-colors hover:bg-white/[0.04] sm:px-3`}
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
                  {formatTime(track.durationSeconds)}
                </time>
                {isAuthenticated && <TrackPlaylistMenu track={track} />}
              </article>
            ))}
          </div>
        </div>
      )}

      {hasNextPage && (
        <button
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          type="button"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </section>
  );
};
