import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Layout } from "../components/Layout";
import { PlaylistCard } from "../components/Playlists/PlaylistCard";
import { EmptyState } from "../components/Ui/EmptyState";
import { Notice } from "../components/Ui/Notice";
import { PageHeader } from "../components/Ui/PageHeader";
import {
  createPlaylist,
  deletePlaylist,
  fetchPlaylists,
} from "../shared/playlists";
import { queryKeys } from "../shared/queryKeys";

export const LibraryPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const playlists = useQuery({
    queryKey: queryKeys.playlists,
    queryFn: fetchPlaylists,
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
          <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
            Loading playlists...
          </p>
        )}
        {playlists.isError && (
          <Notice tone="error">{playlists.error.message}</Notice>
        )}
        {!playlists.isLoading &&
          !playlists.isError &&
          playlists.data?.length === 0 && (
            <EmptyState
              description="Create your first playlist and give your favorite tracks a place to live."
              title="Start a collection"
            />
          )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.data?.map((playlist) => (
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
      </section>
    </Layout>
  );
};
