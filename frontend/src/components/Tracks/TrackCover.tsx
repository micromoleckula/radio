import { getTrackCoverUrl } from "../../shared/tracks";

interface TrackCoverProps {
  trackId: number;
  title: string;
  available: boolean;
  className?: string;
}

export const TrackCover = ({
  trackId,
  title,
  available,
  className = "",
}: TrackCoverProps) => (
  <div
    className={`relative grid shrink-0 place-items-center overflow-hidden rounded bg-gradient-to-br from-emerald-300 to-emerald-900 font-bold text-black ${className}`}
  >
    <span aria-hidden="true">{title.slice(0, 1).toUpperCase() || "♪"}</span>
    {available && (
      <img
        alt={`${title} cover`}
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        src={getTrackCoverUrl(trackId)}
      />
    )}
  </div>
);
