'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Pause, Play, X } from 'lucide-react';

export type Track = { url: string; title: string; subtitle: string; reciterId?: number };

type AudioContextValue = { play: (track: Track) => void; current: Track | null };
const AudioContext = createContext<AudioContextValue>({ play: () => {}, current: null });

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;
    const onEnd = () => setPlaying(false);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const play = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (current?.url === track.url) {
      if (playing) audio.pause();
      else void audio.play().catch(() => setPlaying(false));
      setPlaying(!playing);
      return;
    }
    audio.src = track.url;
    setCurrent(track);
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current, playing]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = '';
    setCurrent(null);
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [current, playing]);

  return (
    <AudioContext.Provider value={{ play, current }}>
      {children}
      {current && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-elevated/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              <p className="truncate text-xs text-ink-muted">{current.subtitle}</p>
            </div>
            <Link href="/audio" className="rounded-md px-3 py-2 text-xs text-primary">القارئ</Link>
            <button type="button" onClick={stop} aria-label="إغلاق المشغّل" className="flex size-10 items-center justify-center rounded-md text-ink-muted">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
