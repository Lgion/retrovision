import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

export default function WaterSort({ onBack, onScoreSave }) {
  // Settings states
  const [colorsCount, setColorsCount] = useState(() => Number(localStorage.getItem('retrovision_water_colors')) || 6);
  const [capacity, setCapacity] = useState(() => Number(localStorage.getItem('retrovision_water_capacity')) || 4);
  const [emptyTubesCount, setEmptyTubesCount] = useState(() => Number(localStorage.getItem('retrovision_water_empty')) || 2);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [completedTubes, setCompletedTubes] = useState([]);
  const [extraTubesCount, setExtraTubesCount] = useState(0); // 0 or 1
  const [hintTubes, setHintTubes] = useState(null); // [srcIdx, destIdx]

  // Animation states
  const [wigglingTube, setWigglingTube] = useState(null);
  const [pouringState, setPouringState] = useState(null); // { srcIdx, destIdx, color }
  
  const colors = {
    R: '#ef4444', // Red
    B: '#06b6d4', // Cyan
    G: '#10b981', // Green
    Y: '#f59e0b', // Yellow
    P: '#8b5cf6', // Purple
    O: '#f97316', // Orange
    W: '#64748b', // Slate
    C: '#78350f', // Cocoa Brown
  };

  useEffect(() => {
    initGame();
  }, [colorsCount, capacity, emptyTubesCount]);

  const initGame = () => {
    const activeColorsKeys = ['R', 'B', 'G', 'Y', 'P', 'O', 'W', 'C'].slice(0, colorsCount);
    
    // Build color pool
    const colorPool = [];
    activeColorsKeys.forEach(col => {
      for (let i = 0; i < capacity; i++) {
        colorPool.push(col);
      }
    });
    
    // Shuffle pool
    for (let i = colorPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
    }

    const initialTubes = [];
    for (let i = 0; i < colorsCount; i++) {
      initialTubes.push(colorPool.slice(i * capacity, i * capacity + capacity));
    }
    
    // Add empty tubes
    for (let i = 0; i < emptyTubesCount; i++) {
      initialTubes.push([]);
    }

    setTubes(initialTubes);
    setSelectedTube(null);
    setHistory([]);
    setWon(false);
    setCompletedTubes([]);
    setWigglingTube(null);
    setPouringState(null);
    setExtraTubesCount(0);
    setHintTubes(null);
  };

  const handleTubeClick = (index) => {
    if (won || pouringState) return;
    if (completedTubes.includes(index)) return; // Sealed

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

      if (canPour(selectedTube, index)) {
        pour(selectedTube, index);
      } else {
        if (tubes[index].length > 0 && !completedTubes.includes(index)) {
          setSelectedTube(index);
          sound.playClick();
        } else {
          setSelectedTube(null);
          sound.playClick();
        }
      }
    }
  };

  const canPour = (srcIdx, destIdx) => {
    const src = tubes[srcIdx];
    const dest = tubes[destIdx];

    if (src.length === 0) return false;
    if (dest.length >= capacity) return false;

    const srcTopColor = src[src.length - 1];
    const destTopColor = dest[dest.length - 1];

    if (dest.length === 0 || srcTopColor === destTopColor) {
      return true;
    }
    return false;
  };

  const pour = (srcIdx, destIdx) => {
    const newHistory = [...history, JSON.stringify(tubes)];
    setHistory(newHistory);

    const src = tubes[srcIdx];
    const color = src[src.length - 1];

    setWigglingTube(destIdx);
    setPouringState({ srcIdx, destIdx, color });
    sound.playScore();

    setTimeout(() => {
      setTubes(prevTubes => {
        const nextTubes = prevTubes.map(t => [...t]);
        const s = nextTubes[srcIdx];
        const d = nextTubes[destIdx];
        const colorToPour = s[s.length - 1];
        
        let count = 0;
        for (let i = s.length - 1; i >= 0; i--) {
          if (s[i] === colorToPour) {
            count++;
          } else {
            break;
          }
        }

        const availableSpace = capacity - d.length;
        const amountToPour = Math.min(count, availableSpace);

        for (let i = 0; i < amountToPour; i++) {
          s.pop();
          d.push(colorToPour);
        }

        // Check if destination is completed (all capacity same color)
        if (d.length === capacity && d.every(c => c === d[0])) {
          setCompletedTubes(prev => {
            const nextCompleted = [...prev, destIdx];
            sound.playPowerup();
            return nextCompleted;
          });
        }

        checkWin(nextTubes);
        return nextTubes;
      });

      setWigglingTube(null);
      setPouringState(null);
    }, 450);

    setSelectedTube(null);
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
        if (src !== dest && canPour(src, dest)) {
          if (completedTubes.includes(src) || completedTubes.includes(dest)) continue;

          const srcTube = tubes[src];
          const destTube = tubes[dest];
          const isSorted = srcTube.every(c => c === srcTube[0]);
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
        if (src !== dest && canPour(src, dest)) {
          setHintTubes([src, dest]);
          sound.playPowerup();
          return;
        }
      }
    }
  };

  const checkWin = (currentTubes) => {
    const isWon = currentTubes.every(tube => {
      if (tube.length === 0) return true;
      if (tube.length === capacity) {
        const firstColor = tube[0];
        return tube.every(color => color === firstColor);
      }
      return false;
    });

    if (isWon) {
      setWon(true);
      sound.playPowerup();
      if (onScoreSave) {
        onScoreSave('Tri Eau', 150);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const prevTubes = JSON.parse(prev);
    setTubes(prevTubes);

    const nextCompleted = [];
    prevTubes.forEach((t, i) => {
      if (t.length === capacity && t.every(c => c === t[0])) {
        nextCompleted.push(i);
      }
    });

    const originalTubesCount = colorsCount + emptyTubesCount;
    if (prevTubes.length === originalTubesCount) {
      setExtraTubesCount(0);
    }

    setCompletedTubes(nextCompleted);
    setHistory(history.slice(0, -1));
    setSelectedTube(null);
    setHintTubes(null);
    sound.playClick();
  };

  const saveSettings = (newColors, newCapacity, newEmpty) => {
    setColorsCount(newColors);
    setCapacity(newCapacity);
    setEmptyTubesCount(newEmpty);
    localStorage.setItem('retrovision_water_colors', newColors);
    localStorage.setItem('retrovision_water_capacity', newCapacity);
    localStorage.setItem('retrovision_water_empty', newEmpty);
    setIsSettingsOpen(false);
  };

  const renderTube = (tube, idx) => {
    const isSelected = selectedTube === idx;
    const isWiggling = wigglingTube === idx;
    const isCompleted = completedTubes.includes(idx);
    const isSourcePouring = pouringState && pouringState.srcIdx === idx;

    const isHintSource = hintTubes && hintTubes[0] === idx;
    const isHintDest = hintTubes && hintTubes[1] === idx;
    
    // Position inside grid layout (5 columns per row for better touch targets and spacing)
    const colsPerRow = 5;
    const row = Math.floor(idx / colsPerRow);
    const col = idx % colsPerRow;
    
    const tubeWidth = 52;
    const horizontalSpacing = 74;
    const verticalSpacing = capacity * 36 + 48;

    const left = col * horizontalSpacing;
    const top = row * verticalSpacing;

    let dynamicStyle = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
    };

    if (isSourcePouring) {
      const destIdx = pouringState.destIdx;
      const destRow = Math.floor(destIdx / colsPerRow);
      const destCol = destIdx % colsPerRow;
      
      const dx = (destCol - col) * horizontalSpacing - 12;
      const dy = (destRow - row) * verticalSpacing - 50;
      
      dynamicStyle = {
        ...dynamicStyle,
        transform: `translate(${dx}px, ${dy}px) rotate(70deg)`,
        zIndex: 99,
      };
    } else if (isSelected) {
      dynamicStyle = {
        ...dynamicStyle,
        transform: 'translateY(-14px)',
        zIndex: 90,
      };
    }

    const tubeHeight = capacity * 36 + 12;
    const liquidHeight = capacity * 36;

    return (
      <div 
        key={idx} 
        onClick={() => handleTubeClick(idx)}
        className={`glass-test-tube ${isWiggling ? 'wiggling' : ''}`}
        style={{
          ...tubeStyle,
          ...dynamicStyle,
          height: `${tubeHeight}px`,
          width: `${tubeWidth}px`,
          borderColor: isSelected 
            ? 'var(--primary)' 
            : isHintSource 
              ? '#f59e0b' 
              : isHintDest 
                ? '#10b981' 
                : 'var(--border-color)',
          borderWidth: '2.5px',
          boxShadow: isSelected 
            ? '0 0 18px rgba(2, 132, 199, 0.35)' 
            : isHintSource || isHintDest
              ? '0 0 18px rgba(245, 158, 11, 0.35)'
              : 'inset 0 0 8px rgba(0,0,0,0.01)',
          background: '#ffffff',
          borderRadius: '0 0 28px 28px',
        }}
      >
        {/* Cork Stopper on Completed Tubes */}
        {isCompleted && <div className="cork-stopper" style={{ top: '-14px', height: '16px' }} />}

        {/* Floating Bubbles */}
        {tube.length > 0 && !isCompleted && (
          <>
            <div className="bubble" style={{ left: '8px', '--bubble-drift': '3px', animationDelay: '0.1s', animationDuration: '3s' }} />
            <div className="bubble" style={{ left: '20px', '--bubble-drift': '-4px', animationDelay: '1.2s', animationDuration: '3.8s' }} />
            <div className="bubble" style={{ left: '32px', '--bubble-drift': '2px', animationDelay: '2.2s', animationDuration: '3.5s' }} />
          </>
        )}

        <div style={{ ...liquidContainerStyle, height: `${liquidHeight}px`, borderRadius: '0 0 24px 24px' }}>
          {Array.from({ length: capacity }).map((_, slotIdx) => {
            const colorKey = tube[capacity - 1 - slotIdx];
            const colorHex = colors[colorKey];
            const isTopLiquidSegment = colorHex && (slotIdx === capacity - tube.length);

            return (
              <div 
                key={slotIdx}
                style={{
                  ...liquidSlotStyle,
                  backgroundColor: colorHex || 'transparent',
                  boxShadow: colorHex ? `inset 0 0 8px rgba(255,255,255,0.2), 0 0 12px ${colorHex}44` : 'none',
                  borderBottom: slotIdx === capacity - 1 ? 'none' : '1.5px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                {isTopLiquidSegment && (
                  <div className="liquid-meniscus" style={{ backgroundColor: colorHex, height: '6px' }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={tubeLabelStyle}>{idx + 1}</div>
      </div>
    );
  };

  // Determine dynamic board height based on rows
  const totalTubes = tubes.length;
  const colsPerRow = 5;
  const boardRows = Math.ceil(totalTubes / colsPerRow);
  const verticalSpacing = capacity * 36 + 48;
  const boardHeight = boardRows * verticalSpacing;

  return (
    <div className="game-container" style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={onBack} className="retro-btn" style={backBtnStyle}>
          &lt; Hub
        </button>
        <div style={titleStyle}>TRI DE L'EAU</div>
        <button onClick={() => setIsSettingsOpen(true)} className="settings-btn" title="Règles">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {/* Rules Indicator */}
      <div style={rulesInfoStyle}>
        Règles : <strong>{colorsCount} couleurs, capacité {capacity}, {emptyTubesCount} vides</strong>
      </div>

      {/* Helpers panel */}
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
      <div style={boardWrapperStyle}>
        <div style={{ ...boardStyle, height: `${boardHeight}px` }}>
          {/* Simulated pouring stream */}
          {pouringState && (
            <div 
              className="pour-stream"
              style={{
                color: colors[pouringState.color],
                backgroundColor: colors[pouringState.color],
                left: `${(pouringState.destIdx % colsPerRow) * 76 + 22}px`,
                top: `${Math.floor(pouringState.destIdx / colsPerRow) * verticalSpacing - 18}px`,
                height: '30px',
                width: '6px',
              }}
            />
          )}

          {tubes.map((tube, idx) => renderTube(tube, idx))}
        </div>
      </div>

      {won && (
        <div style={overlayStyle}>
          <div style={victoryTitleStyle}>NIVEAU COMPLÉTÉ !</div>
          <div style={descStyle}>Toutes les éprouvettes ont été triées.</div>
          <button onClick={initGame} className="retro-btn" style={restartBtnStyle}>
            Nouveau Niveau
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="accessibility-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
          <div className="accessibility-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="accessibility-modal-title">Paramètres de l'Eau</h3>
            
            {/* Colors count setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Nombre de Couleurs :</span>
              <div className="accessibility-setting-options">
                {[4, 5, 6, 7, 8].map(num => (
                  <button 
                    key={num}
                    className={`accessibility-setting-btn ${colorsCount === num ? 'active' : ''}`}
                    onClick={() => saveSettings(num, capacity, emptyTubesCount)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Segments par Tube (Capacité) :</span>
              <div className="accessibility-setting-options">
                {[3, 4, 5].map(num => (
                  <button 
                    key={num}
                    className={`accessibility-setting-btn ${capacity === num ? 'active' : ''}`}
                    onClick={() => saveSettings(colorsCount, num, emptyTubesCount)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty tubes setting */}
            <div className="accessibility-setting-row">
              <span className="accessibility-setting-label">Tubes Vides de Départ :</span>
              <div className="accessibility-setting-options">
                {[1, 2, 3].map(num => (
                  <button 
                    key={num}
                    className={`accessibility-setting-btn ${emptyTubesCount === num ? 'active' : ''}`}
                    onClick={() => saveSettings(colorsCount, capacity, num)}
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
        Sélectionnez une fiole puis une autre fiole compatible pour y verser la couleur du sommet.
      </div>
    </div>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '430px',
  background: '#ffffff',
  borderRadius: '24px',
  padding: '20px',
  boxSizing: 'border-box',
  margin: '0 auto',
  position: 'relative',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
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

const boardWrapperStyle = {
  width: '100%',
  background: '#f8fafc',
  borderRadius: '20px',
  padding: '30px 10px 10px',
  display: 'flex',
  justifyContent: 'center',
  boxSizing: 'border-box',
  border: '2px solid var(--border-color)',
  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)',
};

const boardStyle = {
  position: 'relative',
  width: '348px', // 5 columns * 76px spacing
};

const tubeStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  cursor: 'pointer',
  transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
};

const liquidContainerStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  overflow: 'hidden'
};

const liquidSlotStyle = {
  flex: 1,
  width: '100%',
  transition: 'background-color 0.4s ease',
  position: 'relative'
};

const tubeLabelStyle = {
  position: 'absolute',
  top: '-24px',
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text-muted)',
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
