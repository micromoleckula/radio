import type { FormEvent } from "react";
import type { Track } from "../../shared/tracks";

interface PlaylistHeaderProps {
  title: string;
  trackCount: number;
  isRenaming: boolean;
  titleDraft: string;
  onTitleDraftChange: (value: string) => void;
  onRename: (event: FormEvent<HTMLFormElement>) => void;
  isRenamePending: boolean;
  onStartRenaming: () => void;
  onCancelRenaming: () => void;
  selectedTrackId: string;
  onSelectedTrackChange: (value: string) => void;
  addableTracks: Track[];
  onAddTrack: (event: FormEvent<HTMLFormElement>) => void;
  isAddingTrack: boolean;
}

export function PlaylistHeader({
  title,
  trackCount,
  isRenaming,
  titleDraft,
  onTitleDraftChange,
  onRename,
  isRenamePending,
  onStartRenaming,
  onCancelRenaming,
  selectedTrackId,
  onSelectedTrackChange,
  addableTracks,
  onAddTrack,
  isAddingTrack,
}: PlaylistHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 sm:p-6">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Playlist
        </p>
        {isRenaming ? (
          <form className="flex gap-2" onSubmit={onRename}>
            <input
              aria-label="Playlist title"
              autoFocus
              className="min-w-0 rounded bg-zinc-800 px-3 py-2 text-xl font-bold text-white outline-none focus:ring-2 focus:ring-emerald-400"
              maxLength={120}
              onChange={(event) => {
                onTitleDraftChange(event.target.value);
              }}
              required
              value={titleDraft}
            />
            <button
              className="rounded-full bg-emerald-400 px-4 text-sm font-semibold text-black disabled:opacity-50"
              disabled={isRenamePending || !titleDraft.trim()}
              type="submit"
            >
              Save
            </button>
            <button
              className="px-2 text-sm text-zinc-400 hover:text-white"
              onClick={onCancelRenaming}
              type="button"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <button
              aria-label="Rename playlist"
              className="text-sm text-zinc-400 hover:text-white"
              onClick={onStartRenaming}
              type="button"
            >
              Edit name
            </button>
          </div>
        )}
        <p className="mt-2 text-sm text-zinc-400">
          {trackCount} {trackCount === 1 ? "track" : "tracks"}
        </p>
      </div>
      <form className="flex w-full gap-2 sm:w-auto" onSubmit={onAddTrack}>
        <select
          aria-label="Select a track to add"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50 sm:w-60"
          onChange={(event) => {
            onSelectedTrackChange(event.target.value);
          }}
          value={selectedTrackId}
        >
          <option value="">Choose a track</option>
          {addableTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title} · {track.artist}
            </option>
          ))}
        </select>
        <button
          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
          disabled={!selectedTrackId || isAddingTrack}
          type="submit"
        >
          Add
        </button>
      </form>
    </header>
  );
}
