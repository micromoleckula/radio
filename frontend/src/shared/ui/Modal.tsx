import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="fixed left-1/2 top-1/2 m-0 w-[min(28rem,calc(100%-2rem))] max-w-none -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <section className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl sm:p-6">
        <header className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold" id={titleId}>
              {title}
            </h2>
            <button
              aria-label="Close dialog"
              className="grid size-8 shrink-0 place-items-center rounded-full text-xl leading-none text-zinc-400 hover:bg-white/10 hover:text-white"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
          {description && (
            <p className="mt-2 text-sm leading-6 text-zinc-400" id={descriptionId}>
              {description}
            </p>
          )}
        </header>
        {children}
      </section>
    </dialog>
  );
}
