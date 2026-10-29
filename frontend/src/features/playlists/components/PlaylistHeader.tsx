import type { FormEvent } from "react";

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
}: PlaylistHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5 rounded-xl border border-white-5 bg-white-2 p-5 sm:p-6">
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
    </header>
  );
}
