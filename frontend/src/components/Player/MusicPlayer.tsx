import { useEffect, useRef, useState } from "react";
import { getTrackStreamUrl } from "../../shared/tracks";
import { usePlayerStore } from "../../store/player.store";
import { TrackCover } from "../Tracks/TrackCover";

export const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setPlaying = usePlayerStore((state) => state.setPlaying);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const previousTrack = usePlayerStore((state) => state.previousTrack);
  const currentTrack = queue.at(currentIndex);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    const source = getTrackStreamUrl(currentTrack.id);

    if (audio.src !== new URL(source, document.baseURI).href) {
      audio.src = source;
      audio.load();
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, setPlaying]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = () => {
    if (!currentTrack) {
      return;
    }

    setPlaying(!isPlaying);
  };

  return (
    <footer className="grid h-[88px] shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-3 border-t border-white/10 bg-[#090909] px-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {currentTrack ? (
          <TrackCover
            available={currentTrack.coverAvailable}
            className="size-12 text-lg"
            title={currentTrack.title}
            trackId={currentTrack.id}
          />
        ) : (
          <div className="grid size-12 shrink-0 place-items-center rounded bg-zinc-800 text-lg text-zinc-500">
            ♪
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {currentTrack?.title ?? "Choose a track"}
          </p>
          <p className="truncate text-xs text-zinc-400">
            {currentTrack?.artist ?? "Nothing playing"}
          </p>
        </div>
        <label className="w-12 shrink-0 sm:hidden">
          <input
            aria-label="Volume"
            className="h-1 w-full cursor-pointer accent-emerald-400"
            max={1}
            min={0}
            onChange={(event) => {
              setVolume(Number(event.target.value));
            }}
            step={0.01}
            type="range"
            value={volume}
          />
        </label>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-1">
        <div className="flex items-center gap-5">
          <button
            aria-label="Previous track"
            className="text-zinc-400 transition-colors hover:text-white disabled:opacity-40"
            disabled={queue.length === 0}
            onClick={previousTrack}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid size-8 place-items-center rounded-full bg-white text-sm text-black transition-transform hover:scale-105 disabled:opacity-40"
            disabled={!currentTrack}
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>
          <button
            aria-label="Next track"
            className="text-zinc-400 transition-colors hover:text-white disabled:opacity-40"
            disabled={queue.length === 0}
            onClick={nextTrack}
            type="button"
          >
            ›
          </button>
        </div>
        <div className="flex w-full items-center gap-2 text-[11px] tabular-nums text-zinc-500">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="Track progress"
            className="h-1 min-w-0 flex-1 cursor-pointer accent-emerald-400"
            max={duration || currentTrack?.durationSeconds || 1}
            min={0}
            onChange={(event) => {
              const nextTime = Number(event.target.value);
              setCurrentTime(nextTime);
              if (audioRef.current) {
                audioRef.current.currentTime = nextTime;
              }
            }}
            type="range"
            value={Math.min(
              currentTime,
              duration || currentTrack?.durationSeconds || 1,
            )}
          />
          <span>
            {formatTime(duration || currentTrack?.durationSeconds || 0)}
          </span>
        </div>
      </div>

      <div className="hidden justify-end sm:flex">
        <label className="flex w-28 items-center gap-2 text-zinc-400">
          <span aria-hidden="true">♪</span>
          <input
            aria-label="Volume"
            className="h-1 w-full cursor-pointer accent-emerald-400"
            max={1}
            min={0}
            onChange={(event) => {
              setVolume(Number(event.target.value));
            }}
            step={0.01}
            type="range"
            value={volume}
          />
        </label>
      </div>

      <audio
        hidden
        onDurationChange={(event) => {
          setDuration(event.currentTarget.duration || 0);
        }}
        onEnded={() => {
          nextTrack();
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        ref={audioRef}
      />
    </footer>
  );
};

function formatTime(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  return `${Math.floor(seconds / 60).toString()}:${(seconds % 60).toString().padStart(2, "0")}`;
}
