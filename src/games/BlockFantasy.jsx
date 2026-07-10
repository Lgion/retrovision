import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';

// ── CONSTANTES DES FORMES DE BLOCS ──────────────────────────────────────────
const SHAPE_TEMPLATES = [
  { id: '1x1', matrix: [[1]], color: '#FF3366' },
  { id: '1x2_h', matrix: [[1, 1]], color: '#FF9933' },
  { id: '1x2_v', matrix: [[1], [1]], color: '#FF9933' },
  { id: '1x3_h', matrix: [[1, 1, 1]], color: '#FFFF33' },
  { id: '1x3_v', matrix: [[1], [1], [1]], color: '#FFFF33' },
  { id: '1x4_h', matrix: [[1, 1, 1, 1]], color: '#33FF66' },
  { id: '1x4_v', matrix: [[1], [1], [1], [1]], color: '#33FF66' },
  { id: '1x5_h', matrix: [[1, 1, 1, 1, 1]], color: '#33FFCC' },
  { id: '1x5_v', matrix: [[1], [1], [1], [1], [1]], color: '#33FFCC' },

  // Carrés
  { id: '2x2', matrix: [[1, 1], [1, 1]], color: '#3399FF' },
  { id: '3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#CC33FF' },

  // Rectangles (Nouveaux)
  { id: 'rect_2x3_h', matrix: [[1, 1, 1], [1, 1, 1]], color: '#FF7F50' },
  { id: 'rect_3x2_v', matrix: [[1, 1], [1, 1], [1, 1]], color: '#FF7F50' },
  { id: 'rect_2x4_h', matrix: [[1, 1, 1, 1], [1, 1, 1, 1]], color: '#FF4500' },
  { id: 'rect_4x2_v', matrix: [[1, 1], [1, 1], [1, 1], [1, 1]], color: '#FF4500' },

  // Diagonales (Nouveaux)
  { id: 'diag_2_1', matrix: [[1, 0], [0, 1]], color: '#00FFFF' },
  { id: 'diag_2_2', matrix: [[0, 1], [1, 0]], color: '#00FFFF' },

  // Formes en L (2x2 et 3x3)
  { id: 'l_2x2_1', matrix: [[1, 0], [1, 1]], color: '#FF33CC' },
  { id: 'l_2x2_2', matrix: [[1, 1], [1, 0]], color: '#FF33CC' },
  { id: 'l_2x2_3', matrix: [[0, 1], [1, 1]], color: '#FF33CC' },
  { id: 'l_2x2_4', matrix: [[1, 1], [0, 1]], color: '#FF33CC' },
  
  { id: 'l_3x3_1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: '#FF5050' },
  { id: 'l_3x3_2', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: '#FF5050' },
  { id: 'l_3x3_3', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: '#FF5050' },
  { id: 'l_3x3_4', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: '#FF5050' },

  // Formes en T
  { id: 't_3x3_1', matrix: [[1, 1, 1], [0, 1, 0]], color: '#50C878' },
  { id: 't_3x3_2', matrix: [[0, 1, 0], [1, 1, 1]], color: '#50C878' },
  { id: 't_3x3_3', matrix: [[1, 0], [1, 1], [1, 0]], color: '#50C878' },
  { id: 't_3x3_4', matrix: [[0, 1], [1, 1], [0, 1]], color: '#50C878' },

  // Formes en Z / S
  { id: 'z_3x2', matrix: [[1, 1, 0], [0, 1, 1]], color: '#FFCC00' },
  { id: 's_3x2', matrix: [[0, 1, 1], [1, 1, 0]], color: '#FFCC00' }
];

// ── CONFIGURATION DES NIVEAUX ARCADE ─────────────────────────────────────────
const ARCADE_LEVELS = [
  { level: 1, title: "Première Pierre", goal: { type: 'lines', target: 3, current: 0 }, prePlaced: [] },
  { level: 2, title: "Ruée vers l'Or", goal: { type: 'score', target: 1200, current: 0 }, prePlaced: [] },
  {
    level: 3,
    title: "Nettoyage de Printemps",
    goal: { type: 'clear_stone', target: 4, current: 0 },
    prePlaced: [
      { r: 0, c: 0, color: 'gray', isStone: true }, { r: 0, c: 9, color: 'gray', isStone: true },
      { r: 9, c: 0, color: 'gray', isStone: true }, { r: 9, c: 9, color: 'gray', isStone: true }
    ]
  },
  {
    level: 4,
    title: "Labyrinthe Étroit",
    goal: { type: 'lines', target: 8, current: 0 },
    prePlaced: [
      { r: 4, c: 4, color: 'gray', isStone: true }, { r: 4, c: 5, color: 'gray', isStone: true },
      { r: 5, c: 4, color: 'gray', isStone: true }, { r: 5, c: 5, color: 'gray', isStone: true }
    ]
  },
  { level: 5, title: "Ascension Finale", goal: { type: 'score', target: 2000, current: 0 }, prePlaced: [] }
];

// Outil de rotation de matrice 90° horaire
const rotateMatrix = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};

export default function BlockFantasy({
  onBack,
  onScoreSave,
  isIntermission,
  onIntermissionComplete
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');

  const [customizations, setCustomizations] = useState(() => {
    return getGameConfig('blockfantasy', 'customizations', {
      theme: 'fantasy', mode: 'classic', gridSize: 10, level: 1
    });
  });

  const activeTheme = isIntermission ? 'fantasy' : (customizations.theme || 'fantasy');
  const activeMode = isIntermission ? 'classic' : (customizations.mode || 'classic');
  const gridSize = isIntermission ? 8 : (customizations.gridSize || 10);
  const currentLevelIndex = customizations.level || 1;

  // États de jeu
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_blockfantasy_highscore') || '0', 10);
  });
  const [shelfBlocks, setShelfBlocks] = useState([null, null, null]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [ghostCells, setGhostCells] = useState([]);
  const [isValidDragHover, setIsValidDragHover] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [levelVictory, setLevelVictory] = useState(false);
  const [questGoal, setQuestGoal] = useState({ type: 'score', target: 1000, current: 0 });

  // Nouvelles fonctionnalités: Pouvoirs (3 utilisations max chacun)
  const [rerollUsages, setRerollUsages] = useState(3);
  const [rotationUsages, setRotationUsages] = useState(3);
  const [isRotationMode, setIsRotationMode] = useState(false);
  const [lastMove, setLastMove] = useState(null); // Pour l'historique d'annulation

  // Particules & Animation
  const [particles, setParticles] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);

  const gridRef = useRef(null);

  const addFloatingScore = (text, x, y) => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(fs => fs.id !== id));
    }, 1000);
  };

  const spawnParticle = (x, y, color) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    setParticles(prev => [...prev, {
      id: Date.now() + Math.random(),
      x, y, vx, vy, color, alpha: 1
    }]);
  };

  useEffect(() => {
    initGame();
  }, [gridSize, activeMode, currentLevelIndex]);

  useEffect(() => {
    if (!activeDrag) {
      setGhostCells([]);
      setIsValidDragHover(false);
      return;
    }

    const handleMouseMove = (e) => {
      updateDragPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updateDragPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [activeDrag, board, score, streak]);

  useEffect(() => {
    if (particles.length === 0) return;
    let frameId;
    const updateParticles = () => {
      setParticles(prev => {
        return prev.map(p => ({
          ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.1, alpha: p.alpha - 0.02
        })).filter(p => p.alpha > 0);
      });
      frameId = requestAnimationFrame(updateParticles);
    };
    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  const initGame = () => {
    const totalCells = gridSize * gridSize;
    const initialBoard = Array(totalCells).fill(null);

    if (activeMode === 'arcade') {
      const activeLvl = ARCADE_LEVELS.find(l => l.level === currentLevelIndex) || ARCADE_LEVELS[0];
      if (activeLvl.prePlaced) {
        activeLvl.prePlaced.forEach(cell => {
          const idx = cell.r * gridSize + cell.c;
          if (idx >= 0 && idx < totalCells) initialBoard[idx] = { color: cell.color, isStone: cell.isStone };
        });
      }
      setQuestGoal({ type: activeLvl.goal.type, target: activeLvl.goal.target, current: 0 });
    } else if (isIntermission) {
      setQuestGoal({ type: 'lines', target: 1, current: 0 });
    }

    setBoard(initialBoard);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    setLevelVictory(false);
    setRerollUsages(3);
    setRotationUsages(3);
    setIsRotationMode(false);
    setLastMove(null);
    setShelfBlocks([getRandomBlock(), getRandomBlock(), getRandomBlock()]);
  };

  const getRandomBlock = () => {
    const randIdx = Math.floor(Math.random() * SHAPE_TEMPLATES.length);
    return SHAPE_TEMPLATES[randIdx];
  };

  // --- Actions ---
  const handleReroll = () => {
    if (rerollUsages <= 0 || levelVictory) return;
    sound.playClick();
    const nextShelf = shelfBlocks.map(block => block === null ? null : getRandomBlock());
    setShelfBlocks(nextShelf);
    setRerollUsages(prev => prev - 1);
    
    // Annule le game over si le nouveau set permet un coup
    if (gameOver) {
      checkGameOverState(board, nextShelf);
    }
  };

  const toggleRotationMode = () => {
    if (rotationUsages <= 0 || gameOver || levelVictory) return;
    sound.playClick();
    setIsRotationMode(!isRotationMode);
  };

  const handleUndo = () => {
    if (!lastMove || levelVictory) return;
    sound.playClick();
    setBoard(lastMove.board);
    setScore(lastMove.score);
    setStreak(lastMove.streak);
    setShelfBlocks(lastMove.shelfBlocks);
    setQuestGoal(lastMove.questGoal);
    setLastMove(null);
    setGameOver(false); // Sort du Game Over si on annule le dernier coup mortel
  };

  const handleShelfBlockInteract = (e, block, index) => {
    if (gameOver || levelVictory) return;
    
    if (isRotationMode) {
      // Appliquer la rotation
      const rotatedMatrix = rotateMatrix(block.matrix);
      const newShelf = [...shelfBlocks];
      newShelf[index] = { ...block, matrix: rotatedMatrix };
      setShelfBlocks(newShelf);
      setRotationUsages(prev => prev - 1);
      setIsRotationMode(false);
      sound.playClick();
      checkGameOverState(board, newShelf);
      return;
    }

    // Début du Drag classique
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveDrag({
      blockIndex: index, shape: block, matrix: block.matrix, color: block.color,
      x: clientX, y: clientY, offsetX: clientX - rect.left, offsetY: clientY - rect.top
    });
  };

  const updateDragPosition = (clientX, clientY) => {
    if (!activeDrag || !gridRef.current) return;
    setActiveDrag(prev => prev ? { ...prev, x: clientX, y: clientY } : null);

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridSize;
    const relX = (clientX - activeDrag.offsetX) - gridRect.left;
    const relY = (clientY - activeDrag.offsetY) - gridRect.top;

    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellWidth);
    const blockRows = activeDrag.matrix.length;
    const blockCols = activeDrag.matrix[0].length;

    const isOverGrid = (startRow + blockRows > 0 && startRow < gridSize && startCol + blockCols > 0 && startCol < gridSize);

    if (isOverGrid) {
      const cells = [];
      for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
          if (activeDrag.matrix[r][c] === 1) {
            const boardRow = startRow + r;
            const boardCol = startCol + c;
            if (boardRow >= 0 && boardRow < gridSize && boardCol >= 0 && boardCol < gridSize) {
              cells.push(boardRow * gridSize + boardCol);
            }
          }
        }
      }
      setGhostCells(cells);
      setIsValidDragHover(canPlaceBlock(board, activeDrag.matrix, startRow, startCol, gridSize));
    } else {
      setGhostCells([]);
      setIsValidDragHover(false);
    }
  };

  const handleDragEnd = () => {
    if (!activeDrag || !gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridSize;
    const relX = (activeDrag.x - activeDrag.offsetX) - gridRect.left;
    const relY = (activeDrag.y - activeDrag.offsetY) - gridRect.top;
    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellWidth);

    if (canPlaceBlock(board, activeDrag.matrix, startRow, startCol, gridSize)) {
      placeBlock(startRow, startCol, activeDrag.matrix, activeDrag.color, activeDrag.blockIndex);
    } else {
      sound.playShake();
    }

    setActiveDrag(null);
    setGhostCells([]);
    setIsValidDragHover(false);
  };

  const canPlaceBlock = (boardArray, matrix, startRow, startCol, size) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const boardRow = startRow + r;
          const boardCol = startCol + c;
          if (boardRow < 0 || boardRow >= size || boardCol < 0 || boardCol >= size) return false;
          if (boardArray[boardRow * size + boardCol] !== null) return false;
        }
      }
    }
    return true;
  };

  const placeBlock = (startRow, startCol, matrix, color, blockIndex) => {
    // Sauvegarder l'état pour la fonction Undo
    setLastMove({
      board: [...board],
      score,
      streak,
      shelfBlocks: [...shelfBlocks],
      questGoal: { ...questGoal }
    });

    const nextBoard = [...board];
    let cellsPlaced = 0;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          nextBoard[(startRow + r) * gridSize + (startCol + c)] = { color, isStone: false };
          cellsPlaced++;
        }
      }
    }

    const nextShelf = [...shelfBlocks];
    nextShelf[blockIndex] = null;
    sound.playClick();
    let scoreGained = cellsPlaced;

    const linesToClear = [];
    const colsToClear = [];
    for (let r = 0; r < gridSize; r++) {
      let isFull = true;
      for (let c = 0; c < gridSize; c++) {
        if (nextBoard[r * gridSize + c] === null) { isFull = false; break; }
      }
      if (isFull) linesToClear.push(r);
    }
    for (let c = 0; c < gridSize; c++) {
      let isFull = true;
      for (let r = 0; r < gridSize; r++) {
        if (nextBoard[r * gridSize + c] === null) { isFull = false; break; }
      }
      if (isFull) colsToClear.push(c);
    }

    const clearedIndices = new Set();
    linesToClear.forEach(r => { for (let c = 0; c < gridSize; c++) clearedIndices.add(r * gridSize + c); });
    colsToClear.forEach(c => { for (let r = 0; r < gridSize; r++) clearedIndices.add(r * gridSize + c); });

    const totalLinesCleared = linesToClear.length + colsToClear.length;
    let comboName = '';

    if (totalLinesCleared > 0) {
      let clearPoints = totalLinesCleared === 1 ? 100 : totalLinesCleared === 2 ? 300 : totalLinesCleared === 3 ? 600 : totalLinesCleared === 4 ? 1000 : 1500;
      comboName = totalLinesCleared === 1 ? '' : totalLinesCleared === 2 ? 'Double Combo!' : totalLinesCleared === 3 ? 'Triple Combo!' : totalLinesCleared === 4 ? 'Quad Combo!' : 'Mega Combo!';
      if (totalLinesCleared === 1) sound.playExplosion(); else sound.playScore();

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      const streakBonus = nextStreak > 1 ? (nextStreak - 1) * 50 : 0;
      scoreGained += (clearPoints + streakBonus);

      let centerX = 150, centerY = 150;
      if (clearedIndices.size > 0 && gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const indices = Array.from(clearedIndices);
        const rSum = indices.reduce((acc, idx) => acc + Math.floor(idx / gridSize), 0);
        const cSum = indices.reduce((acc, idx) => acc + (idx % gridSize), 0);
        centerX = (cSum / indices.length) * (rect.width / gridSize) + (rect.width / gridSize / 2);
        centerY = (rSum / indices.length) * (rect.width / gridSize) + (rect.width / gridSize / 2);
      }
      addFloatingScore(`+${clearPoints + streakBonus} ${comboName}`, centerX, centerY);

      clearedIndices.forEach(idx => {
        if (gridRef.current) {
          const rect = gridRef.current.getBoundingClientRect();
          const r = Math.floor(idx / gridSize);
          const c = idx % gridSize;
          spawnParticle(c * (rect.width / gridSize) + (rect.width / gridSize / 2), r * (rect.width / gridSize) + (rect.width / gridSize / 2), nextBoard[idx]?.color || '#fff');
        }
        nextBoard[idx] = null;
      });

      if (activeMode === 'arcade') {
        if (questGoal.type === 'lines') {
          setQuestGoal(prev => {
            const nextCur = Math.min(prev.target, prev.current + totalLinesCleared);
            if (nextCur >= prev.target) handleLevelSuccess();
            return { ...prev, current: nextCur };
          });
        } else if (questGoal.type === 'clear_stone') {
          let stoneCount = 0;
          clearedIndices.forEach(idx => { if (board[idx]?.isStone) stoneCount++; });
          if (stoneCount > 0) {
            setQuestGoal(prev => {
              const nextCur = Math.min(prev.target, prev.current + stoneCount);
              if (nextCur >= prev.target) handleLevelSuccess();
              return { ...prev, current: nextCur };
            });
          }
        }
      }
      if (isIntermission) {
        setQuestGoal(prev => {
          const nextCur = Math.min(prev.target, prev.current + totalLinesCleared);
          if (nextCur >= prev.target) {
            setTimeout(() => { sound.playSudokuSuccess(); if (onIntermissionComplete) onIntermissionComplete(); }, 1000);
          }
          return { ...prev, current: nextCur };
        });
      }
    } else {
      setStreak(0);
    }

    setBoard(nextBoard);
    const newTotalScore = score + scoreGained;
    setScore(newTotalScore);

    if (activeMode === 'classic' && newTotalScore > highScore) {
      setHighScore(newTotalScore);
      localStorage.setItem('retrovision_blockfantasy_highscore', newTotalScore.toString());
      if (onScoreSave) onScoreSave('Block Fantasy', newTotalScore);
    }

    if (activeMode === 'arcade' && questGoal.type === 'score') {
      setQuestGoal(prev => {
        const nextCur = Math.min(prev.target, prev.current + scoreGained);
        if (nextCur >= prev.target) handleLevelSuccess();
        return { ...prev, current: nextCur };
      });
    }

    let finalShelf = nextShelf;
    if (nextShelf.every(b => b === null)) {
      finalShelf = [getRandomBlock(), getRandomBlock(), getRandomBlock()];
      setShelfBlocks(finalShelf);
    } else {
      setShelfBlocks(finalShelf);
    }
    checkGameOverState(nextBoard, finalShelf);
  };

  const handleLevelSuccess = () => {
    setLevelVictory(true);
    sound.playSudokuSuccess();
    if (currentLevelIndex < ARCADE_LEVELS.length) {
      const nextLvl = currentLevelIndex + 1;
      setCustomizations(prev => {
        const next = { ...prev, level: nextLvl };
        updateGameConfig('blockfantasy', 'customizations', next);
        return next;
      });
    }
  };

  const checkGameOverState = (boardArray, shelf) => {
    let canPlay = false;
    for (let i = 0; i < shelf.length; i++) {
      if (shelf[i]) {
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            if (canPlaceBlock(boardArray, shelf[i].matrix, r, c, gridSize)) {
              canPlay = true; break;
            }
          }
          if (canPlay) break;
        }
      }
      if (canPlay) break;
    }
    if (!canPlay) {
      setGameOver(true);
      sound.playBlockedAlert();
    } else {
      setGameOver(false);
    }
  };

  const handleBackWithConfirm = () => {
    if (!gameOver && !levelVictory && score > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) onBack();
    } else {
      onBack();
    }
  };

  const renderCell = (cell, index) => {
    const isGhost = ghostCells.includes(index);
    let cellStyle = cell ? {
      backgroundColor: cell.color,
      border: '1px solid rgba(255,255,255,0.25)',
      boxShadow: activeTheme === 'fantasy' ? `0 0 10px ${cell.color}cc, inset 0 0 4px rgba(255,255,255,0.6)` : 'none'
    } : {
      border: activeTheme === 'wood' ? '1px solid rgba(0, 0, 0, 0.4)' : activeTheme === 'jewel' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(57, 255, 20, 0.18)',
      backgroundColor: activeTheme === 'wood' ? 'rgba(0, 0, 0, 0.25)' : activeTheme === 'jewel' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(57, 255, 20, 0.03)'
    };

    if (isGhost && activeDrag) {
      if (isValidDragHover) {
        cellStyle = { backgroundColor: activeDrag.color, border: '1.5px solid #ffffff', boxShadow: activeTheme === 'fantasy' ? `0 0 14px ${activeDrag.color}` : 'none', opacity: 0.7 };
      } else {
        cellStyle = { backgroundColor: 'rgba(128, 128, 128, 0.45)', border: '1.5px dashed rgba(255, 255, 255, 0.7)', opacity: 0.8 };
      }
    }

    return <div key={index} className={`grid-cell ${cell?.isStone ? 'stone-cell' : ''} ${isGhost ? 'ghost-cell' : ''}`} style={cellStyle}>{cell?.isStone && '🧱'}</div>;
  };

  const getContainerStyles = () => {
    switch (activeTheme) {
      case 'wood': return { background: '#4e3629', border: '4px solid #3d2417', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)', borderRadius: '12px' };
      case 'jewel': return { background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0b29 100%)', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', borderRadius: '24px' };
      default: return { background: 'radial-gradient(circle at center, #0f081d 0%, #030107 100%)', border: '2px solid #39FF14', boxShadow: '0 0 20px rgba(57, 255, 20, 0.25), inset 0 0 12px rgba(57, 255, 20, 0.1)', borderRadius: '16px' };
    }
  };

  const getBoardStyles = () => {
    switch (activeTheme) {
      case 'wood': return { border: '8px solid #3d2417', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.6)' };
      case 'jewel': return { border: '2.5px solid rgba(255,255,255,0.18)', borderRadius: '14px', boxShadow: '0 8px 24px rgba(255,255,255,0.05)' };
      default: return { border: '3px solid #39FF14', borderRadius: '10px', boxShadow: '0 0 16px rgba(57, 255, 20, 0.3)' };
    }
  };

  const getShelfStyles = () => {
    switch (activeTheme) {
      case 'wood': return { border: '4px solid #3d2417', background: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)' };
      case 'jewel': return { border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' };
      default: return { border: '2px dashed rgba(57, 255, 20, 0.4)', background: 'rgba(57, 255, 20, 0.05)', boxShadow: 'inset 0 0 10px rgba(57,255,20,0.1)' };
    }
  };

  if (showCustomization) {
    const tabs = ['theme', 'mode'];
    if (activeMode === 'classic') tabs.push('grid');
    if (activeMode === 'arcade') tabs.push('level');

    return (
      <div className="collection-panel" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1A1C29', zIndex: 1000, display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setShowCustomization(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#39FF14', color: '#000', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>◀</button>
          <h2 style={{ margin: 0, color: '#39FF14' }}>BOUTIQUE BLOCK</h2>
          <div style={{ width: '40px' }} />
        </div>

        <div style={{ display: 'flex', padding: '0 20px', gap: '10px', marginBottom: '20px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, minWidth: '80px', padding: '10px', background: activeTab === tab ? '#39FF14' : '#333', color: activeTab === tab ? '#000' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {tab === 'theme' ? 'Thème' : tab === 'mode' ? 'Mode' : tab === 'grid' ? 'Taille' : 'Niveau'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          
          {activeTab === 'theme' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
              {[{ id: 'fantasy', name: 'Néon Fantasy', preview: '✨' }, { id: 'wood', name: 'Bois Cosy', preview: '🪵' }, { id: 'jewel', name: 'Gemmes Translucides', preview: '💎' }].map(themeItem => {
                const isSelected = activeTheme === themeItem.id;
                return (
                  <div key={themeItem.id} onClick={() => { setCustomizations(prev => { const next = { ...prev, theme: themeItem.id }; updateGameConfig('blockfantasy', 'customizations', next); return next; }); sound.playClick(); }} style={{ background: '#2A2C39', padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{themeItem.preview}</div>
                    <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{themeItem.name}</div>
                    {isSelected && <div style={{ color: '#39FF14', marginTop: '5px', fontWeight: 'bold' }}>✅ Actif</div>}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'mode' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
              {[{ id: 'classic', name: 'Classique Sans Fin', preview: '♾️' }, { id: 'arcade', name: 'Aventure Arcade', preview: '🚩' }].map(modeItem => {
                const isSelected = activeMode === modeItem.id;
                return (
                  <div key={modeItem.id} onClick={() => { setCustomizations(prev => { const next = { ...prev, mode: modeItem.id }; updateGameConfig('blockfantasy', 'customizations', next); return next; }); setActiveTab(modeItem.id === 'classic' ? 'grid' : 'level'); sound.playClick(); }} style={{ background: '#2A2C39', padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{modeItem.preview}</div>
                    <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{modeItem.name}</div>
                    {isSelected && <div style={{ color: '#39FF14', marginTop: '5px', fontWeight: 'bold' }}>✅ Actif</div>}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'grid' && activeMode === 'classic' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
              {[{ size: 12, name: 'Géant (12x12)' }, { size: 10, name: 'Standard (10x10)' }, { size: 8, name: 'Mini (8x8)' }].map(gridSizeItem => {
                const isSelected = gridSize === gridSizeItem.size;
                return (
                  <div key={gridSizeItem.size} onClick={() => { setCustomizations(prev => { const next = { ...prev, gridSize: gridSizeItem.size }; updateGameConfig('blockfantasy', 'customizations', next); return next; }); sound.playClick(); }} style={{ background: '#2A2C39', padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📏</div>
                    <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{gridSizeItem.name}</div>
                    {isSelected && <div style={{ color: '#39FF14', marginTop: '5px', fontWeight: 'bold' }}>✅ Actif</div>}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'level' && activeMode === 'arcade' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '15px' }}>
              {ARCADE_LEVELS.map(lvl => {
                const isSelected = currentLevelIndex === lvl.level;
                return (
                  <button key={lvl.level} onClick={() => { setCustomizations(prev => { const next = { ...prev, level: lvl.level }; updateGameConfig('blockfantasy', 'customizations', next); return next; }); sound.playClick(); }} style={{ height: '60px', borderRadius: '12px', border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`, backgroundColor: isSelected ? '#39FF14' : '#2A2C39', color: isSelected ? '#000' : '#fff', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {lvl.level}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {showIntro && (
        <GameIntro gameName="BLOCK FANTASY" icon="🧱" colors={['#39FF14', '#FF3366', '#3399FF']} particleType="blocks" onComplete={() => setShowIntro(false)} />
      )}

      <div className="blockfantasy-container game-container" style={{ ...containerStyle, ...getContainerStyles() }}>
        {!isIntermission && (
          <GameHeader title="BLOCK FANTASY" onBack={handleBackWithConfirm} onRestart={initGame} showBgmToggle={false} onShop={() => setShowCustomization(true)} centerContent={
            <div style={statsContainerStyle}>
              <div style={statBoxStyle}><div style={statLabelStyle}>SCORE</div><div style={statValStyle}>{score}</div></div>
              {activeMode === 'classic' ? <div style={statBoxStyle}><div style={statLabelStyle}>RECORD</div><div style={statValStyle}>{highScore}</div></div> : <div style={statBoxStyle}><div style={statLabelStyle}>NIVEAU</div><div style={statValStyle}>{currentLevelIndex}</div></div>}
            </div>
          } />
        )}

        {/* Barre d'actions (Icônes avec compteurs) placée sous la boutique/header */}
        {!isIntermission && (
          <div className="blazer_options" style={actionsRowStyle}>
            <button onClick={handleReroll} disabled={rerollUsages <= 0 || gameOver || levelVictory} className="retro-btn action-btn-icon" style={{ ...actionBtnStyle, opacity: rerollUsages <= 0 ? 0.4 : 1 }} title="Coup de main: Relancer les blocs">
              🎲 <span style={actionBadgeStyle}>{rerollUsages}</span>
            </button>
            <button onClick={toggleRotationMode} disabled={rotationUsages <= 0 || gameOver || levelVictory} className={`retro-btn action-btn-icon ${isRotationMode ? 'pulse-glow' : ''}`} style={{ ...actionBtnStyle, opacity: rotationUsages <= 0 ? 0.4 : 1, borderColor: isRotationMode ? '#39FF14' : '#3b82f6' }} title="Pivoter un bloc proposé">
              {isRotationMode ? '✅' : '🔁'} <span style={actionBadgeStyle}>{rotationUsages}</span>
            </button>
            <button onClick={handleUndo} disabled={!lastMove || levelVictory} className="retro-btn action-btn-icon" style={{ ...actionBtnStyle, opacity: (!lastMove) ? 0.4 : 1 }} title="Revenir en arrière">
              ↩️
            </button>
          </div>
        )}
        
        {isRotationMode && (
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#39FF14', marginBottom: '4px', fontWeight: 'bold' }}>
            Sélectionnez un bloc ci-dessous pour le faire pivoter
          </div>
        )}

        {activeMode === 'arcade' && !isIntermission && (
          <div style={goalBarContainerStyle}>
            <div style={goalLabelStyle}>CIBLE : {questGoal.type === 'score' ? 'Score' : questGoal.type === 'lines' ? 'Lignes' : 'Pierres'}</div>
            <div style={goalBarOuterStyle}>
              <div style={{ ...goalBarInnerStyle, width: `${Math.min(100, (questGoal.current / questGoal.target) * 100)}%` }} />
              <span style={goalTextOverlayStyle}>{questGoal.current} / {questGoal.target}</span>
            </div>
          </div>
        )}

        <div style={boardWrapperStyle}>
          <div ref={gridRef} style={{ ...gridContainerStyle, ...getBoardStyles(), gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)`, backgroundColor: activeTheme === 'wood' ? '#2e1c10' : activeTheme === 'jewel' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)' }}>
            {board.map((cell, index) => renderCell(cell, index))}
            {particles.map(p => <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, width: '8px', height: '8px', backgroundColor: p.color, borderRadius: '2px', opacity: p.alpha, pointerEvents: 'none', boxShadow: activeTheme === 'fantasy' ? `0 0 6px ${p.color}` : 'none' }} />)}
            {floatingScores.map(fs => <div key={fs.id} style={{ position: 'absolute', left: fs.x, top: fs.y, transform: 'translate(-50%, -100%)', color: '#39FF14', fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 8px #000, 0 0 10px #39FF14', animation: 'floatUpScore 1s forwards', pointerEvents: 'none', zIndex: 20 }}>{fs.text}</div>)}
            
            {gameOver && (
              <div style={overlayStyle}>
                <div style={gameOverTitleStyle}>BLOCAGE TOTAL</div>
                <div style={descStyle}>Aucun coup possible sur la grille !</div>
                <div style={statsReportStyle}>Score final : <span style={{ color: '#39FF14', fontWeight: 'bold' }}>{score}</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '200px' }}>
                  {rerollUsages > 0 && <button onClick={handleReroll} className="retro-btn pulse-glow" style={{ ...overlayBtnStyle, borderColor: '#3b82f6', color: '#60a5fa' }}>🎲 Relancer ({rerollUsages})</button>}
                  {lastMove && <button onClick={handleUndo} className="retro-btn" style={{ ...overlayBtnStyle, borderColor: '#eab308', color: '#facc15' }}>↩️ Annuler</button>}
                  <button onClick={initGame} className="retro-btn" style={overlayBtnStyle}>Réessayer</button>
                </div>
              </div>
            )}
            {levelVictory && (
              <div style={overlayStyle}>
                <div style={victoryTitleStyle}>NIVEAU RÉUSSI !</div>
                <div style={descStyle}>Objectif complété avec succès.</div>
                <div style={statsReportStyle}>Score : <span style={{ color: '#39FF14', fontWeight: 'bold' }}>{score}</span></div>
                <button onClick={() => { setLevelVictory(false); initGame(); }} className="retro-btn pulse-glow" style={overlayBtnStyle}>{currentLevelIndex <= ARCADE_LEVELS.length ? 'Niveau Suivant' : 'Recommencer'}</button>
              </div>
            )}
          </div>
        </div>



        <div style={{ ...shelfContainerStyle, ...getShelfStyles() }}>
          {shelfBlocks.map((block, index) => {
            if (!block) return <div key={index} style={shelfSlotStyle} />;
            const isDragged = activeDrag && activeDrag.blockIndex === index;
            return (
              <div key={index} style={{ ...shelfSlotStyle, opacity: isDragged ? 0 : 1, cursor: isRotationMode ? 'pointer' : 'grab' }} onMouseDown={(e) => handleShelfBlockInteract(e, block, index)} onTouchStart={(e) => handleShelfBlockInteract(e, block, index)}>
                <div style={{ ...miniBlockContainerStyle, animation: isRotationMode ? 'wobble 1.5s infinite ease-in-out' : 'none', filter: isRotationMode ? 'drop-shadow(0 0 4px #39FF14)' : 'none' }}>
                  {block.matrix.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex' }}>
                      {row.map((val, cIdx) => (
                        <div key={cIdx} style={{ width: '18px', height: '18px', margin: '1px', borderRadius: '3px', backgroundColor: val === 1 ? block.color : 'transparent', border: val === 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', boxShadow: val === 1 && activeTheme === 'fantasy' ? `0 0 6px ${block.color}` : 'none' }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {activeDrag && (
          <div style={{ position: 'fixed', left: activeDrag.x - activeDrag.offsetX, top: activeDrag.y - activeDrag.offsetY, pointerEvents: 'none', zIndex: 9999, transform: 'scale(1.2)', transformOrigin: 'top left', transition: 'transform 0.05s' }}>
            {activeDrag.matrix.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((val, cIdx) => (
                  <div key={cIdx} style={{ width: '26px', height: '26px', margin: '1px', borderRadius: '4px', backgroundColor: val === 1 ? (isValidDragHover ? activeDrag.color : 'rgba(120, 120, 120, 0.85)') : 'transparent', border: val === 1 ? (isValidDragHover ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px dashed rgba(255,255,255,0.6)') : 'none', boxShadow: val === 1 && activeTheme === 'fantasy' && isValidDragHover ? `0 0 12px ${activeDrag.color}` : 'none', opacity: val === 1 ? (isValidDragHover ? 1 : 0.65) : 0 }} />
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={footerHelpStyle}>
          {isIntermission ? <span>Complétez n'importe quelle ligne ou colonne pour passer l'entracte.</span> : <span>Glissez les formes dans la grille pour former des lignes complètes.</span>}
        </div>
      </div>

      <style>{`
        @keyframes floatUpScore { 0% { transform: translate(-50%, -100%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -220%) scale(0.85); opacity: 0; } }
        @keyframes wobble { 0%, 100% { transform: rotate(-3deg) scale(0.9); } 50% { transform: rotate(3deg) scale(0.9); } }
        .grid-cell { width: 100%; height: 100%; border-radius: 4px; transition: background-color 0.08s, border-color 0.08s, transform 0.1s; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .ghost-cell { transform: scale(0.96); }
        .stone-cell { background: #4b5563 !important; border: 2px solid #374151 !important; box-shadow: inset 0 2px 4px rgba(255,255,255,0.2) !important; }
        .action-btn-icon { position: relative; font-size: 24px; width: 56px; height: 56px; padding: 0 !important; display: flex; align-items: center; justify-content: center; border-radius: 16px !important; }
      `}</style>
    </>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '430px', boxSizing: 'border-box', margin: '0 auto', padding: '16px' };
const statsContainerStyle = { display: 'flex', gap: '12px' };
const statBoxStyle = { flex: 1, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' };
const statLabelStyle = { fontSize: '10px', color: '#8e8a9f', fontFamily: 'Orbitron, sans-serif', marginBottom: '2px' };
const statValStyle = { fontSize: '16px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Orbitron, sans-serif' };
const boardWrapperStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '12px 0' };
const gridContainerStyle = { position: 'relative', display: 'grid', gap: '3px', width: '100%', aspectRatio: '1 / 1', padding: '6px', boxSizing: 'border-box', overflow: 'hidden' };
const shelfContainerStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: '100px', margin: '4px 0', borderRadius: '12px', padding: '8px', boxSizing: 'border-box' };
const shelfSlotStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', transition: 'transform 0.2s', userSelect: 'none' };
const miniBlockContainerStyle = { display: 'flex', flexDirection: 'column', transform: 'scale(0.9)', transition: 'all 0.2s' };
const actionsRowStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%', margin: '4px 0 12px 0' };

const actionBtnStyle = {
  border: '1px solid #3b82f6',
  background: 'rgba(59, 130, 246, 0.12)',
  color: '#ffffff',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)'
};

const actionBadgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  background: '#39FF14',
  color: '#000',
  fontSize: '10px',
  fontWeight: 'bold',
  padding: '2px 5px',
  borderRadius: '10px',
  border: '2px solid #14151F',
  fontFamily: 'system-ui'
};

const overlayStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 8, 19, 0.93)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 30, padding: '20px', textAlign: 'center', backdropFilter: 'blur(4px)' };
const gameOverTitleStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '26px', color: '#ff3366', textShadow: '0 0 12px #ff3366', fontWeight: 'bold', marginBottom: '10px' };
const victoryTitleStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '26px', color: '#39FF14', textShadow: '0 0 12px #39FF14', fontWeight: 'bold', marginBottom: '10px' };
const descStyle = { color: '#ffffff', fontSize: '13px', marginBottom: '16px' };
const statsReportStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '16px', color: '#ffffff', marginBottom: '20px' };
const overlayBtnStyle = { padding: '10px 22px', fontSize: '14px', border: '2px solid #39FF14', background: 'transparent', color: '#39FF14', boxShadow: '0 0 10px rgba(57, 255, 20, 0.25)', cursor: 'pointer', borderRadius: '8px', fontFamily: 'Orbitron, sans-serif' };
const footerHelpStyle = { marginTop: '8px', fontSize: '11px', color: '#8e8a9f', textAlign: 'center', lineHeight: '1.4' };
const entractHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: '8px', marginBottom: '10px' };
const skipIntermissionBtnStyle = { background: 'transparent', border: '1px solid #39FF14', color: '#39FF14', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' };
const goalBarContainerStyle = { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', width: '100%' };
const goalLabelStyle = { fontSize: '10px', color: '#8e8a9f', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'Orbitron, sans-serif' };
const goalBarOuterStyle = { position: 'relative', width: '100%', height: '18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const goalBarInnerStyle = { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #15803d 0%, #39FF14 100%)', borderRadius: '9px', transition: 'width 0.3s ease' };
const goalTextOverlayStyle = { position: 'relative', zIndex: 5, fontSize: '11px', color: '#ffffff', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' };
const panelContainerStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#14151F', zIndex: 1000, display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '16px', boxSizing: 'border-box' };
const panelHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' };
const backBtnStyle = { width: '36px', height: '36px', borderRadius: '50%', background: '#2A2C39', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const tabContainerStyle = { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '20px' };
const configSectionStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const sectionTitleStyle = { margin: 0, fontSize: '13px', letterSpacing: '1px', color: '#8e8a9f', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' };
const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' };
const themeCardStyle = { background: '#20212C', padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.2s', textAlign: 'center', fontSize: '12px' };
const levelsGridStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' };
const levelBtnStyle = { width: '45px', height: '45px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.15s' };
const panelCloseBtnStyle = { width: '100%', padding: '12px', borderColor: '#39FF14', color: '#39FF14', fontSize: '14px', fontWeight: 'bold', background: 'transparent', marginTop: '10px', cursor: 'pointer' };
