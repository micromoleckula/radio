import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  createManagedTrack,
  updateManagedTrack,
} from "../../shared/audioAdmin";
import { MAX_TRACK_DURATION_SECONDS } from "../../shared/constants";
import { queryKeys } from "../../shared/queryKeys";
import type { Track } from "../../shared/tracks";

interface AudioTrackFormProps {
  track?: Track;
  onCancel: () => void;
  onSaved: () => void;
}

export const AudioTrackForm = ({
  track,
  onCancel,
  onSaved,
}: AudioTrackFormProps) => {
  const queryClient = useQueryClient();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      track
        ? updateManagedTrack(track.id, formData)
        : createManagedTrack(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tracks() });
      onSaved();
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const duration = formData.get("durationSeconds");

    if (typeof duration === "string" && !duration.trim()) {
      formData.delete("durationSeconds");
    }

    if (audioFile) {
      formData.set("audio", audioFile);
    } else {
      formData.delete("audio");
    }

    if (coverFile) {
      formData.set("cover", coverFile);
    } else {
      formData.delete("cover");
    }

    mutation.mutate(formData);
  };

  return (
    <form
      className="grid gap-4 rounded-lg border border-white/10 bg-[#171717] p-5 sm:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between sm:col-span-2">
        <h2 className="text-lg font-semibold text-white">
          {track ? "Edit track" : "Add audio"}
        </h2>
        <button
          aria-label="Close editor"
          className="text-sm text-zinc-400 hover:text-white"
          onClick={onCancel}
          type="button"
        >
          Close
        </button>
      </div>

      <label className="grid gap-1.5 text-xs text-zinc-400">
        Title
        <input
          className="rounded bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
          defaultValue={track?.title ?? ""}
          maxLength={200}
          name="title"
        />
      </label>
      <label className="grid gap-1.5 text-xs text-zinc-400">
        Artist
        <input
          className="rounded bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
          defaultValue={track?.artist ?? ""}
          maxLength={200}
          name="artist"
        />
      </label>
      <label className="grid gap-1.5 text-xs text-zinc-400">
        Album
        <input
          className="rounded bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
          defaultValue={track?.album ?? ""}
          maxLength={200}
          name="album"
        />
      </label>
      <label className="grid gap-1.5 text-xs text-zinc-400">
        Duration override in seconds
        <input
          className="rounded bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400"
          defaultValue={track?.durationSeconds ?? ""}
          max={MAX_TRACK_DURATION_SECONDS}
          min={1}
          name="durationSeconds"
          type="number"
        />
      </label>
      <label className="grid gap-1.5 text-xs text-zinc-400">
        MP3 file {track ? "(optional)" : "(required)"}
        <input
          accept=".mp3,audio/mpeg"
          className="rounded bg-zinc-800 px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
          onChange={(event) => {
            setAudioFile(event.target.files?.[0] ?? null);
          }}
          required={!track}
          type="file"
        />
      </label>
      <label className="grid gap-1.5 text-xs text-zinc-400">
        Cover image{" "}
        {track ? "(optional)" : "(optional, embedded art supported)"}
        <input
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="rounded bg-zinc-800 px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
          onChange={(event) => {
            setCoverFile(event.target.files?.[0] ?? null);
          }}
          type="file"
        />
      </label>

      {mutation.error && (
        <p className="text-sm text-red-400 sm:col-span-2" role="alert">
          {mutation.error.message}
        </p>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending
            ? "Saving..."
            : track
              ? "Save changes"
              : "Add track"}
        </button>
        <button
          className="rounded-full px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/10"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
