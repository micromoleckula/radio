interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
  className?: string;
}

export function VolumeControl({
  volume,
  onChange,
  className = "",
}: VolumeControlProps) {
  return (
    <label className={`flex items-center gap-2 text-zinc-500 ${className}`}>
      <span aria-hidden="true">♪</span>
      <input
        aria-label="Volume"
        className="h-1 w-full cursor-pointer accent-emerald-400"
        max={1}
        min={0}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        step={0.01}
        type="range"
        value={volume}
      />
    </label>
  );
}
