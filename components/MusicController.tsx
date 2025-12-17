import React, { useState, useEffect, useRef } from 'react';
import { ASSETS } from '../constants';

const MusicController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio(ASSETS.music.bg);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Try to play automatically (might be blocked by browser policy until interaction)
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Auto-play was prevented
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button 
      onClick={toggleMusic}
      className="absolute top-4 right-4 z-50 p-2 rounded-full bg-pink-primary text-white border-2 border-white/20 shadow-lg font-twk text-sm hover:scale-105 active:scale-95 transition-all w-12 h-12 flex items-center justify-center"
      aria-label="Toggle Music"
    >
      {isPlaying ? 'ON' : 'OFF'}
    </button>
  );
};

export default MusicController;
