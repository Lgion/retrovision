import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Boutique from '../components/Boutique';
import IntermissionHeader from '../components/IntermissionHeader';
import { ADVENTURE_LEVELS, getLevelData, calculateLevelStars } from './blockfantasy/levelsData';

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

  // Rectangles
  { id: 'rect_2x3_h', matrix: [[1, 1, 1], [1, 1, 1]], color: '#FF7F50' },
  { id: 'rect_3x2_v', matrix: [[1, 1], [1, 1], [1, 1]], color: '#FF7F50' },
  { id: 'rect_2x4_h', matrix: [[1, 1, 1, 1], [1, 1, 1, 1]], color: '#FF4500' },
  { id: 'rect_4x2_v', matrix: [[1, 1], [1, 1], [1, 1], [1, 1]], color: '#FF4500' },

  // Diagonales
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
  intermissionDifficulty,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const [customizations, setCustomizations] = useState(() => {
    return getGameConfig('blockfantasy', 'customizations', {
      theme: 'fantasy', mode: 'classic', gridSize: 10, level: 1
    });
  });

  const activeTheme = isIntermission ? 'fantasy' : (customizations.theme || 'fantasy');
  const activeMode = isIntermission ? 'classic' : (customizations.mode || 'classic');
  const gridSize = isIntermission ? 8 : (customizations.gridSize || 10);
  const currentLevelIndex = customizations.level || 1;

  // Progression Aventure (Étoiles sauvegardées)
  const [starsMap, setStarsMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('retrovision_blockfantasy_stars') || '{}');
    } catch (e) {
      return {};
    }
  });

  // États du plateau
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_blockfantasy_highscore') || '0', 10);
  });
  const [shelfBlocks, setShelfBlocks] = useState([null, null, null]);

  // Drag & Drop Haute Précision & Ombre Réactive
  const [activeDrag, setActiveDrag] = useState(null);
  const [ghostCells, setGhostCells] = useState([]);
  const [anticipateClearCells, setAnticipateClearCells] = useState([]);
  const [isValidDragHover, setIsValidDragHover] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(0);
  const lastMousePosRef = useRef({ x: 0, y: 0, time: 0 });

  // Combos, Fever & Dynamic Feel
  const [streak, setStreak] = useState(0);
  const [feverMeter, setFeverMeter] = useState(0); // 0 à 100
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [feverTimer, setFeverTimer] = useState(0);
  const [shakeBoard, setShakeBoard] = useState(false);

  // Fin de partie & Aventure
  const [gameOver, setGameOver] = useState(false);
  const [levelVictory, setLevelVictory] = useState(false);
  const [victoryStars, setVictoryStars] = useState(1);
  const [questGoal, setQuestGoal] = useState({ type: 'score', target: 1000, current: 0 });

  // Pouvoirs de Sauvetage Anti-Blocage
  const [rerollUsages, setRerollUsages] = useState(3);
  const [rotationUsages, setRotationUsages] = useState(3);
  const [hammerUsages, setHammerUsages] = useState(2);
  const [jokerUsages, setJokerUsages] = useState(2);
  const [isRotationMode, setIsRotationMode] = useState(false);
  const [isHammerMode, setIsHammerMode] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  // Particules & Animation
  const [particles, setParticles] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);

  const gridRef = useRef(null);

  const addFloatingScore = (text, x, y, color = '#39FF14') => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(fs => fs.id !== id));
    }, 1100);
  };

  const spawnParticle = (x, y, color) => {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      setParticles(prev => [...prev, {
        id: Date.now() + Math.random(),
        x, y, vx, vy, color, alpha: 1, size: Math.random() * 6 + 4
      }]);
    }
  };

  // Particules animées
  useEffect(() => {
    if (particles.length === 0) return;
    let frameId;
    const updateParticles = () => {
      setParticles(prev => {
        return prev.map(p => ({
          ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, alpha: p.alpha - 0.025
        })).filter(p => p.alpha > 0);
      });
      frameId = requestAnimationFrame(updateParticles);
    };
    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  // Décompte du Mode Fever
  useEffect(() => {
    if (!isFeverActive) return;
    const interval = setInterval(() => {
      setFeverTimer(prev => {
        if (prev <= 1) {
          setIsFeverActive(false);
          setFeverMeter(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFeverActive]);

  // Initialisation à chaque changement de mode ou niveau
  useEffect(() => {
    initGame();
  }, [gridSize, activeMode, currentLevelIndex]);

  // Écouteurs globaux de Drag & Drop
  useEffect(() => {
    if (!activeDrag) {
      setGhostCells([]);
      setAnticipateClearCells([]);
      setIsValidDragHover(false);
      setTiltAngle(0);
      return;
    }

    const handleMouseMove = (e) => {
      updateDragPosition(e.clientX, e.clientY, false);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updateDragPosition(e.touches[0].clientX, e.touches[0].clientY, true);
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
  }, [activeDrag, board, score, streak, isFeverActive]);

  const initGame = () => {
    const totalCells = gridSize * gridSize;
    const initialBoard = Array(totalCells).fill(null);

    if (activeMode === 'arcade') {
      const activeLvl = getLevelData(currentLevelIndex);
      if (activeLvl && activeLvl.prePlaced) {
        activeLvl.prePlaced.forEach(cell => {
          const idx = cell.r * gridSize + cell.c;
          if (idx >= 0 && idx < totalCells) {
            initialBoard[idx] = {
              color: cell.color || '#64748b',
              isStone: Boolean(cell.isStone),
              isIce: Boolean(cell.isIce),
              isGold: Boolean(cell.isGold),
              hits: cell.hits || (cell.isIce ? 1 : 0)
            };
          }
        });
      }
      setQuestGoal({ type: activeLvl.goal.type, target: activeLvl.goal.target, current: 0 });
    } else if (isIntermission) {
      setQuestGoal({ type: 'lines', target: 1, current: 0 });
    }

    setBoard(initialBoard);
    setScore(0);
    setStreak(0);
    setFeverMeter(0);
    setIsFeverActive(false);
    setFeverTimer(0);
    setGameOver(false);
    setLevelVictory(false);
    setRerollUsages(3);
    setRotationUsages(3);
    setHammerUsages(2);
    setJokerUsages(2);
    setIsRotationMode(false);
    setIsHammerMode(false);
    setLastMove(null);
    setGhostCells([]);
    setAnticipateClearCells([]);
    setShelfBlocks([getRandomBlock(), getRandomBlock(), getRandomBlock()]);
  };

  const getRandomBlock = () => {
    const randIdx = Math.floor(Math.random() * SHAPE_TEMPLATES.length);
    return SHAPE_TEMPLATES[randIdx];
  };

  // --- ACTIONS DE SAUVETAGE ANTI-BLOCAGE ---

  const handleReroll = () => {
    if (rerollUsages <= 0 || levelVictory) return;
    sound.playClick?.();
    const nextShelf = shelfBlocks.map(block => block === null ? null : getRandomBlock());
    setShelfBlocks(nextShelf);
    setRerollUsages(prev => prev - 1);
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      addFloatingScore('🎲 RELANCE !', rect.width / 2, rect.height / 2, '#38BDF8');
    }
    if (gameOver) {
      checkGameOverState(board, nextShelf);
    }
  };

  const toggleRotationMode = () => {
    if (rotationUsages <= 0 || gameOver || levelVictory) return;
    sound.playClick?.();
    setIsHammerMode(false);
    setIsRotationMode(!isRotationMode);
  };

  const toggleHammerMode = () => {
    if (hammerUsages <= 0 || gameOver || levelVictory) return;
    sound.playClick?.();
    setIsRotationMode(false);
    setIsHammerMode(!isHammerMode);
  };

  const handleUseJoker = () => {
    if (jokerUsages <= 0 || gameOver || levelVictory) return;
    sound.playPowerup?.();
    const emptySlotIdx = shelfBlocks.findIndex(b => b === null);
    const targetIdx = emptySlotIdx !== -1 ? emptySlotIdx : 0;
    const newShelf = [...shelfBlocks];
    newShelf[targetIdx] = { id: 'joker_1x1', matrix: [[1]], color: '#FACC15', isJoker: true };
    setShelfBlocks(newShelf);
    setJokerUsages(prev => prev - 1);
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      addFloatingScore('🪄 BLOC JOKER 1x1 !', rect.width / 2, rect.height / 2, '#FACC15');
    }
    if (gameOver) {
      checkGameOverState(board, newShelf);
    }
  };

  const handleHammerCellClick = (index) => {
    if (!isHammerMode || !board[index]) return;
    sound.playBlockHammer?.();
    const nextBoard = [...board];
    const victim = nextBoard[index];
    nextBoard[index] = null;
    setBoard(nextBoard);
    setHammerUsages(prev => prev - 1);
    setIsHammerMode(false);

    // Particules de destruction
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const r = Math.floor(index / gridSize);
      const c = index % gridSize;
      const cellW = rect.width / gridSize;
      spawnParticle(c * cellW + cellW / 2, r * cellW + cellW / 2, victim.color || '#F43F5E');
      addFloatingScore('🔨 BRISÉ !', c * cellW + cellW / 2, r * cellW + cellW / 2, '#F43F5E');
    }

    // Mise à jour de quête si c'était une pierre ou de la glace
    if (activeMode === 'arcade') {
      if (victim.isStone && questGoal.type === 'clear_stone') {
        setQuestGoal(prev => {
          const nextCur = Math.min(prev.target, prev.current + 1);
          if (nextCur >= prev.target) handleLevelSuccess();
          return { ...prev, current: nextCur };
        });
      } else if (victim.isIce && questGoal.type === 'clear_ice') {
        setQuestGoal(prev => {
          const nextCur = Math.min(prev.target, prev.current + 1);
          if (nextCur >= prev.target) handleLevelSuccess();
          return { ...prev, current: nextCur };
        });
      }
    }

    checkGameOverState(nextBoard, shelfBlocks);
  };

  const handleUndo = () => {
    if (!lastMove || levelVictory) return;
    sound.playClick?.();
    setBoard(lastMove.board);
    setScore(lastMove.score);
    setStreak(lastMove.streak);
    setShelfBlocks(lastMove.shelfBlocks);
    setQuestGoal(lastMove.questGoal);
    setLastMove(null);
    setGameOver(false);
  };

  // --- DRAG & DROP HAUTE FIDÉLITÉ (1:1 SCALE + OMBRE RÉACTIVE) ---

  const handleShelfBlockInteract = (e, block, index) => {
    if (gameOver || levelVictory || isHammerMode) return;
    
    if (isRotationMode) {
      const rotatedMatrix = rotateMatrix(block.matrix);
      const newShelf = [...shelfBlocks];
      newShelf[index] = { ...block, matrix: rotatedMatrix };
      setShelfBlocks(newShelf);
      setRotationUsages(prev => prev - 1);
      setIsRotationMode(false);
      sound.playClick?.();
      checkGameOverState(board, newShelf);
      return;
    }

    e.preventDefault();
    const isTouch = Boolean(e.touches && e.touches.length > 0);
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    if (!gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridSize;

    const blockRows = block.matrix.length;
    const blockCols = block.matrix[0].length;

    // Ancrage précis : la pièce a la taille 1:1 exacte de la grille !
    // Sur mobile (toucher), on surélève la pièce au-dessus du pouce.
    // Sur desktop (souris), la pièce est parfaitement centrée.
    const dragOffsetX = (blockCols * cellWidth) / 2;
    const dragOffsetY = isTouch ? (blockRows * cellWidth) + 36 : (blockRows * cellWidth) / 2;

    lastMousePosRef.current = { x: clientX, y: clientY, time: performance.now() };

    setActiveDrag({
      blockIndex: index,
      shape: block,
      matrix: block.matrix,
      color: block.color,
      x: clientX,
      y: clientY,
      cellWidth,
      dragOffsetX,
      dragOffsetY,
      isTouch
    });
  };

  const updateDragPosition = (clientX, clientY, isTouch) => {
    if (!activeDrag || !gridRef.current) return;

    // Calcul de la vélocité et du tilt dynamique (effet d'inertie de l'ombre)
    const now = performance.now();
    const dt = Math.max(1, now - lastMousePosRef.current.time);
    const vx = (clientX - lastMousePosRef.current.x) / dt;
    lastMousePosRef.current = { x: clientX, y: clientY, time: now };

    const targetTilt = Math.max(-10, Math.min(10, vx * 8));
    setTiltAngle(prev => prev * 0.6 + targetTilt * 0.4);

    setActiveDrag(prev => prev ? { ...prev, x: clientX, y: clientY } : null);

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridSize;

    // Coin supérieur gauche du bloc flottant
    const pieceLeft = clientX - activeDrag.dragOffsetX;
    const pieceTop = clientY - activeDrag.dragOffsetY;

    // Correspondance 1:1 avec les coordonnées de la grille
    const relX = pieceLeft - gridRect.left;
    const relY = pieceTop - gridRect.top;

    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellWidth);
    const blockRows = activeDrag.matrix.length;
    const blockCols = activeDrag.matrix[0].length;

    // Vérifier si le bloc est au-dessus de la grille
    const isOverGrid = (startRow + blockRows > 0 && startRow < gridSize && startCol + blockCols > 0 && startCol < gridSize);

    if (isOverGrid && canPlaceBlock(board, activeDrag.matrix, startRow, startCol, gridSize)) {
      const cells = [];
      for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
          if (activeDrag.matrix[r][c] === 1) {
            const bR = startRow + r;
            const bC = startCol + c;
            cells.push(bR * gridSize + bC);
          }
        }
      }
      setGhostCells(cells);
      setIsValidDragHover(true);

      // --- EFFET D'ANTICIPATION LUMINEUSE (ANTICIPATION GLOW À LA BLOCK BLAST!) ---
      // Simuler le placement et identifier les lignes/colonnes qui vont sauter
      const tempBoard = [...board];
      cells.forEach(idx => { tempBoard[idx] = { color: activeDrag.color }; });

      const fullRows = [];
      const fullCols = [];
      for (let r = 0; r < gridSize; r++) {
        let isFull = true;
        for (let c = 0; c < gridSize; c++) {
          if (tempBoard[r * gridSize + c] === null) { isFull = false; break; }
        }
        if (isFull) fullRows.push(r);
      }
      for (let c = 0; c < gridSize; c++) {
        let isFull = true;
        for (let r = 0; r < gridSize; r++) {
          if (tempBoard[r * gridSize + c] === null) { isFull = false; break; }
        }
        if (isFull) fullCols.push(c);
      }

      const toClear = new Set();
      fullRows.forEach(r => { for (let c = 0; c < gridSize; c++) toClear.add(r * gridSize + c); });
      fullCols.forEach(c => { for (let r = 0; r < gridSize; r++) toClear.add(r * gridSize + c); });
      setAnticipateClearCells(Array.from(toClear));
    } else {
      // Position invalide : supprimer tout ghost parasite pour garder la grille propre !
      setGhostCells([]);
      setAnticipateClearCells([]);
      setIsValidDragHover(false);
    }
  };

  const handleDragEnd = () => {
    if (!activeDrag || !gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridSize;

    const pieceLeft = activeDrag.x - activeDrag.dragOffsetX;
    const pieceTop = activeDrag.y - activeDrag.dragOffsetY;
    const relX = pieceLeft - gridRect.left;
    const relY = pieceTop - gridRect.top;

    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellWidth);

    if (canPlaceBlock(board, activeDrag.matrix, startRow, startCol, gridSize)) {
      placeBlock(startRow, startCol, activeDrag.matrix, activeDrag.color, activeDrag.blockIndex);
    } else {
      sound.playShake?.();
    }

    setActiveDrag(null);
    setGhostCells([]);
    setAnticipateClearCells([]);
    setIsValidDragHover(false);
    setTiltAngle(0);
  };

  const canPlaceBlock = (boardArray, matrix, startRow, startCol, size) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const bR = startRow + r;
          const bC = startCol + c;
          if (bR < 0 || bR >= size || bC < 0 || bC >= size) return false;
          if (boardArray[bR * size + bC] !== null) return false;
        }
      }
    }
    return true;
  };

  const placeBlock = (startRow, startCol, matrix, color, blockIndex) => {
    // Sauvegarde Undo
    setLastMove({
      board: [...board],
      score,
      streak,
      feverMeter,
      isFeverActive,
      shelfBlocks: [...shelfBlocks],
      questGoal: { ...questGoal }
    });

    const nextBoard = [...board];
    let cellsPlaced = 0;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          nextBoard[(startRow + r) * gridSize + (startCol + c)] = { color, isStone: false, isIce: false };
          cellsPlaced++;
        }
      }
    }

    const nextShelf = [...shelfBlocks];
    nextShelf[blockIndex] = null;

    // Son de pose de tuile net
    sound.playBlockPlace?.(cellsPlaced);

    // Multiplicateur Fever
    const multiplier = isFeverActive ? 2 : 1;
    let scoreGained = cellsPlaced * multiplier;

    // Détection des lignes et colonnes pleines
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
    const isCrossBlast = linesToClear.length > 0 && colsToClear.length > 0;

    if (totalLinesCleared > 0) {
      // Calcul du streak et points
      const nextStreak = streak + 1;
      setStreak(nextStreak);

      let clearPoints = totalLinesCleared === 1 ? 120 : totalLinesCleared === 2 ? 350 : totalLinesCleared === 3 ? 750 : totalLinesCleared === 4 ? 1300 : 2000;
      if (isCrossBlast) clearPoints += 600; // Bonus Cross Blast

      const streakBonus = nextStreak > 1 ? (nextStreak - 1) * 80 : 0;
      scoreGained += (clearPoints + streakBonus) * multiplier;

      // Sons addictifs & Screen Shake
      if (isCrossBlast) {
        sound.playBlockCrossBlast?.();
        triggerScreenShake();
      } else if (nextStreak > 1) {
        sound.playBlockCombo?.(nextStreak);
        if (totalLinesCleared >= 2) triggerScreenShake();
      } else {
        if (totalLinesCleared === 1) sound.playExplosion?.(); else sound.playScore?.();
      }

      // Progression Fever Gauge
      const feverGain = totalLinesCleared * 22 + (isCrossBlast ? 35 : 0);
      setFeverMeter(prev => {
        const nextM = Math.min(100, prev + feverGain);
        if (nextM >= 100 && !isFeverActive) {
          setIsFeverActive(true);
          setFeverTimer(12);
          sound.playFeverActive?.();
          if (gridRef.current) {
            const rect = gridRef.current.getBoundingClientRect();
            addFloatingScore('🔥 FANTASY FEVER x2! 🔥', rect.width / 2, 40, '#F59E0B');
          }
        }
        return nextM;
      });

      // Nom du Combo
      let comboName = '';
      if (isCrossBlast) {
        comboName = '⚡ CROSS BLAST!';
      } else if (nextStreak >= 5) {
        comboName = `👑 GODLIKE x${nextStreak}!`;
      } else if (nextStreak >= 3) {
        comboName = `🔥 SUPER COMBO x${nextStreak}!`;
      } else if (nextStreak === 2) {
        comboName = '✨ COMBO x2!';
      } else if (totalLinesCleared === 2) {
        comboName = 'DOUBLE LIGNE!';
      } else if (totalLinesCleared >= 3) {
        comboName = 'MEGA BLAST!';
      }

      // Position du floating score
      let centerX = 150, centerY = 150;
      if (clearedIndices.size > 0 && gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const indices = Array.from(clearedIndices);
        const rSum = indices.reduce((acc, idx) => acc + Math.floor(idx / gridSize), 0);
        const cSum = indices.reduce((acc, idx) => acc + (idx % gridSize), 0);
        centerX = (cSum / indices.length) * (rect.width / gridSize) + (rect.width / gridSize / 2);
        centerY = (rSum / indices.length) * (rect.width / gridSize) + (rect.width / gridSize / 2);
      }
      addFloatingScore(`+${(clearPoints + streakBonus) * multiplier} ${comboName}`, centerX, centerY, isCrossBlast ? '#FACC15' : '#39FF14');

      // Traitement des cellules spéciales (pierres, glaces, or)
      let stonesBroken = 0;
      let iceBroken = 0;

      clearedIndices.forEach(idx => {
        const targetCell = nextBoard[idx];
        if (gridRef.current) {
          const rect = gridRef.current.getBoundingClientRect();
          const r = Math.floor(idx / gridSize);
          const c = idx % gridSize;
          const cellW = rect.width / gridSize;
          spawnParticle(c * cellW + cellW / 2, r * cellW + cellW / 2, targetCell?.color || '#fff');
        }

        if (targetCell?.isStone) stonesBroken++;
        if (targetCell?.isIce) iceBroken++;
        if (targetCell?.isGold) scoreGained += 500 * multiplier;

        nextBoard[idx] = null;
      });

      // Gestion des objectifs Aventure
      if (activeMode === 'arcade') {
        updateQuestProgress(totalLinesCleared, isCrossBlast, nextStreak, stonesBroken, iceBroken);
      }

      if (isIntermission) {
        setQuestGoal(prev => {
          const nextCur = Math.min(prev.target, prev.current + totalLinesCleared);
          if (nextCur >= prev.target) {
            setTimeout(() => {
              sound.playSudokuSuccess?.();
              if (replaySameIntermission) {
                if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
                initGame();
              } else if (onIntermissionComplete) {
                onIntermissionComplete();
              }
            }, 1000);
          }
          return { ...prev, current: nextCur };
        });
      }
    } else {
      setStreak(0);
      // Réduction lente du fever si aucun coup destructeur
      setFeverMeter(prev => Math.max(0, prev - 8));
    }

    setBoard(nextBoard);
    const newTotalScore = score + scoreGained;
    setScore(newTotalScore);

    if (activeMode === 'classic' && newTotalScore > highScore) {
      setHighScore(newTotalScore);
      localStorage.setItem('retrovision_blockfantasy_highscore', newTotalScore.toString());
      if (onScoreSave) onScoreSave('Block Fantasy', newTotalScore);
    }

    // Régénération du présentoir si vidé
    let finalShelf = nextShelf;
    if (nextShelf.every(b => b === null)) {
      finalShelf = [getRandomBlock(), getRandomBlock(), getRandomBlock()];
      setShelfBlocks(finalShelf);
    } else {
      setShelfBlocks(finalShelf);
    }

    checkGameOverState(nextBoard, finalShelf);
  };

  const triggerScreenShake = () => {
    setShakeBoard(true);
    setTimeout(() => setShakeBoard(false), 320);
  };

  const updateQuestProgress = (lines, isCross, currentStreak, stones, ice) => {
    setQuestGoal(prev => {
      let delta = 0;
      if (prev.type === 'lines') delta = lines;
      else if (prev.type === 'double_clears' && lines >= 2) delta = 1;
      else if (prev.type === 'cross_blast' && isCross) delta = 1;
      else if (prev.type === 'combo_streak') {
        return { ...prev, current: Math.max(prev.current, currentStreak) };
      }
      else if (prev.type === 'clear_stone') delta = stones;
      else if (prev.type === 'clear_ice') delta = ice;
      else if (prev.type === 'clear_stone_and_ice') delta = stones + ice;
      else if (prev.type === 'fever_count' && isFeverActive) delta = 1;

      const nextCur = Math.min(prev.target, prev.current + delta);
      if (nextCur >= prev.target) {
        handleLevelSuccess();
      }
      return { ...prev, current: nextCur };
    });
  };

  const handleLevelSuccess = () => {
    setLevelVictory(true);
    sound.playChapterVictory?.();
    const starsEarned = calculateLevelStars(currentLevelIndex, score);
    setVictoryStars(starsEarned);

    // Sauvegarde de progression
    const nextStars = { ...starsMap, [currentLevelIndex]: Math.max(starsMap[currentLevelIndex] || 0, starsEarned) };
    setStarsMap(nextStars);
    try {
      localStorage.setItem('retrovision_blockfantasy_stars', JSON.stringify(nextStars));
    } catch (e) {}

    // Débloquer niveau suivant
    if (currentLevelIndex < ADVENTURE_LEVELS.length) {
      setCustomizations(prev => {
        const next = { ...prev, level: currentLevelIndex + 1 };
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
              canPlay = true;
              break;
            }
          }
          if (canPlay) break;
        }
      }
      if (canPlay) break;
    }

    if (!canPlay) {
      setGameOver(true);
      sound.playBlockedAlert?.();
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

  // --- RENDU D'UNE CELLULE DU PLATEAU ---

  const renderCell = (cell, index) => {
    const isGhost = ghostCells.includes(index);
    const isAnticipate = anticipateClearCells.includes(index);

    let cellContent = null;
    let cellStyle = {};

    if (cell) {
      // Cellule occupée
      cellStyle = {
        backgroundColor: cell.color,
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: activeTheme === 'fantasy' ? `0 0 10px ${cell.color}aa, inset 0 0 4px rgba(255,255,255,0.6)` : 'none'
      };
      if (cell.isStone) {
        cellContent = '🧱';
        cellStyle.backgroundColor = '#475569';
      } else if (cell.isIce) {
        cellContent = '❄️';
        cellStyle.backgroundColor = '#0284c7';
      } else if (cell.isGold) {
        cellContent = '✨';
        cellStyle.backgroundColor = '#f59e0b';
      }
    } else {
      // Case vide
      cellStyle = {
        border: activeTheme === 'wood' ? '1px solid rgba(0, 0, 0, 0.4)' : activeTheme === 'jewel' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(57, 255, 20, 0.15)',
        backgroundColor: activeTheme === 'wood' ? 'rgba(0, 0, 0, 0.25)' : activeTheme === 'jewel' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(57, 255, 20, 0.03)'
      };
    }

    // Effet d'Ombre / Ghost quand un bloc valide survole la case
    if (isGhost && activeDrag && isValidDragHover) {
      cellStyle = {
        backgroundColor: activeDrag.color,
        opacity: 0.65,
        border: '1.5px solid #ffffff',
        boxShadow: `0 0 12px ${activeDrag.color}`,
        transform: 'scale(0.96)'
      };
    }

    // Effet d'Anticipation Shimmer sur les lignes qui vont sauter
    if (isAnticipate) {
      cellStyle = {
        ...cellStyle,
        border: '2px solid #FACC15',
        boxShadow: '0 0 14px #FACC15, inset 0 0 8px #FACC15',
        animation: 'anticipatePulse 0.4s infinite alternate'
      };
    }

    return (
      <div
        key={index}
        className={`grid-cell ${isHammerMode && cell ? 'hammer-target' : ''}`}
        style={cellStyle}
        onClick={() => isHammerMode && handleHammerCellClick(index)}
      >
        {cellContent}
      </div>
    );
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
      default: return { border: isFeverActive ? '3px solid #F59E0B' : '3px solid #39FF14', borderRadius: '10px', boxShadow: isFeverActive ? '0 0 24px rgba(245, 158, 11, 0.6)' : '0 0 16px rgba(57, 255, 20, 0.3)' };
    }
  };

  const getShelfStyles = () => {
    switch (activeTheme) {
      case 'wood': return { border: '4px solid #3d2417', background: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)' };
      case 'jewel': return { border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' };
      default: return { border: '2px dashed rgba(57, 255, 20, 0.4)', background: 'rgba(57, 255, 20, 0.05)', boxShadow: 'inset 0 0 10px rgba(57,255,20,0.1)' };
    }
  };

  // Boutique / Personnalisation
  if (showCustomization) {
    const categories = [
      {
        id: 'theme',
        name: 'Thème Visuel',
        icon: '🎨',
        items: [
          { id: 'fantasy', name: 'Néon Fantasy', icon: '✨' },
          { id: 'wood', name: 'Bois Cosy', icon: '🪵' },
          { id: 'jewel', name: 'Gemmes Translucides', icon: '💎' }
        ]
      },
      {
        id: 'mode',
        name: 'Mode de Jeu',
        icon: '🎮',
        items: [
          { id: 'classic', name: 'Classique Sans Fin', icon: '♾️' },
          { id: 'arcade', name: 'Aventure (10 Chapitres)', icon: '🗺️' }
        ]
      }
    ];

    if (activeMode === 'classic') {
      categories.push({
        id: 'gridSize',
        name: 'Taille de Grille',
        icon: '📐',
        items: [
          { id: 12, name: 'Géant (12x12)', icon: '📏' },
          { id: 10, name: 'Standard (10x10)', icon: '📐' },
          { id: 8, name: 'Mini (8x8)', icon: '🧩' }
        ]
      });
    }

    return (
      <Boutique
        title="BOUTIQUE BLOCK"
        icon="🧱"
        categories={categories}
        currentSelections={{
          theme: activeTheme,
          mode: activeMode,
          gridSize: gridSize,
          level: currentLevelIndex
        }}
        onSelect={(cat, val) => {
          setCustomizations(prev => {
            const next = { ...prev, [cat]: val };
            updateGameConfig('blockfantasy', 'customizations', next);
            return next;
          });
        }}
        onClose={() => setShowCustomization(false)}
      />
    );
  }

  const activeLvlInfo = activeMode === 'arcade' ? getLevelData(currentLevelIndex) : null;

  return (
    <>
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="BLOCK FANTASY"
          icon="🧱"
          colors={['#39FF14', '#FF3366', '#3399FF']}
          particleType="blocks"
          onComplete={() => setShowIntro(false)}
        />
      )}

      <div className="blockfantasy-container game-container" style={{ ...containerStyle, ...getContainerStyles() }}>
        {!isIntermission && (
          <GameHeader
            title="BLOCK FANTASY"
            onBack={handleBackWithConfirm}
            onRestart={initGame}
            showBgmToggle={false}
            onShop={() => setShowCustomization(true)}
            centerContent={
              <div style={statsContainerStyle}>
                <div style={statBoxStyle}><div style={statLabelStyle}>SCORE</div><div style={statValStyle}>{score}</div></div>
                {activeMode === 'classic' ? (
                  <div style={statBoxStyle}><div style={statLabelStyle}>RECORD</div><div style={statValStyle}>{highScore}</div></div>
                ) : (
                  <div style={{ ...statBoxStyle, cursor: 'pointer' }} onClick={() => setShowLevelSelect(true)} title="Changer de niveau">
                    <div style={statLabelStyle}>NIVEAU</div>
                    <div style={{ ...statValStyle, color: '#38BDF8' }}>{currentLevelIndex} 🗺️</div>
                  </div>
                )}
              </div>
            }
          />
        )}

        {isIntermission && (
          <IntermissionHeader
            instructionText="Complétez des lignes ou colonnes pour retourner au jeu principal."
            onRestart={initGame}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={questGoal && questGoal.target > 0 ? (questGoal.current / questGoal.target) : 0}
          />
        )}

        {/* Bannière Mode Aventure (10 Chapitres) */}
        {activeMode === 'arcade' && !isIntermission && activeLvlInfo && (
          <div
            onClick={() => setShowLevelSelect(true)}
            style={chapterBannerStyle}
            title="Cliquer pour choisir un chapitre"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{activeLvlInfo.icon}</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FACC15', fontFamily: 'Orbitron, sans-serif' }}>
                  CHAPITRE {activeLvlInfo.id} : {activeLvlInfo.title.toUpperCase()}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {activeLvlInfo.subtitle} • {activeLvlInfo.difficultyText}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#38BDF8', fontWeight: 'bold' }}>
              🗺️ Chapitres
            </div>
          </div>
        )}

        {/* Barre d'Objectif Aventure */}
        {activeMode === 'arcade' && !isIntermission && (
          <div style={goalBarContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={goalLabelStyle}>
                OBJECTIF : {questGoal.type === 'lines' ? 'Lignes' : questGoal.type === 'double_clears' ? 'Doubles Lignes' : questGoal.type === 'cross_blast' ? 'Cross Blast ⚡' : questGoal.type === 'clear_stone' ? 'Pierres 🧱' : questGoal.type === 'clear_ice' ? 'Glace ❄️' : questGoal.type === 'clear_stone_and_ice' ? 'Pierres & Glaces' : questGoal.type === 'combo_streak' ? 'Combo Streak 👑' : 'Mode Fever 🔥'}
              </span>
              <span style={{ fontSize: '10px', color: '#39FF14', fontWeight: 'bold' }}>
                {questGoal.current} / {questGoal.target}
              </span>
            </div>
            <div style={goalBarOuterStyle}>
              <div style={{ ...goalBarInnerStyle, width: `${Math.min(100, (questGoal.current / questGoal.target) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* Jauge Fantasy Fever */}
        {!isIntermission && (
          <div style={feverBarContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: isFeverActive ? '#F59E0B' : '#94a3b8', letterSpacing: '0.5px' }}>
                {isFeverActive ? `🔥 FANTASY FEVER ACTIF (x2) : ${feverTimer}s` : '⚡ JAUGE FEVER'}
              </span>
              <span style={{ fontSize: '9px', color: isFeverActive ? '#F59E0B' : '#94a3b8', fontWeight: 'bold' }}>
                {isFeverActive ? 'EN COURS !' : `${Math.round(feverMeter)}%`}
              </span>
            </div>
            <div style={feverBarOuterStyle}>
              <div
                style={{
                  ...feverBarInnerStyle,
                  width: `${isFeverActive ? (feverTimer / 12) * 100 : feverMeter}%`,
                  background: isFeverActive ? 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)' : 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)'
                }}
              />
            </div>
          </div>
        )}

        {/* Barre d'Outils de Sauvetage Anti-Blocage */}
        {!isIntermission && (
          <div className="blazer_options" style={actionsRowStyle}>
            <button
              onClick={toggleHammerMode}
              disabled={hammerUsages <= 0 || gameOver || levelVictory}
              className={`retro-btn action-btn-icon ${isHammerMode ? 'hammer-active pulse-glow' : ''}`}
              style={{ ...actionBtnStyle, borderColor: isHammerMode ? '#F43F5E' : '#3b82f6', opacity: hammerUsages <= 0 ? 0.35 : 1 }}
              title="Marteau Céleste: Détruire une tuile ou pierre sur la grille"
            >
              🔨 <span style={actionBadgeStyle}>{hammerUsages}</span>
            </button>

            <button
              onClick={handleReroll}
              disabled={rerollUsages <= 0 || gameOver || levelVictory}
              className="retro-btn action-btn-icon"
              style={{ ...actionBtnStyle, opacity: rerollUsages <= 0 ? 0.35 : 1 }}
              title="Relancer immédiatement les 3 blocs du présentoir"
            >
              🎲 <span style={actionBadgeStyle}>{rerollUsages}</span>
            </button>

            <button
              onClick={toggleRotationMode}
              disabled={rotationUsages <= 0 || gameOver || levelVictory}
              className={`retro-btn action-btn-icon ${isRotationMode ? 'pulse-glow' : ''}`}
              style={{ ...actionBtnStyle, opacity: rotationUsages <= 0 ? 0.35 : 1, borderColor: isRotationMode ? '#39FF14' : '#3b82f6' }}
              title="Pivoter un bloc proposé"
            >
              {isRotationMode ? '✅' : '🔁'} <span style={actionBadgeStyle}>{rotationUsages}</span>
            </button>

            <button
              onClick={handleUseJoker}
              disabled={jokerUsages <= 0 || gameOver || levelVictory}
              className="retro-btn action-btn-icon"
              style={{ ...actionBtnStyle, borderColor: '#FACC15', opacity: jokerUsages <= 0 ? 0.35 : 1 }}
              title="Baguette Joker: Charger un bloc 1x1 sauveur"
            >
              🪄 <span style={{ ...actionBadgeStyle, background: '#FACC15' }}>{jokerUsages}</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={!lastMove || levelVictory}
              className="retro-btn action-btn-icon"
              style={{ ...actionBtnStyle, opacity: (!lastMove) ? 0.35 : 1 }}
              title="Revenir au coup précédent"
            >
              ↩️
            </button>
          </div>
        )}

        {isRotationMode && (
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#39FF14', marginBottom: '4px', fontWeight: 'bold' }}>
            Sélectionnez un bloc ci-dessous pour le faire pivoter
          </div>
        )}

        {isHammerMode && (
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#F43F5E', marginBottom: '4px', fontWeight: 'bold', animation: 'blink 1s infinite' }}>
            🔨 Cliquez sur une case du plateau pour la pulvériser !
          </div>
        )}

        {/* Plateau de Jeu avec Screen Shake & Anticipation */}
        <div style={boardWrapperStyle}>
          <div
            ref={gridRef}
            className={`grid-board ${shakeBoard ? 'screen-shake' : ''}`}
            style={{
              ...gridContainerStyle,
              ...getBoardStyles(),
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              backgroundColor: activeTheme === 'wood' ? '#2e1c10' : activeTheme === 'jewel' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.35)'
            }}
          >
            {board.map((cell, index) => renderCell(cell, index))}

            {particles.map(p => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  borderRadius: '2px',
                  opacity: p.alpha,
                  pointerEvents: 'none',
                  boxShadow: `0 0 6px ${p.color}`
                }}
              />
            ))}

            {floatingScores.map(fs => (
              <div
                key={fs.id}
                style={{
                  position: 'absolute',
                  left: fs.x,
                  top: fs.y,
                  transform: 'translate(-50%, -100%)',
                  color: fs.color || '#39FF14',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px #000, 0 0 10px rgba(0,0,0,0.8)',
                  animation: 'floatUpScore 1.1s forwards',
                  pointerEvents: 'none',
                  zIndex: 20
                }}
              >
                {fs.text}
              </div>
            ))}

            {/* Modal Game Over avec Options de Sauvetage */}
            {gameOver && (
              <div style={overlayStyle}>
                <div style={gameOverTitleStyle}>GRILLE BLOQUÉE</div>
                <div style={descStyle}>Aucun coup possible avec le tirage actuel.</div>
                <div style={statsReportStyle}>Score : <span style={{ color: '#39FF14', fontWeight: 'bold' }}>{score}</span></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '220px' }}>
                  {hammerUsages > 0 && (
                    <button
                      onClick={() => { setGameOver(false); setIsHammerMode(true); }}
                      className="retro-btn pulse-glow"
                      style={{ ...overlayBtnStyle, borderColor: '#F43F5E', color: '#F43F5E' }}
                    >
                      🔨 Sauvetage Marteau ({hammerUsages})
                    </button>
                  )}
                  {rerollUsages > 0 && (
                    <button
                      onClick={handleReroll}
                      className="retro-btn pulse-glow"
                      style={{ ...overlayBtnStyle, borderColor: '#3b82f6', color: '#60a5fa' }}
                    >
                      🎲 Relancer Tirage ({rerollUsages})
                    </button>
                  )}
                  {lastMove && (
                    <button
                      onClick={handleUndo}
                      className="retro-btn"
                      style={{ ...overlayBtnStyle, borderColor: '#eab308', color: '#facc15' }}
                    >
                      ↩️ Annuler Dernier Coup
                    </button>
                  )}
                  <button onClick={initGame} className="retro-btn" style={overlayBtnStyle}>
                    Recommencer
                  </button>
                </div>
              </div>
            )}

            {/* Modal Victoire Chapitre avec Étoiles */}
            {levelVictory && (
              <div style={overlayStyle}>
                <div style={victoryTitleStyle}>CHAPITRE RÉUSSI !</div>
                <div style={{ fontSize: '32px', margin: '8px 0' }}>
                  {'⭐'.repeat(victoryStars)}{'☆'.repeat(3 - victoryStars)}
                </div>
                <div style={descStyle}>Objectif de niveau accompli avec brio.</div>
                <div style={statsReportStyle}>Score Final : <span style={{ color: '#39FF14', fontWeight: 'bold' }}>{score}</span></div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setLevelVictory(false); initGame(); }}
                    className="retro-btn pulse-glow"
                    style={overlayBtnStyle}
                  >
                    {currentLevelIndex < ADVENTURE_LEVELS.length ? 'Chapitre Suivant ➔' : 'Rejouer'}
                  </button>
                  <button
                    onClick={() => { setLevelVictory(false); setShowLevelSelect(true); }}
                    className="retro-btn"
                    style={{ ...overlayBtnStyle, borderColor: '#38BDF8', color: '#38BDF8' }}
                  >
                    Carte 🗺️
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Présentoir des Blocs du Joueur */}
        <div style={{ ...shelfContainerStyle, ...getShelfStyles() }}>
          {shelfBlocks.map((block, index) => {
            if (!block) return <div key={index} style={shelfSlotStyle} />;
            const isDragged = activeDrag && activeDrag.blockIndex === index;
            return (
              <div
                key={index}
                style={{ ...shelfSlotStyle, opacity: isDragged ? 0 : 1, cursor: isRotationMode ? 'pointer' : 'grab' }}
                onMouseDown={(e) => handleShelfBlockInteract(e, block, index)}
                onTouchStart={(e) => handleShelfBlockInteract(e, block, index)}
              >
                <div
                  style={{
                    ...miniBlockContainerStyle,
                    animation: isRotationMode ? 'wobble 1.5s infinite ease-in-out' : 'none',
                    filter: isRotationMode ? 'drop-shadow(0 0 6px #39FF14)' : 'none'
                  }}
                >
                  {block.matrix.map((row, rIdx) => (
                    <div key={rIdx} style={{ display: 'flex' }}>
                      {row.map((val, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            width: '20px',
                            height: '20px',
                            margin: '1.5px',
                            borderRadius: '3px',
                            backgroundColor: val === 1 ? block.color : 'transparent',
                            border: val === 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                            boxShadow: val === 1 && activeTheme === 'fantasy' ? `0 0 6px ${block.color}` : 'none'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* BLOC FLOTTANT EN COURS DE DRAG AVEC OMBRE PORTÉE PHYSIQUE & TILT RÉACTIF */}
        {activeDrag && (
          <div
            style={{
              position: 'fixed',
              left: activeDrag.x - activeDrag.dragOffsetX,
              top: activeDrag.y - activeDrag.dragOffsetY,
              pointerEvents: 'none',
              zIndex: 9999,
              transform: `rotate(${tiltAngle}deg) scale(1.04)`,
              transformOrigin: 'center center',
              transition: 'transform 0.08s ease-out',
              // Ombre portée naturelle réactive qui donne la sensation de volume 3D en lévitation
              filter: `drop-shadow(${tiltAngle * -1.5}px 18px 16px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 10px ${activeDrag.color}66)`
            }}
          >
            {activeDrag.matrix.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'flex' }}>
                {row.map((val, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      width: `${activeDrag.cellWidth - 3}px`,
                      height: `${activeDrag.cellWidth - 3}px`,
                      margin: '1.5px',
                      borderRadius: '4px',
                      backgroundColor: val === 1 ? activeDrag.color : 'transparent',
                      border: val === 1 ? '1.5px solid rgba(255,255,255,0.6)' : 'none',
                      boxShadow: val === 1 ? `0 0 12px ${activeDrag.color}, inset 0 0 6px rgba(255,255,255,0.5)` : 'none',
                      opacity: val === 1 ? 1 : 0
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Modal Sélecteur des 10 Chapitres Aventure */}
        {showLevelSelect && (
          <div style={levelModalOverlayStyle}>
            <div style={levelModalContentStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: '#38BDF8', fontFamily: 'Orbitron, sans-serif', fontSize: '16px' }}>
                  🗺️ CARTE DES 10 CHAPITRES
                </h3>
                <button
                  onClick={() => setShowLevelSelect(false)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                {ADVENTURE_LEVELS.map(lvl => {
                  const isCurrent = currentLevelIndex === lvl.id;
                  const stars = starsMap[lvl.id] || 0;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        setCustomizations(prev => {
                          const next = { ...prev, mode: 'arcade', level: lvl.id };
                          updateGameConfig('blockfantasy', 'customizations', next);
                          return next;
                        });
                        setShowLevelSelect(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: isCurrent ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{lvl.icon}</span>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
                            {lvl.id}. {lvl.title}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {lvl.subtitle} • {lvl.difficultyText}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {stars > 0 ? '⭐'.repeat(stars) : <span style={{ color: '#64748b', fontSize: '11px' }}>Non joué</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div style={footerHelpStyle}>
          {isIntermission ? (
            <span>Complétez n'importe quelle ligne ou colonne pour passer l'entracte.</span>
          ) : (
            <span>Glissez les formes dans la grille. Complétez lignes et colonnes pour déclencher des combos !</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatUpScore {
          0% { transform: translate(-50%, -100%) scale(0.9); opacity: 1; }
          50% { transform: translate(-50%, -180%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -240%) scale(0.9); opacity: 0; }
        }
        @keyframes wobble {
          0%, 100% { transform: rotate(-4deg) scale(0.92); }
          50% { transform: rotate(4deg) scale(0.92); }
        }
        @keyframes anticipatePulse {
          0% { transform: scale(0.97); filter: brightness(1.1); }
          100% { transform: scale(1.02); filter: brightness(1.4); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .screen-shake {
          animation: shake 0.32s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }
        .grid-cell {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          transition: background-color 0.08s, border-color 0.08s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          user-select: none;
        }
        .hammer-target {
          cursor: crosshair !important;
          animation: blink 0.8s infinite alternate;
        }
        .action-btn-icon {
          position: relative;
          font-size: 22px;
          width: 48px;
          height: 48px;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px !important;
        }
      `}</style>
    </>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '430px', boxSizing: 'border-box', margin: '0 auto', padding: '14px' };
const statsContainerStyle = { display: 'flex', gap: '10px' };
const statBoxStyle = { flex: 1, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '5px 8px', textAlign: 'center' };
const statLabelStyle = { fontSize: '9px', color: '#8e8a9f', fontFamily: 'Orbitron, sans-serif', marginBottom: '2px' };
const statValStyle = { fontSize: '15px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Orbitron, sans-serif' };

const chapterBannerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 12px',
  background: 'rgba(56, 189, 248, 0.08)',
  border: '1px solid rgba(56, 189, 248, 0.25)',
  borderRadius: '8px',
  margin: '6px 0 4px 0',
  cursor: 'pointer'
};

const goalBarContainerStyle = { display: 'flex', flexDirection: 'column', gap: '3px', margin: '4px 0 6px 0', width: '100%' };
const goalLabelStyle = { fontSize: '10px', color: '#8e8a9f', fontWeight: 'bold', letterSpacing: '0.5px', fontFamily: 'Orbitron, sans-serif' };
const goalBarOuterStyle = { position: 'relative', width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' };
const goalBarInnerStyle = { position: 'absolute', left: 0, top: 0, bottom: 0, background: 'linear-gradient(90deg, #10B981 0%, #39FF14 100%)', borderRadius: '5px', transition: 'width 0.3s ease' };

const feverBarContainerStyle = { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '6px', width: '100%' };
const feverBarOuterStyle = { position: 'relative', width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' };
const feverBarInnerStyle = { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '3px', transition: 'width 0.25s ease' };

const boardWrapperStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '4px 0 8px 0' };
const gridContainerStyle = { position: 'relative', display: 'grid', gap: '3px', width: '100%', aspectRatio: '1 / 1', padding: '6px', boxSizing: 'border-box', overflow: 'hidden' };
const shelfContainerStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: '96px', margin: '2px 0 6px 0', borderRadius: '12px', padding: '6px', boxSizing: 'border-box' };
const shelfSlotStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', transition: 'transform 0.2s', userSelect: 'none' };
const miniBlockContainerStyle = { display: 'flex', flexDirection: 'column', transform: 'scale(0.92)', transition: 'all 0.2s' };
const actionsRowStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', margin: '2px 0 8px 0' };

const actionBtnStyle = {
  border: '1px solid #3b82f6',
  background: 'rgba(59, 130, 246, 0.12)',
  color: '#ffffff',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)'
};

const actionBadgeStyle = {
  position: 'absolute',
  top: '-5px',
  right: '-5px',
  background: '#39FF14',
  color: '#000',
  fontSize: '9px',
  fontWeight: 'bold',
  padding: '1px 5px',
  borderRadius: '10px',
  border: '1.5px solid #14151F',
  fontFamily: 'system-ui'
};

const overlayStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 8, 19, 0.94)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 30, padding: '20px', textAlign: 'center', backdropFilter: 'blur(6px)' };
const gameOverTitleStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '24px', color: '#ff3366', textShadow: '0 0 12px #ff3366', fontWeight: 'bold', marginBottom: '8px' };
const victoryTitleStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '24px', color: '#39FF14', textShadow: '0 0 12px #39FF14', fontWeight: 'bold', marginBottom: '6px' };
const descStyle = { color: '#ffffff', fontSize: '13px', marginBottom: '14px' };
const statsReportStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '15px', color: '#ffffff', marginBottom: '18px' };
const overlayBtnStyle = { padding: '9px 18px', fontSize: '13px', border: '2px solid #39FF14', background: 'transparent', color: '#39FF14', boxShadow: '0 0 10px rgba(57, 255, 20, 0.25)', cursor: 'pointer', borderRadius: '8px', fontFamily: 'Orbitron, sans-serif' };
const footerHelpStyle = { marginTop: '4px', fontSize: '11px', color: '#8e8a9f', textAlign: 'center', lineHeight: '1.4' };

const levelModalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' };
const levelModalContentStyle = { background: '#111827', border: '1.5px solid #38BDF8', borderRadius: '16px', padding: '18px', width: '100%', maxWidth: '420px', boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)' };
