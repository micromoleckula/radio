import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useTracks } from "../hooks/useTracks";
import {
  addTrackToPlaylist,
  fetchPlaylist,
  renamePlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
} from "../shared/playlists";
import { usePlayerStore } from "../store/player.store";

export const PlaylistPage = () => {
  const { playlistId: playlistIdParam } = useParams();
  const playlistId = Number(playlistIdParam);
  const isValidPlaylistId = Number.isSafeInteger(playlistId) && playlistId > 0;
  const queryClient = useQueryClient();
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const playlist = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => fetchPlaylist(playlistId),
    enabled: isValidPlaylistId,
  });
  const availableTracks = useTracks();
  const playTrack = usePlayerStore((state) => state.playTrack);
  const addMutation = useMutation({
    mutationFn: (trackId: number) => addTrackToPlaylist(playlistId, trackId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] }),
  });
  const removeMutation = useMutation({
    mutationFn: (trackId: number) =>
      removeTrackFromPlaylist(playlistId, trackId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["playlist", playlistId] }),
  });
  const renameMutation = useMutation({
    mutationFn: (title: string) => renamePlaylist(playlistId, title),
    onSuccess: async (updatedPlaylist) => {
      queryClient.setQueryData(["playlist", playlistId], updatedPlaylist);
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setIsRenaming(false);
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (trackIds: number[]) =>
      reorderPlaylistTracks(playlistId, trackIds),
    onSuccess: (updatedPlaylist) => {
      queryClient.setQueryData(["playlist", playlistId], updatedPlaylist);
    },
  });
  const tracks = playlist.data?.tracks ?? [];
  const trackIds = new Set(tracks.map((track) => track.id));
  const addableTracks =
    availableTracks.data?.pages.flatMap((page) => page.items) ?? [];

  const moveTrack = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= tracks.length) {
      return;
    }

    const trackIds = tracks.map((track) => track.id);
    [trackIds[index], trackIds[targetIndex]] = [
      trackIds[targetIndex],
      trackIds[index],
    ];
    reorderMutation.mutate(trackIds);
  };

  const handleRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = titleDraft.trim();

    if (title) {
      renameMutation.mutate(title);
    }
  };

  if (!isValidPlaylistId) {
    return (
      <Layout>
        <p className="text-zinc-400">Playlist not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <Link className="text-sm text-zinc-400 hover:text-white" to="/library">
          Your Library
        </Link>

        {playlist.isLoading && (
          <p className="text-sm text-zinc-400">Loading playlist...</p>
        )}
        {playlist.isError && (
          <p className="text-sm text-red-400" role="alert">
            {playlist.error.message}
          </p>
        )}

        {playlist.data && (
          <>
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Playlist
                </p>
                {isRenaming ? (
                  <form className="flex gap-2" onSubmit={handleRename}>
                    <input
                      aria-label="Playlist title"
                      autoFocus
                      className="min-w-0 rounded bg-zinc-800 px-3 py-2 text-xl font-bold text-white outline-none focus:ring-2 focus:ring-emerald-400"
                      maxLength={120}
                      onChange={(event) => {
                        setTitleDraft(event.target.value);
                      }}
                      required
                      value={titleDraft}
                    />
                    <button
                      className="rounded-full bg-emerald-400 px-4 text-sm font-semibold text-black disabled:opacity-50"
                      disabled={renameMutation.isPending || !titleDraft.trim()}
                      type="submit"
                    >
                      Save
                    </button>
                    <button
                      className="px-2 text-sm text-zinc-400 hover:text-white"
                      onClick={() => {
                        setIsRenaming(false);
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="truncate text-4xl font-bold">
                      {playlist.data.title}
                    </h1>
                    <button
                      aria-label="Rename playlist"
                      className="text-sm text-zinc-400 hover:text-white"
                      onClick={() => {
                        setTitleDraft(playlist.data.title);
                        setIsRenaming(true);
                      }}
                      type="button"
                    >
                      Edit name
                    </button>
                  </div>
                )}
                <p className="mt-2 text-sm text-zinc-400">
                  {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                </p>
              </div>
              <form
                className="flex w-full gap-2 sm:w-auto"
                onSubmit={(event) => {
                  event.preventDefault();
                  const trackId = Number(selectedTrackId);
                  if (trackId) {
                    addMutation.mutate(trackId);
                  }
                }}
              >
                <select
                  aria-label="Select a track to add"
                  className="min-w-0 flex-1 rounded bg-zinc-800 px-3 py-2 text-sm text-white sm:w-60"
                  onChange={(event) => {
                    setSelectedTrackId(event.target.value);
                  }}
                  value={selectedTrackId}
                >
                  <option value="">Choose a track</option>
                  {addableTracks
                    .filter((track) => !trackIds.has(track.id))
                    .map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.title} · {track.artist}
                      </option>
                    ))}
                </select>
                <button
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
                  disabled={!selectedTrackId || addMutation.isPending}
                  type="submit"
                >
                  Add
                </button>
              </form>
            </header>

            {(addMutation.error ||
              removeMutation.error ||
              renameMutation.error ||
              reorderMutation.error) && (
              <p className="text-sm text-red-400" role="alert">
                {
                  (
                    addMutation.error ??
                    removeMutation.error ??
                    renameMutation.error ??
                    reorderMutation.error
                  )?.message
                }
              </p>
            )}

            {tracks.length === 0 ? (
              <p className="text-sm text-zinc-400">
                This playlist is empty. Add a track from your library.
              </p>
            ) : (
              <div className="divide-y divide-white/10">
                {tracks.map((track, index) => (
                  <article
                    className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded px-2 py-3 text-sm hover:bg-white/5"
                    key={track.id}
                  >
                    <button
                      aria-label={`Play ${track.title} by ${track.artist}`}
                      className="text-zinc-500 hover:text-white"
                      onClick={() => {
                        playTrack(track, tracks);
                      }}
                      type="button"
                    >
                      {index + 1}
                    </button>
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-white">
                        {track.title}
                      </h2>
                      <p className="truncate text-zinc-400">{track.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`Move ${track.title} up`}
                        className="grid size-7 place-items-center rounded text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => {
                          moveTrack(index, -1);
                        }}
                        type="button"
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Move ${track.title} down`}
                        className="grid size-7 place-items-center rounded text-zinc-500 hover:bg-white/10 hover:text-white disabled:opacity-30"
                        disabled={
                          index === tracks.length - 1 ||
                          reorderMutation.isPending
                        }
                        onClick={() => {
                          moveTrack(index, 1);
                        }}
                        type="button"
                      >
                        ↓
                      </button>
                      <button
                        aria-label={`Remove ${track.title} from playlist`}
                        className="px-2 text-zinc-500 hover:text-red-400"
                        disabled={removeMutation.isPending}
                        onClick={() => {
                          removeMutation.mutate(track.id);
                        }}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};
