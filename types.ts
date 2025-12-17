export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export interface PipeData {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GamePhysics {
  gravity: number;
  lift: number;
  velocity: number;
}
