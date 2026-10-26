import { useTracks } from "../../hooks/useTracks";
import { usePlayerStore } from "../../store/player.store";
import { TrackCover } from "./TrackCover";

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

  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">{title}</h1>

      {isLoading && <p className="text-zinc-400">Loading tracks...</p>}

      {isError && (
        <div
          role="alert"
          className="flex items-center gap-3 text-sm text-red-400"
        >
          <span>{error.message}</span>
          <button
            className="underline"
            onClick={() => void refetch()}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && tracks.length === 0 && (
        <p className="text-zinc-400">
          {query
            ? "No tracks match your search."
            : "No tracks have been added yet."}
        </p>
      )}

      {tracks.length > 0 && (
        <div className="divide-y divide-white/10">
          {tracks.map((track, index) => (
            <article
              className="group grid grid-cols-[2rem_2.75rem_minmax(0,1fr)_5rem] items-center gap-3 rounded px-2 py-3 text-sm transition-colors hover:bg-white/5"
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
              <time className="text-right tabular-nums text-zinc-400">
                {formatDuration(track.durationSeconds)}
              </time>
            </article>
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          className="rounded bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
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

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
}
