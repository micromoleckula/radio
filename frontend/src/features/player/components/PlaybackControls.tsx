interface PlaybackControlsProps {
  isPlaying: boolean;
  hasTracks: boolean;
  onPrevious: () => void;
  onToggle: () => void;
  onNext: () => void;
}

export function PlaybackControls({
  isPlaying,
  hasTracks,
  onPrevious,
  onToggle,
  onNext,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-5">
      <button
        aria-label="Previous track"
        className="text-lg text-zinc-500 transition-colors hover:text-white disabled:opacity-40"
        disabled={!hasTracks}
        onClick={onPrevious}
        type="button"
      >
        ‹
      </button>
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid size-9 place-items-center rounded-full bg-white text-xs text-black transition-transform hover:scale-105 disabled:opacity-40"
        disabled={!hasTracks}
        onClick={onToggle}
        type="button"
      >
        {isPlaying ? (
          <svg
            aria-hidden="true"
            fill="currentColor"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <path d="M4 3.25A1.25 1.25 0 0 1 5.25 2h.5A1.25 1.25 0 0 1 7 3.25v9.5A1.25 1.25 0 0 1 5.75 14h-.5A1.25 1.25 0 0 1 4 12.75v-9.5Zm5 0A1.25 1.25 0 0 1 10.25 2h.5A1.25 1.25 0 0 1 12 3.25v9.5A1.25 1.25 0 0 1 10.75 14h-.5A1.25 1.25 0 0 1 9 12.75v-9.5Z" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            fill="currentColor"
            height="16"
            viewBox="0 0 16 16"
            width="16"
          >
            <path d="M4.5 2.7a.7.7 0 0 1 1.05-.6l7.2 4.3a.7.7 0 0 1 0 1.2l-7.2 4.3a.7.7 0 0 1-1.05-.6V2.7Z" />
          </svg>
        )}
      </button>
      <button
        aria-label="Next track"
        className="text-lg text-zinc-500 transition-colors hover:text-white disabled:opacity-40"
        disabled={!hasTracks}
        onClick={onNext}
        type="button"
      >
        ›
      </button>
    </div>
  );
}
