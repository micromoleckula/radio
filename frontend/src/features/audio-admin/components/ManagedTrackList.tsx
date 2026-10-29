import type { Track } from "../../tracks/api";
import { useInfiniteScroll } from "../../../shared/hooks/useInfiniteScroll";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Notice } from "../../../shared/ui/Notice";
import { TrackCover } from "../../tracks/components/TrackCover";

interface ManagedTrackListProps {
  tracks: Track[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  deleteError?: Error | null;
  isDeleting: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onEdit: (track: Track) => void;
  onDelete: (track: Track) => void;
  onLoadMore: () => Promise<unknown>;
}

export function ManagedTrackList({
  tracks,
  isLoading,
  isError,
  error,
  deleteError,
  isDeleting,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onEdit,
  onDelete,
  onLoadMore,
}: ManagedTrackListProps) {
  const sentinelRef = useInfiniteScroll({
    enabled: hasNextPage && !isFetchNextPageError,
    isFetching: isFetchingNextPage,
    onLoadMore,
  });

  return (
    <>
      {isLoading && (
        <p className="text-sm text-zinc-400">Loading audio files...</p>
      )}
      {isError && error && <Notice tone="error">{error.message}</Notice>}
      {deleteError && <Notice tone="error">{deleteError.message}</Notice>}
      {!isLoading && tracks.length === 0 && (
        <EmptyState
          description="Add an MP3 file to start building your library."
          title="No tracks yet"
        />
      )}

      <div className="divide-y divide-white/10">
        {tracks.map((track) => (
          <article
            className="grid managed-track-grid items-center gap-4 py-3"
            key={track.id}
          >
            <TrackCover
              available={track.coverAvailable}
              className="size-14 text-lg"
              title={track.title}
              trackId={track.id}
            />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium text-white">
                {track.title}
              </h2>
              <p className="truncate text-xs text-zinc-400">
                {track.artist}
                {track.album ? ` · ${track.album}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="rounded-full px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  onEdit(track);
                }}
                type="button"
              >
                Edit
              </button>
              <button
                className="rounded-full px-3 py-2 text-xs text-zinc-400 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                disabled={isDeleting}
                onClick={() => {
                  onDelete(track);
                }}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

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
              onClick={() => void onLoadMore()}
              type="button"
            >
              Could not load more tracks. Try again.
            </button>
          )}
        </div>
      )}
    </>
  );
}
