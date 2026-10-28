import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  createManagedTrack,
  updateManagedTrack,
} from "../shared/audioAdmin";
import { queryKeys } from "../shared/queryKeys";
import type { Track } from "../shared/tracks";

export function useAudioTrackForm(track: Track | undefined, onSaved: () => void) {
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

  return {
    handleSubmit,
    setAudioFile,
    setCoverFile,
    error: mutation.error,
    isPending: mutation.isPending,
  };
}
