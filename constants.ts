// ⚙️ PHYSICS (USE EXACT VALUES)
export const GRAVITY = 0.12;    // very low, bird should float
export const LIFT = -4.0;       // soft jump impulse
export const INITIAL_VELOCITY = 0;

// Game Rules
export const WIN_SCORE = 6;
export const PIPE_SPEED = 2.5; // Adjusted slightly for 60fps smoothness
export const PIPE_SPAWN_RATE = 180; // Frames between pipes
export const PIPE_GAP = 220; // Gap between top and bottom pipe
export const PIPE_WIDTH = 60;

// Assets Paths
// ⚠️ USER ACTION REQUIRED: Populate the /Media folders with the files listed below.
export const ASSETS = {
  fonts: {
    // 📂 /Media/fonts/
    // Required files: twkburns-bold-webfont.woff2, twkburns-bold-webfont.woff
    woff2: '/Media/fonts/twkburns-extrabold-webfont.woff2',
    woff: '/Media/fonts/twkburns-extrabold-webfont.woff',
  },
  images: {
    // 📂 /Media/images/
    // Required file: can.png (The main character/player)
    player: '/Media/images/Canette_Rose.png',
    
    // Required file: box.png (The winning screen icon)
    box: '/Media/images/package_2.png',
    
    // Required file: Background_image.png (The static background)
    background: '/Media/images/Background_image.png',
    
    // ⚠️ PLACEHOLDER: This pipe currently uses an online placeholder.
    // To use a local image, place 'pipe.png' in /Media/images/ and change this line to: 
    // pipe: '/Media/images/pipe.png',
    pipe: '/Media/images/pipe.png', 
  },
  music: {
    // 📂 /Media/music/
    // Required file: track.mp3 (Background music)
    bg: '/Media/music/track.mp3',
  }
};