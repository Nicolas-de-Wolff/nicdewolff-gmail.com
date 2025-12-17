import React from 'react';
import GameLoop from './components/GameLoop';
import MusicController from './components/MusicController';
import { ASSETS } from './constants';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-neutral-900 overflow-hidden">
      {/* 
        📱 RESPONSIVE MOBILE FORMAT (MANDATORY)
        Min: 375x812, Max: 440x956 
        Using standard Tailwind classes mapped to style.css constraints 
      */}
      <div className="game-container relative w-full h-full max-w-[440px] max-h-[956px] bg-bg-primary">
        
        {/* BACKGROUND IMAGE */}
        {/* ⚠️ This background image can be replaced later with another image from /Media/images/ */}
        <img
            src={ASSETS.images.background}
            alt="Game Background"
            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
            onError={(e) => {
                // Fallback if image is missing so the game is still playable
                e.currentTarget.style.display = 'none';
            }}
        />

        {/* Global UI Elements */}
        <MusicController />
        
        {/* Game Engine */}
        <GameLoop />
      
      </div>
    </div>
  );
};

export default App;