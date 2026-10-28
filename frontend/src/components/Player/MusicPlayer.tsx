import { useMusicPlayer } from "../../hooks/useMusicPlayer";
import { formatTime } from "../../shared/formatTime";
import { PlaybackControls } from "./PlaybackControls";
import { PlayerTrackInfo } from "./PlayerTrackInfo";
import { VolumeControl } from "./VolumeControl";

export const MusicPlayer = () => {
  const player = useMusicPlayer();

  const togglePlayback = () => {
    if (player.currentTrack) {
      player.setPlaying(!player.isPlaying);
    }
  };

  const seek = (nextTime: number) => {
    player.setCurrentTime(nextTime);
    if (player.audioRef.current) {
      player.audioRef.current.currentTime = nextTime;
    }
  };

  const duration =
    player.duration || player.currentTrack?.durationSeconds || 1;

  return (
    <footer className="grid h-[82px] shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-2 rounded-xl border border-white/[0.05] bg-zinc-900 px-3 sm:h-[88px] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <PlayerTrackInfo track={player.currentTrack} />
        <VolumeControl
          className="w-12 shrink-0 sm:hidden"
          onChange={player.setVolume}
          volume={player.volume}
        />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-1">
        <PlaybackControls
          hasTracks={player.queue.length > 0}
          isPlaying={player.isPlaying}
          onNext={player.nextTrack}
          onPrevious={player.previousTrack}
          onToggle={togglePlayback}
        />
        <div className="flex w-full items-center gap-2 text-[10px] tabular-nums text-zinc-500 sm:text-[11px]">
          <span>{formatTime(player.currentTime)}</span>
          <input
            aria-label="Track progress"
            className="h-1 min-w-0 flex-1 cursor-pointer accent-emerald-400 disabled:cursor-default"
            disabled={!player.currentTrack}
            max={duration}
            min={0}
            onChange={(event) => {
              seek(Number(event.target.value));
            }}
            type="range"
            value={Math.min(player.currentTime, duration)}
          />
          <span>
            {formatTime(
              player.duration || player.currentTrack?.durationSeconds || 0,
            )}
          </span>
        </div>
      </div>

      <div className="hidden justify-end sm:flex">
        <VolumeControl
          className="w-28"
          onChange={player.setVolume}
          volume={player.volume}
        />
      </div>

      <audio
        hidden
        onDurationChange={(event) => {
          player.setDuration(event.currentTarget.duration || 0);
        }}
        onEnded={player.nextTrack}
        onTimeUpdate={(event) => {
          player.setCurrentTime(event.currentTarget.currentTime);
        }}
        ref={player.audioRef}
      />
    </footer>
  );
};
