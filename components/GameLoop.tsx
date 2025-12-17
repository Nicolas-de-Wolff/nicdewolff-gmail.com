import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, PipeData } from '../types';
import { GRAVITY, LIFT, INITIAL_VELOCITY, WIN_SCORE, PIPE_SPEED, PIPE_SPAWN_RATE, PIPE_GAP, PIPE_WIDTH, ASSETS } from '../constants';

// Images refs to hold loaded HTMLImageElements
interface GameImages {
  player: HTMLImageElement | null;
  pipe: HTMLImageElement | null;
}

const GameLoop: React.FC = () => {
  // UI State
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game Physics State (Refs for performance/mutability in loop)
  const birdY = useRef<number>(300);
  const velocity = useRef<number>(INITIAL_VELOCITY);
  const pipes = useRef<PipeData[]>([]);
  const frameCount = useRef<number>(0);
  
  // Asset Refs
  const images = useRef<GameImages>({ player: null, pipe: null });

  // Load Assets
  useEffect(() => {
    const playerImg = new Image();
    playerImg.src = ASSETS.images.player;
    // Fallback if local image missing during dev
    playerImg.onerror = () => { playerImg.src = 'https://picsum.photos/40/40'; };
    
    const pipeImg = new Image();
    pipeImg.src = ASSETS.images.pipe;

    images.current = { player: playerImg, pipe: pipeImg };
  }, []);

  // Controls
  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      velocity.current = LIFT;
    } else if (gameState === GameState.START || gameState === GameState.GAME_OVER || gameState === GameState.WON) {
      resetGame();
      setGameState(GameState.PLAYING);
      velocity.current = LIFT;
    }
  }, [gameState]);

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Game Reset
  const resetGame = () => {
    birdY.current = window.innerHeight / 3; // Start roughly in upper third
    velocity.current = INITIAL_VELOCITY;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
  };

  // Main Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Player horizontal position (fixed at 1/3 of screen width)
    const birdX = width / 3;

    // Clear canvas (transparent to show video behind)
    ctx.clearRect(0, 0, width, height);

    if (gameState === GameState.PLAYING) {
      // 1. Physics
      velocity.current += GRAVITY;
      birdY.current += velocity.current;

      // 2. Pipe Spawning
      frameCount.current++;
      if (frameCount.current % PIPE_SPAWN_RATE === 0) {
        const minPipeHeight = 100;
        const maxPipeHeight = height - PIPE_GAP - minPipeHeight;
        const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
        
        pipes.current.push({
          x: width,
          topHeight: randomHeight,
          passed: false
        });
      }

      // 3. Pipe Movement & Collision
      pipes.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        // Collision Logic
        // Bird dimensions (approximate)
        const birdSize = 34; // Radius or box size
        const birdLeft = birdX - birdSize / 2;
        const birdRight = birdX + birdSize / 2;
        const birdTop = birdY.current - birdSize / 2;
        const birdBottom = birdY.current + birdSize / 2;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        // Check X overlap
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check Y overlap (Top Pipe OR Bottom Pipe)
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
                setGameState(GameState.GAME_OVER);
            }
        }

        // Score Update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          setScore(prev => {
            const newScore = prev + 1;
            if (newScore >= WIN_SCORE) {
               setGameState(GameState.WON);
            }
            return newScore;
          });
        }
      });

      // Cleanup off-screen pipes
      pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > -10);

      // Ground/Ceiling Collision
      if (birdY.current + 17 > height || birdY.current - 17 < 0) {
        setGameState(GameState.GAME_OVER);
      }
    } else {
        // Idle animation if Start screen (hovering)
        if (gameState === GameState.START) {
            birdY.current = height / 2 + Math.sin(Date.now() / 300) * 10;
        }
    }

    // 4. Drawing
    
    // Draw Pipes
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-pink-variant-1').trim() || '#ff6f8f';
    pipes.current.forEach(pipe => {
      // Top Pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      
      // Bottom Pipe
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, height - (pipe.topHeight + PIPE_GAP));

      // Optional: Draw image over the rect if needed
      // ⚠️ This pipe image can be replaced later with an image or a video from Media/images or Media/video
      /* 
      if (images.current.pipe) {
         ctx.drawImage(images.current.pipe, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
         // ... draw bottom pipe similarly
      }
      */
    });

    // Draw Player (Can)
    if (images.current.player) {
      const size = 40; 
      ctx.save();
      ctx.translate(birdX, birdY.current);
      // Rotation based on velocity
      const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (velocity.current * 0.1)));
      ctx.rotate(rotation);
      ctx.drawImage(images.current.player, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
        // Fallback drawing if image not loaded
        ctx.fillStyle = '#FF476C';
        ctx.beginPath();
        ctx.arc(birdX, birdY.current, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState]);

  // Init Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Resize handler
  useEffect(() => {
     const resize = () => {
         if (canvasRef.current) {
             // We use the parent container's size
             canvasRef.current.width = canvasRef.current.offsetWidth;
             canvasRef.current.height = canvasRef.current.offsetHeight;
             
             if (gameState === GameState.START) {
                 birdY.current = canvasRef.current.height / 2;
             }
         }
     };
     window.addEventListener('resize', resize);
     resize();
     return () => window.removeEventListener('resize', resize);
  }, [gameState]);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-pointer touch-manipulation z-10 relative"
        onClick={jump}
        onTouchStart={jump}
      />
      
      {/* Score HUD */}
      {(gameState === GameState.PLAYING || gameState === GameState.GAME_OVER || gameState === GameState.WON) && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
             <span className="font-twk text-4xl text-pink-primary drop-shadow-md stroke-white">
                {score}
             </span>
        </div>
      )}

      {/* Overlays */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
          <h1 className="text-6xl text-pink-primary mb-8 font-twk drop-shadow-lg">Vole</h1>
          <button className="pointer-events-auto btn-primary px-8 py-4 text-2xl rounded-xl shadow-xl hover:bg-pink-600 transition-colors">
            JOUER
          </button>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 pointer-events-auto">
          <h2 className="text-4xl text-bg-secondary mb-4 font-twk">Perdu !</h2>
          <div className="bg-bg-secondary p-6 rounded-xl text-center shadow-2xl border-4 border-pink-primary">
             <p className="text-bg-primary text-xl mb-4 font-twk">Score: {score}</p>
             <button onClick={() => { setGameState(GameState.START); resetGame(); }} className="btn-primary px-6 py-3 text-xl rounded-lg">
                Rejouer
             </button>
          </div>
        </div>
      )}

      {gameState === GameState.WON && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg-secondary p-6 animate-fade-in text-center">
          <h2 className="text-5xl text-bg-primary mb-6 font-twk">Gagné !</h2>
          
          <img 
            src={ASSETS.images.box} 
            alt="Box" 
            className="w-32 h-32 object-contain mb-6 animate-bounce"
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/150/150')}
          />
          
          <p className="text-2xl text-bg-primary font-twk mb-8 max-w-[80%] leading-relaxed">
            La cannette est bien emballée
          </p>
          
          <button 
            onClick={() => { setGameState(GameState.START); resetGame(); }} 
            className="btn-primary px-8 py-4 text-2xl rounded-xl shadow-lg"
          >
            JOUER ENCORE
          </button>
        </div>
      )}
    </>
  );
};

export default GameLoop;