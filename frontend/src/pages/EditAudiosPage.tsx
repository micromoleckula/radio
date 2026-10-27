import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { AudioTrackForm } from "../components/Tracks/AudioTrackForm";
import { TrackCover } from "../components/Tracks/TrackCover";
import { Layout } from "../components/Layout";
import { useTracks } from "../hooks/useTracks";
import { apiAdminGet } from "../shared/api";
import { deleteManagedTrack, unlockAudioAdmin } from "../shared/audioAdmin";
import { queryKeys } from "../shared/queryKeys";
import type { Track } from "../shared/tracks";
import { useAudioAdminStore } from "../store/audioAdmin.store";

export const EditAudiosPage = () => {
  const token = useAudioAdminStore((state) => state.token);
  const setToken = useAudioAdminStore((state) => state.setToken);
  const logout = useAudioAdminStore((state) => state.logout);
  const [password, setPassword] = useState("");
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const tracks = useTracks();
  const adminSession = useQuery({
    queryKey: queryKeys.audioAdminSession,
    queryFn: () => apiAdminGet<{ active: true }>("/audio-admin/session"),
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const unlock = useMutation({
    mutationFn: unlockAudioAdmin,
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      setPassword("");
    },
  });
  const deleteTrack = useMutation({
    mutationFn: deleteManagedTrack,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracks() });
    },
  });
  const allTracks = tracks.data?.pages.flatMap((page) => page.items) ?? [];

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    unlock.mutate(password);
  };

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090909] px-4 text-white">
        <form
          className="w-full max-w-sm space-y-5 rounded-lg border border-white/10 bg-[#171717] p-6"
          onSubmit={handleUnlock}
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Audio management
            </p>
            <h1 className="text-2xl font-bold">Unlock editor</h1>
          </div>
          <label className="grid gap-2 text-sm text-zinc-300">
            Manager PIN
            <input
              autoComplete="current-password"
              autoFocus
              className="rounded bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
              maxLength={128}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              required
              type="password"
              value={password}
            />
          </label>
          {unlock.error && (
            <p className="text-sm text-red-400" role="alert">
              {unlock.error.message}
            </p>
          )}
          <button
            className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
            disabled={unlock.isPending || !password}
            type="submit"
          >
            {unlock.isPending ? "Checking..." : "Unlock"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl space-y-7">
        {adminSession.isError && (
          <p className="text-sm text-red-400" role="alert">
            {adminSession.error.message}
          </p>
        )}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Audio management
            </p>
            <h1 className="text-3xl font-bold">Edit audios</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage tracks, metadata and artwork.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-300"
              onClick={() => {
                setEditingTrack(null);
                setIsCreating((current) => !current);
              }}
              type="button"
            >
              {isCreating ? "Cancel" : "Add audio"}
            </button>
            <button
              className="rounded-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10"
              onClick={logout}
              type="button"
            >
              Lock
            </button>
          </div>
        </header>

        {isCreating && (
          <AudioTrackForm
            onCancel={() => {
              setIsCreating(false);
            }}
            onSaved={() => {
              setIsCreating(false);
            }}
          />
        )}
        {editingTrack && (
          <AudioTrackForm
            key={editingTrack.id}
            onCancel={() => {
              setEditingTrack(null);
            }}
            onSaved={() => {
              setEditingTrack(null);
            }}
            track={editingTrack}
          />
        )}

        {tracks.isLoading && (
          <p className="text-sm text-zinc-400">Loading audio files...</p>
        )}
        {tracks.isError && (
          <p className="text-sm text-red-400" role="alert">
            {tracks.error.message}
          </p>
        )}
        {deleteTrack.error && (
          <p className="text-sm text-red-400" role="alert">
            {deleteTrack.error.message}
          </p>
        )}
        {!tracks.isLoading && allTracks.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/15 px-5 py-12 text-center text-sm text-zinc-400">
            No tracks yet. Add an MP3 file to start your library.
          </p>
        )}

        <div className="divide-y divide-white/10">
          {allTracks.map((track) => (
            <article
              className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 py-3"
              key={track.id}
            >
              <TrackCover
                available={track.coverAvailable}
                className="size-14 text-lg"
                title={track.title}
                trackId={track.id}
              />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-medium text-white">
                  {track.title}
                </h2>
                <p className="truncate text-xs text-zinc-400">
                  {track.artist}
                  {track.album ? ` · ${track.album}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-full px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTrack(track);
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-full px-3 py-2 text-xs text-zinc-400 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                  disabled={deleteTrack.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete “${track.title}”?`)) {
                      deleteTrack.mutate(track.id);
                    }
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        {tracks.hasNextPage && (
          <button
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-50"
            disabled={tracks.isFetchingNextPage}
            onClick={() => void tracks.fetchNextPage()}
            type="button"
          >
            {tracks.isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </section>
    </Layout>
  );
};