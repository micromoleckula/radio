import { AudioTrackForm } from "../features/audio-admin/components/AudioTrackForm";
import { AudioAdminUnlockForm } from "../features/audio-admin/components/AudioAdminUnlockForm";
import { ManagedTrackList } from "../features/audio-admin/components/ManagedTrackList";
import { Notice } from "../shared/ui/Notice";
import { PageHeader } from "../shared/ui/PageHeader";
import { useAudioAdminPage } from "../features/audio-admin/hooks/useAudioAdminPage";
import { ConfirmDialog } from "../shared/ui/ConfirmDialog";

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
          <div className="rounded-xl border border-white-6 bg-white-2 p-1">
            <AudioTrackForm
              onCancel={page.closeCreateForm}
              onSaved={page.closeCreateForm}
            />
          </div>
        )}
        {page.editingTrack && (
          <div className="rounded-xl border border-white-6 bg-white-2 p-1">
            <AudioTrackForm
              key={page.editingTrack.id}
              onCancel={page.closeEditForm}
              onSaved={page.closeEditForm}
              track={page.editingTrack}
            />
          </div>
        )}

        <ManagedTrackList
          error={page.tracks.error}
          hasNextPage={page.tracks.hasNextPage}
          isFetchNextPageError={page.tracks.isFetchNextPageError}
          isDeleting={page.isDeleting}
          isError={page.tracks.isError}
          isFetchingNextPage={page.tracks.isFetchingNextPage}
          isLoading={page.tracks.isLoading}
          onDelete={page.requestDeleteTrack}
          onEdit={page.startEditingTrack}
          onLoadMore={() => page.tracks.fetchNextPage()}
          tracks={page.allTracks}
        />
        <ConfirmDialog
          confirmLabel="Delete track"
          description={`Delete “${page.trackToDelete?.title ?? ""}” from the library? This cannot be undone.`}
          error={page.trackToDelete ? page.deleteError?.message : undefined}
          isOpen={page.trackToDelete !== null}
          isPending={page.isDeleting}
          onClose={page.cancelDeleteTrack}
          onConfirm={page.confirmDeleteTrack}
          title="Delete track?"
        />
      </section>
  );
};
