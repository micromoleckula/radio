import { AudioTrackForm } from "../components/Tracks/AudioTrackForm";
import { AudioAdminUnlockForm } from "../components/Tracks/AudioAdminUnlockForm";
import { ManagedTrackList } from "../components/Tracks/ManagedTrackList";
import { Layout } from "../components/Layout";
import { Notice } from "../components/Ui/Notice";
import { PageHeader } from "../components/Ui/PageHeader";
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
          <Notice tone="error">{page.adminSessionError.message}</Notice>
        )}
        <PageHeader
          actions={
            <div className="flex items-center gap-2">
              <button
                className="rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                onClick={page.toggleCreateForm}
                type="button"
              >
                {page.isCreating ? "Cancel" : "Add audio"}
              </button>
              <button
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/10"
                onClick={page.logout}
                type="button"
              >
                Lock
              </button>
            </div>
          }
          description="Manage the tracks and artwork in your collection."
          eyebrow="Audio management"
          title="Edit audios"
        />

        {page.isCreating && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            <AudioTrackForm
              onCancel={page.closeCreateForm}
              onSaved={page.closeCreateForm}
            />
          </div>
        )}
        {page.editingTrack && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            <AudioTrackForm
              key={page.editingTrack.id}
              onCancel={page.closeEditForm}
              onSaved={page.closeEditForm}
              track={page.editingTrack}
            />
          </div>
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
