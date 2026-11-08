import {
  useId,
  useCallback,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { addTrackToPlaylist } from "../../playlists/api";
import { queryKeys } from "../../../shared/lib/queryKeys";
import type { Track } from "../api";
import { useAuthStore } from "../../auth/store/auth.store";
import { Notice } from "../../../shared/ui/Notice";
import { useInfiniteScroll } from "../../../shared/hooks/useInfiniteScroll";
import { usePlaylists } from "../../playlists/hooks/usePlaylists";
import { useAnchoredMenu } from "../hooks/useAnchoredMenu";

interface TrackPlaylistMenuProps {
  track: Track;
}

export function TrackPlaylistMenu({ track }: TrackPlaylistMenuProps) {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [addedPlaylistId, setAddedPlaylistId] = useState<number | null>(null);
  const menuId = useId();
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);
  const { containerRef, menuRef, triggerRef, menuStyle } = useAnchoredMenu(
    isOpen,
    closeMenu,
  );
  const playlists = usePlaylists(isOpen && Boolean(token), track.id);
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

      {isOpen &&
        menuStyle &&
        createPortal(
          <div
            aria-label={`Add ${track.title} to a playlist`}
            className="fixed z-[100] flex flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-800 p-2 shadow-xl"
            id={menuId}
            ref={menuRef}
            style={menuStyle}
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
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ul>
                  {playlistItems.map((playlist) => {
                    const isAdded =
                      playlist.containsTrack === true ||
                      addedPlaylistId === playlist.id;
                    const isAdding =
                      addTrack.isPending &&
                      addTrack.variables === playlist.id;

                    return (
                      <li key={playlist.id}>
                        <button
                          className={`flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left text-sm transition-colors disabled:cursor-default ${isAdded || isAdding ? "text-emerald-300" : "text-zinc-200 hover:bg-white/10"}`}
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
                              : isAdding
                                ? "Adding..."
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
                    {playlists.isFetchingNextPage &&
                      "Loading more playlists..."}
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
          </div>,
          document.body,
        )}
    </div>
  );
}
