import { create } from "zustand";
import type { Track } from "../shared/tracks";

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
    const currentIndex = queue.findIndex((item) => item.id === track.id);
    set({ queue, currentIndex, isPlaying: currentIndex >= 0 });
  },

  setPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  nextTrack: () => {
    set((state) => ({
      currentIndex:
        state.queue.length > 0
          ? (state.currentIndex + 1) % state.queue.length
          : -1,
      isPlaying: state.queue.length > 0,
    }));
  },

  previousTrack: () => {
    set((state) => ({
      currentIndex:
        state.queue.length > 0
          ? (state.currentIndex - 1 + state.queue.length) % state.queue.length
          : -1,
      isPlaying: state.queue.length > 0,
    }));
  },
}));