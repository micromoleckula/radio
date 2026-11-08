import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useTracks } from "../../tracks/hooks/useTracks";
import { apiAdminGet } from "../../../shared/api/client";
import { deleteManagedTrack, unlockAudioAdmin } from "../api";
import { queryKeys } from "../../../shared/lib/queryKeys";
import type { Track } from "../../tracks/api";
import { useAudioAdminStore } from "../store/audioAdmin.store";
import { AUDIO_ADMIN_ROUTE } from "../../../shared/lib/constants";

export function useAudioAdminPage() {
  const token = useAudioAdminStore((state) => state.token);
  const setToken = useAudioAdminStore((state) => state.setToken);
  const logout = useAudioAdminStore((state) => state.logout);
  const [password, setPassword] = useState("");
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const tracks = useTracks();
  const adminSession = useQuery({
    queryKey: queryKeys.audioAdminSession,
    queryFn: () =>
      apiAdminGet<{ active: true }>(`${AUDIO_ADMIN_ROUTE}/session`),
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tracks() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.playlists }),
        queryClient.invalidateQueries({ queryKey: queryKeys.playlistPrefix }),
      ]);
      setTrackToDelete(null);
    },
  });
  const allTracks = tracks.data?.pages.flatMap((page) => page.items) ?? [];

  const handleUnlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    unlock.mutate(password);
  };

  const toggleCreateForm = () => {
    setEditingTrack(null);
    setIsCreating((current) => !current);
  };

  const startEditingTrack = (track: Track) => {
    setIsCreating(false);
    setEditingTrack(track);
  };

  const requestDeleteTrack = (track: Track) => {
    deleteTrack.reset();
    setTrackToDelete(track);
  };

  const confirmDeleteTrack = () => {
    if (trackToDelete) {
      deleteTrack.mutate(trackToDelete.id);
    }
  };

  return {
    token,
    logout,
    password,
    setPassword,
    handleUnlock,
    unlockPending: unlock.isPending,
    unlockError: unlock.error,
    adminSessionError: adminSession.error,
    tracks,
    allTracks,
    deleteError: deleteTrack.error,
    isDeleting: deleteTrack.isPending,
    isCreating,
    editingTrack,
    trackToDelete,
    toggleCreateForm,
    startEditingTrack,
    requestDeleteTrack,
    confirmDeleteTrack,
    cancelDeleteTrack: () => {
      setTrackToDelete(null);
      deleteTrack.reset();
    },
    closeCreateForm: () => {
      setIsCreating(false);
    },
    closeEditForm: () => {
      setEditingTrack(null);
    },
  };
}
