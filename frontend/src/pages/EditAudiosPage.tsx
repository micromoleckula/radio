import { AudioTrackForm } from "../components/Tracks/AudioTrackForm";
import { AudioAdminUnlockForm } from "../components/Tracks/AudioAdminUnlockForm";
import { ManagedTrackList } from "../components/Tracks/ManagedTrackList";
import { Layout } from "../components/Layout";
import { useAudioAdminPage } from "../hooks/useAudioAdminPage";

export const EditAudiosPage = () => {
  const page = useAudioAdminPage();

  if (!page.token) {
    return (
      <AudioAdminUnlockForm
        error={page.unlockError}
        isPending={page.unlockPending}
        onPasswordChange={page.setPassword}
        onSubmit={page.handleUnlock}
        password={page.password}
      />
    );
  }

  return (
    <Layout>
      <section className="mx-auto w-full max-w-5xl space-y-7">
        {page.adminSessionError && (
          <p className="text-sm text-red-400" role="alert">
            {page.adminSessionError.message}
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
              onClick={page.toggleCreateForm}
              type="button"
            >
              {page.isCreating ? "Cancel" : "Add audio"}
            </button>
            <button
              className="rounded-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10"
              onClick={page.logout}
              type="button"
            >
              Lock
            </button>
          </div>
        </header>

        {page.isCreating && (
          <AudioTrackForm
            onCancel={page.closeCreateForm}
            onSaved={page.closeCreateForm}
          />
        )}
        {page.editingTrack && (
          <AudioTrackForm
            key={page.editingTrack.id}
            onCancel={page.closeEditForm}
            onSaved={page.closeEditForm}
            track={page.editingTrack}
          />
        )}

        <ManagedTrackList
          deleteError={page.deleteError}
          error={page.tracks.error}
          hasNextPage={Boolean(page.tracks.hasNextPage)}
          isDeleting={page.isDeleting}
          isError={page.tracks.isError}
          isFetchingNextPage={page.tracks.isFetchingNextPage}
          isLoading={page.tracks.isLoading}
          onDelete={page.confirmDeleteTrack}
          onEdit={page.startEditingTrack}
          onLoadMore={() => {
            void page.tracks.fetchNextPage();
          }}
          tracks={page.allTracks}
        />
      </section>
    </Layout>
  );
};
