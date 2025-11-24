
import { LevelConfig } from './types';

// Generate 64 unique monster IDs to be used as seeds
export const EMOJI_POOL = Array.from({ length: 64 }, (_, i) => `mon_${i + 1}`);

export const BASE_SCORE = 10;
export const TIME_BONUS_PER_SEC = 10;
export const COMBO_MULTIPLIER = 1.5;
export const COMBO_TIME_WINDOW_MS = 2500; // 2.5 seconds to chain combo

// Difficulty scaling: 10 levels per cycle
export const getLevelConfig = (level: number): LevelConfig => {
  // Cycle 0 = Levels 1-10, Cycle 1 = Levels 11-20, etc.
  const cycle = Math.floor((level - 1) / 10);
  
  // Step within cycle: 0 to 9
  const step = (level - 1) % 10;
  
  // Grid Dimensions: EVEN HARDER START
  // Start with many small tiles immediately
  let rows = 8;
  let cols = 6;

  // Progression: Dense -> Very Dense -> Max Mobile Density
  if (step < 2) { 
      // Lv 1-2: 48 Tiles (8x6) - Increased from 7x6
      rows = 8; cols = 6; 
  } else if (step < 5) { 
      // Lv 3-5: 56 Tiles (8x7)
      rows = 8; cols = 7; 
  } else if (step < 8) { 
      // Lv 6-8: 64 Tiles (8x8) - Very dense box
      rows = 8; cols = 8; 
  } else { 
      // Lv 9-10: 70 Tiles (10x7) - Tall grid
      rows = 10; cols = 7; 
  }

  // Cycle Multiplier: For very high levels (Cycle 2+), keep it maxed
  if (cycle >= 1) {
      // Rotate configurations for variety in later cycles
      if (step % 2 === 0) { rows = 9; cols = 7; } 
      else { rows = 10; cols = 6; }
  }

  // Types Count: Increase variety faster
  // Start with 12 types (was 10)
  const typesCount = Math.min(EMOJI_POOL.length, 12 + cycle * 4 + Math.floor(step / 2));
  
  const totalTiles = rows * cols;
  
  // Time Limit
  // Tighter time as levels progress
  const baseTimePerTile = 2.0 - (Math.min(cycle, 5) * 0.1); 
  const timeSeconds = Math.max(25, Math.floor(totalTiles * baseTimePerTile));

  // Score threshold "Par" score
  const scoreThreshold = (totalTiles / 2) * BASE_SCORE;

  return {
    rows,
    cols,
    timeSeconds,
    typesCount,
    scoreThreshold
  };
};

/**
 * Calculates the Target Score based on the history of all levels up to this point.
 * This creates a "Par" score for the entire game run.
 */
export const calculateCumulativeTargetScore = (currentLevel: number): number => {
  let totalTarget = 0;
  for (let i = 1; i <= currentLevel; i++) {
    const config = getLevelConfig(i);
    const tiles = config.rows * config.cols;
    const pairs = tiles / 2;
    // Expectation: Base points + 20% Combo overhead
    totalTarget += Math.floor((pairs * BASE_SCORE) * 1.2); 
  }
  return totalTarget;
};
