import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

function MahjongIcon({ name }) {
  const size = 34;
  switch (name) {
    case 'fa': // Green Dragon
      return (
        <span style={{
          fontSize: '32px',
          color: '#16a34a',
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1'
        }}>
          發
        </span>
      );
    case 'xi': // West Wind
      return (
        <span style={{
          fontSize: '32px',
          color: '#1f2937',
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1'
        }}>
          西
        </span>
      );
    case 'six': // Six Character
      return (
        <span style={{
          fontSize: '32px',
          color: '#1d4ed8',
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1'
        }}>
          六
        </span>
      );
    case 'two': // Two Character
      return (
        <span style={{
          fontSize: '32px',
          color: '#1d4ed8',
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1'
        }}>
          二
        </span>
      );
    case 'circles': // 9 Dots
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="5" cy="5" r="2.8" fill="#166534" />
          <circle cx="12" cy="5" r="2.8" fill="#991b1b" />
          <circle cx="19" cy="5" r="2.8" fill="#1e40af" />
          <circle cx="5" cy="12" r="2.8" fill="#991b1b" />
          <circle cx="12" cy="12" r="2.8" fill="#1e40af" />
          <circle cx="19" cy="12" r="2.8" fill="#166534" />
          <circle cx="5" cy="19" r="2.8" fill="#1e40af" />
          <circle cx="12" cy="19" r="2.8" fill="#166534" />
          <circle cx="19" cy="19" r="2.8" fill="#991b1b" />
        </svg>
      );
    case 'eight_dots': // 8 Blue Dots
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="7" cy="4" r="2.5" fill="#1d4ed8" />
          <circle cx="17" cy="4" r="2.5" fill="#1d4ed8" />
          <circle cx="7" cy="9.5" r="2.5" fill="#1d4ed8" />
          <circle cx="17" cy="9.5" r="2.5" fill="#1d4ed8" />
          <circle cx="7" cy="15" r="2.5" fill="#1d4ed8" />
          <circle cx="17" cy="15" r="2.5" fill="#1d4ed8" />
          <circle cx="7" cy="20.5" r="2.5" fill="#1d4ed8" />
          <circle cx="17" cy="20.5" r="2.5" fill="#1d4ed8" />
        </svg>
      );
    case 'one_circle': // 1 Dot
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#15803d" />
          <circle cx="12" cy="12" r="8" fill="#1d4ed8" />
          <circle cx="12" cy="12" r="4.5" fill="#dc2626" />
          <circle cx="12" cy="12" r="1.8" fill="#ffffff" />
        </svg>
      );
    case 'bamboo_green_3': // 3 Green Sticks
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="5" y="4" width="3" height="16" rx="1.2" fill="#166534" />
          <circle cx="6.5" cy="12" r="1" fill="#ffffff" />
          <rect x="11" y="4" width="3" height="16" rx="1.2" fill="#166534" />
          <circle cx="12.5" cy="12" r="1" fill="#ffffff" />
          <rect x="17" y="4" width="3" height="16" rx="1.2" fill="#166534" />
          <circle cx="18.5" cy="12" r="1" fill="#ffffff" />
        </svg>
      );
    case 'bamboo_red_3': // 3 Red Sticks
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="5" y="4" width="3" height="16" rx="1.2" fill="#b91c1c" />
          <circle cx="6.5" cy="12" r="1" fill="#ffffff" />
          <rect x="11" y="4" width="3" height="16" rx="1.2" fill="#b91c1c" />
          <circle cx="12.5" cy="12" r="1" fill="#ffffff" />
          <rect x="17" y="4" width="3" height="16" rx="1.2" fill="#b91c1c" />
          <circle cx="18.5" cy="12" r="1" fill="#ffffff" />
        </svg>
      );
    case 'bamboo_green_4': // 4 Green Sticks (H shape)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="6" y="3" width="3" height="8" rx="1" fill="#166534" />
          <rect x="15" y="3" width="3" height="8" rx="1" fill="#166534" />
          <rect x="6" y="13" width="3" height="8" rx="1" fill="#166534" />
          <rect x="15" y="13" width="3" height="8" rx="1" fill="#166534" />
          <rect x="9" y="10.5" width="6" height="3" rx="0.5" fill="#166534" />
        </svg>
      );
    case 'flower': // Pink Cherry Blossom with leaves
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          {/* Green backing leaves */}
          <path d="M6 15C4 17 4 20 7 19C8 18 8 16 7 15Z" fill="#166534" />
          <path d="M18 15C20 17 20 20 17 19C16 18 16 16 17 15Z" fill="#166534" />
          {/* Blossom Petals */}
          <circle cx="12" cy="7.5" r="4" fill="#f472b6" />
          <circle cx="7.5" cy="11.5" r="4" fill="#f472b6" />
          <circle cx="16.5" cy="11.5" r="4" fill="#f472b6" />
          <circle cx="9.5" cy="16.5" r="4" fill="#f472b6" />
          <circle cx="14.5" cy="16.5" r="4" fill="#f472b6" />
          {/* Yellow Center */}
          <circle cx="12" cy="12.5" r="2.8" fill="#facc15" />
          <circle cx="12" cy="12.5" r="1.2" fill="#ca8a04" />
        </svg>
      );
    case 'leaf': // Orange Maple Leaf on Yellow Disk
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#f97316" />
          <circle cx="12" cy="12" r="8.5" fill="#facc15" />
          {/* Stylized Leaf */}
          <path d="M12 5.5L13.5 8.5L16.5 8L15 11L17.5 13L14 13.5L12 17L10 13.5L6.5 13L9 11L7.5 8L10.5 8.5L12 5.5Z" fill="#ea580c" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MahjongZen({ onBack, onScoreSave }) {
  const [mode, setMode] = useState(() => localStorage.getItem('retrovision_mahjong_mode') || 'slide');
  const [boardSize, setBoardSize] = useState(() => localStorage.getItem('retrovision_mahjong_size') || 'large');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showArrows, setShowArrows] = useState(false); // Hidden by default to match reference

  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [hintIds, setHintIds] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('retrovision_mahjong_highscore_val')) || 2147;
  });

  const [dragStart, setDragStart] = useState(null);
  const [initialTilesForDrag, setInitialTilesForDrag] = useState(null);
  const [matchingLines, setMatchingLines] = useState([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [dragHasMoved, setDragHasMoved] = useState(false);
  const [vibratingSymbol, setVibratingSymbol] = useState(null);

  const symbols = [
    { name: 'fa' },
    { name: 'xi' },
    { name: 'six' },
    { name: 'two' },
    { name: 'circles' },
    { name: 'eight_dots' },
    { name: 'one_circle' },
    { name: 'bamboo_green_3' },
    { name: 'bamboo_red_3' },
    { name: 'bamboo_green_4' },
    { name: 'flower' },
    { name: 'leaf' },
  ];

  const maxRows = boardSize === 'small' ? 4 : boardSize === 'medium' ? 6 : 8;

  useEffect(() => {
    initGame();
  }, [mode, boardSize]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('retrovision_mahjong_highscore_val', score.toString());
    }
  }, [score, highScore]);

  // Zen layout config (multiple Z-layers)
  const getLayoutPatterns = (size) => {
    const slots = [];
    if (size === 'small') {
      for (let y = 1; y <= 4; y++) {
        for (let x = 1; x <= 6; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 3; y++) {
        for (let x = 2; x <= 5; x++) {
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 2; y <= 3; y++) {
        for (let x = 3; x <= 4; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
    } else if (size === 'medium') {
      for (let y = 1; y <= 6; y++) {
        for (let x = 1; x <= 8; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 5; y++) {
        for (let x = 2; x <= 7; x++) {
          if ((x === 2 || x === 7) && (y === 2 || y === 5)) continue;
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 3; y <= 4; y++) {
        for (let x = 4; x <= 5; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
    } else {
      // 144 tiles total
      for (let y = 1; y <= 8; y++) {
        for (let x = 1; x <= 10; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 7; y++) {
        for (let x = 2; x <= 9; x++) {
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 3; y <= 5; y++) {
        for (let x = 4; x <= 7; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
      for (let y = 4; y <= 5; y++) {
        for (let x = 5; x <= 6; x++) {
          slots.push({ x, y, z: 3 });
        }
      }
    }
    return slots;
  };

  // Reversed Generation to guarantee Zen Solitaire solubility
  const generateSolubleZenLayout = (size) => {
    const slots = getLayoutPatterns(size);
    const totalTiles = slots.length;

    const pool = [];
    let symIdx = 0;
    while (pool.length < totalTiles) {
      const sym = symbols[symIdx % symbols.length];
      for (let i = 0; i < 4; i++) {
        pool.push({ ...sym });
      }
      symIdx++;
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const occupied = new Set();
    const boardTiles = [];
    let idCounter = 1;

    const isOccupied = (x, y, z) => occupied.has(`${x},${y},${z}`);

    const isSlotFreeToFill = (slot) => {
      const { x, y, z } = slot;
      if (isOccupied(x, y, z + 1)) return false;
      const leftOccupied = isOccupied(x - 1, y, z);
      const rightOccupied = isOccupied(x + 1, y, z);
      if (leftOccupied && rightOccupied) return false;
      return true;
    };

    const remainingSlots = [...slots];
    while (remainingSlots.length > 0) {
      const freeSlots = remainingSlots.filter(isSlotFreeToFill);

      if (freeSlots.length < 2) {
        const s1 = remainingSlots.pop();
        const s2 = remainingSlots.pop() || s1;
        if (!s1) break;

        const sym = pool.pop();
        boardTiles.push({ id: idCounter++, x: s1.x, y: s1.y, z: s1.z, sym, active: true });
        occupied.add(`${s1.x},${s1.y},${s1.z}`);

        if (s2 !== s1) {
          const sym2 = pool.pop() || sym;
          boardTiles.push({ id: idCounter++, x: s2.x, y: s2.y, z: s2.z, sym: sym2, active: true });
          occupied.add(`${s2.x},${s2.y},${s2.z}`);
        }
        continue;
      }

      const idx1 = Math.floor(Math.random() * freeSlots.length);
      let idx2 = Math.floor(Math.random() * freeSlots.length);
      while (idx2 === idx1 && freeSlots.length > 1) {
        idx2 = Math.floor(Math.random() * freeSlots.length);
      }

      const slot1 = freeSlots[idx1];
      const slot2 = freeSlots[idx2];

      const s1Index = remainingSlots.findIndex(s => s.x === slot1.x && s.y === slot1.y && s.z === slot1.z);
      remainingSlots.splice(s1Index, 1);
      const s2Index = remainingSlots.findIndex(s => s.x === slot2.x && s.y === slot2.y && s.z === slot2.z);
      remainingSlots.splice(s2Index, 1);

      const sym = pool.pop();
      boardTiles.push({ id: idCounter++, x: slot1.x, y: slot1.y, z: slot1.z, sym, active: true });
      occupied.add(`${slot1.x},${slot1.y},${slot1.z}`);

      boardTiles.push({ id: idCounter++, x: slot2.x, y: slot2.y, z: slot2.z, sym, active: true });
      occupied.add(`${slot2.x},${slot2.y},${slot2.z}`);
    }

    return boardTiles;
  };

  const initGame = () => {
    setHintIds([]);
    setSelectedTile(null);
    setHistory([]);
    setWon(false);
    setLost(false);
    setScore(0);
    setHintsLeft(3);
    setMatchingLines([]);

    if (mode === 'zen') {
      const initialTiles = generateSolubleZenLayout(boardSize);
      setTiles(initialTiles);
    } else {
      const tileCounts = boardSize === 'small' ? 24 : boardSize === 'medium' ? 36 : 48;
      const pool = [];
      let symIdx = 0;
      while (pool.length < tileCounts) {
        const sym = symbols[symIdx % symbols.length];
        pool.push({ ...sym });
        pool.push({ ...sym });
        symIdx++;
      }

      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const slots = [];
      for (let y = 1; y <= maxRows; y++) {
        for (let x = 1; x <= 6; x++) {
          slots.push({ x, y });
        }
      }

      for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }

      const boardTiles = [];
      for (let i = 0; i < pool.length; i++) {
        const slot = slots[i];
        boardTiles.push({
          id: i + 1,
          x: slot.x,
          y: slot.y,
          z: 0,
          sym: pool[i],
          active: true,
        });
      }
      setTiles(boardTiles);
    }
  };

  const saveToHistory = () => {
    const state = {
      tiles: JSON.stringify(tiles),
      score,
      selectedTile: selectedTile ? JSON.stringify(selectedTile) : null,
    };
    setHistory(prev => [...prev, state]);
  };

  const isTileFree = (tile, currentTiles = tiles) => {
    const { x, y, z } = tile;
    const hasTileOnTop = currentTiles.some(t => t.active && t.z === z + 1 && t.x === x && t.y === y);
    if (hasTileOnTop) return false;
    const hasLeft = currentTiles.some(t => t.active && t.z === z && t.x === x - 1 && t.y === y);
    const hasRight = currentTiles.some(t => t.active && t.z === z && t.x === x + 1 && t.y === y);
    if (hasLeft && hasRight) return false;
    return true;
  };

  const checkLostZen = (currentTiles) => {
    const active = currentTiles.filter(t => t.active);
    if (active.length === 0) return false;

    const freeTiles = active.filter(t => isTileFree(t, currentTiles));
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].sym.name === freeTiles[j].sym.name) {
          return false;
        }
      }
    }
    return true;
  };

  const handleZenTileClick = (tile) => {
    if (won || lost) return;
    setHintIds([]);

    if (!isTileFree(tile)) {
      sound.playClick();
      return;
    }

    if (selectedTile === null) {
      // Check if there is any other free tile with the same symbol
      const active = tiles.filter(t => t.active && t.id !== tile.id && isTileFree(t));
      const hasMatch = active.some(t => t.sym.name === tile.sym.name);
      if (hasMatch) {
        setSelectedTile(tile);
        sound.playClick();
      } else {
        setVibratingSymbol(tile.sym.name);
        sound.playClick();
        setTimeout(() => setVibratingSymbol(null), 400);
      }
    } else {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        sound.playClick();
      } else if (selectedTile.sym.name === tile.sym.name) {
        saveToHistory();
        sound.playScore();
        setScore(prev => prev + 10);

        const nextTiles = tiles.map(t =>
          (t.id === tile.id || t.id === selectedTile.id) ? { ...t, active: false } : t
        );
        setTiles(nextTiles);
        setSelectedTile(null);

        if (nextTiles.every(t => !t.active)) {
          setWon(true);
          sound.playPowerup();
          if (onScoreSave) onScoreSave('Mahjong Zen', score + 100);
        } else if (checkLostZen(nextTiles)) {
          setLost(true);
          sound.playClick();
        }
      } else {
        // If clicking a different symbol, check if the new one has free matches
        const active = tiles.filter(t => t.active && t.id !== tile.id && isTileFree(t));
        const hasMatch = active.some(t => t.sym.name === tile.sym.name);
        if (hasMatch) {
          setSelectedTile(tile);
          sound.playClick();
        } else {
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      }
    }
  };

  const shiftRow = (y, direction) => {
    saveToHistory();
    sound.playClick();
    const originalTiles = tiles.map(t => ({ ...t }));

    const nextTiles = tiles.map(t => {
      if (t.y === y && t.z === 0) {
        let nextX = t.x + direction;
        if (nextX > 6) nextX = 1;
        if (nextX < 1) nextX = 6;
        return { ...t, x: nextX };
      }
      return t;
    });

    setTiles(nextTiles);
    setTimeout(() => {
      checkForMatchesAndResolve(nextTiles, originalTiles);
    }, 100);
  };

  const shiftColumn = (x, direction) => {
    saveToHistory();
    sound.playClick();
    const originalTiles = tiles.map(t => ({ ...t }));

    const nextTiles = tiles.map(t => {
      if (t.x === x && t.z === 0) {
        let nextY = t.y + direction;
        if (nextY > maxRows) nextY = 1;
        if (nextY < 1) nextY = maxRows;
        return { ...t, y: nextY };
      }
      return t;
    });

    setTiles(nextTiles);
    setTimeout(() => {
      checkForMatchesAndResolve(nextTiles, originalTiles);
    }, 100);
  };

  // Push Block Sliding simulation
  const canPushTile = (tileId, dx, dy, nextCoords, currentTiles) => {
    const tile = currentTiles.find(t => t.id === tileId);
    if (!tile) return false;
    const nextX = tile.x + dx;
    const nextY = tile.y + dy;

    if (nextX < 1 || nextX > 6 || nextY < 1 || nextY > maxRows) {
      return false;
    }

    const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
    if (obstacle) {
      return canPushTile(obstacle.id, dx, dy, nextCoords, currentTiles);
    }
    return true;
  };

  const pushTile = (tileId, dx, dy, nextCoords, currentTiles) => {
    const tile = currentTiles.find(t => t.id === tileId);
    if (!tile) return;
    const nextX = tile.x + dx;
    const nextY = tile.y + dy;

    const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
    if (obstacle) {
      pushTile(obstacle.id, dx, dy, nextCoords, currentTiles);
    }
    nextCoords.set(tileId, { x: nextX, y: nextY });
  };

  const handleTileMouseDown = (e, tile) => {
    if (mode !== 'slide' || won || lost || matchingLines.length > 0) return;
    setDragStart({
      tileId: tile.id,
      screenX: e.clientX,
      screenY: e.clientY
    });
    setInitialTilesForDrag(tiles.map(t => ({ ...t })));
    setDragHasMoved(false);
  };

  const handleTileTouchStart = (e, tile) => {
    if (mode !== 'slide' || won || lost || matchingLines.length > 0) return;
    const touch = e.touches[0];
    setDragStart({
      tileId: tile.id,
      screenX: touch.clientX,
      screenY: touch.clientY
    });
    setInitialTilesForDrag(tiles.map(t => ({ ...t })));
    setDragHasMoved(false);
  };

  const handleTileMouseMove = (e) => {
    if (!dragStart || !initialTilesForDrag) return;
    const dx = e.clientX - dragStart.screenX;
    const dy = e.clientY - dragStart.screenY;
    processDrag(dx, dy);
  };

  const handleTileTouchMove = (e) => {
    if (!dragStart || !initialTilesForDrag) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.screenX;
    const dy = touch.clientY - dragStart.screenY;
    processDrag(dx, dy);
  };

  const processDrag = (dx, dy) => {
    const cellWidth = 58;
    const cellHeight = 72;

    let gridDx = 0;
    let gridDy = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
      gridDx = Math.round(dx / cellWidth);
    } else {
      gridDy = Math.round(dy / cellHeight);
    }

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setDragHasMoved(true);
    }

    if (gridDx === 0 && gridDy === 0) {
      setTiles(initialTilesForDrag);
      return;
    }

    let currentLayout = initialTilesForDrag.map(t => ({ ...t }));
    const dragTile = currentLayout.find(t => t.id === dragStart.tileId);
    if (!dragTile) return;

    const stepX = gridDx > 0 ? 1 : gridDx < 0 ? -1 : 0;
    const stepY = gridDy > 0 ? 1 : gridDy < 0 ? -1 : 0;
    const totalSteps = Math.max(Math.abs(gridDx), Math.abs(gridDy));

    for (let step = 0; step < totalSteps; step++) {
      const nextCoords = new Map();
      currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));

      if (canPushTile(dragTile.id, stepX, stepY, nextCoords, currentLayout)) {
        pushTile(dragTile.id, stepX, stepY, nextCoords, currentLayout);
        currentLayout = currentLayout.map(t => {
          const coord = nextCoords.get(t.id);
          return { ...t, x: coord.x, y: coord.y };
        });
      } else {
        break;
      }
    }

    setTiles(currentLayout);
  };

  const handleDragRelease = () => {
    if (!dragStart) return;
    const finalTiles = [...tiles];
    const originalTiles = initialTilesForDrag;
    const isClick = !dragHasMoved;

    const clickTileId = dragStart.tileId;

    setDragStart(null);
    setInitialTilesForDrag(null);

    if (isClick) {
      const clickedTile = tiles.find(t => t.id === clickTileId);
      if (clickedTile) {
        handleSlideTileClick(clickedTile);
      }
    } else {
      checkForMatchesAndResolve(finalTiles, originalTiles);
    }
  };

  // Helper to check if a straight line segment path is clear of active tiles
  const checkPathClear = (x1, y1, x2, y2, activeTiles, ignoreIds = []) => {
    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY + 1; y < maxY; y++) {
        if (y < 1 || y > maxRows) continue;
        if (x1 < 1 || x1 > 6) continue;
        const hasTile = activeTiles.some(t => t.active && t.x === x1 && t.y === y && !ignoreIds.includes(t.id));
        if (hasTile) return false;
      }
      return true;
    }
    if (y1 === y2) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX + 1; x < maxX; x++) {
        if (x < 1 || x > 6) continue;
        if (y1 < 1 || y1 > maxRows) continue;
        const hasTile = activeTiles.some(t => t.active && t.x === x && t.y === y1 && !ignoreIds.includes(t.id));
        if (hasTile) return false;
      }
      return true;
    }
    return false;
  };

  // Find connection path (0 turns only for straight line matching in Slider)
  const findConnectionPath = (t1, t2, activeTiles) => {
    const ignoreIds = [t1.id, t2.id];

    // Direct (0 turns)
    if (t1.x === t2.x && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) {
      return [t1, t2];
    }
    if (t1.y === t2.y && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) {
      return [t1, t2];
    }

    return null;
  };

  // Gravity and Column Merging
  const applyGravityAndColumnMerging = (currentTiles) => {
    let tempTiles = currentTiles.map(t => ({ ...t }));

    // Vertical Gravity
    for (let x = 1; x <= 6; x++) {
      const colTiles = tempTiles.filter(t => t.active && t.x === x);
      colTiles.sort((a, b) => b.y - a.y);
      let nextY = maxRows;
      colTiles.forEach(tile => {
        const tObj = tempTiles.find(t => t.id === tile.id);
        if (tObj) tObj.y = nextY;
        nextY--;
      });
    }

    // Horizontal Column Merging
    let emptyColFound = true;
    while (emptyColFound) {
      emptyColFound = false;
      for (let x = 1; x < 6; x++) {
        const currentColActive = tempTiles.some(t => t.active && t.x === x);
        const rightColActive = tempTiles.some(t => t.active && t.x > x);
        if (!currentColActive && rightColActive) {
          tempTiles = tempTiles.map(t => {
            if (t.active && t.x > x) return { ...t, x: t.x - 1 };
            return t;
          });
          emptyColFound = true;
          break;
        }
      }
    }

    return tempTiles;
  };

  const handleSlideTileClick = (tile) => {
    if (won || lost || matchingLines.length > 0) return;
    setDragStart(null);
    setHintIds([]);

    if (selectedTile === null) {
      // Check if there is exactly one aligned match on the board
      const alignedMatches = [];
      const active = tiles.filter(t => t.active && t.id !== tile.id);
      for (const t of active) {
        if (t.sym.name === tile.sym.name) {
          const path = findConnectionPath(tile, t, tiles);
          if (path) {
            alignedMatches.push({ t, path });
          }
        }
      }

      if (alignedMatches.length === 1) {
        // One-click match!
        const match = alignedMatches[0];
        saveToHistory();
        sound.playScore();
        const newScore = score + 20;
        setScore(newScore);
        resolveClickMatch(tile.id, match.t.id, match.path, newScore);
      } else if (alignedMatches.length > 1) {
        // Otherwise select it
        setSelectedTile(tile);
        sound.playClick();
      } else {
        // No aligned matches! Vibrate all tiles of this symbol
        setVibratingSymbol(tile.sym.name);
        sound.playClick();
        setTimeout(() => setVibratingSymbol(null), 400);
      }
    } else {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        sound.playClick();
      } else if (selectedTile.sym.name === tile.sym.name) {
        const path = findConnectionPath(selectedTile, tile, tiles);
        if (path) {
          saveToHistory();
          sound.playScore();
          const newScore = score + 20;
          setScore(newScore);
          resolveClickMatch(selectedTile.id, tile.id, path, newScore);
          setSelectedTile(null);
        } else {
          // Not aligned: vibrate both and deselect
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      } else {
        // Different symbol: check if the new one has any aligned matches, else vibrate
        const alignedMatches = [];
        const active = tiles.filter(t => t.active && t.id !== tile.id);
        for (const t of active) {
          if (t.sym.name === tile.sym.name) {
            const path = findConnectionPath(tile, t, tiles);
            if (path) {
              alignedMatches.push({ t, path });
            }
          }
        }

        if (alignedMatches.length > 0) {
          setSelectedTile(tile);
          sound.playClick();
        } else {
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      }
    }
  };

  const resolveClickMatch = async (tileId1, tileId2, path, newScore) => {
    setMatchingLines([path]);

    const matchedIds = new Set([tileId1, tileId2]);
    let nextTiles = tiles.map(t =>
      matchedIds.has(t.id) ? { ...t, matching: true } : t
    );
    setTiles(nextTiles);

    await new Promise(resolve => setTimeout(resolve, 600));

    nextTiles = nextTiles.map(t =>
      matchedIds.has(t.id) ? { ...t, active: false, matching: false } : t
    );

    setTiles(nextTiles);
    setMatchingLines([]);

    if (nextTiles.every(t => !t.active)) {
      setWon(true);
      sound.playPowerup();
      if (onScoreSave) onScoreSave('Mahjong Slide', newScore + 100);
    }
  };

  const checkForMatchesAndResolve = async (currentTiles, originalTiles, draggedTileId) => {
    let nextTiles = currentTiles.map(t => ({ ...t }));
    const activeTiles = nextTiles.filter(t => t.active);

    // Track only moved tiles to prevent automatic explosion of static adjacent tiles
    const movedTileIds = new Set();
    currentTiles.forEach(tile => {
      const orig = originalTiles?.find(o => o.id === tile.id);
      if (orig && (tile.x !== orig.x || tile.y !== orig.y)) {
        movedTileIds.add(tile.id);
      }
    });

    let matchFound = null;

    if (draggedTileId) {
      const draggedTile = nextTiles.find(t => t.id === draggedTileId);
      if (draggedTile && draggedTile.active) {
        const active = nextTiles.filter(t => t.active && t.id !== draggedTileId);
        for (const t2 of active) {
          if (t2.sym.name === draggedTile.sym.name) {
            const path = findConnectionPath(draggedTile, t2, nextTiles);
            if (path) {
              matchFound = { t1: draggedTile, t2, path };
              break;
            }
          }
        }
      }
    } else {
      // For helper arrows: check any moved tile, but only take at most one match
      for (let i = 0; i < activeTiles.length; i++) {
        for (let j = i + 1; j < activeTiles.length; j++) {
          const t1 = activeTiles[i];
          const t2 = activeTiles[j];

          if (!movedTileIds.has(t1.id) && !movedTileIds.has(t2.id)) {
            continue;
          }

          if (t1.sym.name === t2.sym.name) {
            const path = findConnectionPath(t1, t2, activeTiles);
            if (path) {
              matchFound = { t1, t2, path };
              break;
            }
          }
        }
        if (matchFound) break;
      }
    }

    if (matchFound) {
      sound.playScore();
      const newScore = score + 20;
      setScore(newScore);

      // Save connection path to draw
      setMatchingLines([matchFound.path]);

      const matchedIds = new Set([matchFound.t1.id, matchFound.t2.id]);
      nextTiles = nextTiles.map(t =>
        matchedIds.has(t.id) ? { ...t, matching: true } : t
      );
      setTiles(nextTiles);

      await new Promise(resolve => setTimeout(resolve, 600));

      nextTiles = nextTiles.map(t =>
        matchedIds.has(t.id) ? { ...t, active: false, matching: false } : t
      );

      // Save final tiles state without gravity
      setTiles(nextTiles);
      setMatchingLines([]);

      if (nextTiles.every(t => !t.active)) {
        setWon(true);
        sound.playPowerup();
        if (onScoreSave) onScoreSave('Mahjong Slide', newScore + 100);
      }
    } else {
      // Revert if no matches were made!
      if (originalTiles) {
        sound.playClick();
        setTiles(originalTiles);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTiles(JSON.parse(prev.tiles));
    setScore(prev.score);
    setSelectedTile(prev.selectedTile ? JSON.parse(prev.selectedTile) : null);
    setHistory(history.slice(0, -1));
    setLost(false);
    setHintIds([]);
    setMatchingLines([]);
    sound.playClick();
  };

  const getHint = () => {
    if (hintsLeft <= 0) return;
    setHintIds([]);
    const active = tiles.filter(t => t.active);
    if (active.length === 0) return;

    if (mode === 'zen') {
      const freeTiles = active.filter(t => isTileFree(t));
      for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
          if (freeTiles[i].sym.name === freeTiles[j].sym.name) {
            setHintIds([freeTiles[i].id, freeTiles[j].id]);
            setHintsLeft(prev => prev - 1);
            sound.playPowerup();
            return;
          }
        }
      }

      // Fallback for Zen: if no free pairs, show any active pair
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          if (active[i].sym.name === active[j].sym.name) {
            setHintIds([active[i].id, active[j].id]);
            setHintsLeft(prev => prev - 1);
            sound.playPowerup();
            return;
          }
        }
      }
    } else {
      // 1. Try to find a pair that is already aligned and clear
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          if (active[i].sym.name === active[j].sym.name) {
            const path = findConnectionPath(active[i], active[j], active);
            if (path) {
              setHintIds([active[i].id, active[j].id]);
              setHintsLeft(prev => prev - 1);
              sound.playPowerup();
              return;
            }
          }
        }
      }

      // 2. Fallback: find ANY active identical pair
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          if (active[i].sym.name === active[j].sym.name) {
            setHintIds([active[i].id, active[j].id]);
            setHintsLeft(prev => prev - 1);
            sound.playPowerup();
            return;
          }
        }
      }
    }
  };

  const shuffleTiles = () => {
    const active = tiles.filter(t => t.active);
    if (active.length === 0) return;
    saveToHistory();

    const activeSymbols = active.map(t => t.sym);
    for (let i = activeSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activeSymbols[i], activeSymbols[j]] = [activeSymbols[j], activeSymbols[i]];
    }

    let activeIdx = 0;
    const nextTiles = tiles.map(t => {
      if (t.active) {
        return { ...t, sym: activeSymbols[activeIdx++] };
      }
      return t;
    });

    setTiles(nextTiles);
    setHintIds([]);
    setSelectedTile(null);
    sound.playPowerup();
  };

  const saveSettings = (newMode, newSize, newShowArrows) => {
    setMode(newMode);
    setBoardSize(newSize);
    setShowArrows(newShowArrows);
    localStorage.setItem('retrovision_mahjong_mode', newMode);
    localStorage.setItem('retrovision_mahjong_size', newSize);
    setIsSettingsOpen(false);
  };

  // Grid dimensions
  const cellWidth = 58;
  const cellHeight = 72;
  const tileWidth = 54;
  const tileHeight = 66;

  const maxBoardWidth = mode === 'zen' ? (boardSize === 'small' ? 220 : boardSize === 'medium' ? 280 : 348) : 6 * cellWidth + 4;
  const maxBoardHeight = mode === 'zen' ? (boardSize === 'small' ? 260 : boardSize === 'medium' ? 340 : 420) : maxRows * cellHeight + 4;

  const gridSlots = [];
  for (let y = 1; y <= maxRows; y++) {
    for (let x = 1; x <= 6; x++) {
      gridSlots.push({ x, y });
    }
  }

  return (
    <div
      className="game-container"
      style={containerStyle}
      onMouseMove={handleTileMouseMove}
      onTouchMove={handleTileTouchMove}
      onMouseUp={handleDragRelease}
      onTouchEnd={handleDragRelease}
    >
      <style>{`
        @keyframes shake-vibrate {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-2px, 1px) rotate(-1deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          60% { transform: translate(-1px, 2px) rotate(0deg); }
          80% { transform: translate(2px, 1px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .tile-vibrating {
          animation: shake-vibrate 0.3s ease-in-out;
        }
      `}</style>
      {/* Header styled exactly to match the reference */}
      <div style={headerWrapperStyle}>
        <button onClick={onBack} style={blueSquareBtnStyle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div style={referenceStatsStyle}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Meilleur du mois</span>
            <span style={statValueStyle}>{highScore}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Score</span>
            <span style={statValueStyle}>{score}</span>
          </div>
        </div>

        <button onClick={() => setIsSettingsOpen(true)} style={blueSquareBtnStyle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <div style={redDotStyle} />
        </button>
      </div>

      {/* Round / Mode indicator */}
      <div style={roundTitleStyle}>
        {mode === 'zen' ? 'Zen Solitaire Stacked' : `Normal Round ${boardSize === 'small' ? '3' : boardSize === 'medium' ? '4' : '5'}`}
      </div>

      {/* Restart helper */}
      <div style={helpersContainerStyle}>
        <button onClick={initGame} className="retro-btn" style={helperBtnStyle}>
          🔄 Recommencer
        </button>
      </div>

      {/* Playfield wrapper styled to match screenshots */}
      <div style={{
        ...boardWrapperStyle,
        background: mode === 'slide' ? '#083c54' : '#f8fafc',
        border: mode === 'slide' ? '6px solid #38bdf8' : '2px solid var(--border-color)',
        boxShadow: mode === 'slide' ? 'inset 0 4px 12px rgba(0,0,0,0.4), 0 10px 25px rgba(0,0,0,0.15)' : 'inset 0 2px 8px rgba(0,0,0,0.02)',
      }}>
        <div style={{ ...boardStyle, width: `${maxBoardWidth}px`, height: `${maxBoardHeight}px` }}>

          {/* Faint grid guide lines in slider mode */}
          {mode === 'slide' && gridSlots.map(slot => (
            <div
              key={`bg-${slot.x}-${slot.y}`}
              style={{
                position: 'absolute',
                left: `${(slot.x - 1) * cellWidth + 2}px`,
                top: `${(slot.y - 1) * cellHeight + 2}px`,
                width: `${tileWidth}px`,
                height: `${tileHeight}px`,
                borderRadius: '8px',
                border: '1.5px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(255, 255, 255, 0.01)',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />
          ))}

          {/* Render glowing matching lines */}
          {mode === 'slide' && matchingLines.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 95,
                pointerEvents: 'none',
              }}
            >
              {matchingLines.map((path, idx) => {
                const pointsStr = path.map(p => {
                  const px = (p.x - 1) * cellWidth + cellWidth / 2 + 2;
                  const py = (p.y - 1) * cellHeight + cellHeight / 2 + 2;
                  return `${px},${py}`;
                }).join(' ');

                return (
                  <polyline
                    key={`path-${idx}`}
                    points={pointsStr}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: 'drop-shadow(0 0 4px #06b6d4) drop-shadow(0 0 10px #22d3ee)',
                    }}
                  />
                );
              })}
            </svg>
          )}

          {/* Slider circular shifting arrows (optional, hidden by default) */}
          {mode === 'slide' && showArrows && (
            <>
              {Array.from({ length: maxRows }).map((_, rIdx) => {
                const y = rIdx + 1;
                return (
                  <React.Fragment key={`row-ctrl-${y}`}>
                    <button
                      onClick={() => shiftRow(y, -1)}
                      style={{ ...rowArrowStyle, left: '-30px', top: `${(y - 1) * cellHeight + 20}px` }}
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => shiftRow(y, 1)}
                      style={{ ...rowArrowStyle, right: '-30px', top: `${(y - 1) * cellHeight + 20}px` }}
                    >
                      ▶
                    </button>
                  </React.Fragment>
                );
              })}

              {Array.from({ length: 6 }).map((_, cIdx) => {
                const x = cIdx + 1;
                return (
                  <React.Fragment key={`col-ctrl-${x}`}>
                    <button
                      onClick={() => shiftColumn(x, -1)}
                      style={{ ...colArrowStyle, top: '-30px', left: `${(x - 1) * cellWidth + 12}px` }}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => shiftColumn(x, 1)}
                      style={{ ...colArrowStyle, bottom: '-30px', left: `${(x - 1) * cellWidth + 12}px` }}
                    >
                      ▼
                    </button>
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Render Active Tiles */}
          {tiles.map((tile) => {
            if (!tile.active) return null;

            const isSelected = selectedTile?.id === tile.id;
            const isHint = hintIds.includes(tile.id);
            const isFree = mode === 'zen' ? isTileFree(tile) : true;

            let left = 0;
            let top = 0;
            let zIndex = 80;

            if (mode === 'zen') {
              left = (tile.x - 1) * 30 + tile.z * 5;
              top = (tile.y - 1) * 44 - tile.z * 7;
              zIndex = 80 + tile.z + (isSelected ? 50 : 0);
            } else {
              left = (tile.x - 1) * cellWidth + 2;
              top = (tile.y - 1) * cellHeight + 2;
              zIndex = 80 + (isSelected ? 50 : 0);
            }

            return (
              <div
                key={tile.id}
                onClick={() => mode === 'zen' ? handleZenTileClick(tile) : null}
                onMouseDown={(e) => handleTileMouseDown(e, tile)}
                onTouchStart={(e) => handleTileTouchStart(e, tile)}
                className={`mahjong-tile-3d ${isSelected ? 'selected' : ''} ${isHint ? 'hinted' : ''} ${!isFree && mode === 'zen' ? 'blocked' : ''} ${tile.sym.name === vibratingSymbol ? 'tile-vibrating' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${mode === 'zen' ? 44 : tileWidth}px`,
                  height: `${mode === 'zen' ? 56 : tileHeight}px`,
                  zIndex,
                  transform: isSelected ? 'translate3d(0, -8px, 10px)' : 'none',
                  cursor: isFree ? 'pointer' : 'not-allowed',
                  opacity: tile.matching ? 0.7 : isFree ? 1 : 0.6,
                  filter: isFree ? 'none' : 'brightness(0.8) grayscale(20%)',
                  background: '#ffffff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  borderBottom: '5px solid #16a34a', // Thicker green bottom layer
                  borderRight: '3px solid #15803d',
                  boxShadow: isSelected
                    ? '0 12px 24px rgba(245, 158, 11, 0.4)'
                    : isHint
                      ? '0 0 18px rgba(139, 92, 246, 0.8)'
                      : `0 4px 6px rgba(0, 0, 0, 0.15), ${tile.z * 2}px ${tile.z * 2 + 2}px 6px rgba(0,0,0,0.18)`,
                  outline: isSelected
                    ? '3px solid #f59e0b'
                    : isHint
                      ? '3px solid #8b5cf6'
                      : 'none',
                  outlineOffset: '2px',
                  transition: dragStart ? 'none' : 'left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1), transform 0.15s, opacity 0.2s',
                  userSelect: 'none',
                  touchAction: 'none',
                }}
              >
                <MahjongIcon name={tile.sym.name} />
              </div>
            );
          })}

        </div>
      </div>

      {/* Bottom Center Floating Lightbulb Hint Button */}
      <div style={bottomControlsStyle}>
        <button
          onClick={getHint}
          style={{
            ...hintCircleBtnStyle,
            opacity: hintsLeft > 0 ? 1 : 0.5,
            cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed'
          }}
          disabled={hintsLeft <= 0}
          className="hints_btn"
        >
          <span style={{ fontSize: '30px' }}>💡</span>
          <div style={badgeStyle}>{hintsLeft}</div>
        </button>
      </div>

      {won && (
        <div style={overlayStyle}>
          <div style={victoryTitleStyle}>VICTOIRE !</div>
          <div style={descStyle}>Félicitations ! Vous avez complété le plateau.</div>
          <button onClick={initGame} className="retro-btn" style={restartBtnStyle}>
            Nouveau Niveau
          </button>
        </div>
      )}

      {lost && (
        <div style={overlayStyle}>
          <div style={{ ...victoryTitleStyle, color: '#ef4444' }}>PLUS DE COUPS !</div>
          <div style={descStyle}>Aucune paire libre n'est disponible sur le plateau.</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={shuffleTiles} className="retro-btn" style={{ ...restartBtnStyle, background: '#f59e0b', borderColor: '#f59e0b' }}>
              Mélanger
            </button>
            <button onClick={initGame} className="retro-btn" style={{ ...restartBtnStyle, background: '#ef4444', borderColor: '#ef4444' }}>
              Recommencer
            </button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="accessibility-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <div className="accessibility-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="accessibility-modal-title">Paramètres de Mahjong</h3>

            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Mode de Jeu :</span>
              <div className="accessibility-setting-options">
                <button
                  className={`accessibility-setting-btn ${mode === 'zen' ? 'active' : ''}`}
                  onClick={() => saveSettings('zen', boardSize, showArrows)}
                >
                  Zen (Solitaire)
                </button>
                <button
                  className={`accessibility-setting-btn ${mode === 'slide' ? 'active' : ''}`}
                  onClick={() => saveSettings('slide', boardSize, showArrows)}
                >
                  Slider (Glisser/Aligner)
                </button>
              </div>
            </div>

            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Taille / Tuiles :</span>
              <div className="accessibility-setting-options">
                <button
                  className={`accessibility-setting-btn ${boardSize === 'small' ? 'active' : ''}`}
                  onClick={() => saveSettings(mode, 'small', showArrows)}
                >
                  Petite ({mode === 'zen' ? '36' : '24'} tuiles)
                </button>
                <button
                  className={`accessibility-setting-btn ${boardSize === 'medium' ? 'active' : ''}`}
                  onClick={() => saveSettings(mode, 'medium', showArrows)}
                >
                  Moyenne ({mode === 'zen' ? '72' : '36'} tuiles)
                </button>
                <button
                  className={`accessibility-setting-btn ${boardSize === 'large' ? 'active' : ''}`}
                  onClick={() => saveSettings(mode, 'large', showArrows)}
                >
                  Grande ({mode === 'zen' ? '144' : '48'} tuiles)
                </button>
              </div>
            </div>

            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Flèches d'aide :</span>
              <div className="accessibility-setting-options">
                <button
                  className={`accessibility-setting-btn ${showArrows ? 'active' : ''}`}
                  onClick={() => saveSettings(mode, boardSize, true)}
                >
                  Afficher
                </button>
                <button
                  className={`accessibility-setting-btn ${!showArrows ? 'active' : ''}`}
                  onClick={() => saveSettings(mode, boardSize, false)}
                >
                  Masquer
                </button>
              </div>
            </div>

            <div className="accessibility-modal-footer">
              <button className="retro-btn" onClick={() => setIsSettingsOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={footerHelpStyle}>
        {mode === 'zen'
          ? 'Mahjong Zen : Sélectionnez deux tuiles identiques libres pour les éliminer.'
          : 'Mahjong Slider : Glissez une tuile pour pousser les autres. Alignez deux tuiles identiques en ligne droite dégagée pour les faire disparaître.'}
      </div>
    </div>
  );
}

// Styles matching the reference visual theme
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '430px',
  background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', // Beautiful water-sky gradient background matching reference
  borderRadius: '28px',
  padding: '24px',
  boxSizing: 'border-box',
  margin: '0 auto',
  boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
  border: '3px solid #ffffff',
  position: 'relative'
};

const headerWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
  gap: '10px',
};

const blueSquareBtnStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '12px',
  background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
  border: '2px solid #ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
  position: 'relative',
};

const redDotStyle = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  width: '10px',
  height: '10px',
  background: '#ef4444',
  borderRadius: '50%',
  border: '2px solid #ffffff',
};

const referenceStatsStyle = {
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
  border: '2.5px solid #60a5fa',
  borderRadius: '16px',
  padding: '6px 12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
};

const statItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const statLabelStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#93c5fd',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statValueStyle = {
  fontSize: '18px',
  fontWeight: '900',
  color: '#ffffff',
};

const roundTitleStyle = {
  fontSize: '19px',
  fontWeight: '800',
  color: '#ffffff',
  textAlign: 'center',
  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  margin: '10px 0 12px 0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const helpersContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const helperBtnStyle = {
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: '800',
  color: '#1e3a8a',
  background: '#ffffff',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  cursor: 'pointer',
  minHeight: '38px',
  boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
};

const boardWrapperStyle = {
  width: '100%',
  borderRadius: '24px',
  padding: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  transition: 'background-color 0.3s, border-color 0.3s',
};

const boardStyle = {
  position: 'relative',
  margin: '0 auto',
};

const bottomControlsStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '16px',
};

const hintCircleBtnStyle = {
  position: 'relative',
  width: '68px',
  height: '68px',
  borderRadius: '50%',
  background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
  border: '3.5px solid #ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
  transition: 'transform 0.1s active',
};

const badgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '24px',
  height: '24px',
  background: '#ef4444',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #ffffff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(2, 132, 199, 0.96)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 150,
  padding: '24px',
  textAlign: 'center',
  borderRadius: '24px',
  border: '3px solid #ffffff'
};

const victoryTitleStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '32px',
  color: '#ffffff',
  fontWeight: '900',
  marginBottom: '12px',
  textShadow: '0 2px 6px rgba(0,0,0,0.3)',
};

const descStyle = {
  color: '#e0f2fe',
  fontSize: '17px',
  fontWeight: '600',
  marginBottom: '24px',
};

const restartBtnStyle = {
  padding: '14px 28px',
  fontSize: '16px',
  border: '2px solid #ffffff',
  background: '#ffffff',
  color: '#0284c7',
  fontWeight: '800',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
};

const footerHelpStyle = {
  marginTop: '16px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#e0f2fe',
  textAlign: 'center',
  lineHeight: '1.45',
  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
};

const rowArrowStyle = {
  position: 'absolute',
  width: '24px',
  height: '32px',
  borderRadius: '6px',
  background: '#ffffff',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const colArrowStyle = {
  position: 'absolute',
  width: '32px',
  height: '24px',
  borderRadius: '6px',
  background: '#ffffff',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};
