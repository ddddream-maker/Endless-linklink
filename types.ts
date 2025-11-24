export interface Coordinate {
  row: number;
  col: number;
}

export interface Tile {
  id: string; // Unique ID for React keys
  type: string; // The emoji/icon content
  status: 'active' | 'selected' | 'matched';
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  LEADERBOARD = 'LEADERBOARD',
}

export interface LevelConfig {
  rows: number;
  cols: number;
  timeSeconds: number;
  typesCount: number; // How many unique emojis to use
  scoreThreshold: number; // Score needed to pass (usually clearing board)
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}