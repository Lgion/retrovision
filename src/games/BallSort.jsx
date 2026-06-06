import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

const getTopColorGroupCount = (tube) => {
  if (tube.length === 0) return 0;
  const topColor = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

export default function BallSort({ onBack, onScoreSave }) {
  // Settings states
  const [colorsCount, setColorsCount] = useState(() => Number(localStorage.getItem('retrovision_ball_colors')) || 5);
  const [variant, setVariant] = useState(() => localStorage.getItem('retrovision_ball_variant') || 'classique'); // 'classique' (Simple) or 'double' (Double)
  const [capacity, setCapacity] = useState(() => Number(localStorage.getItem('retrovision_ball_capacity')) || 4);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [bouncingTube, setBouncingTube] = useState(null);
  const [extraTubesCount, setExtraTubesCount] = useState(0); // 0 or 1
  const [hintTubes, setHintTubes] = useState(null); // [srcIdx, destIdx]
  
  // State for sparkle particles
  const [particles, setParticles] = useState([]);

  // High-contrast colors optimized for visibility
  const colors = {
    R: '#ef4444', // Red
    C: '#06b6d4', // Cyan
    G: '#10b981', // Green
    Y: '#f59e0b', // Yellow
    P: '#8b5cf6', // Purple
    O: '#f97316', // Orange
    W: '#64748b', // Slate Grey
    K: '#78350f', // Brown
  };

  useEffect(() => {
    initGame();
  }, [colorsCount, variant, capacity]);

  const initGame = () => {
    const activeColorsKeys = ['R', 'C', 'G', 'Y', 'P', 'O', 'W', 'K'].slice(0, colorsCount);
    const ballsPerColor = variant === 'classique' ? capacity : capacity * 2;
    
    const ballPool = [];
    activeColorsKeys.forEach(col => {
      for (let i = 0; i < ballsPerColor; i++) {
        ballPool.push(col);
      }
    });

    // Shuffle pool
    for (let i = ballPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ballPool[i], ballPool[j]] = [ballPool[j], ballPool[i]];
    }

    const filledTubesCount = variant === 'classique' ? colorsCount : colorsCount * 2;
    const initialTubes = [];
    for (let i = 0; i < filledTubesCount; i++) {
      initialTubes.push(ballPool.slice(i * capacity, i * capacity + capacity));
    }
    
    // Add 2 empty tubes
    initialTubes.push([]);
    initialTubes.push([]);

    setTubes(initialTubes);
    setSelectedTube(null);
    setHistory([]);
    setWon(false);
    setBouncingTube(null);
    setParticles([]);
    setExtraTubesCount(0);
    setHintTubes(null);
  };

  const handleTubeClick = (index) => {
    if (won) return;
    setHintTubes(null);

    if (selectedTube === null) {
      if (tubes[index].length === 0) return;
      setSelectedTube(index);
      sound.playClick();
    } else {
      if (selectedTube === index) {
        setSelectedTube(null);
        sound.playClick();
        return;
      }

      if (canMove(selectedTube, index)) {
        moveBall(selectedTube, index);
      } else {
        if (tubes[index].length > 0) {
          setSelectedTube(index);
          sound.playClick();
        } else {
          setSelectedTube(null);
          sound.playClick();
        }
      }
    }
  };

  const canMove = (srcIdx, destIdx) => {
    const src = tubes[srcIdx];
    const dest = tubes[destIdx];

    if (src.length === 0) return false;
    if (dest.length >= capacity) return false;

    const ballToMove = src[src.length - 1];
    const destTopBall = dest[dest.length - 1];

    if (dest.length === 0 || destTopBall === ballToMove) {
      const countToMove = getTopColorGroupCount(src);
      return dest.length + countToMove <= capacity;
    }
    return false;
  };

  const moveBall = (srcIdx, destIdx) => {
    setHistory([...history, JSON.stringify(tubes)]);

    const nextTubes = tubes.map(t => [...t]);
    const countToMove = getTopColorGroupCount(nextTubes[srcIdx]);
    const ballsToMove = [];
    for (let i = 0; i < countToMove; i++) {
      ballsToMove.push(nextTubes[srcIdx].pop());
    }
    // Push them onto destIdx in the same order
    for (let i = 0; i < countToMove; i++) {
      nextTubes[destIdx].push(ballsToMove[i]);
    }

    setTubes(nextTubes);
    setSelectedTube(null);
    setBouncingTube(destIdx); // Bounce top ball
    sound.playScore();

    // Check if this action completed a tube
    const targetTube = nextTubes[destIdx];
    if (targetTube.length === capacity && targetTube.every(b => b === targetTube[0])) {
      triggerSparkles(destIdx, colors[targetTube[0]]);
    }

    setTimeout(() => {
      setBouncingTube(null);
    }, 700);

    checkWin(nextTubes);
  };

  const addExtraTube = () => {
    if (won || extraTubesCount >= 1) return;
    setHistory([...history, JSON.stringify(tubes)]);
    setTubes([...tubes, []]);
    setExtraTubesCount(1);
    sound.playPowerup();
  };

  const getHint = () => {
    setHintTubes(null);
    for (let src = 0; src < tubes.length; src++) {
      for (let dest = 0; dest < tubes.length; dest++) {
        if (src !== dest && canMove(src, dest)) {
          const srcTube = tubes[src];
          const destTube = tubes[dest];
          const isSorted = srcTube.length > 0 && srcTube.every(b => b === srcTube[0]);
          const movingToEmpty = destTube.length === 0;
          
          if (!(isSorted && movingToEmpty)) {
            setHintTubes([src, dest]);
            sound.playPowerup();
            return;
          }
        }
      }
    }
    // Fallback
    for (let src = 0; src < tubes.length; src++) {
      for (let dest = 0; dest < tubes.length; dest++) {
        if (src !== dest && canMove(src, dest)) {
          setHintTubes([src, dest]);
          sound.playPowerup();
          return;
        }
      }
    }
  };

  const triggerSparkles = (tubeIdx, color) => {
    const newParticles = [];
    const timestamp = Date.now();
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.2;
      const speed = 40 + Math.random() * 50;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 20;
      newParticles.push({
        id: `${timestamp}-${i}`,
        tubeIdx,
        dx: `${dx}px`,
        dy: `${dy}px`,
        color,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 800);
  };

  const checkWin = (currentTubes) => {
    const isWon = currentTubes.every(tube => {
      if (tube.length === 0) return true;
      if (tube.length === capacity) {
        const firstColor = tube[0];
        return tube.every(ball => ball === firstColor);
      }
      return false;
    });

    if (isWon) {
      setWon(true);
      sound.playPowerup();
      if (onScoreSave) {
        onScoreSave('Tri Billes', 150);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const prevTubes = JSON.parse(prev);
    setTubes(prevTubes);
    
    const originalTubesCount = (variant === 'classique' ? colorsCount : colorsCount * 2) + 2;
    if (prevTubes.length === originalTubesCount) {
      setExtraTubesCount(0);
    }

    setHistory(history.slice(0, -1));
    setSelectedTube(null);
    setHintTubes(null);
    sound.playClick();
  };

  const saveSettings = (newColors, newVariant, newCapacity) => {
    setColorsCount(newColors);
    setVariant(newVariant);
    setCapacity(newCapacity);
    localStorage.setItem('retrovision_ball_colors', newColors);
    localStorage.setItem('retrovision_ball_variant', newVariant);
    localStorage.setItem('retrovision_ball_capacity', newCapacity);
    setIsSettingsOpen(false);
  };

  const renderTube = (tube, realIdx) => {
    const isSelected = selectedTube === realIdx;
    const selectedGroupCount = isSelected ? getTopColorGroupCount(tube) : 0;
    const floatingBall = isSelected && tube.length > 0 ? tube[tube.length - 1] : null;

    const isHintSource = hintTubes && hintTubes[0] === realIdx;
    const isHintDest = hintTubes && hintTubes[1] === realIdx;

    const tubeParticles = particles.filter(p => p.tubeIdx === realIdx);

    // Increased sizes for stroke recovery accessibility
    const tubeHeight = capacity * 46 + 24;

    return (
      <div key={realIdx} style={tubeWrapperStyle}>
        {/* Sparkles particle container */}
        {tubeParticles.map(p => (
          <div 
            key={p.id}
            className="sparkle-particle"
            style={{
              '--dx': p.dx,
              '--dy': p.dy,
              '--sparkle-color': p.color,
              left: '50%',
              top: '44px',
            }}
          />
        ))}

        {/* Floating ball slot */}
        <div style={floatSlotStyle}>
          {isSelected && floatingBall && (
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '4px',
                animation: 'float-item 1.6s infinite ease-in-out',
                zIndex: 100,
              }}
            >
              {Array.from({ length: selectedGroupCount }).map((_, idx) => (
                <div 
                  key={idx}
                  className="marble-ball-3d"
                  style={{
                    backgroundColor: colors[floatingBall],
                    width: '46px',
                    height: '46px',
                    boxShadow: `inset -4px -4px 10px rgba(0,0,0,0.6), inset 4px 4px 8px rgba(255,255,255,0.4), 0 0 15px ${colors[floatingBall]}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Glass Test Tube cylinder */}
        <div 
          onClick={() => handleTubeClick(realIdx)}
          className={`glass-test-tube ${isHintSource ? 'wiggling' : ''}`}
          style={{
            ...tubeStyle,
            height: `${tubeHeight}px`,
            width: '54px',
            borderRadius: '0 0 28px 28px',
            borderColor: isSelected 
              ? 'var(--primary)' 
              : isHintSource 
                ? '#f59e0b' 
                : isHintDest 
                  ? '#10b981' 
                  : 'var(--border-color)',
            borderWidth: '2.5px',
            boxShadow: isSelected 
              ? '0 0 20px rgba(2, 132, 199, 0.4)' 
              : isHintSource || isHintDest
                ? '0 0 20px rgba(245, 158, 11, 0.4)'
                : 'inset 0 0 10px rgba(0,0,0,0.02)',
            transform: isSelected ? 'translateY(-14px)' : 'none',
          }}
        >
          <div style={ballsContainerStyle}>
            {Array.from({ length: capacity }).map((_, slotIdx) => {
              const ballIdx = capacity - 1 - slotIdx;
              const shouldHideBall = isSelected && (ballIdx >= tube.length - selectedGroupCount);
              const ballColorKey = (!shouldHideBall && ballIdx < tube.length) ? tube[ballIdx] : null;
              const isBouncing = bouncingTube === realIdx && ballIdx === tube.length - 1;

              return (
                <div key={slotIdx} style={ballSlotStyle}>
                  {ballColorKey && (
                    <div 
                      className={`marble-ball-3d ${isBouncing ? 'bouncing' : ''}`}
                      style={{
                        backgroundColor: colors[ballColorKey],
                        width: '46px',
                        height: '46px',
                        boxShadow: `inset -4px -4px 10px rgba(0,0,0,0.6), inset 4px 4px 8px rgba(255,255,255,0.4), 0 0 12px ${colors[ballColorKey]}66`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={labelStyle}>{realIdx + 1}</div>
      </div>
    );
  };

  return (
    <div className="game-container" style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={onBack} className="retro-btn" style={backBtnStyle}>
          &lt; Hub
        </button>
        <div style={titleStyle}>TRI DE BILLES</div>
        <button onClick={() => setIsSettingsOpen(true)} className="settings-btn" title="Règles">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {/* Rules Indicator */}
      <div style={rulesInfoStyle}>
        Règles : <strong>{colorsCount} couleurs ({variant === 'classique' ? 'Simple' : 'Double'}), capacité {capacity}</strong>
      </div>

      {/* Helpers Panel */}
      <div style={helpersContainerStyle}>
        <button 
          onClick={undo} 
          className="retro-btn" 
          style={{ ...helperBtnStyle, opacity: history.length > 0 ? 1 : 0.5 }}
          disabled={history.length === 0}
        >
          ↩ Annuler
        </button>
        <button 
          onClick={getHint} 
          className="retro-btn" 
          style={helperBtnStyle}
        >
          💡 Indice
        </button>
        <button 
          onClick={addExtraTube} 
          className="retro-btn" 
          style={{ ...helperBtnStyle, opacity: extraTubesCount < 1 ? 1 : 0.5 }}
          disabled={extraTubesCount >= 1}
        >
          🧪 +1 Tube
        </button>
      </div>

      {/* Board Tubes */}
      <div style={rowsContainerStyle}>
        <div style={flexBoardStyle}>
          {tubes.map((tube, idx) => renderTube(tube, idx))}
        </div>
      </div>

      {/* Victory Overlay */}
      {won && (
        <div style={overlayStyle}>
          <div style={victoryTitleStyle}>VICTOIRE !</div>
          <div style={descStyle}>Félicitations ! Toutes les billes ont été triées.</div>
          <button onClick={initGame} className="retro-btn" style={restartBtnStyle}>
            Nouveau Niveau
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="accessibility-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <div className="accessibility-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="accessibility-modal-title">Paramètres de Tri</h3>
            
            {/* Colors count setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Nombre de Couleurs :</span>
              <div className="accessibility-setting-options">
                {[3, 4, 5, 6, 7, 8].map(num => (
                  <button 
                    key={num}
                    className={`accessibility-setting-btn ${colorsCount === num ? 'active' : ''}`}
                    onClick={() => saveSettings(num, variant, capacity)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Variant setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Variante (Billes par couleur) :</span>
              <div className="accessibility-setting-options">
                <button 
                  className={`accessibility-setting-btn ${variant === 'classique' ? 'active' : ''}`}
                  onClick={() => saveSettings(colorsCount, 'classique', capacity)}
                >
                  Simple ({capacity} billes)
                </button>
                <button 
                  className={`accessibility-setting-btn ${variant === 'double' ? 'active' : ''}`}
                  onClick={() => saveSettings(colorsCount, 'double', capacity)}
                >
                  Double ({capacity * 2} billes)
                </button>
              </div>
            </div>

            {/* Capacity setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Capacité des Tubes :</span>
              <div className="accessibility-setting-options">
                {[3, 4, 5].map(num => (
                  <button 
                    key={num}
                    className={`accessibility-setting-btn ${capacity === num ? 'active' : ''}`}
                    onClick={() => saveSettings(colorsCount, variant, num)}
                  >
                    {num}
                  </button>
                ))}
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
        Sélectionnez un tube pour attraper toutes les billes identiques du sommet, puis cliquez sur un autre tube pour les y déposer.
      </div>
    </div>
  );
}

// Inline Styles updated for high-contrast accessibility
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '560px',
  background: '#ffffff',
  borderRadius: '24px',
  padding: '20px',
  boxSizing: 'border-box',
  margin: '0 auto',
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  border: '1px solid var(--border-color)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px',
};

const backBtnStyle = {
  padding: '10px 18px',
  fontSize: '15px',
  fontWeight: '700',
  minHeight: '44px',
};

const titleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--text-main)',
  letterSpacing: '-0.3px',
};

const rulesInfoStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  textAlign: 'center',
  marginBottom: '10px',
};

const helpersContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '18px',
};

const helperBtnStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--primary)',
  background: '#ffffff',
  border: '2px solid var(--primary)',
  borderRadius: '12px',
  cursor: 'pointer',
  minHeight: '44px',
};

const rowsContainerStyle = {
  padding: '20px 12px',
  background: '#f8fafc',
  borderRadius: '20px',
  border: '2px solid var(--border-color)',
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)',
};

const flexBoardStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px 16px',
  width: '100%',
};

const tubeWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
};

const floatSlotStyle = {
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '54px',
  marginBottom: '2px',
  position: 'relative',
  overflow: 'visible',
};

const tubeStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  cursor: 'pointer',
  padding: '8px 0',
  boxSizing: 'border-box',
};

const ballsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '2px',
};

const ballSlotStyle = {
  height: '46px',
  width: '50px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
};

const labelStyle = {
  marginTop: '6px',
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: '700',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  padding: '20px',
  textAlign: 'center',
  borderRadius: '24px',
  border: '1px solid var(--border-color)',
};

const victoryTitleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '28px',
  color: '#10b981',
  fontWeight: '800',
  marginBottom: '10px',
};

const descStyle = {
  color: 'var(--text-main)',
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '24px',
};

const restartBtnStyle = {
  padding: '14px 28px',
  fontSize: '16px',
  border: '2px solid #10b981',
  background: '#10b981',
  color: '#ffffff',
  fontWeight: '800',
};

const footerHelpStyle = {
  marginTop: '16px',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  textAlign: 'center',
  lineHeight: '1.45',
};
