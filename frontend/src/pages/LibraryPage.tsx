import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Layout } from "../shared/layout/Layout";
import { PlaylistCard } from "../features/playlists/components/PlaylistCard";
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

export const LibraryPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists }),
  });
  const deleteMutation = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists }),
  });

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = title.trim();

    if (name) {
      createMutation.mutate(name, {
        onSuccess: () => {
          setTitle("");
        },
      });
    }
  };

  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl space-y-7">
        <PageHeader
          actions={
            <form
              className="flex w-full gap-2 sm:w-auto"
              onSubmit={handleCreate}
            >
              <input
                aria-label="Playlist name"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50 sm:w-56"
                maxLength={120}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
                placeholder="New playlist"
                required
                value={title}
              />
              <button
                className="rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300 disabled:opacity-50"
                disabled={createMutation.isPending || !title.trim()}
                type="submit"
              >
                Create
              </button>
            </form>
          }
          description="Your playlists, gathered in one place."
          eyebrow="Collection"
          title="Your library"
        />

        {createMutation.error && (
          <Notice tone="error">{createMutation.error.message}</Notice>
        )}
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
                deleteMutation.mutate(item.id);
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
      </section>
    </Layout>
  );
};
