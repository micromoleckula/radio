import { Link, useParams } from "react-router-dom";
import { PlaylistHeader } from "../features/playlists/components/PlaylistHeader";
import { PlaylistTrackList } from "../features/playlists/components/PlaylistTrackList";
import { Notice } from "../shared/ui/Notice";
import { usePlaylistPage } from "../features/playlists/hooks/usePlaylistPage";
import { ConfirmDialog } from "../shared/ui/ConfirmDialog";

export const PlaylistPage = () => {
  const { playlistId: playlistIdParam } = useParams();
  const playlistId = Number(playlistIdParam);
  const isValidPlaylistId = Number.isSafeInteger(playlistId) && playlistId > 0;
  const page = usePlaylistPage(playlistId, isValidPlaylistId);

  if (!isValidPlaylistId) {
    return <p className="text-zinc-400">Playlist not found.</p>;
  }

  return (
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <Link className="text-sm text-zinc-400 hover:text-white" to="/library">
          Your Library
        </Link>

        {page.playlist.isLoading && (
          <p className="rounded-lg border border-white-6 bg-white-2 px-4 py-3 text-sm text-zinc-400">
            Loading playlist...
          </p>
        )}
        {page.playlist.isError && (
          <Notice tone="error">
            {page.playlist.error.message}
          </Notice>
        )}

        {page.playlist.data && (
          <>
            <PlaylistHeader
              isRenamePending={page.isRenamingPlaylist}
              isRenaming={page.isRenaming}
              onCancelRenaming={page.cancelRenaming}
              onRename={page.handleRename}
              onStartRenaming={page.startRenaming}
              onTitleDraftChange={page.setTitleDraft}
              title={page.playlist.data.title}
              titleDraft={page.titleDraft}
              trackCount={page.tracks.length}
            />

            {page.error && (
              <Notice tone="error">
                {page.error.message}
              </Notice>
            )}

            <PlaylistTrackList
              isRemovingTrack={page.isRemovingTrack}
              isReordering={page.isReordering}
              onMoveTrack={page.moveTrack}
              onPlayTrack={page.playTrack}
              onRemoveTrack={page.requestRemoveTrack}
              tracks={page.tracks}
            />
          </>
        )}
        <ConfirmDialog
          confirmLabel="Remove track"
          description={`Remove “${page.trackToRemove?.title ?? ""}” from this playlist?`}
          error={page.removeError?.message}
          isOpen={page.trackToRemove !== null}
          isPending={page.isRemovingTrack}
          onClose={page.cancelRemoveTrack}
          onConfirm={page.confirmRemoveTrack}
          title="Remove track?"
        />
      </section>
  );
};
