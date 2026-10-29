import type { Track } from "../../tracks/api";
import { FormField } from "../../../shared/ui/FormField";

interface TrackFormFieldsProps {
  track?: Track;
  onAudioChange: (file: File | null) => void;
  onCoverChange: (file: File | null) => void;
}

const inputClassName =
  "rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10";

const fileInputClassName =
  "rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white";

export function TrackFormFields({
  track,
  onAudioChange,
  onCoverChange,
}: TrackFormFieldsProps) {
  return (
    <>
      <FormField label="Title">
        <input
          className={inputClassName}
          defaultValue={track?.title ?? ""}
          maxLength={200}
          name="title"
        />
      </FormField>
      <FormField label="Artist">
        <input
          className={inputClassName}
          defaultValue={track?.artist ?? ""}
          maxLength={200}
          name="artist"
        />
      </FormField>
      <FormField label="Album">
        <input
          className={inputClassName}
          defaultValue={track?.album ?? ""}
          maxLength={200}
          name="album"
        />
      </FormField>
      <FormField label={`MP3 file ${track ? "(optional)" : "(required)"}`}>
        <input
          accept=".mp3,audio/mpeg"
          className={fileInputClassName}
          onChange={(event) => {
            onAudioChange(event.target.files?.[0] ?? null);
          }}
          required={!track}
          type="file"
        />
      </FormField>
      <FormField
        label={`Cover image ${track ? "(optional)" : "(optional, embedded art supported)"}`}
      >
        <input
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className={fileInputClassName}
          onChange={(event) => {
            onCoverChange(event.target.files?.[0] ?? null);
          }}
          type="file"
        />
      </FormField>
    </>
  );
}
