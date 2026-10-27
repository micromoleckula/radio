import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
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
      <section className="mx-auto w-full max-w-4xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Collection
            </p>
            <h1 className="text-3xl font-bold">Your Library</h1>
          </div>
          <form className="flex w-full gap-2 sm:w-auto" onSubmit={handleCreate}>
            <input
              aria-label="Playlist name"
              className="min-w-0 flex-1 rounded-full bg-zinc-800 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400 sm:w-56"
              maxLength={120}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="New playlist"
              required
              value={title}
            />
            <button
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
              disabled={createMutation.isPending || !title.trim()}
              type="submit"
            >
              Create
            </button>
          </form>
        </div>

        {createMutation.error && (
          <p className="text-sm text-red-400" role="alert">
            {createMutation.error.message}
          </p>
        )}
        {playlists.isLoading && (
          <p className="text-sm text-zinc-400">Loading playlists...</p>
        )}
        {playlists.isError && (
          <p className="text-sm text-red-400" role="alert">
            {playlists.error.message}
          </p>
        )}
        {!playlists.isLoading && playlists.data?.length === 0 && (
          <p className="text-sm text-zinc-400">
            Your playlists will appear here.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.data?.map((playlist) => (
            <article
              className="group min-w-0 rounded-lg bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]"
              key={playlist.id}
            >
              <Link className="block" to={`/library/${playlist.id.toString()}`}>
                <div className="mb-4 grid aspect-square place-items-center rounded bg-gradient-to-br from-emerald-300 to-emerald-900 text-5xl font-bold text-black">
                  {playlist.title.slice(0, 1).toUpperCase()}
                </div>
                <h2 className="truncate font-semibold text-white">
                  {playlist.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {playlist.trackCount}{" "}
                  {playlist.trackCount === 1 ? "track" : "tracks"}
                </p>
              </Link>
              <button
                aria-label={`Delete ${playlist.title}`}
                className="mt-3 text-xs text-zinc-500 transition-colors hover:text-red-400"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(playlist.id);
                }}
                type="button"
              >
                Delete playlist
              </button>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
};
