import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import ArrowPuzzleCollection from './ArrowPuzzleCollection';

const DIRS = {
  'up': { dr: -1, dc: 0, symbol: '▲', color: '#ef4444' }, // Red
  'down': { dr: 1, dc: 0, symbol: '▼', color: '#3b82f6' }, // Blue
  'left': { dr: 0, dc: -1, symbol: '◀', color: '#10b981' }, // Green
  'right': { dr: 0, dc: 1, symbol: '▶', color: '#f59e0b' } // Orange
};

const WIRE_COLORS = [
  '#0f172a', // Dark Navy for the unified shape look
];

const HORSE_MASK_16 = [
  "       XXX      ",
  "      XXXXX     ",
  "      XXXXXX    ",
  "      XXXXXX    ",
  "      XXXXXX    ",
  "  XXX XXXXXXX   ",
  " XXXXXXXXXXXXX  ",
  " XXXXXXXXXXXXX  ",
  "  XXXXXXXXXXXX  ",
  "     XXXXXXXXX  ",
  "    XXXXXXXXXX  ",
  "   XXXXXXXXXXX  ",
  "  XXXXXXXXXXXX  ",
  " XXXXXXXXXXXXX  ",
  "XXXXXXXXXXXXXX  ",
  "XXXXXXXXXXXXXX  "
];

const HORSE_MASK_32 = [
  "              XXXXX             ",
  "             XXXXXXX            ",
  "             XXXXXXXX           ",
  "             XXXXXXXXX          ",
  "             XXXXXXXXXX         ",
  "             XXXXXXXXXX         ",
  "             XXXXXXXXXX         ",
  "             XXXXXXXXXXX        ",
  "             XXXXXXXXXXX        ",
  "             XXXXXXXXXXX        ",
  "    XXXXX    XXXXXXXXXXXX       ",
  "   XXXXXXX   XXXXXXXXXXXX       ",
  "  XXXXXXXXX  XXXXXXXXXXXXX      ",
  " XXXXXXXXXXXXXXXXXXXXXXXXX      ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "  XXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "   XXXXXXXXXXXXXXXXXXXXXXXX     ",
  "        XXXXXXXXXXXXXXXXXXX     ",
  "       XXXXXXXXXXXXXXXXXXXX     ",
  "      XXXXXXXXXXXXXXXXXXXXX     ",
  "     XXXXXXXXXXXXXXXXXXXXXX     ",
  "    XXXXXXXXXXXXXXXXXXXXXXX     ",
  "   XXXXXXXXXXXXXXXXXXXXXXXX     ",
  "  XXXXXXXXXXXXXXXXXXXXXXXXX     ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXX    ",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXX    "
];

const MASKS = {
  16: HORSE_MASK_16,
  32: HORSE_MASK_32
};

const isValidCell = (r, c, size) => {
  if (MASKS[size]) {
    return MASKS[size][r][c] === 'X';
  }
  return true;
};

export default function ArrowPuzzle({ onBack, onScoreSave, isIntermission, intermissionDifficulty, onIntermissionComplete, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [mode, setMode] = useState(() => getGameConfig('arrows', 'mode', 'dense')); // 'scattered' | 'dense' | 'wire'
  const [boardSize, setBoardSize] = useState(6);
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(0);
  const [arrowsLeft, setArrowsLeft] = useState(0);
  const [wires, setWires] = useState([]);
  const [victoryPhase, setVictoryPhase] = useState(0);
  const [flyingArrows, setFlyingArrows] = useState([]); // Array of flying animations for standard mode
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(3);
  const [showCollection, setShowCollection] = useState(false);
  const [customizations, setCustomizations] = useState(() => getGameConfig('arrows', 'customizations', { difficulty: 'moyen', theme: 'classic' }));

  const getDifficultySettings = (diffId, gameMode) => {
    switch(diffId) {
      case 'facile': return { size: 16, arrows: gameMode === 'wire' ? 75 : 85 };
      case 'moyen': return { size: 24, arrows: gameMode === 'wire' ? 150 : 150 };
      case 'difficile': return { size: 32, arrows: gameMode === 'wire' ? 300 : 250 };
      default: return { size: 24, arrows: gameMode === 'wire' ? 150 : 150 };
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing' && victoryPhase === 0 && moves > 0 && arrowsLeft > 0) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, victoryPhase, moves, arrowsLeft]);

  useEffect(() => {
    if (isIntermission && gameState === 'menu') {
      const diff = intermissionDifficulty || 'facile';
      const activeMode = 'wire';
      setMode(activeMode);
      const settings = getDifficultySettings(diff, activeMode);
      startGame(settings.size, settings.arrows, activeMode);
    }
  }, [isIntermission, gameState]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && victoryPhase === 0 && moves > 0 && arrowsLeft > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  // 1. Original scattered board generator
  const generateBoard = (size, numArrows) => {
    let newGrid = Array(size).fill(null).map(() => Array(size).fill(null));
    let placed = 0;
    let attempts = 0;
    const dirKeys = Object.keys(DIRS);

    while (placed < numArrows && attempts < 2000) {
      attempts++;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (newGrid[r][c] !== null) continue;

      const dirName = dirKeys[Math.floor(Math.random() * dirKeys.length)];
      const dir = DIRS[dirName];

      let pathClear = true;
      let currR = r + dir.dr;
      let currC = c + dir.dc;
      while (currR >= 0 && currR < size && currC >= 0 && currC < size) {
        if (newGrid[currR][currC] !== null) {
          pathClear = false;
          break;
        }
        currR += dir.dr;
        currC += dir.dc;
      }

      if (pathClear) {
        newGrid[r][c] = {
          id: `arrow_${placed}`,
          dir: dirName,
          symbol: dir.symbol,
          color: dir.color,
          r, c
        };
        placed++;
      }
    }
    return { grid: newGrid, placed };
  };

  // 2. Dense board generator (100% full solvable grid of single blocks)
  const generateDenseBoard = (size) => {
    let newGrid = Array(size).fill(null).map(() => Array(size).fill(null));
    let U = new Set();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        U.add(`${r},${c}`);
      }
    }

    const dirKeys = Object.keys(DIRS);
    const assignments = {};

    while (U.size > 0) {
      let candidates = [];
      for (let cell of U) {
        let [r, c] = cell.split(',').map(Number);
        let validDirs = [];
        for (let dirName of dirKeys) {
          const dir = DIRS[dirName];
          let currR = r + dir.dr;
          let currC = c + dir.dc;
          let pathClear = true;
          while (currR >= 0 && currR < size && currC >= 0 && currC < size) {
            if (U.has(`${currR},${currC}`)) {
              pathClear = false;
              break;
            }
            currR += dir.dr;
            currC += dir.dc;
          }
          if (pathClear) {
            validDirs.push(dirName);
          }
        }
        if (validDirs.length > 0) {
          candidates.push({ r, c, validDirs });
        }
      }

      if (candidates.length === 0) break; // Fallback

      const cand = candidates[Math.floor(Math.random() * candidates.length)];
      const chosenDir = cand.validDirs[Math.floor(Math.random() * cand.validDirs.length)];
      assignments[`${cand.r},${cand.c}`] = chosenDir;
      U.delete(`${cand.r},${cand.c}`);
    }

    let placed = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (assignments[`${r},${c}`]) {
          const dirName = assignments[`${r},${c}`];
          const dir = DIRS[dirName];
          newGrid[r][c] = {
            id: `arrow_${placed++}`,
            dir: dirName,
            symbol: dir.symbol,
            color: dir.color,
            r, c
          };
        }
      }
    }
    return { grid: newGrid, placed };
  };

  const generateWireBoard = (size, numWires) => {
    let newGrid = Array(size).fill(null).map(() => Array(size).fill(null));
    let newWires = [];
    const dirKeys = Object.keys(DIRS);
    let attempts = 0;
    const maxAttempts = size > 20 ? 25000 : 10000;

    while (newWires.length < numWires && attempts < maxAttempts) {
      attempts++;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!isValidCell(r, c, size)) continue;
      if (newGrid[r][c] !== null) continue;

      const dirName = dirKeys[Math.floor(Math.random() * dirKeys.length)];
      const dir = DIRS[dirName];

      // Check if exit ray is clear of placed wires
      const isRayClear = (startR, startC) => {
        let currR = startR + dir.dr;
        let currC = startC + dir.dc;
        while (currR >= 0 && currR < size && currC >= 0 && currC < size) {
          if (newGrid[currR][currC] !== null) return false;
          currR += dir.dr;
          currC += dir.dc;
        }
        return true;
      };

      if (!isRayClear(r, c)) continue;

      // Start tail segment in opposite direction of arrowhead
      const tailR = r - dir.dr;
      const tailC = c - dir.dc;
      if (tailR < 0 || tailR >= size || tailC < 0 || tailC >= size) continue;
      if (!isValidCell(tailR, tailC, size)) continue;
      if (newGrid[tailR][tailC] !== null) continue;

      let currentWire = [{ r, c }, { r: tailR, c: tailC }];
      let currentCells = new Set([`${r},${c}`, `${tailR},${tailC}`]);
      // Longer wires to be compactly interlaced like a real labyrinth
      const maxLen = Math.min(35, size * 1.5);
      const targetLength = 5 + Math.floor(Math.random() * (maxLen - 4));

      let growAttempts = 0;
      while (currentWire.length < targetLength && growAttempts < 80) {
        growAttempts++;
        const tail = currentWire[currentWire.length - 1];

        const neighbors = [
          { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
        ].sort(() => Math.random() - 0.5);

        let grown = false;
        for (let n of neighbors) {
          const nr = tail.r + n.dr;
          const nc = tail.c + n.dc;

          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (isValidCell(nr, nc, size) && newGrid[nr][nc] === null && !currentCells.has(`${nr},${nc}`)) {
              // Ensure we don't cross the head's exit ray
              let onExitRay = false;
              let currR = r + dir.dr;
              let currC = c + dir.dc;
              while (currR >= 0 && currR < size && currC >= 0 && currC < size) {
                if (nr === currR && nc === currC) {
                  onExitRay = true;
                  break;
                }
                currR += dir.dr;
                currC += dir.dc;
              }

              if (!onExitRay) {
                currentWire.push({ r: nr, c: nc });
                currentCells.add(`${nr},${nc}`);
                grown = true;
                break;
              }
            }
          }
        }
        if (!grown) break;
      }

      if (currentWire.length < 3) continue;

      const wireId = `wire_${newWires.length}`;
      const color = WIRE_COLORS[newWires.length % WIRE_COLORS.length];

      for (let cell of currentWire) {
        newGrid[cell.r][cell.c] = wireId;
      }

      newWires.push({
        id: wireId,
        path: currentWire,
        dir: dirName,
        color: color,
        flying: false
      });
    }

    return { grid: newGrid, placed: newWires.length, wires: newWires };
  };

  const startGame = (size, arrows, overrideMode = null) => {
    const activeMode = overrideMode || mode;
    sound.playClick();
    setBoardSize(size);
    if (activeMode === 'wire') {
      const { grid: newGrid, placed, wires: newWires } = generateWireBoard(size, arrows);
      setGrid(newGrid);
      setWires(newWires);
      setArrowsLeft(placed);
    } else {
      const { grid: newGrid, placed } = activeMode === 'dense' ? generateDenseBoard(size) : generateBoard(size, arrows);
      setGrid(newGrid);
      setWires([]);
      setArrowsLeft(placed);
    }
    setMoves(0);
    setVictoryPhase(0);
    setFlyingArrows([]);
    setLives(3);
    setHints(3);
    setGameState('playing');
    sound.startBGM();
  };

  // 1. Path checking for standard modes (scattered / dense)
  const checkPath = (r, c, dirName, currentGrid) => {
    const dir = DIRS[dirName];
    let currR = r + dir.dr;
    let currC = c + dir.dc;
    while (currR >= 0 && currR < boardSize && currC >= 0 && currC < boardSize) {
      if (currentGrid[currR][currC] !== null) {
        return false;
      }
      currR += dir.dr;
      currC += dir.dc;
    }
    return true;
  };

  const handleArrowTap = (r, c) => {
    if (victoryPhase !== 0) return;
    const arrow = grid[r][c];
    if (!arrow) return;

    if (checkPath(r, c, arrow.dir, grid)) {
      sound.playBallDrop();

      const newGrid = [...grid.map(row => [...row])];
      newGrid[r][c] = null;
      setGrid(newGrid);
      setMoves(m => m + 1);

      const flyingId = Date.now() + Math.random();
      setFlyingArrows(prev => [...prev, { ...arrow, flyingId }]);

      setTimeout(() => {
        setFlyingArrows(prev => prev.filter(f => f.flyingId !== flyingId));
      }, 400);

      setArrowsLeft(prev => {
        const newLeft = prev - 1;
        if (newLeft === 0) handleVictory();
        return newLeft;
      });
    } else {
      sound.playShake();
      setLives(l => {
        const newL = l - 1;
        if (newL <= 0) setVictoryPhase(-2); // Game over phase
        return newL;
      });
      const el = document.getElementById(arrow.id);
      if (el) {
        el.classList.remove('shake-anim');
        void el.offsetWidth;
        el.classList.add('shake-anim');
      }
    }
  };

  // 2. Path checking & handling for wire mode (slithering)
  const handleWireTap = (wire) => {
    if (victoryPhase !== 0 || wire.flying) return;

    const dir = DIRS[wire.dir];
    let canFly = true;
    const head = wire.path[0];
    let currR = head.r + dir.dr;
    let currC = head.c + dir.dc;
    while (currR >= 0 && currR < boardSize && currC >= 0 && currC < boardSize) {
      const hit = grid[currR][currC];
      if (hit !== null && hit !== wire.id) {
        canFly = false;
        break;
      }
      currR += dir.dr;
      currC += dir.dc;
    }

    if (canFly) {
      sound.playBallDrop();

      // Trigger slithering state
      setWires(prev => prev.map(w => w.id === wire.id ? { ...w, flying: true } : w));

      // Remove from grid so other wires can move
      const newGrid = [...grid.map(row => [...row])];
      for (let cell of wire.path) {
        newGrid[cell.r][cell.c] = null;
      }
      setGrid(newGrid);
      setMoves(m => m + 1);

      setTimeout(() => {
        setWires(prev => prev.filter(w => w.id !== wire.id));
        setArrowsLeft(prev => {
          const newLeft = prev - 1;
          if (newLeft === 0) handleVictory();
          return newLeft;
        });
      }, 800); // Wait for transition duration

    } else {
      sound.playShake();
      setLives(l => {
        const newL = l - 1;
        if (newL <= 0) setVictoryPhase(-2); // Game over phase
        return newL;
      });
      const el = document.getElementById(wire.id);
      if (el) {
        el.classList.remove('shake-anim');
        void el.offsetWidth;
        el.classList.add('shake-anim');
      }
    }
  };

  const handleVictory = () => {
    if (isIntermission && onIntermissionComplete) {
      setTimeout(() => onIntermissionComplete(), 1000);
      return;
    }
    setVictoryPhase(-1);
    setTimeout(() => {
      sound.stopBGM();
      setVictoryPhase(1);
      sound.playPowerup();

      setTimeout(() => {
        setVictoryPhase(2);
        sound.playExplosion();
      }, 1500);

      setTimeout(() => {
        setVictoryPhase(3);
        sound.playScore();
        if (onScoreSave) {
          onScoreSave('Flèches', Math.max(1000 - moves * 5, 100));
        }
      }, 3500);
    }, 1500);
  };

  const useHint = () => {
    if (hints <= 0 || victoryPhase !== 0) return;

    // Find an arrow or wire that can fly
    if (mode === 'wire') {
      const flyable = wires.find(wire => {
        if (wire.flying) return false;
        const dir = DIRS[wire.dir];
        let canFly = true;
        const head = wire.path[0];
        let currR = head.r + dir.dr;
        let currC = head.c + dir.dc;
        while (currR >= 0 && currR < boardSize && currC >= 0 && currC < boardSize) {
          const hit = grid[currR][currC];
          if (hit !== null && hit !== wire.id) {
            canFly = false;
            break;
          }
          currR += dir.dr;
          currC += dir.dc;
        }
        return canFly;
      });
      if (flyable) {
        setHints(h => h - 1);
        handleWireTap(flyable);
      }
    } else {
      let flyable = null;
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          const arrow = grid[r][c];
          if (arrow && checkPath(r, c, arrow.dir, grid)) {
            flyable = { r, c };
            break;
          }
        }
        if (flyable) break;
      }
      if (flyable) {
        setHints(h => h - 1);
        handleArrowTap(flyable.r, flyable.c);
      }
    }
  };

  const CELL_SIZE = Math.min(50, Math.floor(440 / boardSize));
  const strokeWidth = mode === 'wire' ? Math.max(2, Math.round(CELL_SIZE * 0.15)) : CELL_SIZE - 4;
  const arrowHeadSize = Math.max(6, Math.round(CELL_SIZE * 0.4));
  const fontSize = Math.max(12, Math.round(CELL_SIZE * 0.48));

  // Construct full SVG Path for wire (Tail to Head + straight exit path)
  const getPathD = (wire) => {
    const pts = [...wire.path].reverse(); // Reverse so we draw from tail to head
    const head = wire.path[0];
    const dir = DIRS[wire.dir];

    // Add 15 extra cells in exit direction to go fully off-screen
    for (let i = 1; i <= 15; i++) {
      pts.push({
        r: head.r + dir.dr * i,
        c: head.c + dir.dc * i
      });
    }

    return pts.map((p, idx) => {
      const cmd = idx === 0 ? 'M' : 'L';
      return `${cmd} ${p.c * CELL_SIZE + CELL_SIZE / 2} ${p.r * CELL_SIZE + CELL_SIZE / 2}`;
    }).join(' ');
  };

  if (showCollection) {
    return (
      <ArrowPuzzleCollection
        onClose={() => {
          setShowCollection(false);
          const settings = getDifficultySettings(customizations.difficulty, mode);
          startGame(settings.size, settings.arrows);
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('arrows', 'customizations', next);
            return next;
          });
          setShowCollection(false);
          if (category === 'difficulty') {
            const settings = getDifficultySettings(id, mode);
            startGame(settings.size, settings.arrows);
          }
        }}
      />
    );
  }

  const getThemeStyles = () => {
    switch(customizations.theme) {
      case 'neon': return { bg: '#2e1065', wireBg: '#1e1b4b', container: 'rgba(46, 16, 101, 0.85)' };
      case 'forest': return { bg: '#064e3b', wireBg: '#022c22', container: 'rgba(6, 78, 59, 0.85)' };
      default: return { bg: '#1e293b', wireBg: '#f8fafc', container: 'rgba(15, 23, 42, 0.85)' };
    }
  };
  const theme = getThemeStyles();

  return (
    <>
      {showIntro && !isIntermission && <GameIntro
        gameName="ARROW PUZZLE"
        icon="⬆️"
        colors={['#3b82f6', '#10b981', '#ef4444']}
        particleType="arrows"
        onComplete={() => setShowIntro(false)}
      />}

      {isIntermission && gameState === 'playing' && (
        <div className="entract-header entractArrowHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: '8px', marginBottom: '10px' }}>
          <div className="entract-header-text">
            Entracte ! Videz la grille pour retourner au jeu principal.
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

      <div style={{
        display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '800px',
        background: theme.container, backdropFilter: 'blur(10px)',
        borderRadius: '16px', padding: '20px', boxSizing: 'border-box',
        margin: '0 auto', flex: 1, position: 'relative', overflowX: 'hidden'
      }}>
        {!isIntermission && (
          <GameHeader
            title="ARROW PUZZLE"
            onBack={handleBackWithConfirm}
            onRestart={gameState === 'playing' ? () => { const s = getDifficultySettings(customizations.difficulty, mode); startGame(s.size, s.arrows); } : undefined}
            onHint={gameState === 'playing' ? useHint : undefined}
            onShop={() => setShowCollection(true)}
            hintDisabled={hints <= 0}
            hintsLeft={hints}
            showBgmToggle={false} // bgm is managed elsewhere
            centerContent={
              gameState === 'playing' ? (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div><span style={{ color: '#8e8a9f' }}>Vies: </span><span style={{ color: '#ef4444', fontSize: '1rem' }}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span></div>
                  <div><span style={{ color: '#8e8a9f' }}>Restes: </span><span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{arrowsLeft}</span></div>
                </div>
              ) : null
            }
            style={{ marginBottom: '20px' }}
          />
        )}

        {gameState === 'menu' && (
          <div style={menuStyle}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}>⬆️</div>
            <h2 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>Démêlez les flèches !</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => { setMode('scattered'); updateGameConfig('arrows', 'mode', 'scattered'); sound.playClick(); }}
                style={{
                  background: mode === 'scattered' ? '#3b82f6' : 'transparent',
                  color: mode === 'scattered' ? 'white' : '#cbd5e1',
                  border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Éparpillé
              </button>
              <button
                onClick={() => { setMode('dense'); updateGameConfig('arrows', 'mode', 'dense'); sound.playClick(); }}
                style={{
                  background: mode === 'dense' ? '#10b981' : 'transparent',
                  color: mode === 'dense' ? 'white' : '#cbd5e1',
                  border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Bloc Dense
              </button>
              <button
                onClick={() => { setMode('wire'); updateGameConfig('arrows', 'mode', 'wire'); sound.playClick(); }}
                style={{
                  background: mode === 'wire' ? '#ec4899' : 'transparent',
                  color: mode === 'wire' ? 'white' : '#cbd5e1',
                  border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Filaires
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { const s = getDifficultySettings(customizations.difficulty, mode); startGame(s.size, s.arrows); }}
                className="retro-btn pulse-glow"
                style={{ padding: '15px 40px', fontSize: '20px', borderColor: '#3b82f6', color: '#3b82f6', width: '250px' }}
              >
                Jouer ({customizations.difficulty})
              </button>
            </div>

            <div style={{ marginTop: '30px', color: '#cbd5e1', textAlign: 'center', fontSize: '14px', maxWidth: '300px' }}>
              <strong>Règle :</strong> {mode === 'wire' ? "Touchez un fil pour le faire glisser. Il ne peut s'enfuir que si la sortie en face de sa tête est libre !" : "Touchez une flèche pour la faire voler. Elle ne peut partir que si son chemin est libre !"}
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div style={gameplayContainerStyle}>



            <div style={{
              position: 'relative', width: boardSize * CELL_SIZE, height: boardSize * CELL_SIZE,
              backgroundColor: mode === 'wire' ? theme.wireBg : theme.bg,
              borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', margin: '0 auto', overflow: 'hidden',
              animation: 'boardEnter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both' // Staging & Appeal
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'grid', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, zIndex: 0
              }}>
                {Array.from({ length: boardSize * boardSize }).map((_, i) => (
                  <div key={i} style={{ border: `1px ${mode === 'wire' ? 'solid transparent' : 'dashed rgba(255,255,255,0.05)'}` }} />
                ))}
              </div>

              {mode === 'wire' ? (
                <svg width={boardSize * CELL_SIZE} height={boardSize * CELL_SIZE} style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, overflow: 'visible' }}>
                  {wires.map(wire => {
                    const head = wire.path[0];
                    const dir = DIRS[wire.dir];
                    const cx = head.c * CELL_SIZE + CELL_SIZE / 2;
                    const cy = head.r * CELL_SIZE + CELL_SIZE / 2;
                    const L_orig = (wire.path.length - 1) * CELL_SIZE;
                    const L_exit = 15 * CELL_SIZE;

                    // Triangle arrowhead coordinates positioned at the tip of the line
                    const size = arrowHeadSize;
                    let arrowPoly = "";
                    if (wire.dir === 'up') arrowPoly = `${cx - size * 0.7},${cy + size * 0.4} ${cx},${cy - size * 0.8} ${cx + size * 0.7},${cy + size * 0.4}`;
                    if (wire.dir === 'down') arrowPoly = `${cx - size * 0.7},${cy - size * 0.4} ${cx},${cy + size * 0.8} ${cx + size * 0.7},${cy - size * 0.4}`;
                    if (wire.dir === 'left') arrowPoly = `${cx + size * 0.4},${cy - size * 0.7} ${cx - size * 0.8},${cy} ${cx + size * 0.4},${cy + size * 0.7}`;
                    if (wire.dir === 'right') arrowPoly = `${cx - size * 0.4},${cy - size * 0.7} ${cx + size * 0.8},${cy} ${cx - size * 0.4},${cy + size * 0.7}`;

                    return (
                      <g
                        key={wire.id}
                        id={wire.id}
                        onClick={() => handleWireTap(wire)}
                        style={{
                          cursor: 'pointer',
                          filter: boardSize > 16 ? 'none' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))'
                        }}
                      >
                        <path
                          d={getPathD(wire)}
                          fill="none"
                          stroke={wire.color}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            strokeDasharray: `${L_orig} 10000`,
                            strokeDashoffset: wire.flying ? -L_exit : 0,
                            transition: wire.flying ? 'stroke-dashoffset 0.8s cubic-bezier(0.5, -0.3, 0.1, 1.2)' : 'none'
                          }}
                        />
                        <polygon
                          points={arrowPoly}
                          fill={wire.color}
                          stroke={wire.color}
                          strokeWidth="1"
                          strokeLinejoin="round"
                          style={{
                            transform: wire.flying ? `translate(${dir.dc * L_exit}px, ${dir.dr * L_exit}px)` : 'none',
                            transition: wire.flying ? 'transform 0.8s cubic-bezier(0.5, -0.3, 0.1, 1.2)' : 'none'
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <React.Fragment>
                  {/* Static Arrows for scattered / dense modes */}
                  {grid.map((row, r) => row.map((arrow, c) => {
                    if (!arrow) return null;
                    return (
                      <div
                        key={arrow.id}
                        id={arrow.id}
                        onClick={() => handleArrowTap(r, c)}
                        style={{
                          position: 'absolute', left: c * CELL_SIZE, top: r * CELL_SIZE,
                          width: CELL_SIZE, height: CELL_SIZE, zIndex: 10,
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          cursor: 'pointer', transition: 'transform 0.1s'
                        }}
                      >
                        <div style={{
                          width: '80%', height: '80%', backgroundColor: arrow.color,
                          borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                          color: 'white', fontSize: `${fontSize}px`, fontWeight: 'bold',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.3)',
                          border: '1px solid rgba(255,255,255,0.4)'
                        }}>
                          {arrow.symbol}
                        </div>
                      </div>
                    );
                  }))}
                </React.Fragment>
              )}

              {/* Flying Arrows */}
              {mode !== 'wire' && flyingArrows.map(arrow => {
                const dx = DIRS[arrow.dir].dc * 400; // Fly far away
                const dy = DIRS[arrow.dir].dr * 400;
                const isHoriz = DIRS[arrow.dir].dc !== 0;
                return (
                  <div
                    key={arrow.flyingId}
                    style={{
                      position: 'absolute', left: arrow.c * CELL_SIZE, top: arrow.r * CELL_SIZE,
                      width: CELL_SIZE, height: CELL_SIZE, zIndex: 20,
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      pointerEvents: 'none',
                      animation: `flyAwaySquash 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
                      '--dx': `${dx}px`, '--dy': `${dy}px`,
                      '--sx': isHoriz ? 1.8 : 0.4, // Stretch in flight direction
                      '--sy': isHoriz ? 0.4 : 1.8,
                      '--asx': isHoriz ? 0.7 : 1.3, // Squash for anticipation
                      '--asy': isHoriz ? 1.3 : 0.7,
                    }}
                  >
                    <div style={{
                      width: '80%', height: '80%', backgroundColor: arrow.color,
                      borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                      color: 'white', fontSize: `${fontSize}px`, fontWeight: 'bold',
                      boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
                      opacity: 0.8
                    }}>
                      {arrow.symbol}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Immediate Confetti Explosion */}
        {victoryPhase !== 0 && victoryPhase !== -2 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 1000 }}>
            {Array.from({ length: 100 }, (_, i) => {
              const angle = Math.random() * Math.PI * 2;
              const velocity = 150 + Math.random() * 450; // spread
              const tx = Math.cos(angle) * velocity;
              const ty = Math.sin(angle) * velocity + 300; // gravity effect
              return (
                <div key={i} style={{
                  position: 'absolute',
                  width: '10px', height: '10px',
                  background: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a855f7'][i % 6],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                  '--tx': `${tx}px`, '--ty': `${ty}px`, '--rot': `${Math.random() * 720}deg`,
                  animation: `confettiExplode ${1 + Math.random() * 1.5}s cubic-bezier(0.25, 1, 0.5, 1) forwards`
                }} />
              )
            })}
          </div>
        )}

        {/* Victory Overlays */}
        {(victoryPhase > 0 || victoryPhase === -2) && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s'
          }}>
            {/* Removed old missing confettiFall element */}

            {victoryPhase === -2 && (
              <div style={{
                animation: 'dropInHeavy 0.8s cubic-bezier(0.25, 1, 0.5, 1) both', textAlign: 'center', background: 'white', padding: '50px',
                borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #ef4444', zIndex: 10
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>💀</div>
                <h2 style={{ fontSize: '2.5rem', color: '#333', margin: '0 0 20px 0' }}>Game Over !</h2>
                <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
                  Plus de vies restantes.
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => startGame(boardSize, mode === 'wire' ? (boardSize === 16 ? 75 : 300) : (boardSize === 16 ? 85 : 250))}
                    className="retro-btn pulse-glow"
                    style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    Recommencer
                  </button>
                  {isIntermission ? (
                    <button
                      onClick={() => { if (onIntermissionComplete) onIntermissionComplete(false); }}
                      className="retro-btn"
                      style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      Passer l'entracte ⏭
                    </button>
                  ) : (
                    <button
                      onClick={() => { setVictoryPhase(0); setGameState('menu'); }}
                      className="retro-btn"
                      style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                      Menu
                    </button>
                  )}
                </div>
              </div>
            )}

            {victoryPhase === 1 && (
              <h2 style={{ fontSize: '4rem', color: '#3b82f6', margin: 0, animation: 'textPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>ÉPURÉ !</h2>
            )}

            {victoryPhase === 3 && (
              <div style={{
                animation: 'popInBouncy 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both', textAlign: 'center', background: 'white', padding: '50px',
                borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #3b82f6', zIndex: 10
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎯</div>
                <h2 style={{ fontSize: '2.5rem', color: '#333', margin: '0 0 20px 0' }}>Grille Vidée !</h2>
                <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '30px' }}>
                  Score: <strong style={{ color: '#3b82f6', fontSize: '2rem' }}>{Math.max(1000 - moves * 5, 100)}</strong>
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => startGame(boardSize, mode === 'wire' ? (boardSize === 16 ? 75 : 300) : (boardSize === 16 ? 85 : 250))}
                    className="retro-btn"
                    style={{ fontSize: '1.2rem', padding: '10px 30px', borderColor: '#f59e0b', color: '#f59e0b' }}
                  >
                    Recommencer
                  </button>
                  <button
                    onClick={() => {
                      if (isIntermission && onIntermissionComplete) onIntermissionComplete();
                      else if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') onIntermissionRequest();
                      else { setVictoryPhase(0); setGameState('menu'); }
                    }}
                    className="retro-btn"
                    style={{ fontSize: '1.2rem', padding: '10px 30px', borderColor: '#3b82f6', color: '#3b82f6' }}
                  >
                    {isIntermission ? "Retour au Mahjong" : "Super !"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes flyAwaySquash {
          0% { transform: translate(0, 0) scale(1, 1); opacity: 1; }
          25% { transform: translate(calc(var(--dx) * -0.05), calc(var(--dy) * -0.05)) scale(var(--asx), var(--asy)); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(var(--sx), var(--sy)); opacity: 0; }
        }
        @keyframes shake-arrow {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          20% { transform: translate(-6px, 0) rotate(-10deg); }
          40% { transform: translate(6px, 0) rotate(10deg); }
          60% { transform: translate(-3px, 0) rotate(-5deg); }
          80% { transform: translate(3px, 0) rotate(5deg); }
        }
        @keyframes popInBouncy {
          0% { transform: scale(0.3) translateY(50px); opacity: 0; }
          50% { transform: scale(1.05) translateY(-10px); opacity: 1; }
          75% { transform: scale(0.95) translateY(5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes dropInHeavy {
          0% { transform: translateY(-150vh) rotate(-15deg); opacity: 0; }
          50% { transform: translateY(20px) rotate(5deg); opacity: 1; }
          65% { transform: translateY(-10px) rotate(-2deg); opacity: 1; }
          80% { transform: translateY(5px) rotate(1deg); opacity: 1; }
          100% { transform: translateY(0) rotate(0); opacity: 1; }
        }
        @keyframes boardEnter {
          0% { transform: perspective(1000px) rotateX(-15deg) translateY(60px) scale(0.9); opacity: 0; }
          100% { transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1); opacity: 1; }
        }
        @keyframes confettiExplode {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
          40% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes textPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .shake-anim {
          animation: shake-arrow 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}} />
      </div>
    </>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '500px',
  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
  borderRadius: '16px', padding: '20px', boxSizing: 'border-box',
  margin: '0 auto', flex: 1, position: 'relative', overflowX: 'hidden'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'
};

const backBtnStyle = { padding: '8px 12px', fontSize: '14px' };

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif', fontSize: '22px', color: '#3b82f6',
  textShadow: '0 0 10px rgba(59, 130, 246, 0.5)', letterSpacing: '2px', fontWeight: 'bold'
};

const menuStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 };

const gameplayContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%', overflowX: 'auto', paddingBottom: '20px' };

const statusRowStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', padding: '0 10px', boxSizing: 'border-box'
};
