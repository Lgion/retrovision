import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Boutique from '../components/Boutique';

// --- CONFIGURATION ---
const GRID_SIZE = 5;
const TARGET_NUMBER = 13;

const VALUE_COLORS = {
  1: '#EF4444', // Red
  2: '#F97316', // Orange
  3: '#FBBF24', // Yellow
  4: '#10B981', // Emerald
  5: '#14B8A6', // Teal
  6: '#06B6D4', // Cyan
  7: '#0EA5E9', // Sky Blue
  8: '#6366F1', // Indigo
  9: '#8B5CF6', // Purple
  10: '#D946EF', // Fuchsia
  11: '#EC4899', // Pink
  12: '#F43F5E', // Rose
  13: '#EAB308', // Gold
};

// --- HELPER FUNCTIONS ---
const getRandomValue = (currentMax) => {
  // Spawn values between 1 and max(3, currentMax - 3)
  const maxSpawn = Math.max(3, currentMax - 3);
  // Slight bias towards lower numbers
  const rand = Math.random();
  if (rand < 0.5) return 1;
  if (rand < 0.8) return Math.min(2, maxSpawn);
  return Math.floor(Math.random() * maxSpawn) + 1;
};

const areAdjacent = (r1, c1, r2, c2) => {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr <= 1 && dc <= 1) && !(dr === 0 && dc === 0);
};

export default function Impossible13({ onBack, onScoreSave, isIntermission, onIntermissionComplete }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showStore, setShowStore] = useState(false);

  const [customizations, setCustomizations] = useState(() => {
    return getGameConfig('impossible13', 'customizations', { theme: 'neon' });
  });

  const activeTheme = isIntermission ? 'neon' : (customizations.theme || 'neon');

  // Game State
  const [board, setBoard] = useState([]); // 2D array: { val, id }
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('retrovision_impossible13_highscore') || '0', 10));
  const [currentMax, setCurrentMax] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [undoUsages, setUndoUsages] = useState(3);
  const [lastMove, setLastMove] = useState(null);

  // Interaction State
  const [activeChain, setActiveChain] = useState([]); // Array of { r, c }
  const [isDragging, setIsDragging] = useState(false);

  // Animation State
  const [particles, setParticles] = useState([]);
  const [floatingScores, setFloatingScores] = useState([]);

  const gridRef = useRef(null);

  useEffect(() => {
    initGame();
  }, []);

  // Particle Engine
  useEffect(() => {
    if (particles.length === 0) return;
    let frameId;
    const updateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, alpha: p.alpha - 0.02
      })).filter(p => p.alpha > 0));
      frameId = requestAnimationFrame(updateParticles);
    };
    frameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  const addFloatingScore = (text, x, y) => {
    const id = Date.now() + Math.random();
    setFloatingScores(prev => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(fs => fs.id !== id));
    }, 1000);
  };

  const spawnParticleBurst = (x, y, color) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      newParticles.push({
        id: Date.now() + Math.random() + i,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const initGame = () => {
    let initialMax = 3;
    let newBoard = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      let row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({ val: getRandomValue(initialMax), id: Math.random() });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setScore(0);
    setCurrentMax(initialMax);
    setGameOver(false);
    setVictory(false);
    setUndoUsages(3);
    setLastMove(null);
    setActiveChain([]);
    setIsDragging(false);
  };

  const saveStateForUndo = () => {
    setLastMove({
      board: board.map(row => row.map(cell => ({ ...cell }))),
      score,
      currentMax,
    });
  };

  const handleUndo = () => {
    if (undoUsages <= 0 || !lastMove || victory) return;
    sound.playClick();
    setBoard(lastMove.board);
    setScore(lastMove.score);
    setCurrentMax(lastMove.currentMax);
    setLastMove(null);
    setUndoUsages(prev => prev - 1);
    setGameOver(false);
  };

  const handlePointerDown = (r, c) => {
    if (gameOver || victory) return;
    setIsDragging(true);
    setActiveChain([{ r, c }]);
    sound.playClick();
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !gridRef.current || gameOver || victory) return;
    
    // Support touch and mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const elem = document.elementFromPoint(clientX, clientY);
    if (!elem || !elem.dataset.row || !elem.dataset.col) return;

    const r = parseInt(elem.dataset.row, 10);
    const c = parseInt(elem.dataset.col, 10);

    const firstCell = activeChain[0];
    const lastCell = activeChain[activeChain.length - 1];

    // If hovering the previous cell in the chain, go back (undo last link)
    if (activeChain.length > 1) {
      const prevCell = activeChain[activeChain.length - 2];
      if (prevCell.r === r && prevCell.c === c) {
        setActiveChain(prev => prev.slice(0, -1));
        sound.playClick(); // light tick
        return;
      }
    }

    // Check validity
    if (board[r][c].val === board[firstCell.r][firstCell.c].val) {
      // Must not be already in chain
      if (!activeChain.some(cell => cell.r === r && cell.c === c)) {
        // Must be adjacent to last cell
        if (areAdjacent(lastCell.r, lastCell.c, r, c)) {
          setActiveChain(prev => [...prev, { r, c }]);
          sound.playBallDrop(); // pitch up effect could be nice
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || gameOver || victory) return;
    setIsDragging(false);

    if (activeChain.length >= 3) {
      executeMerge();
    } else {
      setActiveChain([]);
    }
  };

  // Attach global pointer up
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) handlePointerUp();
    };
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging, activeChain]);

  const executeMerge = () => {
    saveStateForUndo();
    
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const targetCell = activeChain[activeChain.length - 1];
    const mergeValue = newBoard[targetCell.r][targetCell.c].val + 1;
    const chainLength = activeChain.length;
    const pointsEarned = chainLength * mergeValue * 10;

    // Apply merge
    newBoard[targetCell.r][targetCell.c].val = mergeValue;
    
    // Clear other cells in chain
    for (let i = 0; i < activeChain.length - 1; i++) {
      const cell = activeChain[i];
      newBoard[cell.r][cell.c].val = 0;
    }

    let newMax = Math.max(currentMax, mergeValue);
    
    sound.playScore(); // generic merge sound

    // Visual Feedback
    const rect = gridRef.current.getBoundingClientRect();
    const cellW = rect.width / GRID_SIZE;
    const centerX = targetCell.c * cellW + (cellW / 2);
    const centerY = targetCell.r * cellW + (cellW / 2);
    
    addFloatingScore(`+${pointsEarned}`, centerX, centerY);
    spawnParticleBurst(centerX, centerY, VALUE_COLORS[mergeValue] || '#fff');

    // Win condition check
    if (mergeValue === TARGET_NUMBER) {
      sound.playSudokuSuccess();
      setVictory(true);
      if (isIntermission && onIntermissionComplete) {
        setTimeout(onIntermissionComplete, 1500);
      }
    }

    // Apply Gravity and Spawn new tiles
    for (let c = 0; c < GRID_SIZE; c++) {
      let emptySlots = 0;
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newBoard[r][c].val === 0) {
          emptySlots++;
        } else if (emptySlots > 0) {
          newBoard[r + emptySlots][c].val = newBoard[r][c].val;
          newBoard[r][c].val = 0;
        }
      }
      for (let r = 0; r < emptySlots; r++) {
        newBoard[r][c] = { val: getRandomValue(newMax), id: Math.random() };
      }
    }

    const newScore = score + pointsEarned;
    setScore(newScore);
    setCurrentMax(newMax);
    setBoard(newBoard);
    setActiveChain([]);

    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('retrovision_impossible13_highscore', newScore.toString());
      if (onScoreSave) onScoreSave('Impossible 13', newScore);
    }

    // Check Game Over
    if (!hasPossibleMoves(newBoard)) {
      setGameOver(true);
      sound.playShake(); // Game over sound
    }
  };

  const hasPossibleMoves = (b) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = b[r][c].val;
        // Run a simple flood fill or DFS to find if there is a cluster of >= 3
        const visited = Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(false));
        const stack = [{r, c}];
        let clusterSize = 0;
        
        while(stack.length > 0) {
          const curr = stack.pop();
          if (visited[curr.r][curr.c]) continue;
          visited[curr.r][curr.c] = true;
          clusterSize++;
          
          if (clusterSize >= 3) return true;

          // Check 8 neighbors
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = curr.r + dr;
              const nc = curr.c + dc;
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (!visited[nr][nc] && b[nr][nc].val === val) {
                  stack.push({r: nr, c: nc});
                }
              }
            }
          }
        }
      }
    }
    return false;
  };

  const renderLines = () => {
    if (activeChain.length < 2 || !gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const cellW = rect.width / GRID_SIZE;
    
    let path = `M ${activeChain[0].c * cellW + cellW/2} ${activeChain[0].r * cellW + cellW/2}`;
    for (let i = 1; i < activeChain.length; i++) {
      path += ` L ${activeChain[i].c * cellW + cellW/2} ${activeChain[i].r * cellW + cellW/2}`;
    }

    const firstVal = board[activeChain[0].r][activeChain[0].c].val;
    const color = VALUE_COLORS[firstVal] || '#fff';

    return (
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
        <path d={path} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" 
              style={{ filter: activeTheme === 'neon' ? `drop-shadow(0 0 8px ${color})` : 'none', opacity: 0.8 }} />
      </svg>
    );
  };

  const getContainerStyle = () => {
    switch (activeTheme) {
      case 'wood': return { background: '#4e3629', border: '4px solid #3d2417', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' };
      case 'jewel': return { background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0b29 100%)', border: '2px solid rgba(255,255,255,0.1)' };
      default: return { background: 'radial-gradient(circle at center, #0f081d 0%, #030107 100%)', border: '2px solid #39FF14' };
    }
  };

  const getCellBackground = (val) => {
    if (val === 13) return 'linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)';
    return VALUE_COLORS[val] || '#4B5563';
  };

  const getCellShadow = (val, isActive) => {
    if (activeTheme !== 'neon' && activeTheme !== 'jewel') return isActive ? 'inset 0 0 0 3px rgba(255,255,255,0.5)' : 'none';
    const color = VALUE_COLORS[val] || '#fff';
    if (val === 13) return `0 0 20px #EAB308, inset 0 0 10px rgba(255,255,255,0.8)`;
    return isActive ? `0 0 15px ${color}, inset 0 0 8px rgba(255,255,255,0.6)` : `inset 0 0 6px rgba(255,255,255,0.2)`;
  };

  if (showStore) {
    return (
      <Boutique
        title="BOUTIQUE IMPOSSIBLE 13"
        icon="1️⃣3️⃣"
        categories={[
          {
            id: 'theme',
            name: 'Thèmes Visuels',
            icon: '🎨',
            items: [
              { id: 'neon', name: 'Néon Fantasy', icon: '✨' },
              { id: 'wood', name: 'Bois Cosy', icon: '🪵' },
              { id: 'jewel', name: 'Gemmes Translucides', icon: '💎' }
            ]
          }
        ]}
        currentSelections={{ theme: activeTheme }}
        onSelect={(_, themeId) => {
          setCustomizations(prev => {
            const next = { ...prev, theme: themeId };
            updateGameConfig('impossible13', 'customizations', next);
            return next;
          });
        }}
        onClose={() => setShowStore(false)}
      />
    );
  }

  return (
    <>
      {showIntro && !isIntermission && (
        <GameIntro gameName="IMPOSSIBLE 13" icon="1️⃣3️⃣" colors={['#EF4444', '#FBBF24', '#10B981', '#39FF14']} particleType="bubbles" onComplete={() => setShowIntro(false)} />
      )}

      <div className="impossible13-container game-container" style={{ ...containerStyle, ...getContainerStyle() }}>
        {!isIntermission && (
          <GameHeader title="IMPOSSIBLE 13" onBack={onBack} onRestart={initGame} showBgmToggle={false} onShop={() => setShowStore(true)} centerContent={
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={statBoxStyle}><div style={statLabelStyle}>SCORE</div><div style={statValStyle}>{score}</div></div>
              <div style={statBoxStyle}><div style={statLabelStyle}>RECORD</div><div style={statValStyle}>{highScore}</div></div>
            </div>
          } />
        )}

        {/* Toolbar */}
        {!isIntermission && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            <button onClick={handleUndo} disabled={undoUsages <= 0 || !lastMove || victory} className="retro-btn" style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #eab308', background: 'rgba(234, 179, 8, 0.1)', color: '#fef08a', opacity: (undoUsages <= 0 || !lastMove) ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>↩️ Annuler</span>
              <span style={{ background: '#eab308', color: '#000', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{undoUsages}</span>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: '10px 0' }}>
          <div 
            ref={gridRef}
            onTouchMove={handlePointerMove}
            onMouseMove={handlePointerMove}
            style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: '8px', width: '100%', maxWidth: '380px', aspectRatio: '1/1', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', touchAction: 'none' }}
          >
            {renderLines()}
            
            {board.map((row, r) => row.map((cell, c) => {
              const isActive = activeChain.some(pos => pos.r === r && pos.c === c);
              const isLast = activeChain.length > 0 && activeChain[activeChain.length - 1].r === r && activeChain[activeChain.length - 1].c === c;
              
              return (
                <div 
                  key={cell.id}
                  data-row={r} data-col={c}
                  onMouseDown={() => handlePointerDown(r, c)}
                  onTouchStart={() => handlePointerDown(r, c)}
                  style={{
                    position: 'relative',
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: getCellBackground(cell.val),
                    boxShadow: getCellShadow(cell.val, isActive),
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: cell.val >= 10 ? '24px' : '30px',
                    fontWeight: '900',
                    color: (cell.val === 13 || cell.val === 3) ? '#000' : '#FFF', // Contrast rules
                    textShadow: (cell.val !== 13 && cell.val !== 3) ? '0 2px 4px rgba(0,0,0,0.4)' : 'none',
                    transform: isLast ? 'scale(1.15)' : isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.1s, box-shadow 0.2s',
                    zIndex: isActive ? 10 : 1,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  {cell.val}
                  {isLast && activeChain.length >= 3 && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#39FF14', color: '#000', fontSize: '12px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', border: '2px solid #000' }}>
                      {cell.val + 1}
                    </div>
                  )}
                </div>
              );
            }))}

            {particles.map(p => (
              <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y, width: '8px', height: '8px', backgroundColor: p.color, borderRadius: '50%', opacity: p.alpha, pointerEvents: 'none', boxShadow: `0 0 6px ${p.color}`, zIndex: 20 }} />
            ))}
            {floatingScores.map(fs => (
              <div key={fs.id} style={{ position: 'absolute', left: fs.x, top: fs.y, transform: 'translate(-50%, -100%)', color: '#39FF14', fontSize: '22px', fontWeight: 'bold', textShadow: '0 0 8px #000, 0 0 10px #39FF14', animation: 'floatUpScore 1s forwards', pointerEvents: 'none', zIndex: 20 }}>
                {fs.text}
              </div>
            ))}
            
            {gameOver && (
              <div style={overlayStyle}>
                <div style={titleStyle}>GRILLE BLOQUÉE</div>
                <div style={{ color: '#fff', marginBottom: '20px' }}>Plus aucun mouvement possible !</div>
                <div style={{ fontSize: '20px', color: '#39FF14', fontWeight: 'bold', marginBottom: '20px' }}>Score: {score}</div>
                {undoUsages > 0 && lastMove && (
                  <button onClick={handleUndo} className="retro-btn" style={{ ...overlayBtnStyle, borderColor: '#eab308', color: '#facc15', marginBottom: '10px' }}>↩️ Annuler (Dernière chance)</button>
                )}
                <button onClick={initGame} className="retro-btn pulse-glow" style={overlayBtnStyle}>Rejouer</button>
              </div>
            )}
            
            {victory && (
              <div style={overlayStyle}>
                <div style={{ ...titleStyle, color: '#EAB308', textShadow: '0 0 12px #EAB308' }}>IMPOSSIBLE 13 !</div>
                <div style={{ color: '#fff', marginBottom: '20px' }}>Vous avez atteint le nombre d'or !</div>
                <div style={{ fontSize: '20px', color: '#39FF14', fontWeight: 'bold', marginBottom: '20px' }}>Score: {score}</div>
                <button onClick={() => { setVictory(false); initGame(); }} className="retro-btn pulse-glow" style={overlayBtnStyle}>Mode Infini</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#8e8a9f', fontSize: '12px', marginTop: '10px' }}>
          Reliez 3 cercles identiques ou plus pour les fusionner !
        </div>
      </div>

      <style>{`
        @keyframes floatUpScore { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -150%) scale(0.85); opacity: 0; } }
      `}</style>
    </>
  );
}

const containerStyle = { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '430px', boxSizing: 'border-box', margin: '0 auto', padding: '16px', borderRadius: '16px' };
const statBoxStyle = { flex: 1, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center' };
const statLabelStyle = { fontSize: '10px', color: '#8e8a9f', fontFamily: 'Orbitron, sans-serif', marginBottom: '2px' };
const statValStyle = { fontSize: '16px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Orbitron, sans-serif' };
const overlayStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 8, 19, 0.93)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 30, padding: '20px', textAlign: 'center', backdropFilter: 'blur(4px)', borderRadius: '16px' };
const titleStyle = { fontFamily: 'Orbitron, sans-serif', fontSize: '26px', color: '#ff3366', textShadow: '0 0 12px #ff3366', fontWeight: 'bold', marginBottom: '10px' };
const overlayBtnStyle = { padding: '12px 24px', fontSize: '16px', border: '2px solid #39FF14', background: 'transparent', color: '#39FF14', cursor: 'pointer', borderRadius: '12px', fontFamily: 'Orbitron, sans-serif' };
