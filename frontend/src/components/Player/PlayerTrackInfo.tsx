import type { Track } from "../../shared/tracks";
import { TrackCover } from "../Tracks/TrackCover";

interface PlayerTrackInfoProps {
  track?: Track;
}

export function PlayerTrackInfo({ track }: PlayerTrackInfoProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {track ? (
        <TrackCover
          available={track.coverAvailable}
          className="size-11 rounded-md text-sm"
          title={track.title}
          trackId={track.id}
        />
      ) : (
        <div className="grid size-11 shrink-0 place-items-center rounded-md border border-white/[0.06] bg-white/[0.03] text-lg text-zinc-600">
          ♪
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {track?.title ?? "Choose a track"}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {track?.artist ?? "Nothing playing"}
        </p>
      </div>
    </div>
  );
}
