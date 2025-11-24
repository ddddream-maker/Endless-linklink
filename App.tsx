
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tile, Coordinate, GameState, LeaderboardEntry } from './types';
import { getLevelConfig, BASE_SCORE, COMBO_TIME_WINDOW_MS, calculateCumulativeTargetScore, TIME_BONUS_PER_SEC } from './constants';
import { generateLevel, findConnectionPath, findAvailableMatch, shuffleTiles } from './utils/engine';
import Board from './components/Board';
import Monster from './components/Monster';
import { Trophy, Clock, Zap, Play, Shuffle, Lightbulb, LogOut, Heart, RotateCcw, Skull, BarChart3, X, Coins, Backpack, MoreHorizontal, Circle, ChevronLeft, Pause, Settings } from 'lucide-react';

const STORAGE_KEY = 'linklink-infinite-leaderboard';
const STATS_KEY = 'linklink-infinite-stats';
const WALLET_KEY = 'linklink-infinite-wallet';
const MAX_LIVES = 3;

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [wallet, setWallet] = useState(0);
  
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selected, setSelected] = useState<Coordinate | null>(null);
  const [path, setPath] = useState<Coordinate[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [clearedStats, setClearedStats] = useState<Record<string, number>>({});
  
  // Modals
  const [showBag, setShowBag] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [hints, setHints] = useState(3);
  const [shuffles, setShuffles] = useState(3);
  const [hintPair, setHintPair] = useState<[Coordinate, Coordinate] | null>(null);
  const [targetScore, setTargetScore] = useState(0);
  const [failReason, setFailReason] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const pathTimeoutRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLeaderboard(JSON.parse(saved));
    
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) setClearedStats(JSON.parse(savedStats));

    const savedWallet = localStorage.getItem(WALLET_KEY);
    if (savedWallet) setWallet(parseInt(savedWallet, 10));
  }, []);

  const addToWallet = (amount: number) => {
    setWallet(prev => {
        const newVal = prev + amount;
        localStorage.setItem(WALLET_KEY, newVal.toString());
        return newVal;
    });
  };

  const updateStats = (type: string) => {
      setClearedStats(prev => {
          const newState = { ...prev, [type]: (prev[type] || 0) + 2 }; // +2 for the pair
          localStorage.setItem(STATS_KEY, JSON.stringify(newState));
          return newState;
      });
  };

  // Save Score to Leaderboard
  const saveScore = (finalScore: number, finalLevel: number) => {
    const newEntry: LeaderboardEntry = {
      name: `Player ${Math.floor(Math.random() * 1000)}`,
      score: finalScore,
      level: finalLevel,
      date: new Date().toLocaleDateString()
    };
    const newBoard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    setLeaderboard(newBoard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard));
  };

  // Start Level Logic
  const startLevel = useCallback((lvl: number) => {
    const config = getLevelConfig(lvl);
    const newGrid = generateLevel(config, lvl);
    setGrid(newGrid);
    setTimeLeft(config.timeSeconds);
    setGameState(GameState.PLAYING);
    setSelected(null);
    setPath([]);
    setCombo(0);
    setLastMatchTime(0);
    setFailReason('');
    
    setHints(prev => Math.min(5, prev + 1));
    setShuffles(prev => Math.min(3, prev + 1));
    setHintPair(null);
    
    const calculatedTarget = calculateCumulativeTargetScore(lvl);
    setTargetScore(calculatedTarget);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleLevelFail("Time's Up!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, timeLeft]); 

  // Handle Failure
  const handleLevelFail = (reason: string) => {
    const newLives = lives - 1;
    setLives(newLives);
    setFailReason(reason);

    setScore(s => s + 300); // Pity points

    if (newLives <= 0) {
      setGameState(GameState.GAME_OVER);
      addToWallet(score + 300); // Bank coins on game over
      saveScore(score, level);
    } else {
      setTimeout(() => {
        alert(`Level Failed: ${reason}\nLife Lost! (+300 Pity Points)`);
        startLevel(level);
      }, 100);
    }
  };

  const handleTileClick = (coord: Coordinate) => {
    if (gameState !== GameState.PLAYING) return;
    const { row, col } = coord;
    const tile = grid[row][col];

    if (tile.status === 'matched') return;

    // Deselect if same
    if (selected && selected.row === row && selected.col === col) {
      const newGrid = [...grid];
      newGrid[row][col] = { ...newGrid[row][col], status: 'active' };
      setGrid(newGrid);
      setSelected(null);
      return;
    }

    if (!selected) {
      const newGrid = [...grid];
      newGrid[row][col] = { ...newGrid[row][col], status: 'selected' };
      setGrid(newGrid);
      setSelected(coord);
      return;
    }

    // Check Match
    const prevTile = grid[selected.row][selected.col];
    if (prevTile.type !== tile.type) {
      const newGrid = [...grid];
      newGrid[selected.row][selected.col] = { ...newGrid[selected.row][selected.col], status: 'active' };
      newGrid[row][col] = { ...newGrid[row][col], status: 'selected' };
      setGrid(newGrid);
      setSelected(coord);
    } else {
      const foundPath = findConnectionPath(grid, selected, coord);
      if (foundPath) {
        handleMatch(selected, coord, foundPath);
      } else {
        const newGrid = [...grid];
        newGrid[selected.row][selected.col] = { ...newGrid[selected.row][selected.col], status: 'active' };
        newGrid[row][col] = { ...newGrid[row][col], status: 'selected' };
        setGrid(newGrid);
        setSelected(coord);
      }
    }
  };

  const handleMatch = (p1: Coordinate, p2: Coordinate, connectionPath: Coordinate[]) => {
    setPath(connectionPath);
    setHintPair(null);
    
    if (pathTimeoutRef.current) clearTimeout(pathTimeoutRef.current);
    pathTimeoutRef.current = window.setTimeout(() => setPath([]), 300);

    const type = grid[p1.row][p1.col].type;
    updateStats(type);

    const now = Date.now();
    let currentCombo = 0;
    if (now - lastMatchTime < COMBO_TIME_WINDOW_MS) {
      currentCombo = combo + 1;
    } else {
      currentCombo = 1; 
    }
    setCombo(currentCombo);
    setLastMatchTime(now);

    const multiplier = currentCombo >= 2 ? (1 + (currentCombo - 1) * 0.1) : 1;
    const matchPoints = Math.floor(BASE_SCORE * multiplier);
    
    setScore(s => s + matchPoints);

    const newGrid = [...grid];
    newGrid[p1.row][p1.col] = { ...newGrid[p1.row][p1.col], status: 'matched' };
    newGrid[p2.row][p2.col] = { ...newGrid[p2.row][p2.col], status: 'matched' };
    setGrid(newGrid);
    setSelected(null);

    const remaining = newGrid.flat().filter(t => t.status !== 'matched').length;
    if (remaining === 0) {
      checkWinCondition();
    }
  };

  const checkWinCondition = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const timeBonus = timeLeft * TIME_BONUS_PER_SEC;
    const potentialFinalScore = score + timeBonus;

    setScore(potentialFinalScore);

    if (potentialFinalScore >= targetScore) {
        if (level % 10 === 0 && lives < 5) {
          setLives(l => l + 1);
        }
        setGameState(GameState.LEVEL_COMPLETE);
    } else {
        handleLevelFail("Score Threshold Not Met");
    }
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    startLevel(nextLvl);
  };

  const quitToMenu = () => {
      addToWallet(score);
      saveScore(score, level);
      setGameState(GameState.MENU);
  };

  // Tools
  const handleHint = () => {
    if (hints <= 0 || hintPair) return;
    const match = findAvailableMatch(grid);
    if (match) {
      setHints(h => h - 1);
      setHintPair(match);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = window.setTimeout(() => setHintPair(null), 2000);
    }
  };

  const handleShuffle = () => {
    if (shuffles <= 0) return;
    setShuffles(s => s - 1);
    const newGrid = shuffleTiles(grid);
    setGrid(newGrid);
    setSelected(null);
    setHintPair(null);
  };

  // UI Components
  const renderLives = () => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Heart 
          key={i} 
          className={`w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm ${i < lives ? 'fill-rose-500 text-rose-600' : 'fill-slate-200 text-slate-300'}`} 
        />
      ))}
    </div>
  );

  const renderBagModal = () => {
      if (!showBag) return null;
      const statEntries = Object.entries(clearedStats).sort((a,b) => b[1] - a[1]);

      return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Backpack className="w-5 h-5 text-indigo-500"/> Inventory
                    </h3>
                    <button onClick={() => setShowBag(false)} className="p-1 hover:bg-slate-200 rounded-full">
                        <X className="w-6 h-6 text-slate-500"/>
                    </button>
                </div>
                
                {/* Wallet Section */}
                <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex flex-col items-center justify-center">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Wealth</div>
                    <div className="text-4xl font-black text-amber-500 flex items-center gap-2 drop-shadow-sm">
                        <Coins className="w-8 h-8 fill-amber-500 text-amber-600" />
                        {wallet.toLocaleString()}
                    </div>
                </div>

                {/* Collection Section */}
                <div className="p-4 overflow-y-auto grid grid-cols-4 gap-3 bg-white">
                    {statEntries.length === 0 ? (
                        <div className="col-span-4 text-center text-slate-400 py-8 flex flex-col items-center gap-2">
                            <Backpack className="w-8 h-8 opacity-20"/>
                            <span>Play to collect vehicles!</span>
                        </div>
                    ) : (
                        statEntries.map(([monId, count]) => (
                            <div key={monId} className="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 mb-1">
                                    <Monster id={monId} size={48} />
                                </div>
                                <div className="text-xs font-bold text-slate-500">x{count}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  };

  const renderLeaderboardModal = () => {
      if (!showLeaderboard) return null;
      return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500 fill-amber-500"/> Gold Leaderboard
                    </h3>
                    <button onClick={() => setShowLeaderboard(false)} className="p-1 hover:bg-slate-200 rounded-full">
                        <X className="w-6 h-6 text-slate-500"/>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-2">
                    {leaderboard.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">No records yet</div>
                    ) : (
                        leaderboard.map((entry, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                               <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                                {idx + 1}
                               </span>
                               <div className="flex flex-col">
                                   <span className="text-slate-700 font-bold text-sm">{entry.name}</span>
                                   <span className="text-slate-400 text-xs">Level {entry.level}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-600 font-black">
                                <Coins className="w-3 h-3 fill-amber-600" />
                                {entry.score}
                            </div>
                          </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      );
  };

  const renderMenu = () => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between py-8 animate-in fade-in duration-700 relative z-10">
        
        {/* Header: Wealth */}
        <div className="flex flex-col items-center gap-2 w-full mt-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] shadow-xl flex items-center justify-center mb-4 transform rotate-3 ring-4 ring-white/50">
                 <div className="text-5xl text-white">∞</div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                无穷∞连连看
            </h1>
            
            <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-md border border-indigo-100 flex items-center gap-2 mt-4">
                <Coins className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-slate-700 font-black text-xl">{wallet.toLocaleString()}</span>
            </div>
        </div>
        
        {/* Center: Play */}
        <div className="w-full px-8">
            <button 
                onClick={() => {
                setLevel(1);
                setScore(0);
                setLives(3);
                startLevel(1);
                }}
                className="w-full aspect-square max-w-[200px] bg-white hover:bg-slate-50 text-indigo-600 rounded-full flex flex-col items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 mx-auto ring-8 ring-indigo-50/50"
            >
                <Play className="w-16 h-16 fill-current ml-2" />
                <span className="text-lg font-black tracking-widest">START</span>
            </button>
        </div>

        {/* Bottom Bar */}
        <div className="w-full flex justify-between px-12 mb-4">
            {/* Leaderboard Button */}
            <button 
                onClick={() => setShowLeaderboard(true)}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform group-active:scale-95 text-slate-600">
                    <Trophy className="w-7 h-7 text-amber-500 fill-amber-100" />
                </div>
                <span className="text-xs font-bold text-slate-500">Rank</span>
            </button>

            {/* Bag Button */}
            <button 
                onClick={() => setShowBag(true)}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform group-active:scale-95 text-slate-600">
                    <Backpack className="w-7 h-7 text-indigo-500 fill-indigo-100" />
                </div>
                <span className="text-xs font-bold text-slate-500">Bag</span>
            </button>
        </div>
      </div>
    );
  };

  const renderGameOverlay = (title: string, subtitle: React.ReactNode, actions: React.ReactNode) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black text-slate-800 mb-2">{title}</h2>
        <div className="mb-8 text-slate-600">{subtitle}</div>
        <div className="space-y-3">
          {actions}
        </div>
      </div>
    </div>
  );

  const progressPercent = Math.min(100, (score / targetScore) * 100);
  const isGoalMet = score >= targetScore;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 overflow-hidden relative selection:bg-transparent">
      
      {/* Background Decor (Desktop) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-orange-50 pointer-events-none"></div>

      {/* Main Container - Constrained Width on Desktop */}
      <div className="flex-1 w-full h-full max-w-md bg-white/50 sm:bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[32px] sm:my-4 sm:border sm:border-slate-200">
        
        {renderBagModal()}
        {renderLeaderboardModal()}

        {gameState === GameState.MENU && renderMenu()}
        
        {gameState === GameState.PLAYING && (
            <div className="flex flex-col h-full relative z-10">
            
            {/* Header / Top Bar */}
            <div className="flex-none px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center z-50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wider">
                        Level {level}
                    </div>
                </div>
                <h1 className="text-sm font-bold text-slate-800 absolute left-1/2 -translate-x-1/2 hidden sm:block">无穷∞连连看</h1>
                <div className="flex items-center gap-2">
                    {renderLives()}
                    <button onClick={() => setGameState(GameState.MENU)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <Pause className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Game Content Wrapper */}
            <div className="flex-1 flex flex-col p-3 overflow-hidden gap-3">
                
                {/* HUD: Score & Timer */}
                <div className="w-full grid grid-cols-3 gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-100 relative overflow-hidden flex-none">
                    
                    <div className="flex flex-col justify-center pl-2">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</div>
                        <div className={`text-xl sm:text-2xl font-black leading-none ${isGoalMet ? 'text-green-600' : 'text-slate-700'}`}>
                            {score}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            Target: {targetScore} {isGoalMet && <span className="text-green-500">✓</span>}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center relative">
                        <div className="h-8 flex items-center justify-center">
                        {combo >= 2 ? (
                        <div className="animate-in zoom-in duration-300">
                            <div className="border border-orange-200 bg-orange-50 px-3 py-1 rounded-full shadow-sm flame-border">
                                <div className="text-lg font-black text-orange-500 flex items-center gap-1">
                                <Zap className="w-4 h-4 fill-orange-500" /> {combo}
                                </div>
                            </div>
                        </div>
                        ) : (
                            <div className="text-slate-300 font-bold text-xs tracking-widest mt-1">COMBO</div>
                        )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end justify-center pr-2">
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</div>
                        <div className={`text-2xl sm:text-3xl font-black tabular-nums flex items-center gap-1 ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                            {timeLeft}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        <div 
                            className={`h-full transition-all duration-500 ${isGoalMet ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Board */}
                <div className="flex-1 w-full flex items-center justify-center min-h-0 relative rounded-2xl overflow-hidden bg-slate-50/50 border border-slate-200/50">
                    <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-2">
                         <Board 
                            grid={grid} 
                            onTileClick={handleTileClick} 
                            path={path} 
                            hintPair={hintPair}
                        />
                    </div>
                </div>

                {/* Bottom Tools */}
                <div className="w-full flex justify-between items-center gap-2 flex-none">
                    <button 
                        onClick={() => setShowBag(true)}
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm active:scale-95"
                    >
                        <Backpack className="w-6 h-6" />
                    </button>

                    <div className="flex gap-4">
                        <button 
                        onClick={handleShuffle}
                        disabled={shuffles <= 0}
                        className={`flex flex-col items-center gap-1 p-2 w-16 rounded-xl border transition-all shadow-sm active:scale-95 ${shuffles > 0 ? 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100' : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'}`}
                        >
                        <Shuffle className="w-5 h-5" />
                        <span className="text-xl sm:text-2xl font-black">{shuffles}</span>
                        </button>

                        <button 
                        onClick={handleHint}
                        disabled={hints <= 0}
                        className={`flex flex-col items-center gap-1 p-2 w-16 rounded-xl border transition-all shadow-sm active:scale-95 ${hints > 0 ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'}`}
                        >
                        <Lightbulb className="w-5 h-5" />
                        <span className="text-xl sm:text-2xl font-black">{hints}</span>
                        </button>
                    </div>

                    <button 
                        onClick={quitToMenu}
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm active:scale-95"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>
            </div>
        )}

        {/* Modals */}
        {gameState === GameState.LEVEL_COMPLETE && renderGameOverlay(
            `Level ${level} Cleared!`,
            <div className="space-y-2">
                <div className="text-5xl mb-4 animate-bounce">🎉</div>
                <div className="text-lg">Score: <span className="font-bold text-slate-800">{score}</span></div>
                {level % 10 === 0 && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        <Heart className="w-4 h-4 fill-current"/> Cycle Complete: +1 Life
                    </div>
                )}
            </div>,
            <>
                <button 
                    onClick={nextLevel}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
                >
                    Next Level <Play className="w-5 h-5 fill-current" />
                </button>
                <button 
                    onClick={quitToMenu}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl active:scale-95 transition-transform"
                >
                    Main Menu
                </button>
            </>
        )}

        {gameState === GameState.GAME_OVER && renderGameOverlay(
            "Game Over",
            <div className="space-y-2">
                <div className="text-5xl mb-4 text-slate-300"><Skull className="w-16 h-16 mx-auto"/></div>
                <p className="text-rose-500 font-bold">Out of Lives</p>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-sm text-slate-500">Collected</span>
                    <div className="text-xl font-black text-amber-500 flex items-center gap-1">
                        <Coins className="w-5 h-5 fill-current" /> {score}
                    </div>
                </div>
            </div>,
            <button 
                onClick={quitToMenu}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
                <RotateCcw className="w-5 h-5" /> Try Again
            </button>
        )}
      </div>
    </div>
  );
}
