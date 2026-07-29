import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Boutique from '../components/Boutique';

// Generic Sudoku helper functions
function isValid(grid, r, c, val, rowsPerBlock, colsPerBlock, size) {
  // Check row
  for (let col = 0; col < size; col++) {
    if (col !== c && grid[r][col] === val) return false;
  }
  // Check col
  for (let row = 0; row < size; row++) {
    if (row !== r && grid[row][c] === val) return false;
  }
  // Check block
  const blockRowStart = Math.floor(r / rowsPerBlock) * rowsPerBlock;
  const blockColStart = Math.floor(c / colsPerBlock) * colsPerBlock;
  for (let row = blockRowStart; row < blockRowStart + rowsPerBlock; row++) {
    for (let col = blockColStart; col < blockColStart + colsPerBlock; col++) {
      if ((row !== r || col !== c) && grid[row][col] === val) return false;
    }
  }
  return true;
}

function solveSudokuGeneric(grid, rowsPerBlock, colsPerBlock, size) {
  let solutionsCount = 0;
  let singleSolution = null;

  function backtrack(index) {
    if (index === size * size) {
      solutionsCount++;
      if (solutionsCount === 1) {
        singleSolution = grid.map(row => [...row]);
      }
      return solutionsCount >= 2; // stop if we have 2 or more solutions
    }

    const r = Math.floor(index / size);
    const c = index % size;

    if (grid[r][c] !== 0) {
      return backtrack(index + 1);
    }

    for (let val = 1; val <= size; val++) {
      if (isValid(grid, r, c, val, rowsPerBlock, colsPerBlock, size)) {
        grid[r][c] = val;
        if (backtrack(index + 1)) {
          return true;
        }
        grid[r][c] = 0;
      }
    }
    return false;
  }

  backtrack(0);
  return { count: solutionsCount, solution: singleSolution };
}

function generateFullBoard(rowsPerBlock, colsPerBlock, size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  function fillGrid(index) {
    if (index === size * size) return true;

    const r = Math.floor(index / size);
    const c = index % size;

    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    for (let val of numbers) {
      if (isValid(grid, r, c, val, rowsPerBlock, colsPerBlock, size)) {
        grid[r][c] = val;
        if (fillGrid(index + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  fillGrid(0);
  return grid;
}

function generatePuzzle(rowsPerBlock, colsPerBlock, size, targetClues) {
  const solution = generateFullBoard(rowsPerBlock, colsPerBlock, size);
  const grid = solution.map(row => [...row]);

  const positions = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const cellsCount = size * size;
  let removed = 0;
  const targetRemoved = cellsCount - targetClues;

  for (let [r, c] of positions) {
    if (removed >= targetRemoved) break;

    const temp = grid[r][c];
    grid[r][c] = 0;

    const gridCopy = grid.map(row => [...row]);
    const { count } = solveSudokuGeneric(gridCopy, rowsPerBlock, colsPerBlock, size);

    if (count === 1) {
      removed++;
    } else {
      grid[r][c] = temp;
    }
  }

  const board = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push({
        r, c,
        value: grid[r][c],
        solution: solution[r][c],
        isOriginal: grid[r][c] !== 0,
        notes: []
      });
    }
    board.push(row);
  }

  return board;
}


const THEMES = {
  classic: {
    id: 'classic',
    name: 'Classique',
    price: 0,
    icon: '📝',
    bgClass: 'sudoku-classic-bg',
    panelBg: 'rgba(255, 255, 255, 0.9)',
    panelText: '#1e293b',
    gridBg: '#ffffff',
    cellBg: '#f8fafc',
    borderThick: '3px solid #1e293b',
    borderThin: '1px solid #cbd5e1',
    selBg: 'rgba(59, 130, 246, 0.3)',
    sameBg: 'rgba(59, 130, 246, 0.15)',
    sameOutline: 'inset 0 0 0 2px rgba(59, 130, 246, 0.5)',
    highEmptyBg: 'rgba(203, 213, 225, 0.3)',
    highDigitBg: 'rgba(203, 213, 225, 0.6)',
    completedBg: 'rgba(16, 185, 129, 0.15)',
    completedOutline: 'inset 0 0 0 1px rgba(16, 185, 129, 0.5)',
    textOriginal: '#0f172a',
    textPlayer: '#2563eb',
    textError: '#dc2626',
    textShadow: 'none',
    keypadNormalBorder: '2px solid #3b82f6',
    keypadNormalBg: '#ffffff',
    keypadNormalText: '#2563eb',
    keypadNormalShadow: '0 4px 10px rgba(59, 130, 246, 0.15)',
    keypadDisabledBorder: '2px solid #cbd5e1',
    keypadDisabledBg: '#f1f5f9',
    keypadDisabledText: '#94a3b8',
    particleColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  },
  neon: {
    id: 'neon',
    name: 'Néon Zen',
    price: 1500,
    icon: '🌌',
    bgClass: 'sudoku-zen-bg',
    panelBg: 'rgba(15, 23, 42, 0.65)',
    panelText: '#ffffff',
    gridBg: '#0f172a',
    cellBg: '#1e293b',
    borderThick: '3px solid #7c3aed',
    borderThin: '1px solid rgba(139, 92, 246, 0.15)',
    selBg: 'rgba(139, 92, 246, 0.45)',
    sameBg: 'rgba(139, 92, 246, 0.3)',
    sameOutline: 'inset 0 0 0 2px rgba(167, 139, 250, 0.8)',
    highEmptyBg: 'rgba(13, 148, 136, 0.08)',
    highDigitBg: 'rgba(139, 92, 246, 0.2)',
    completedBg: 'rgba(16, 185, 129, 0.12)',
    completedOutline: 'inset 0 0 0 1px rgba(16, 185, 129, 0.4)',
    textOriginal: '#f8fafc',
    textPlayer: '#c084fc',
    textError: '#f87171',
    textShadow: '0 0 8px rgba(248, 113, 113, 0.6)',
    keypadNormalBorder: '2px solid #8b5cf6',
    keypadNormalBg: 'rgba(30, 41, 59, 0.8)',
    keypadNormalText: '#a78bfa',
    keypadNormalShadow: '0 4px 10px rgba(139, 92, 246, 0.15)',
    keypadDisabledBorder: '2px solid #334155',
    keypadDisabledBg: 'rgba(15, 23, 42, 0.3)',
    keypadDisabledText: '#475569',
    particleColors: ['#a78bfa', '#8b5cf6', '#60a5fa', '#34d399', '#fbbf24']
  },
  wood: {
    id: 'wood',
    name: 'Bois Précieux',
    price: 3000,
    icon: '🪵',
    bgClass: 'sudoku-wood-bg',
    panelBg: 'rgba(93, 64, 55, 0.85)',
    panelText: '#efebe9',
    gridBg: '#4e342e', 
    cellBg: '#d7ccc8', 
    borderThick: '3px solid #3e2723', 
    borderThin: '1px solid #a1887f',
    selBg: 'rgba(141, 110, 99, 0.6)',
    sameBg: 'rgba(141, 110, 99, 0.4)',
    sameOutline: 'inset 0 0 0 2px #5d4037',
    highEmptyBg: 'rgba(239, 235, 233, 0.3)',
    highDigitBg: 'rgba(161, 136, 127, 0.5)',
    completedBg: 'rgba(56, 142, 60, 0.25)',
    completedOutline: 'inset 0 0 0 1px #2e7d32',
    textOriginal: '#212121',
    textPlayer: '#3e2723', 
    textError: '#b71c1c',
    textShadow: 'none',
    keypadNormalBorder: '2px solid #5d4037',
    keypadNormalBg: '#d7ccc8',
    keypadNormalText: '#3e2723',
    keypadNormalShadow: '0 4px 10px rgba(62, 39, 35, 0.3)',
    keypadDisabledBorder: '2px solid #8d6e63',
    keypadDisabledBg: '#a1887f',
    keypadDisabledText: '#5d4037',
    particleColors: ['#5d4037', '#8d6e63', '#a1887f', '#388e3c', '#ffb300']
  },
  colorful: {
    id: 'colorful',
    name: 'Arc-en-ciel',
    price: 5000,
    icon: '🎨',
    bgClass: 'sudoku-colorful-bg',
    panelBg: 'rgba(255, 255, 255, 0.95)',
    panelText: '#2d3436',
    gridBg: '#fef0f5',
    cellBg: '#ffffff', 
    borderThick: '3px solid #ff9ff3', 
    borderThin: '1px solid #feca57', 
    selBg: 'rgba(84, 160, 255, 0.3)', 
    sameBg: 'rgba(84, 160, 255, 0.15)',
    sameOutline: 'inset 0 0 0 2px #54a0ff',
    highEmptyBg: 'rgba(200, 214, 229, 0.3)', 
    highDigitBg: 'rgba(200, 214, 229, 0.6)', 
    completedBg: 'rgba(29, 209, 161, 0.15)', 
    completedOutline: 'inset 0 0 0 1px #1dd1a1',
    textOriginal: '#5f27cd', 
    textPlayer: '#ff6b6b', 
    textError: '#ee5253', 
    textShadow: 'none',
    keypadNormalBorder: '2px solid #ff9ff3',
    keypadNormalBg: '#ffffff',
    keypadNormalText: '#ff6b6b',
    keypadNormalShadow: '0 4px 10px rgba(255, 159, 243, 0.2)',
    keypadDisabledBorder: '2px solid #c8d6e5',
    keypadDisabledBg: '#f6f8fa',
    keypadDisabledText: '#8395a7',
    particleColors: ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1']
  }
};

export default function Sudoku({ onBack, onScoreSave, isIntermission, onIntermissionComplete, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [difficulty, setDifficulty] = useState('facile'); // 'facile' | 'moyen' | 'difficile'

  const [showStore, setShowStore] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem('retrovision_sudoku_theme') || 'classic';
  });
  
  const currentTheme = THEMES[activeThemeId] || THEMES['classic'];

  const handleSelectTheme = (themeId) => {
    setActiveThemeId(themeId);
    localStorage.setItem('retrovision_sudoku_theme', themeId);
    sound.playClick();
    setShowStore(false);
  };


  // Game parameters
  const [gridSize, setGridSize] = useState(4); // 4, 6, 9
  const [rowsPerBlock, setRowsPerBlock] = useState(2);
  const [colsPerBlock, setColsPerBlock] = useState(2);

  // Board states
  const [board, setBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [victory, setVictory] = useState(false);
  const [history, setHistory] = useState([]); // for undo
  const [animatedCell, setAnimatedCell] = useState(null); // { r, c, ts }
  const [hoveredCell, setHoveredCell] = useState(null); // { r, c }
  const [easiestCell, setEasiestCell] = useState(null); // { r, c }

  // Calculate easiest cell whenever board changes
  useEffect(() => {
    if (gameState !== 'playing' || victory || board.length === 0) {
      setEasiestCell(null);
      return;
    }
    
    const numberGrid = board.map(row => row.map(cell => cell.value));
    let minCandidates = 10;
    let bestCell = null;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (board[r][c].value === 0) {
          let candidatesCount = 0;
          for (let val = 1; val <= gridSize; val++) {
            if (isValid(numberGrid, r, c, val, rowsPerBlock, colsPerBlock, gridSize)) {
              candidatesCount++;
            }
          }
          if (candidatesCount < minCandidates) {
            minCandidates = candidatesCount;
            bestCell = { r, c };
          }
        }
      }
    }
    setEasiestCell(bestCell);
  }, [board, gameState, victory, gridSize, rowsPerBlock, colsPerBlock]);

  // Timer states
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isIntermission && gameState === 'menu') {
      // In intermission mode, we bypass menu and start easy 4x4 immediately
      setTimeout(() => startGame('facile'), 100);
    }
  }, [isIntermission, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !victory) {
      timerRef.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, victory]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && !victory) {
      if (window.confirm("Voulez-vous vraiment quitter la partie de Sudoku en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const startGame = (diff) => {
    sound.playClick();
    setDifficulty(diff);
    setMistakes(0);
    setHintsLeft(diff === 'facile' ? 1 : diff === 'moyen' ? 2 : 3);
    setVictory(false);
    setTime(0);
    setHistory([]);
    setSelectedCell(null);
    setNoteMode(false);

    let size = 4;
    let rBlock = 2;
    let cBlock = 2;
    let clues = 6;

    if (diff === 'moyen') {
      size = 6;
      rBlock = 2;
      cBlock = 3;
      clues = 16;
    } else if (diff === 'difficile') {
      size = 9;
      rBlock = 3;
      cBlock = 3;
      clues = 30;
    }

    setGridSize(size);
    setRowsPerBlock(rBlock);
    setColsPerBlock(cBlock);

    const generated = generatePuzzle(rBlock, cBlock, size, clues);
    setBoard(generated);
    setGameState('playing');
    sound.startBGM();
  };

  const selectCell = (r, c) => {
    if (victory) return;
    const cell = board[r][c];
    if (cell.isOriginal) {
      setSelectedCell({ r, c });
      sound.playClick();
      return;
    }
    setSelectedCell({ r, c });
    sound.playClick();
  };

  const saveHistory = (newBoard) => {
    setHistory(prev => [...prev, board.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })))]);
  };

  const handleNumberInput = (num) => {
    let target = selectedCell;
    if (!target) target = easiestCell;
    if (!target || victory) return;
    const { r, c } = target;
    const cell = board[r][c];

    if (cell.isOriginal) return;

    saveHistory();

    const newBoard = board.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
    const targetCell = newBoard[r][c];
    const wasEmpty = cell.value === 0;

    if (noteMode) {
      // Toggle note
      if (targetCell.value !== 0) {
        // clear value if note is toggled
        targetCell.value = 0;
      }
      if (targetCell.notes.includes(num)) {
        targetCell.notes = targetCell.notes.filter(n => n !== num);
      } else {
        targetCell.notes.push(num);
      }
      sound.playBallDrop();
    } else {
      // Set value
      targetCell.notes = []; // Clear notes
      if (targetCell.value === num) {
        targetCell.value = 0; // Toggle off if clicked same number
        sound.playClick();
      } else {
        targetCell.value = num;
        // Verify correctness
        if (num !== targetCell.solution) {
          sound.playShake();
          setMistakes(m => m + 1);
        } else {
          if (wasEmpty) {
            // Trigger pop animation, particle burst, and play the addictive sound effect!
            setAnimatedCell({ r, c, ts: Date.now() });
            sound.playSudokuSuccess();
          } else {
            sound.playTubeComplete();
          }
        }
      }
    }

    setBoard(newBoard);
    checkWin(newBoard);
    setSelectedCell(null);
  };

  const handleErase = () => {
    let target = selectedCell;
    if (!target) target = easiestCell;
    if (!target || victory) return;
    const { r, c } = target;
    const cell = board[r][c];
    if (cell.isOriginal) return;

    saveHistory();

    const newBoard = board.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
    newBoard[r][c].value = 0;
    newBoard[r][c].notes = [];

    sound.playClick();
    setBoard(newBoard);
  };

  const handleUndo = () => {
    if (history.length === 0 || victory) return;
    sound.playClick();
    const prevBoard = history[history.length - 1];
    setBoard(prevBoard);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleHint = () => {
    if (hintsLeft <= 0 || victory) return;

    // Find all empty cells or incorrect cells
    const targetCells = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = board[r][c];
        if (!cell.isOriginal && cell.value !== cell.solution) {
          targetCells.push({ r, c, solution: cell.solution });
        }
      }
    }

    if (targetCells.length === 0) return; // All correct

    sound.playPowerup();
    const randomCell = targetCells[Math.floor(Math.random() * targetCells.length)];

    saveHistory();

    const newBoard = board.map(row => row.map(cell => ({ ...cell, notes: [...cell.notes] })));
    newBoard[randomCell.r][randomCell.c].value = randomCell.solution;
    newBoard[randomCell.r][randomCell.c].notes = [];

    setBoard(newBoard);
    setSelectedCell({ r: randomCell.r, c: randomCell.c });
    setHintsLeft(h => h - 1);

    checkWin(newBoard);
  };

  const checkWin = (currentBoard) => {
    // A board is won if all cells match their solution
    let solved = true;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (currentBoard[r][c].value !== currentBoard[r][c].solution) {
          solved = false;
          break;
        }
      }
    }

    if (solved) {
      handleVictory();
    }
  };

  const handleVictory = () => {
    sound.stopBGM();
    setVictory(true);
    sound.playScore();

    if (isIntermission && onIntermissionComplete) {
      setTimeout(() => {
        onIntermissionComplete();
      }, 2000);
    } else if (onScoreSave) {
      // Calculate high score based on difficulty and efficiency
      const difficultyMultiplier = gridSize === 4 ? 1 : gridSize === 6 ? 3 : 10;
      const basePoints = 500 * difficultyMultiplier;
      const timePenalty = Math.min(time * 2, basePoints * 0.5);
      const mistakePenalty = Math.min(mistakes * 50, basePoints * 0.3);
      const finalScore = Math.max(basePoints - timePenalty - mistakePenalty, 100);

      setTimeout(() => {
        onScoreSave('Sudoku', Math.round(finalScore));

      }, 1500);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Crosshighlighting check
  const isHighlighted = (r, c) => {
    const activeCell = hoveredCell || selectedCell || easiestCell; // Hover takes priority, but selection stays locked
    if (!activeCell) return false;
    const { r: selR, c: selC } = activeCell;
    if (r === selR || c === selC) return true;

    const blockRowStart = Math.floor(selR / rowsPerBlock) * rowsPerBlock;
    const blockColStart = Math.floor(selC / colsPerBlock) * colsPerBlock;
    if (r >= blockRowStart && r < blockRowStart + rowsPerBlock &&
      c >= blockColStart && c < blockColStart + colsPerBlock) {
      return true;
    }
    return false;
  };

  // Same number highlighting check
  const isSameNumber = (r, c) => {
    const activeCell = hoveredCell || selectedCell || easiestCell; // Hover takes priority, but selection stays locked
    if (!activeCell) return false;
    const { r: selR, c: selC } = activeCell;
    const selVal = board[selR][selC].value;
    if (selVal === 0) return false;
    return board[r][c].value === selVal;
  };

  // Determine if helper prompt should be shown
  const showEmptyCellPrompt = selectedCell && board[selectedCell.r] && board[selectedCell.r][selectedCell.c] && board[selectedCell.r][selectedCell.c].value === 0;

  const unfocusedStyle = showEmptyCellPrompt 
    ? { filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', transition: 'all 0.3s ease' } 
    : { filter: 'blur(0px)', opacity: 1, transition: 'all 0.3s ease' };

  return (
    <>
      {/* Zen Background with Glowing Orbs */}
      <div className={currentTheme.bgClass}>
        <div className="sudoku-zen-orb sudoku-zen-orb-1"></div>
        <div className="sudoku-zen-orb sudoku-zen-orb-2"></div>
      </div>

      {showIntro && !isIntermission && (
        <GameIntro
          gameName="SUDOKU"
          icon="🔢"
          colors={['#8b5cf6', '#6366f1', '#a78bfa']}
          particleType="bubbles"
          onComplete={() => setShowIntro(false)}
        />
      )}

      {isIntermission && gameState === 'playing' && (
        <div className="entract-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: '8px', marginBottom: '10px' }}>
          <div className="entract-header-text">
            Entracte ! Complétez ce Sudoku pour retourner au jeu principal.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onIntermissionRequest && (
              <button onClick={() => onIntermissionRequest()} className="entract-header-btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                🎲 Autre jeu
              </button>
            )}
            <button
              onClick={() => { if (onIntermissionComplete) onIntermissionComplete(false); }}
              className="entract-header-btn"
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
            >
              Passer l'entracte ⏭
            </button>
          </div>
        </div>
      )}

      
        {/* Store Modal */}
        {showStore && (
          <Boutique
            title="BOUTIQUE SUDOKU"
            icon="🔢"
            categories={[
              {
                id: 'theme',
                name: 'Thèmes Visuels',
                icon: '🎨',
                items: Object.values(THEMES).map(t => ({
                  id: t.id,
                  name: t.name,
                  icon: t.icon
                }))
              }
            ]}
            currentSelections={{ theme: activeThemeId }}
            onSelect={(_, themeId) => handleSelectTheme(themeId)}
            onClose={() => setShowStore(false)}
          />
        )}

      <div style={containerStyle}>
        {!isIntermission && (
          <div style={unfocusedStyle}>
            <GameHeader
              title="SUDOKU"
              onBack={handleBackWithConfirm}
              onRestart={gameState === 'playing' && !victory ? () => setGameState('menu') : undefined}
              onShop={() => { sound.playClick(); setShowStore(true); }}
              showBgmToggle={false}
              centerContent={
                gameState === 'playing' ? (
                  <div style={timeCounterStyle}>
                    ⏱️ {formatTime(time)}
                  </div>
                ) : null
              }
            />
          </div>
        )}

        {gameState === 'menu' && (
          <div style={menuStyle}>
            <div style={{ fontSize: '5.5rem', marginBottom: '15px', filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))' }}>🔢</div>
            <h2 style={menuTitleStyle}>Entraînement Sudoku Zen</h2>
            <p style={menuSubtitleStyle}>Stimulez votre mémoire de travail et votre logique visuelle.</p>

            
            <div style={btnGroupStyle}>
              <button
                onClick={() => startGame('facile')}
                className="retro-btn pulse-glow"
                style={{ ...menuBtnStyle, borderColor: '#a78bfa', color: '#a78bfa', background: 'rgba(139, 92, 246, 0.1)' }}
              >
                Facile (Plateau 4x4)
              </button>
              <button
                onClick={() => startGame('moyen')}
                className="retro-btn"
                style={{ ...menuBtnStyle, borderColor: '#0d9488', color: '#0d9488', background: 'rgba(13, 148, 136, 0.1)' }}
              >
                Moyen (Plateau 6x6)
              </button>
              <button
                onClick={() => startGame('difficile')}
                className="retro-btn"
                style={{ ...menuBtnStyle, borderColor: '#f43f5e', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}
              >
                Classique (Plateau 9x9)
              </button>
            </div>

            <div style={helpCardStyle}>
              <strong>Règles :</strong> Chaque ligne, colonne et rectangle doit contenir tous les chiffres sans doublon. Les erreurs s'affichent en rouge.
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div style={gameplayContainerStyle}>
            <div style={{ ...statsRowStyle, ...unfocusedStyle }}>
              <div style={statBoxStyle}>
                Mode : <span style={{ textTransform: 'capitalize', fontWeight: '800', color: '#a78bfa' }}>{difficulty}</span>
              </div>
              <div style={statBoxStyle}>
                ⚠️ Erreurs : <span style={{ fontWeight: '800', color: mistakes > 0 ? '#f87171' : 'inherit' }}>{mistakes}</span>
              </div>
              <div style={statBoxStyle}>
                💡 Indices : <span style={{ fontWeight: '800' }}>{hintsLeft}</span>
              </div>
            </div>

            {/* Sudoku Grid */}
            <div className="sudokuGrid" style={{ ...boardWrapperStyle, maxWidth: gridSize === 4 ? '300px' : gridSize === 6 ? '380px' : '440px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: '100%',
                aspectRatio: '1/1',
                backgroundColor: currentTheme.gridBg,
                border: currentTheme.borderThick,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.3)'
              }}>
                {board.map((row, r) => row.map((cell, c) => {
                  const isSel = selectedCell && selectedCell.r === r && selectedCell.c === c;
                  const isHigh = isHighlighted(r, c);
                  const isSame = isSameNumber(r, c);
                  const hasError = cell.value !== 0 && cell.value !== cell.solution;
                  const isAnimated = animatedCell && animatedCell.r === r && animatedCell.c === c;

                  // Check if the current cell's number is fully completed on the board
                  let isCompletedNum = false;
                  if (cell.value !== 0 && !hasError) {
                    let count = 0;
                    for (let tr = 0; tr < gridSize; tr++) {
                      for (let tc = 0; tc < gridSize; tc++) {
                        if (board[tr][tc].value === cell.value && board[tr][tc].solution === cell.value) {
                          count++;
                        }
                      }
                    }
                    if (count === gridSize) isCompletedNum = true;
                  }

                  // Dynamic borders based on grid configuration
                  let borderRight = currentTheme.borderThin;
                  let borderBottom = currentTheme.borderThin;

                  // Thicker boundaries between subgrids
                  if ((c + 1) % colsPerBlock === 0 && c < gridSize - 1) {
                    borderRight = currentTheme.borderThick;
                  }
                  if ((r + 1) % rowsPerBlock === 0 && r < gridSize - 1) {
                    borderBottom = currentTheme.borderThick;
                  }

                  // Background coloring based on state
                  let bgColor = currentTheme.cellBg;
                  let cellBoxShadow = 'none';

                  const activeCell = hoveredCell || selectedCell; // Persist highlight if cell is selected
                  const isActiveCellEmpty = activeCell && board[activeCell.r] && board[activeCell.r][activeCell.c] && board[activeCell.r][activeCell.c].value === 0;

                  if (isSel) {
                    bgColor = currentTheme.selBg;
                  } else if (isSame) {
                    bgColor = currentTheme.sameBg;
                    // Strong outline for identical numbers to match user request
                    cellBoxShadow = currentTheme.sameOutline;
                  } else if (isHigh) {
                    if (isActiveCellEmpty) {
                      // Empty cell highlight: less visible, subtle cool teal tint at 8% opacity
                      bgColor = currentTheme.highEmptyBg;
                    } else {
                      // Digit cell highlight: clearly visible vibrant violet at 20% opacity
                      bgColor = currentTheme.highDigitBg;
                    }
                  } else if (isCompletedNum) {
                    // Highlight for completely filled numbers (emerald success glow)
                    bgColor = currentTheme.completedBg;
                    cellBoxShadow = currentTheme.completedOutline;
                  }
                  
                  const isEasiest = easiestCell && easiestCell.r === r && easiestCell.c === c;
                  if (isEasiest && !isSel) {
                     cellBoxShadow = 'inset 0 0 15px rgba(234, 179, 8, 0.6)';
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={isEasiest ? 'easiest-cell-pulse' : isAnimated ? 'sudoku-cell-hint-shake' : ''}
                      onClick={() => selectCell(r, c)}
                      onMouseEnter={() => setHoveredCell({ r, c })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        aspectRatio: '1/1',
                        borderRight,
                        borderBottom,
                        backgroundColor: bgColor,
                        boxShadow: cellBoxShadow,
                        position: 'relative',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isAnimated && (
                        <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
                          {Array.from({ length: 8 }).map((_, i) => {
                            const angle = (i * Math.PI) / 4;
                            const distance = 20 + Math.random() * 15;
                            const dx = `${Math.cos(angle) * distance}px`;
                            const dy = `${Math.sin(angle) * distance}px`;
                            const colors = currentTheme.particleColors;
                            const randomColor = colors[i % colors.length];
                            return (
                              <div
                                key={i}
                                className="sudoku-cell-particle"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  backgroundColor: randomColor,
                                  boxShadow: `0 0 6px ${randomColor}`,
                                  '--dx': dx,
                                  '--dy': dy
                                }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {cell.value !== 0 ? (
                        <span
                          key={isAnimated ? animatedCell.ts : 'static'}
                          className={isAnimated ? 'digit-pop-bounce' : ''}
                          style={{
                            fontSize: gridSize === 9 ? '20px' : gridSize === 6 ? '24px' : '28px',
                            fontWeight: '800',
                            color: hasError
                              ? currentTheme.textError
                              : cell.isOriginal
                                ? currentTheme.textOriginal
                                : currentTheme.textPlayer,
                            textShadow: hasError ? currentTheme.textShadow : 'none',
                            display: 'inline-block'
                          }}
                        >
                          {cell.value}
                        </span>
                      ) : (
                        /* Pencil Draft Mode */
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: gridSize === 9 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                          gridTemplateRows: gridSize === 9 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                          width: '100%',
                          height: '100%',
                          padding: '4px',
                          boxSizing: 'border-box'
                        }}>
                          {Array.from({ length: gridSize }, (_, i) => i + 1).map(n => (
                            <div key={n} style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              fontSize: gridSize === 9 ? '9px' : '11px',
                              fontWeight: '700',
                              color: '#64748b',
                              visibility: cell.notes.includes(n) ? 'visible' : 'hidden'
                            }}>
                              {n}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Helper text display for empty cell */}
            {showEmptyCellPrompt && (
              <div className="sudoku-helper-text">
                <span>🎯</span> Sélectionnez un chiffre ci-dessous pour remplir la case
              </div>
            )}

            {/* Input Keypad */}
            <div className={`sudoku_choices ${showEmptyCellPrompt ? 'sudoku-choices-glow' : ''}`} style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize <= 6 ? gridSize : 5}, 1fr)`,
              gap: '10px',
              width: '100%',
              maxWidth: '380px',
              marginTop: '5px',
              marginBottom: '15px',
              padding: '8px',
              boxSizing: 'border-box'
            }}>
              {Array.from({ length: gridSize }, (_, i) => i + 1).map(num => {
                // Check if all of this number is correctly filled
                let complete = true;
                let count = 0;
                for (let r = 0; r < gridSize; r++) {
                  for (let c = 0; c < gridSize; c++) {
                    if (board[r][c].value === num && board[r][c].solution === num) {
                      count++;
                    }
                  }
                }
                if (count < gridSize) complete = false;

                return (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    disabled={complete}
                    className="sudoku-choice-btn"
                    style={{
                      height: '50px',
                      borderRadius: '14px',
                      border: complete ? currentTheme.keypadDisabledBorder : currentTheme.keypadNormalBorder,
                      background: complete ? currentTheme.keypadDisabledBg : currentTheme.keypadNormalBg,
                      color: complete ? currentTheme.keypadDisabledText : currentTheme.keypadNormalText,
                      fontSize: '22px',
                      fontWeight: '800',
                      cursor: complete ? 'not-allowed' : 'pointer',
                      boxShadow: complete ? 'none' : currentTheme.keypadNormalShadow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Sudoku Controls (Pencil, Erase, Undo, Hint) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', width: '100%', maxWidth: '380px', marginBottom: '5px' }}>
              <button
                onClick={() => setSelectedCell(null)}
                className="retro-btn"
                style={{
                  ...actionBtnStyle,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#f8fafc',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                }}
              >
                ✖️ Désélect
              </button>
              <button
                onClick={() => { sound.playClick(); setNoteMode(!noteMode); }}
                className={`retro-btn ${noteMode ? 'pulse-glow' : ''}`}
                style={{
                  ...actionBtnStyle,
                  borderColor: noteMode ? '#a78bfa' : 'rgba(139, 92, 246, 0.3)',
                  color: noteMode ? '#a78bfa' : '#f8fafc',
                  backgroundColor: noteMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                }}
              >
                ✏️ {noteMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={handleErase}
                disabled={!selectedCell || (selectedCell && board[selectedCell.r][selectedCell.c].isOriginal)}
                className="retro-btn"
                style={{
                  ...actionBtnStyle,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#f8fafc',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                }}
              >
                🧹 Effacer
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="retro-btn"
                style={{
                  ...actionBtnStyle,
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  color: '#f8fafc',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                }}
              >
                ↩️ Annuler
              </button>
              <button
                onClick={handleHint}
                disabled={hintsLeft <= 0}
                className="retro-btn"
                style={{
                  ...actionBtnStyle,
                  borderColor: hintsLeft > 0 ? '#0d9488' : 'rgba(139, 92, 246, 0.15)',
                  color: hintsLeft > 0 ? '#0d9488' : '#64748b',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)'
                }}
              >
                💡 ({hintsLeft})
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {victory && !isIntermission && (
          <div style={overlayStyle}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px',
                  width: '10px', height: '10px', background: ['#8b5cf6', '#0d9488', '#e11d48'][i % 3],
                  borderRadius: '50%', animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                  opacity: 0.8
                }} />
              ))}
            </div>

            <div style={victoryCardStyle}>
              <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🏆</div>
              <h2 style={{ fontSize: '2.4rem', color: '#1e1b4b', margin: '0 0 10px 0', fontWeight: '800' }}>Grille Résolue !</h2>
              <p style={{ color: '#4f46e5', fontWeight: '600', fontSize: '1.1rem', margin: '0 0 24px 0' }}>Votre esprit est affûté.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', textAlign: 'left', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                <div style={{ fontSize: '1.05rem', color: '#475569' }}>
                  ⏱️ Temps : <strong style={{ color: '#0f172a' }}>{formatTime(time)}</strong>
                </div>
                <div style={{ fontSize: '1.05rem', color: '#475569' }}>
                  ⚠️ Erreurs : <strong style={{ color: '#0f172a' }}>{mistakes}</strong>
                </div>
                <div style={{ fontSize: '1.05rem', color: '#475569' }}>
                  Score : <strong style={{ color: '#8b5cf6', fontSize: '1.25rem' }}>
                    {Math.round(Math.max((gridSize === 4 ? 500 : gridSize === 6 ? 1500 : 5000) - time * 2 - mistakes * 50, 100))}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setVictory(false);
                  if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') {
                    onIntermissionRequest();
                  } else {
                    setGameState('menu');
                  }
                }}
                className="retro-btn pulse-glow"
                style={{ fontSize: '1.1rem', padding: '12px 36px', borderColor: '#8b5cf6', color: '#8b5cf6', width: '100%' }}
              >
                Nouveau Jeu 🎮
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(105vh) rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// Styles objects
const containerStyle = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '500px',
  background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)',
  borderRadius: '24px', padding: '24px', boxSizing: 'border-box',
  margin: '0 auto', flex: 1, position: 'relative', overflowX: 'hidden',
  border: '1px solid rgba(139, 92, 246, 0.25)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
  zIndex: 1
};

const menuStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1,
  padding: '10px 0', zIndex: 2
};

const menuTitleStyle = {
  fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px', textAlign: 'center',
  fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px'
};

const menuSubtitleStyle = {
  color: '#c084fc', fontSize: '0.95rem', textAlign: 'center', marginBottom: '32px', maxWidth: '340px'
};

const btnGroupStyle = {
  display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '280px'
};

const menuBtnStyle = {
  padding: '14px 28px', fontSize: '1.05rem', width: '100%', borderRadius: '16px'
};

const helpCardStyle = {
  marginTop: '36px', color: '#cbd5e1', textAlign: 'center', fontSize: '0.82rem',
  lineHeight: '1.4', background: 'rgba(15, 23, 42, 0.4)', padding: '12px 18px', borderRadius: '12px',
  border: '1px solid rgba(139, 92, 246, 0.2)', maxWidth: '320px'
};

const gameplayContainerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%', zIndex: 2
};

const timeCounterStyle = {
  fontSize: '20px', fontWeight: '800', color: '#a78bfa',
  background: 'rgba(139, 92, 246, 0.1)', padding: '6px 18px', borderRadius: '20px',
  border: '2px solid rgba(139, 92, 246, 0.3)'
};

const statsRowStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '16px', padding: '0 4px', boxSizing: 'border-box'
};

const statBoxStyle = {
  fontSize: '0.88rem', fontWeight: '700', color: '#cbd5e1',
  background: 'rgba(15, 23, 42, 0.4)', padding: '6px 12px', borderRadius: '10px',
  border: '1px solid rgba(139, 92, 246, 0.2)'
};

const boardWrapperStyle = {
  width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '18px'
};

const gridControlsStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', width: '100%',
  maxWidth: '380px', marginBottom: '5px'
};

const actionBtnStyle = {
  padding: '6px 12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '12px',
  minHeight: '44px', width: '100%', cursor: 'pointer'
};

const overlayStyle = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
  zIndex: 100, display: 'flex', flexDirection: 'column',
  justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.4s ease-out'
};

const victoryCardStyle = {
  animation: 'scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)', textAlign: 'center', background: '#ffffff',
  padding: '36px', borderRadius: '28px', boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
  border: '3px solid #8b5cf6', zIndex: 10, width: '90%', maxWidth: '360px'
};
