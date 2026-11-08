import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { PlaylistCard } from "../features/playlists/components/PlaylistCard";
import type { PlaylistSummary } from "../features/playlists/api";
import { EmptyState } from "../shared/ui/EmptyState";
import { Notice } from "../shared/ui/Notice";
import { PageHeader } from "../shared/ui/PageHeader";
import {
  createPlaylist,
  deletePlaylist,
} from "../features/playlists/api";
import { queryKeys } from "../shared/lib/queryKeys";
import { useInfiniteScroll } from "../shared/hooks/useInfiniteScroll";
import { usePlaylists } from "../features/playlists/hooks/usePlaylists";
import { Modal } from "../shared/ui/Modal";
import { ConfirmDialog } from "../shared/ui/ConfirmDialog";

export const LibraryPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] =
    useState<PlaylistSummary | null>(null);
  const playlists = usePlaylists();
  const playlistItems =
    playlists.data?.pages.flatMap((page) => page.items) ?? [];
  const playlistSentinelRef = useInfiniteScroll({
    enabled: playlists.hasNextPage && !playlists.isFetchNextPageError,
    isFetching: playlists.isFetchingNextPage,
    onLoadMore: () => playlists.fetchNextPage(),
  });
  const createMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      setTitle("");
      setIsCreateModalOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      setPlaylistToDelete(null);
    },
  });

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = title.trim();

    if (name) {
      createMutation.mutate(name);
    }
  };

  return (
      <section className="mx-auto w-full max-w-5xl space-y-7">
        <PageHeader
          actions={
            <button
              className="rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
              type="button"
            >
              Create playlist
            </button>
          }
          description="Your playlists, gathered in one place."
          eyebrow="Collection"
          title="Your library"
        />

        {playlists.isLoading && (
          <p className="rounded-lg border border-white-6 bg-white-2 px-4 py-3 text-sm text-zinc-400">
            Loading playlists...
          </p>
        )}
        {playlists.isError && (
          <Notice tone="error">{playlists.error.message}</Notice>
        )}
        {!playlists.isLoading &&
          !playlists.isError &&
          playlistItems.length === 0 && (
            <EmptyState
              description="Create your first playlist and give your favorite tracks a place to live."
              title="Start a collection"
            />
          )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlistItems.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              isDeleting={deleteMutation.isPending}
              onDelete={(item) => {
                deleteMutation.reset();
                setPlaylistToDelete(item);
              }}
              playlist={playlist}
            />
          ))}
        </div>
        {playlists.hasNextPage && (
          <div
            className="py-3 text-center text-sm text-zinc-500"
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
                Could not load more playlists. Try again.
              </button>
            )}
          </div>
        )}
        <Modal
          description="Choose a name for your new playlist."
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            createMutation.reset();
          }}
          title="Create playlist"
        >
          <form className="space-y-4" onSubmit={handleCreate}>
            <label className="grid gap-2 text-sm text-zinc-300">
              Playlist name
              <input
                autoFocus
                className="rounded-lg border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
                maxLength={120}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
                required
                value={title}
              />
            </label>
            {createMutation.error && (
              <Notice tone="error">{createMutation.error.message}</Notice>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  createMutation.reset();
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
                disabled={createMutation.isPending || !title.trim()}
                type="submit"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Modal>
        <ConfirmDialog
          confirmLabel="Delete playlist"
          description={`Are you sure you want to delete “${playlistToDelete?.title ?? ""}”? This cannot be undone.`}
          error={deleteMutation.error?.message}
          isOpen={playlistToDelete !== null}
          isPending={deleteMutation.isPending}
          onClose={() => {
            setPlaylistToDelete(null);
            deleteMutation.reset();
          }}
          onConfirm={() => {
            if (playlistToDelete) {
              deleteMutation.mutate(playlistToDelete.id);
            }
          }}
          title="Delete playlist?"
        />
      </section>
  );
};
