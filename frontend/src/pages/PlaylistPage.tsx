import { Link, useParams } from "react-router-dom";
import { Layout } from "../shared/layout/Layout";
import { PlaylistHeader } from "../features/playlists/components/PlaylistHeader";
import { PlaylistTrackList } from "../features/playlists/components/PlaylistTrackList";
import { Notice } from "../shared/ui/Notice";
import { usePlaylistPage } from "../features/playlists/hooks/usePlaylistPage";

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
              onRemoveTrack={page.removeTrack}
              tracks={page.tracks}
            />
          </>
        )}
      </section>
    </Layout>
  );
};
