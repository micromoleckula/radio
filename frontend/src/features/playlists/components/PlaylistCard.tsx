import { Link } from "react-router-dom";
import type { PlaylistSummary } from "../api";

interface PlaylistCardProps {
  playlist: PlaylistSummary;
  isDeleting: boolean;
  onDelete: (playlist: PlaylistSummary) => void;
}

export function PlaylistCard({
  playlist,
  isDeleting,
  onDelete,
}: PlaylistCardProps) {
  return (
    <article className="group min-w-0 rounded-xl border border-white-5 bg-white-25 p-3 transition-colors hover:border-white/10 hover:bg-white/5">
      <Link
        className="block rounded-lg focus-visible:outline-offset-4"
        to={`/library/${playlist.id.toString()}`}
      >
        <div className="relative mb-4 grid aspect-square place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-300/80 via-emerald-800 to-zinc-950 text-6xl font-semibold text-black">
          <span className="absolute -bottom-8 -right-4 size-36 rounded-full border-playlist-ring border-white/10" />
          <span className="relative drop-shadow-sm">
            {playlist.title.slice(0, 1).toUpperCase()}
          </span>
          <span className="absolute bottom-3 left-3 text-micro font-semibold uppercase tracking-playlist text-white/60">
            Radio Pepe · Playlist
          </span>
        </div>
        <h2 className="truncate px-1 font-semibold text-white">
          {playlist.title}
        </h2>
        <p className="mt-1 px-1 text-sm text-zinc-500">
          {playlist.trackCount}{" "}
          {playlist.trackCount === 1 ? "track" : "tracks"}
        </p>
      </Link>
      <button
        aria-label={`Delete ${playlist.title}`}
        className="mt-3 rounded-full px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
        disabled={isDeleting}
        onClick={() => {
          onDelete(playlist);
        }}
        type="button"
      >
        Delete playlist
      </button>
    </article>
  );
}
