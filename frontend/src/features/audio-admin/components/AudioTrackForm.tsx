import type { Track } from "../../tracks/api";
import { Notice } from "../../../shared/ui/Notice";
import { TrackFormFields } from "./TrackFormFields";
import { useAudioTrackForm } from "../hooks/useAudioTrackForm";

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
  const form = useAudioTrackForm(track, onSaved);

  return (
    <form
      className="grid gap-4 rounded-lg border border-white/10 bg-panel-background p-5 sm:grid-cols-2"
      onSubmit={form.handleSubmit}
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

      <TrackFormFields
        onAudioChange={form.setAudioFile}
        onCoverChange={form.setCoverFile}
        track={track}
      />

      {form.error && (
        <div className="sm:col-span-2">
          <Notice tone="error">{form.error.message}</Notice>
        </div>
      )}
      <div className="flex gap-3 sm:col-span-2">
        <button
          className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300 disabled:opacity-50"
          disabled={form.isPending}
          type="submit"
        >
          {form.isPending
            ? "Saving..."
            : track
              ? "Save changes"
              : "Add track"}
        </button>
        <button
          className="rounded-full px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/10"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
