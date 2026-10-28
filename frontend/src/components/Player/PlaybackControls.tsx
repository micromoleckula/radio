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
        {isPlaying ? "Ⅱ" : "▶"}
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
