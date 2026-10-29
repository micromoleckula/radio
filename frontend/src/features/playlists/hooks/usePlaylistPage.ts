import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  fetchPlaylist,
  renamePlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
} from "../api";
import { queryKeys } from "../../../shared/lib/queryKeys";
import type { Track } from "../../tracks/api";
import { usePlayerStore } from "../../player/store/player.store";

export function usePlaylistPage(playlistId: number, enabled: boolean) {
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const playlist = useQuery({
    queryKey: queryKeys.playlist(playlistId),
    queryFn: () => fetchPlaylist(playlistId),
    enabled,
  });
  const playTrack = usePlayerStore((state) => state.playTrack);
  const tracks = playlist.data?.tracks ?? [];
  const removeMutation = useMutation({
    mutationFn: (trackId: number) =>
      removeTrackFromPlaylist(playlistId, trackId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.playlist(playlistId),
      }),
  });
  const renameMutation = useMutation({
    mutationFn: (title: string) => renamePlaylist(playlistId, title),
    onSuccess: async (updatedPlaylist) => {
      queryClient.setQueryData(
        queryKeys.playlist(playlistId),
        updatedPlaylist,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.playlists });
      setIsRenaming(false);
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (trackIds: number[]) =>
      reorderPlaylistTracks(playlistId, trackIds),
    onSuccess: (updatedPlaylist) => {
      queryClient.setQueryData(
        queryKeys.playlist(playlistId),
        updatedPlaylist,
      );
    },
  });

  const handleRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = titleDraft.trim();

    if (title) {
      renameMutation.mutate(title);
    }
  };

  const moveTrack = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= tracks.length) {
      return;
    }

    const nextTrackIds = tracks.map((track) => track.id);
    [nextTrackIds[index], nextTrackIds[targetIndex]] = [
      nextTrackIds[targetIndex],
      nextTrackIds[index],
    ];
    reorderMutation.mutate(nextTrackIds);
  };

  const startRenaming = () => {
    setTitleDraft(playlist.data?.title ?? "");
    setIsRenaming(true);
  };

  const error =
    removeMutation.error ??
    renameMutation.error ??
    reorderMutation.error;

  return {
    playlist,
    tracks,
    isRenaming,
    titleDraft,
    setTitleDraft,
    handleRename,
    startRenaming,
    cancelRenaming: () => {
      setIsRenaming(false);
    },
    moveTrack,
    removeTrack: (trackId: number) => {
      removeMutation.mutate(trackId);
    },
    playTrack: (track: Track) => {
      playTrack(track, tracks);
    },
    error,
    isRenamingPlaylist: renameMutation.isPending,
    isReordering: reorderMutation.isPending,
    isRemovingTrack: removeMutation.isPending,
  };
}
