import { useEffect, useRef, useState } from "react";
import { getTrackStreamUrl } from "../shared/tracks";
import { usePlayerStore } from "../store/player.store";

export function useMusicPlayer() {
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

  return {
    audioRef,
    queue,
    currentTrack,
    isPlaying,
    setPlaying,
    nextTrack,
    previousTrack,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
  };
}
