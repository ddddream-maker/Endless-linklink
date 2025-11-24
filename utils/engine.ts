import { Coordinate, Tile, LevelConfig } from '../types';
import { EMOJI_POOL } from '../constants';

/**
 * The core "Link Link" pathfinding algorithm.
 */

// Helper to check if a specific cell is blocked
const isBlocked = (grid: Tile[][], r: number, c: number): boolean => {
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return false; // Out of bounds is "empty" (connectable via border)
  const tile = grid[r][c];
  // 'matched' tiles are effectively empty space and can be traversed
  return tile.status !== 'matched';
};

// Check if horizontal line connects p1 and p2 directly without obstruction
const checkHorizontal = (grid: Tile[][], r: number, c1: number, c2: number): boolean => {
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  for (let c = minC + 1; c < maxC; c++) {
    if (isBlocked(grid, r, c)) return false;
  }
  return true;
};

// Check if vertical line connects p1 and p2 directly without obstruction
const checkVertical = (grid: Tile[][], c: number, r1: number, r2: number): boolean => {
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  for (let r = minR + 1; r < maxR; r++) {
    if (isBlocked(grid, r, c)) return false;
  }
  return true;
};

// 0 Turns: Direct neighbor or straight line
const checkZeroTurns = (grid: Tile[][], p1: Coordinate, p2: Coordinate): boolean => {
  if (p1.row === p2.row) return checkHorizontal(grid, p1.row, p1.col, p2.col);
  if (p1.col === p2.col) return checkVertical(grid, p1.col, p1.row, p2.row);
  return false;
};

// 1 Turn: Find a corner point C that connects p1 and p2 via straight lines
const checkOneTurn = (grid: Tile[][], p1: Coordinate, p2: Coordinate): Coordinate | null => {
  const c1 = { row: p1.row, col: p2.col };
  const c2 = { row: p2.row, col: p1.col };

  if (!isBlocked(grid, c1.row, c1.col)) {
    if (checkHorizontal(grid, p1.row, p1.col, c1.col) && checkVertical(grid, p2.col, c1.row, p2.row)) {
      return c1;
    }
  }

  if (!isBlocked(grid, c2.row, c2.col)) {
    if (checkVertical(grid, p1.col, p1.row, c2.row) && checkHorizontal(grid, p2.row, c2.col, p2.col)) {
      return c2;
    }
  }

  return null;
};

// 2 Turns: Scan outward
const checkTwoTurns = (grid: Tile[][], p1: Coordinate, p2: Coordinate): Coordinate[] | null => {
  const rows = grid.length;
  const cols = grid[0].length;

  // Scan Horizontally from p1
  for (let c = -1; c <= cols; c++) {
    if (c === p1.col) continue; 
    const scanPoint = { row: p1.row, col: c };
    
    const blocked = isBlocked(grid, scanPoint.row, scanPoint.col);
    
    if (!blocked) {
      if (checkHorizontal(grid, p1.row, p1.col, c)) {
        const corner = checkOneTurn(grid, scanPoint, p2);
        if (corner) {
          return [scanPoint, corner];
        }
      }
    }
  }

  // Scan Vertically from p1
  for (let r = -1; r <= rows; r++) {
    if (r === p1.row) continue;
    const scanPoint = { row: r, col: p1.col };
    
    const blocked = isBlocked(grid, scanPoint.row, scanPoint.col);

    if (!blocked) {
      if (checkVertical(grid, p1.col, p1.row, r)) {
        const corner = checkOneTurn(grid, scanPoint, p2);
        if (corner) {
          return [scanPoint, corner];
        }
      }
    }
  }

  return null;
};

export const findConnectionPath = (grid: Tile[][], p1: Coordinate, p2: Coordinate): Coordinate[] | null => {
  if (checkZeroTurns(grid, p1, p2)) return [p1, p2];
  const corner1 = checkOneTurn(grid, p1, p2);
  if (corner1) return [p1, corner1, p2];
  const corners2 = checkTwoTurns(grid, p1, p2);
  if (corners2) return [p1, ...corners2, p2];
  return null;
};

// Mask generators for different layouts
const getLayoutMask = (rows: number, cols: number, level: number): boolean[][] => {
  const mask = Array(rows).fill(null).map(() => Array(cols).fill(true));
  
  // Only apply patterns if board is large enough
  if (rows < 4 || cols < 4) return mask;

  const type = (level - 1) % 5; // Cycle through 5 types

  // 0: Full Rect (Default)
  if (type === 0) return mask;

  // 1: Hollow (Ring)
  if (type === 1) {
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        mask[r][c] = false;
      }
    }
  }
  // 2: Concave (凹)
  else if (type === 2) {
    const startC = Math.floor(cols / 3);
    const endC = Math.floor(cols * 2 / 3);
    for (let r = 0; r < Math.floor(rows / 2); r++) {
      for (let c = startC; c <= endC; c++) {
        mask[r][c] = false;
      }
    }
  }
  // 3: Columns/Stripes
  else if (type === 3) {
      for (let c = 1; c < cols; c+=2) {
          // Leave gaps in columns
          // But we need to ensure connectivity. LinkLink usually allows gaps.
          // Let's just remove random holes to make it Swiss Cheese
          // Deterministic "Swiss Cheese"
          for(let r=0; r<rows; r+=2) {
             mask[r][c] = false;
          }
      }
  }
  // 4: Corners Removed (Rounded)
  else if (type === 4) {
      mask[0][0] = false;
      mask[0][cols-1] = false;
      mask[rows-1][0] = false;
      mask[rows-1][cols-1] = false;
      if(rows > 5 && cols > 5) {
          mask[1][1] = false;
          mask[1][cols-2] = false;
          mask[rows-2][1] = false;
          mask[rows-2][cols-2] = false;
      }
  }

  return mask;
};

export const generateLevel = (config: LevelConfig, level: number): Tile[][] => {
  const { rows, cols, typesCount } = config;
  
  // Get layout mask
  const mask = getLayoutMask(rows, cols, level);

  // Count valid slots
  let validSlots: Coordinate[] = [];
  for(let r=0; r<rows; r++) {
    for(let c=0; c<cols; c++) {
      if(mask[r][c]) {
        validSlots.push({ row: r, col: c });
      }
    }
  }

  // Ensure even number of slots
  if (validSlots.length % 2 !== 0) {
    // Remove the last one to make it even
    validSlots.pop();
  }

  if (validSlots.length === 0) throw new Error("No valid slots for level");

  // Generate Pairs
  let pairs: string[] = [];
  for (let i = 0; i < validSlots.length / 2; i++) {
    const type = EMOJI_POOL[i % typesCount];
    pairs.push(type, type);
  }

  // Shuffle Pairs
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  // Initialize Grid
  const grid: Tile[][] = [];
  let pairIdx = 0;
  
  // Create empty grid first
  for (let r = 0; r < rows; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < cols; c++) {
       // Default to matched (empty)
       row.push({
         id: `tile-${r}-${c}-void`,
         type: '',
         status: 'matched'
       });
    }
    grid.push(row);
  }

  // Fill valid slots
  for(const slot of validSlots) {
    grid[slot.row][slot.col] = {
      id: `tile-${slot.row}-${slot.col}-${Math.random()}`,
      type: pairs[pairIdx++],
      status: 'active'
    };
  }

  return grid;
};

export const findAvailableMatch = (grid: Tile[][]): [Coordinate, Coordinate] | null => {
  const activeTiles: {row: number, col: number, type: string}[] = [];
  for(let r=0; r<grid.length; r++) {
    for(let c=0; c<grid[0].length; c++) {
      if(grid[r][c].status !== 'matched') {
        activeTiles.push({ row: r, col: c, type: grid[r][c].type });
      }
    }
  }

  const tilesByType: Record<string, typeof activeTiles> = {};
  for(const t of activeTiles) {
    if(!tilesByType[t.type]) tilesByType[t.type] = [];
    tilesByType[t.type].push(t);
  }

  for (const type in tilesByType) {
    const group = tilesByType[type];
    if (group.length < 2) continue;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const p1 = { row: group[i].row, col: group[i].col };
        const p2 = { row: group[j].row, col: group[j].col };
        
        if (findConnectionPath(grid, p1, p2)) {
          return [p1, p2];
        }
      }
    }
  }
  return null;
};

export const shuffleTiles = (grid: Tile[][]): Tile[][] => {
  const activeCoords: Coordinate[] = [];
  const activeTypes: string[] = [];
  const newGrid = grid.map(row => row.map(tile => ({ ...tile })));

  for (let r = 0; r < newGrid.length; r++) {
    for (let c = 0; c < newGrid[0].length; c++) {
      if (newGrid[r][c].status !== 'matched') {
        activeCoords.push({ row: r, col: c });
        activeTypes.push(newGrid[r][c].type);
        if (newGrid[r][c].status === 'selected') {
          newGrid[r][c].status = 'active';
        }
      }
    }
  }

  for (let i = activeTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeTypes[i], activeTypes[j]] = [activeTypes[j], activeTypes[i]];
  }

  activeCoords.forEach((coord, index) => {
    newGrid[coord.row][coord.col].type = activeTypes[index];
    newGrid[coord.row][coord.col].id = `tile-${coord.row}-${coord.col}-${Math.random()}`; 
  });

  return newGrid;
};