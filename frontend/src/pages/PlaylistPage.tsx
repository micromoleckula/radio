import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PlaylistHeader } from "../components/Playlists/PlaylistHeader";
import { PlaylistTrackList } from "../components/Playlists/PlaylistTrackList";
import { Notice } from "../components/Ui/Notice";
import { usePlaylistPage } from "../hooks/usePlaylistPage";

export const PlaylistPage = () => {
  const { playlistId: playlistIdParam } = useParams();
  const playlistId = Number(playlistIdParam);
  const isValidPlaylistId = Number.isSafeInteger(playlistId) && playlistId > 0;
  const page = usePlaylistPage(playlistId, isValidPlaylistId);

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

        {page.playlist.isLoading && (
          <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
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
              addableTracks={page.addableTracks}
              isAddingTrack={page.isAddingTrack}
              isRenamePending={page.isRenamingPlaylist}
              isRenaming={page.isRenaming}
              onAddTrack={page.handleAddTrack}
              onCancelRenaming={page.cancelRenaming}
              onRename={page.handleRename}
              onSelectedTrackChange={page.setSelectedTrackId}
              onStartRenaming={page.startRenaming}
              onTitleDraftChange={page.setTitleDraft}
              selectedTrackId={page.selectedTrackId}
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
              onRemoveTrack={page.removeTrack}
              tracks={page.tracks}
            />
          </>
        )}
      </section>
    </Layout>
  );
};
