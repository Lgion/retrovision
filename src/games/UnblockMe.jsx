import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { getGameConfig, updateGameConfig } from '../utils/config';
import LEVELS from '../utils/unblockLevels.json';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionProposal from '../components/IntermissionProposal';
import { useConfirm } from '../components/ConfirmContext';

export default function UnblockMe({
  onBack,
  onScoreSave,
  onLaunchIntermission,
  onIntermissionRequest,
  onIntermissionComplete,
  isIntermission = false,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionConfig,
  intermissionGames
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!isIntermission);
  const [gameState, setGameState] = useState('playing'); // Démarrage direct dans le jeu
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

  // Chargement d'un niveau spécifique
  const loadLevel = useCallback((idx) => {
    setCurrentLevelIdx(idx);
    const levelBlocks = JSON.parse(JSON.stringify(LEVELS[idx])); // Deep copy
    setBlocks(levelBlocks);
    setHistory([]);
    setMoves(0);
    setVictoryPhase(0);
    setSelectedBlockId(null);
    setGameState('playing');
    sound.startBGM();
  }, []);

  // Lancement d'un niveau aléatoire
  const loadRandomLevel = useCallback((excludeIdx = currentLevelIdx) => {
    sound.playClick();
    haptic.tap(30);
    const pool = LEVELS.map((_, i) => i).filter(i => i !== excludeIdx);
    const nextIdx = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : 0;
    loadLevel(nextIdx);
  }, [currentLevelIdx, loadLevel]);

  // Initialisation immédiate avec un niveau aléatoire sans écran de départ
  useEffect(() => {
    const initialIdx = Math.floor(Math.random() * LEVELS.length);
    loadLevel(initialIdx);
  }, [loadLevel]);

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

  const handleBackWithConfirm = async () => {
    if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
      const ok = await confirm({
        title: "Quitter Débloque-moi ?",
        message: "Voulez-vous vraiment quitter la partie en cours ?",
        confirmText: "Oui, quitter",
        cancelText: "Continuer à jouer",
        confirmVariant: "danger"
      });
      if (ok) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const undoMove = () => {
    if (history.length === 0 || victoryPhase !== 0) return;
    sound.playClick();
    haptic.tap(20);
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
    haptic.tap(20);
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
      haptic.light(20);
      return;
    }

    // Move is valid
    haptic.tap(25);
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

  // Raccourcis clavier pour le bloc sélectionné
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedBlockId || victoryPhase !== 0) return;
      if (e.key === 'ArrowUp') { e.preventDefault(); moveBlock('up'); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveBlock('down'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); moveBlock('left'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); moveBlock('right'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, victoryPhase, blocks]);

  const handleVictory = () => {
    setVictoryPhase(-1);
    haptic.success();
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
    <div style={containerStyle}>
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="DÉBLOQUE-MOI"
          icon="🚪"
          colors={['#f97316', '#ef4444', '#fbbf24']}
          particleType="blocks"
          onComplete={() => setShowIntro(false)}
        />
      )}

      <GameHeader
        title="DÉBLOQUE-MOI"
        gameId="unblock"
        onBack={handleBackWithConfirm}
        onLaunchIntermission={onLaunchIntermission || onIntermissionRequest}
        onRestart={loadRandomLevel}
        restartTitle="Nouveau défi aléatoire"
        onUndo={undoMove}
        undoDisabled={history.length === 0}
        showBgmToggle={false}
        centerContent={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontFamily: 'Orbitron, sans-serif' }}>
            <div style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <span>🎲 Défi #{currentLevelIdx + 1}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Coups: <span style={{ color: '#f97316', fontWeight: 'bold' }}>{moves}</span>
            </div>
          </div>
        }
      />

      {/* Aire de jeu principale */}
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

        {/* PAVÉ DIRECTIONNEL SOUS LA GRILLE */}
        {(() => {
          const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
          const isTarget = selectedBlock?.type === 'target';
          const isHorizontal = selectedBlock?.orientation === 'h';
          const isVertical = selectedBlock?.orientation === 'v';

          return (
            <div
              style={{
                marginTop: '18px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {selectedBlock ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    animation: 'cm-fade-in 0.2s ease-out'
                  }}
                >
                  {/* Indicateur visuel du bloc sélectionné */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      background: isTarget
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isHorizontal
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                      border: `1px solid ${isTarget ? '#EF4444' : isHorizontal ? '#3B82F6' : '#F59E0B'}`,
                      marginBottom: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{isTarget ? '🔴' : isHorizontal ? '🟦' : '🟨'}</span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: isTarget ? '#F87171' : isHorizontal ? '#93C5FD' : '#FCD34D'
                      }}
                    >
                      Bloc {isTarget ? 'Rouge (Sortie)' : isHorizontal ? 'Horizontal (◀ ▶)' : 'Vertical (▲ ▼)'}
                    </span>
                    <button
                      onClick={() => setSelectedBlockId(null)}
                      title="Désélectionner"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        marginLeft: '4px',
                        fontSize: '14px',
                        padding: '2px 4px'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Disposition en croix du pavé tactile */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 62px)',
                      gridTemplateRows: 'repeat(3, 56px)',
                      gap: '8px',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {/* Ligne 1 : Bouton Haut */}
                    <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => moveBlock('up')}
                        disabled={!isVertical}
                        style={dpadBtnStyle('up', isVertical, isTarget)}
                        aria-label="Déplacer vers le haut"
                      >
                        ▲
                      </button>
                    </div>

                    {/* Ligne 2 : Gauche, Centre (Désélection), Droite */}
                    <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => moveBlock('left')}
                        disabled={!isHorizontal}
                        style={dpadBtnStyle('left', isHorizontal, isTarget)}
                        aria-label="Déplacer vers la gauche"
                      >
                        ◀
                      </button>
                    </div>

                    <div
                      style={{
                        gridColumn: '2 / 3',
                        gridRow: '2 / 3',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <button
                        onClick={() => setSelectedBlockId(null)}
                        title="Désélectionner le bloc"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => moveBlock('right')}
                        disabled={!isHorizontal}
                        style={dpadBtnStyle('right', isHorizontal, isTarget)}
                        aria-label="Déplacer vers la droite"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Ligne 3 : Bouton Bas */}
                    <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => moveBlock('down')}
                        disabled={!isVertical}
                        style={dpadBtnStyle('down', isVertical, isTarget)}
                        aria-label="Déplacer vers le bas"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    fontSize: '13px',
                    textAlign: 'center',
                    maxWidth: '340px'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>👆</span>
                  <span>
                    Touchez un bloc sur la grille pour faire apparaître les flèches et utiliser le pavé directionnel.
                  </span>
                </div>
              )}
            </div>
          );
        })()}
        
        <div style={{marginTop: '16px', color: '#94a3b8', fontSize: '12px', textAlign: 'center'}}>
          Glissez le bloc rouge <strong>vers la sortie ▶</strong> à droite.
        </div>
      </div>

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
              animation: 'popIn 0.5s', textAlign: 'center', background: 'white', padding: '40px 24px',
              borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #E53E3E', zIndex: 10,
              maxWidth: '380px', width: '90%'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🧠</div>
              <h2 style={{ fontSize: '2rem', color: '#333', margin: '0 0 12px 0' }}>Logique Imparable !</h2>
              <div style={{ fontSize: '1.3rem', color: '#666', marginBottom: '24px' }}>
                Score: <strong style={{ color: '#E53E3E', fontSize: '1.8rem' }}>{Math.max(1000 - moves * 10, 100)}</strong>
              </div>
              {isIntermission ? (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <button
                    onClick={() => onIntermissionComplete && onIntermissionComplete()}
                    className="retro-btn pulse-glow"
                    style={{ fontSize: '1.1rem', padding: '12px 26px', borderColor: '#E53E3E', color: '#E53E3E' }}
                  >
                    Terminer l'Entracte 🏁
                  </button>
                </div>
              ) : (
                <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
                  <IntermissionProposal
                    onIntermissionRequest={onIntermissionRequest}
                    upcomingIntermission={upcomingIntermission}
                    onSelectUpcomingIntermission={onSelectUpcomingIntermission}
                    onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
                    intermissionConfig={intermissionConfig}
                    intermissionGames={intermissionGames}
                    excludeGameKey="unblock"
                    onContinue={() => {
                      setVictoryPhase(0);
                      loadRandomLevel();
                    }}
                    continueText="Nouveau Défi Aléatoire 🎲"
                    showDirectContinue={true}
                    customStyle={{ marginBottom: '16px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => { setVictoryPhase(0); loadRandomLevel(); }}
                      className="retro-btn pulse-glow"
                      style={{ fontSize: '15px', padding: '12px 24px', borderColor: '#E53E3E', color: '#E53E3E', fontWeight: 'bold' }}
                    >
                      Nouveau Défi Aléatoire 🎲 ➔
                    </button>
                  </div>
                </div>
              )}
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

// D-pad button style logic
const dpadBtnStyle = (dir, isEnabled, isTarget) => ({
  width: '58px',
  height: '52px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  cursor: isEnabled ? 'pointer' : 'default',
  border: isEnabled
    ? `2px solid ${isTarget ? '#EF4444' : '#38BDF8'}`
    : '1px solid rgba(255, 255, 255, 0.08)',
  background: isEnabled
    ? (isTarget
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.45) 100%)'
        : 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(37, 99, 235, 0.45) 100%)')
    : 'rgba(15, 23, 42, 0.4)',
  color: isEnabled ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
  boxShadow: isEnabled
    ? `0 4px 15px ${isTarget ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`
    : 'none',
  opacity: isEnabled ? 1 : 0.22,
  transition: 'all 0.15s ease',
  touchAction: 'manipulation'
});

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
