import { create } from "zustand";
import type { Track } from "../../tracks/api";

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  playTrack: (track: Track, queue: Track[]) => void;
  setPlaying: (isPlaying: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,

  playTrack: (track, queue) => {
    if (!track.audioAvailable) {
      return;
    }

    const currentIndex = queue.findIndex((item) => item.id === track.id);
    set({ queue, currentIndex, isPlaying: currentIndex >= 0 });
  },

  setPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  nextTrack: () => {
    set((state) => moveToAvailableTrack(state, 1));
  },

  previousTrack: () => {
    set((state) => moveToAvailableTrack(state, -1));
  },
}));

function moveToAvailableTrack(
  state: Pick<PlayerState, "queue" | "currentIndex">,
  direction: 1 | -1,
): Pick<PlayerState, "currentIndex" | "isPlaying"> {
  const { queue, currentIndex } = state;

  for (let step = 1; step <= queue.length; step += 1) {
    const index =
      (currentIndex + direction * step + queue.length) % queue.length;
    if (queue[index]?.audioAvailable) {
      return { currentIndex: index, isPlaying: true };
    }
  }

  return { currentIndex: -1, isPlaying: false };
}