import { Modal } from "./Modal";
import { Notice } from "./Notice";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isPending = false,
  error,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      {error && <Notice tone="error">{error}</Notice>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-50"
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-wait disabled:opacity-50"
          disabled={isPending}
          onClick={onConfirm}
          type="button"
        >
          {isPending ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
