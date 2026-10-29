import type { Track } from "../../tracks/api";

interface PlaylistTrackListProps {
  tracks: Track[];
  isReordering: boolean;
  isRemovingTrack: boolean;
  onPlayTrack: (track: Track) => void;
  onMoveTrack: (index: number, direction: -1 | 1) => void;
  onRemoveTrack: (trackId: number) => void;
}

export function PlaylistTrackList({
  tracks,
  isReordering,
  isRemovingTrack,
  onPlayTrack,
  onMoveTrack,
  onRemoveTrack,
}: PlaylistTrackListProps) {
  if (tracks.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        This playlist is empty. Add a track from your library.
      </p>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {tracks.map((track, index) => (
        <article
          className="group grid playlist-track-grid items-center gap-3 rounded px-2 py-3 text-sm hover:bg-white/5"
          key={track.id}
        >
          <button
            aria-label={`Play ${track.title} by ${track.artist}`}
            className="text-zinc-500 hover:text-white"
            onClick={() => {
              onPlayTrack(track);
            }}
            type="button"
          >
            {index + 1}
          </button>
          <div className="min-w-0">
            <h2 className="truncate font-medium text-white">{track.title}</h2>
            <p className="truncate text-zinc-400">{track.artist}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label={`Move ${track.title} up`}
              className="grid size-7 place-items-center rounded text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30"
              disabled={index === 0 || isReordering}
              onClick={() => {
                onMoveTrack(index, -1);
              }}
              type="button"
            >
              ↑
            </button>
            <button
              aria-label={`Move ${track.title} down`}
              className="grid size-7 place-items-center rounded text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30"
              disabled={index === tracks.length - 1 || isReordering}
              onClick={() => {
                onMoveTrack(index, 1);
              }}
              type="button"
            >
              ↓
            </button>
            <button
              aria-label={`Remove ${track.title} from playlist`}
              className="px-2 text-zinc-500 hover:text-red-400"
              disabled={isRemovingTrack}
              onClick={() => {
                onRemoveTrack(track.id);
              }}
              type="button"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
