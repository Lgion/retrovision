import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import LEVELS from '../utils/unblockLevels.json';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';

export default function UnblockMe({ onBack, onScoreSave, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'levelSelect'
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(() => {
    return getGameConfig('unblock', 'levelProgress', 0);
  });
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  
  const [blocks, setBlocks] = useState([]);
  const [history, setHistory] = useState([]); // For undo
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [victoryPhase, setVictoryPhase] = useState(0);

  // Constants
  const GRID_SIZE = 6;
  const CELL_PX = 50;
  const BOARD_PX = GRID_SIZE * CELL_PX;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, victoryPhase, moves]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const loadLevel = (idx) => {
    sound.playClick();
    setCurrentLevelIdx(idx);
    const levelBlocks = JSON.parse(JSON.stringify(LEVELS[idx])); // Deep copy
    setBlocks(levelBlocks);
    setHistory([]);
    setMoves(0);
    setVictoryPhase(0);
    setSelectedBlockId(null);
    setGameState('playing');
    sound.startBGM();
  };

  const undoMove = () => {
    if (history.length === 0 || victoryPhase !== 0) return;
    sound.playClick();
    const previousState = history[history.length - 1];
    setBlocks(JSON.parse(previousState));
    setHistory(history.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelectedBlockId(null);
  };

  const isCellOccupied = (row, col, excludeBlockId = null) => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return true; // Wall
    
    for (const b of blocks) {
      if (b.id === excludeBlockId) continue;
      if (b.orientation === 'h') {
        if (row === b.row && col >= b.col && col < b.col + b.length) return true;
      } else {
        if (col === b.col && row >= b.row && row < b.row + b.length) return true;
      }
    }
    return false;
  };

  const handleBlockSelect = (id) => {
    if (victoryPhase !== 0) return;
    sound.playClick();
    setSelectedBlockId(id === selectedBlockId ? null : id); // Toggle selection
  };

  const moveBlock = (direction) => {
    if (victoryPhase !== 0 || !selectedBlockId) return;

    const blockIdx = blocks.findIndex(b => b.id === selectedBlockId);
    if (blockIdx === -1) return;
    
    const b = blocks[blockIdx];
    let targetRow = b.row;
    let targetCol = b.col;

    // Determine target cell to check based on direction
    if (direction === 'up' && b.orientation === 'v') targetRow = b.row - 1;
    else if (direction === 'down' && b.orientation === 'v') targetRow = b.row + b.length;
    else if (direction === 'left' && b.orientation === 'h') targetCol = b.col - 1;
    else if (direction === 'right' && b.orientation === 'h') targetCol = b.col + b.length;
    else return; // Invalid direction for this orientation

    if (isCellOccupied(targetRow, targetCol, b.id)) {
      sound.playShake(); // Blocked!
      return;
    }

    // Move is valid
    setHistory([...history, JSON.stringify(blocks)]);
    
    const newBlocks = [...blocks];
    const newBlock = { ...b };
    
    if (direction === 'up') newBlock.row -= 1;
    if (direction === 'down') newBlock.row += 1;
    if (direction === 'left') newBlock.col -= 1;
    if (direction === 'right') newBlock.col += 1;
    
    newBlocks[blockIdx] = newBlock;
    setBlocks(newBlocks);
    setMoves(m => m + 1);
    sound.playBallDrop(); // Nice wood sliding sound

    // Check Win Condition (Red block touches right edge)
    if (newBlock.type === 'target' && newBlock.col + newBlock.length >= GRID_SIZE) {
      handleVictory();
    }
  };

  const handleVictory = () => {
    setVictoryPhase(-1);
    setTimeout(() => {
      sound.stopBGM();
      setVictoryPhase(1);
      sound.playPowerup();

      if (currentLevelIdx >= maxUnlockedLevel) {
        const nextLevel = Math.min(currentLevelIdx + 1, LEVELS.length - 1);
        setMaxUnlockedLevel(nextLevel);
        updateGameConfig('unblock', 'levelProgress', nextLevel);
      }

      setTimeout(() => {
        setVictoryPhase(2);
        sound.playExplosion();
      }, 1500);

      setTimeout(() => {
        setVictoryPhase(3);
        sound.playScore();
        if (onScoreSave) {
          onScoreSave('Débloque-Moi', Math.max(1000 - moves * 10, 100));
        }
      }, 3500);
    }, 1500);
  };

  const renderBlock = (b) => {
    const isSelected = selectedBlockId === b.id;
    const isTarget = b.type === 'target';
    
    const width = b.orientation === 'h' ? b.length * CELL_PX : CELL_PX;
    const height = b.orientation === 'v' ? b.length * CELL_PX : CELL_PX;
    const left = b.col * CELL_PX;
    const top = b.row * CELL_PX;

    return (
      <div 
        key={b.id}
        onClick={() => handleBlockSelect(b.id)}
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          padding: '2px', // gap between blocks
          boxSizing: 'border-box',
          transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: isSelected ? 10 : 2
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: isTarget ? '#E53E3E' : (b.orientation === 'h' ? '#3B82F6' : '#F59E0B'),
          borderRadius: '8px',
          boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.6), inset 0 0 10px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.2)',
          border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}>
          {/* Wood grain texture effect via gradient */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
            borderRadius: '6px', pointerEvents: 'none'
          }}/>
          
          {/* Accessibility Arrows when selected */}
          {isSelected && b.orientation === 'h' && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock('left'); }}
                style={arrowBtnStyle('left')}
                className="pulse-arrow"
              >◀</button>
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock('right'); }}
                style={arrowBtnStyle('right')}
                className="pulse-arrow"
              >▶</button>
            </>
          )}
          {isSelected && b.orientation === 'v' && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock('up'); }}
                style={arrowBtnStyle('up')}
                className="pulse-arrow"
              >▲</button>
              <button 
                onClick={(e) => { e.stopPropagation(); moveBlock('down'); }}
                style={arrowBtnStyle('down')}
                className="pulse-arrow"
              >▼</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {showIntro && <GameIntro 
        gameName="DÉBLOQUE-MOI" 
        icon="🧱" 
        colors={['#E53E3E', '#F59E0B', '#3B82F6']} 
        particleType="blocks" 
        onComplete={() => setShowIntro(false)} 
      />}
      <div style={containerStyle}>
      <GameHeader
        title="DÉBLOQUE-MOI"
        onBack={handleBackWithConfirm}
        onRestart={gameState === 'playing' ? () => setGameState('menu') : undefined}
        showBgmToggle={false} // BGM global
        centerContent={
          gameState === 'playing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontFamily: 'Orbitron, sans-serif' }}>
              <div style={{ fontSize: '14px', color: '#ffffff' }}>
                Niv: <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{currentLevelIdx + 1}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#8e8a9f' }}>
                Coups: <span style={{ color: '#fff', fontWeight: 'bold' }}>{moves}</span>
              </div>
            </div>
          ) : null
        }
        extraControls={
          gameState === 'playing' ? (
            <button 
              onClick={undoMove} 
              disabled={history.length === 0}
              className="retro-btn"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                opacity: history.length > 0 ? 1 : 0.5
              }}
            >
              ↩️ Undo
            </button>
          ) : null
        }
      />

      {gameState === 'menu' && (
        <div style={menuStyle}>
          <div style={{fontSize: '5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(229, 62, 62, 0.5))'}}>🧱</div>
          <h2 style={{color: '#fff', marginBottom: '30px'}}>Débloque-Moi !</h2>
          
          <button 
            onClick={() => loadLevel(maxUnlockedLevel)}
            className="retro-btn pulse-glow"
            style={{padding: '15px 40px', fontSize: '20px', borderColor: '#E53E3E', color: '#E53E3E', marginBottom: '15px', width: '250px'}}
          >
            {maxUnlockedLevel > 0 ? `Continuer (Niv. ${maxUnlockedLevel + 1})` : 'Jouer'}
          </button>

          <button 
            onClick={() => setGameState('levelSelect')}
            className="retro-btn"
            style={{padding: '15px 40px', fontSize: '16px', borderColor: '#cbd5e1', color: '#cbd5e1', width: '250px'}}
          >
            Choisir un Niveau
          </button>
        </div>
      )}

      {gameState === 'levelSelect' && (
        <div style={menuStyle}>
          <h2 style={{color: '#fff', marginBottom: '30px'}}>Sélection du Niveau</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px'}}>
            {LEVELS.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => loadLevel(idx)}
                disabled={idx > maxUnlockedLevel && idx !== 0}
                className="retro-btn"
                style={{
                  padding: '15px 20px', 
                  fontSize: '18px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  opacity: (idx > maxUnlockedLevel && idx !== 0) ? 0.5 : 1,
                  borderColor: idx === maxUnlockedLevel ? '#E53E3E' : '#cbd5e1',
                  color: idx === maxUnlockedLevel ? '#E53E3E' : '#cbd5e1'
                }}
              >
                <span>Niveau {idx + 1}</span>
                {(idx > maxUnlockedLevel && idx !== 0) ? <span>🔒</span> : <span>▶</span>}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setGameState('menu')}
            className="retro-btn"
            style={{marginTop: '20px', padding: '10px 20px', borderColor: '#64748b', color: '#64748b'}}
          >
            Retour Menu
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={gameplayContainerStyle}>
          


          <div style={{...boardWrapperStyle, width: BOARD_PX, height: BOARD_PX}}>
            {/* Exit hole indicator */}
            <div style={{
              position: 'absolute', right: '-15px', top: `${2 * CELL_PX + 5}px`,
              width: '15px', height: `${CELL_PX - 10}px`,
              background: '#E53E3E', borderRadius: '0 8px 8px 0',
              boxShadow: '0 0 10px rgba(229, 62, 62, 0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
            }}>
              ▶
            </div>

            {/* Grid Background */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              background: '#451a03', // dark wood color
              borderRadius: '8px', zIndex: 0
            }}>
              {Array.from({length: GRID_SIZE * GRID_SIZE}).map((_, i) => (
                <div key={i} style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
              ))}
            </div>

            {/* Render Blocks */}
            {blocks.map(renderBlock)}
          </div>
          
          <div style={{marginTop: '30px', color: '#cbd5e1', fontSize: '14px', textAlign: 'center'}}>
            <strong>Astuce :</strong> Touchez un bloc pour le sélectionner, puis utilisez les flèches pour le faire glisser. Amenez le bloc rouge vers la sortie ▶.
          </div>
        </div>
      )}

      {/* Victory Overlays */}
      {victoryPhase > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s'
        }}>
          {victoryPhase >= 2 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px',
                  width: '10px', height: '10px', background: ['#E53E3E', '#3B82F6', '#F59E0B'][i%3],
                  borderRadius: '2px', animation: `confettiFall ${2 + Math.random()*3}s linear ${Math.random()*2}s infinite`,
                  transform: `rotate(${Math.random()*360}deg)`, opacity: 0.8
                }} />
              ))}
            </div>
          )}

          {victoryPhase === 1 && (
            <h2 style={{ fontSize: '4rem', color: '#39FF14', margin: 0, animation: 'popIn 0.8s' }}>DÉBLOQUÉ !</h2>
          )}

          {victoryPhase === 3 && (
            <div style={{
              animation: 'popIn 0.5s', textAlign: 'center', background: 'white', padding: '50px',
              borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #E53E3E', zIndex: 10
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🧠</div>
              <h2 style={{ fontSize: '2.5rem', color: '#333', margin: '0 0 20px 0' }}>Logique Imparable !</h2>
              <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '30px' }}>
                Score: <strong style={{ color: '#E53E3E', fontSize: '2rem' }}>{Math.max(1000 - moves * 10, 100)}</strong>
              </div>
              <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                <button
                  onClick={() => { setVictoryPhase(0); setGameState('levelSelect'); }}
                  className="retro-btn"
                  style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#333', color: '#333' }}
                >
                  Niveaux
                </button>
                {currentLevelIdx < LEVELS.length - 1 && (
                  <button
                    onClick={() => {
                      setVictoryPhase(0);
                      if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') {
                        onIntermissionRequest();
                      } else {
                        loadLevel(currentLevelIdx + 1);
                      }
                    }}
                    className="retro-btn pulse-glow"
                    style={{ fontSize: '1.2rem', padding: '10px 20px', borderColor: '#E53E3E', color: '#E53E3E' }}
                  >
                    Niveau Suivant
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-arrow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .pulse-arrow {
          animation: pulse-arrow 1s infinite alternate;
        }
      `}} />
      </div>
    </>
  );
}

// Arrow button style logic
const arrowBtnStyle = (dir) => {
  const base = {
    position: 'absolute', background: 'rgba(255,255,255,0.9)', border: '2px solid #333',
    color: '#333', width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px',
    cursor: 'pointer', zIndex: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
  };
  if (dir === 'left') return { ...base, left: '-18px' };
  if (dir === 'right') return { ...base, right: '-18px' };
  if (dir === 'up') return { ...base, top: '-18px' };
  if (dir === 'down') return { ...base, bottom: '-18px' };
  return base;
};

// Inline Styles
const containerStyle = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '500px',
  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
  borderRadius: '16px', padding: '20px', boxSizing: 'border-box',
  margin: '0 auto', minHeight: '100%', position: 'relative'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'
};

const backBtnStyle = { padding: '8px 16px', fontSize: '14px' };

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif', fontSize: '22px', color: '#F59E0B',
  textShadow: '0 0 10px rgba(245, 158, 11, 0.5)', letterSpacing: '1px', fontWeight: 'bold'
};

const menuStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, marginTop: '20px' };

const gameplayContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 };

const statusRowStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '30px', fontSize: '18px', padding: '0 10px', boxSizing: 'border-box'
};

const boardWrapperStyle = {
  position: 'relative', margin: '0 auto', boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
  backgroundColor: '#78350f', border: '8px solid #451a03', borderRadius: '12px'
};
