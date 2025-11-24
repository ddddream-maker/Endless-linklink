
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Tile, Coordinate } from '../types';
import Monster from './Monster';

interface BoardProps {
  grid: Tile[][];
  onTileClick: (coord: Coordinate) => void;
  path: Coordinate[];
  hintPair: [Coordinate, Coordinate] | null;
}

const Board: React.FC<BoardProps> = ({ grid, onTileClick, path, hintPair }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ cellSize: 0, boardWidth: 0, boardHeight: 0 });

  if (!grid || grid.length === 0) return null;

  const rows = grid.length;
  const cols = grid[0].length;
  const GAP = 2; // Grid gap in px

  // Calculate optimal cell size to fit the wrapper
  useEffect(() => {
    const calculateSize = () => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        
        // Available space accounting for gaps
        const availableW = width - (GAP * (cols - 1));
        const availableH = height - (GAP * (rows - 1));
        
        const cellW = availableW / cols;
        const cellH = availableH / rows;
        
        // Use the smaller dimension to ensure it fits
        const size = Math.floor(Math.min(cellW, cellH));
        
        // Sanity check to prevent negative or zero sizes
        const finalSize = Math.max(size, 0);

        setLayout({
          cellSize: finalSize,
          boardWidth: finalSize * cols + GAP * (cols - 1),
          boardHeight: finalSize * rows + GAP * (rows - 1)
        });
      }
    };

    calculateSize();
    
    const observer = new ResizeObserver(calculateSize);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    window.addEventListener('resize', calculateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateSize);
    };
  }, [rows, cols]); // Recalculate when grid dimensions change
  
  const { cellSize, boardWidth, boardHeight } = layout;

  const svgLines = useMemo(() => {
    if (path.length < 2 || cellSize === 0) return null;
    const lines = [];
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        
        const x1 = p1.col * (cellSize + GAP) + (cellSize / 2);
        const y1 = p1.row * (cellSize + GAP) + (cellSize / 2);
        const x2 = p2.col * (cellSize + GAP) + (cellSize / 2);
        const y2 = p2.row * (cellSize + GAP) + (cellSize / 2);
        
        lines.push(
            <line 
                key={i} 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke="#fbbf24" 
                strokeWidth={cellSize * 0.2}
                strokeLinecap="round" 
                className="drop-shadow-md opacity-90"
            />
        );
    }
    return lines;
  }, [path, cellSize, GAP]);

  const isHinted = (r: number, c: number) => {
    if (!hintPair) return false;
    return (hintPair[0].row === r && hintPair[0].col === c) ||
           (hintPair[1].row === r && hintPair[1].col === c);
  };

  // If sizing hasn't happened yet, don't render the grid to avoid jumpiness
  const isVisible = cellSize > 0;

  return (
    <div ref={wrapperRef} className="relative flex justify-center items-center w-full h-full overflow-hidden">
      {isVisible && (
        <div 
          className="relative grid"
          style={{ 
            width: boardWidth,
            height: boardHeight,
            gap: `${GAP}px`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {/* SVG Overlay for Path */}
          {path.length > 0 && (
              <svg 
                  className="absolute top-0 left-0 pointer-events-none z-30 overflow-visible"
                  style={{ width: '100%', height: '100%' }}
              >
                  {svgLines}
              </svg>
          )}

          {grid.map((row, rIndex) => (
            <React.Fragment key={rIndex}>
              {row.map((tile, cIndex) => {
                const hinted = isHinted(rIndex, cIndex);
                const isMatched = tile.status === 'matched';
                
                // If matched, we render an invisible placeholder to keep grid structure
                if (isMatched) {
                    return <div key={tile.id} style={{ width: cellSize, height: cellSize }} />;
                }

                return (
                <div
                  key={tile.id}
                  onClick={() => onTileClick({ row: rIndex, col: cIndex })}
                  className={`
                    relative
                    flex items-center justify-center cursor-pointer
                    transition-all duration-100 rounded-[6px] select-none
                    ${tile.status === 'selected' 
                      ? 'bg-indigo-100 ring-2 ring-inset ring-indigo-500 z-10 scale-[1.05]' 
                      : hinted 
                        ? 'bg-amber-50 ring-2 ring-inset ring-amber-400 animate-pulse z-10'
                        : 'bg-white shadow-[0_2px_0_#cbd5e1] active:shadow-none active:translate-y-[2px]'}
                  `}
                  style={{
                    width: cellSize,
                    height: cellSize
                  }}
                >
                  <div className="pointer-events-none flex items-center justify-center">
                    <Monster id={tile.type} size={cellSize * 0.85} />
                  </div>
                </div>
              )})}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Board;
