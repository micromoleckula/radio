import { useEffect, useId, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { addTrackToPlaylist } from "../../shared/playlists";
import { queryKeys } from "../../shared/queryKeys";
import type { Track } from "../../shared/tracks";
import { useAuthStore } from "../../store/auth.store";
import { Notice } from "../Ui/Notice";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { usePlaylists } from "../../hooks/usePlaylists";

interface TrackPlaylistMenuProps {
  track: Track;
}

export function TrackPlaylistMenu({ track }: TrackPlaylistMenuProps) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState<number | null>(null);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const playlists = usePlaylists(isOpen && Boolean(token));
  const playlistItems =
    playlists.data?.pages.flatMap((page) => page.items) ?? [];
  const playlistSentinelRef = useInfiniteScroll({
    enabled:
      isOpen &&
      playlists.hasNextPage &&
      !playlists.isFetchNextPageError,
    isFetching: playlists.isFetchingNextPage,
    onLoadMore: () => playlists.fetchNextPage(),
  });
  const addTrack = useMutation({
    mutationFn: (playlistId: number) =>
      addTrackToPlaylist(playlistId, track.id),
    onSuccess: async (playlist) => {
      queryClient.setQueryData(queryKeys.playlist(playlist.id), playlist);
      await queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      setAddedPlaylistId(playlist.id);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (!token) {
    return null;
  }

  return (
    <div className="relative justify-self-end" ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={`More options for ${track.title}`}
        className="grid size-8 place-items-center rounded-full text-lg leading-none text-zinc-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
        onClick={() => {
          setAddedPlaylistId(null);
          setIsOpen((current) => !current);
        }}
        ref={triggerRef}
        type="button"
      >
        ⋯
      </button>

      {isOpen && (
        <div
          aria-label={`Add ${track.title} to a playlist`}
          className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-white/10 bg-zinc-800 p-2 shadow-xl"
          id={menuId}
        >
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Add to playlist
          </p>
          {playlists.isLoading && (
            <p className="px-2 py-3 text-sm text-zinc-400">
              Loading playlists...
            </p>
          )}
          {playlists.isError && (
            <Notice tone="error">{playlists.error.message}</Notice>
          )}
          {!playlists.isLoading &&
            playlistItems.length === 0 &&
            !playlists.isError && (
            <p className="px-2 py-2 text-sm text-zinc-400">
              No playlists yet.{" "}
              <Link
                className="text-emerald-300 hover:text-emerald-200"
                onClick={() => {
                  setIsOpen(false);
                }}
                to="/library"
              >
                Create one
              </Link>
              .
            </p>
          )}
          {playlistItems.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              <ul>
                {playlistItems.map((playlist) => {
                  const isAdded = addedPlaylistId === playlist.id;

                  return (
                    <li key={playlist.id}>
                      <button
                        className="flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:cursor-default disabled:text-emerald-300"
                        disabled={addTrack.isPending || isAdded}
                        onClick={() => {
                          addTrack.mutate(playlist.id);
                        }}
                        type="button"
                      >
                        <span className="truncate">{playlist.title}</span>
                        <span className="shrink-0 text-xs">
                          {isAdded
                            ? "Added"
                            : `${playlist.trackCount.toString()} tracks`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {playlists.hasNextPage && (
                <div
                  className="px-2 py-2 text-xs text-zinc-500"
                  ref={playlistSentinelRef}
                  role="status"
                  aria-live="polite"
                >
                  {playlists.isFetchingNextPage && "Loading more playlists..."}
                  {playlists.isFetchNextPageError && (
                    <button
                      className="text-emerald-300 hover:text-emerald-200"
                      onClick={() => void playlists.fetchNextPage()}
                      type="button"
                    >
                      Could not load more. Try again.
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {addTrack.error && (
            <div className="mt-2">
              <Notice tone="error">{addTrack.error.message}</Notice>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
