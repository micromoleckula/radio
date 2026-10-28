export function formatTime(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  return `${Math.floor(seconds / 60).toString()}:${(seconds % 60).toString().padStart(2, "0")}`;
}
