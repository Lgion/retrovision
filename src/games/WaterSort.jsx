import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import WaterSortCollection from './WaterSortCollection';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import WinLossTransition from '../components/WinLossTransition';
import GameHeader from '../components/GameHeader';

export default function WaterSort({ onBack, onScoreSave, isIntermission, intermissionDifficulty, onIntermissionComplete, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);
  const containerRef = useRef(null);
  const lastNumFilledRef = useRef(0);
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [history, setHistory] = useState([]);
  const [victoryPhase, setVictoryPhase] = useState(0); // 0: playing, 1: stage1, 2: stage2, 3: final
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [pouringTubes, setPouringTubes] = useState(null); // { src, dest }
  const [extraTubesCount, setExtraTubesCount] = useState(0);
  const [hintTubes, setHintTubes] = useState(null);
  const [scale, setScale] = useState(1);
  const [showCollection, setShowCollection] = useState(false);
  const [customizations, setCustomizations] = useState(() => getGameConfig('water', 'customizations', { tube: 'wt1', theme: 'bg1', color: 'wc1', difficulty: 'moyen' }));
  const [pourFromBottom, setPourFromBottom] = useState(false);
  const [completedTubeIndex, setCompletedTubeIndex] = useState(null);

  // We will determine tube counts dynamically in initGame
  const defaultCap = 4;

  const colorPalettes = {
    wc1: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#14B8A6', '#4C1D95'],
    wc2: ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFCC99', '#F5F5DC', '#B266B2'],
    wc3: ['#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#D2691E', '#6B21A8', '#4B0082'],
    wc4: ['#FF1493', '#32CD32', '#1E90FF', '#FFD700', '#8A2BE2', '#00FA9A', '#FF4500', '#20B2AA', '#F5DEB3'],
    wc5: ['#EA3323', '#75FA4C', '#3A3AFA', '#F6FA05', '#F505F1', '#05FAFA', '#FA9E05', '#F43F5E', '#8B5A2B'],
    wc6: ['#8B0000', '#556B2F', '#00008B', '#B8860B', '#4B0082', '#2F4F4F', '#D2691E', '#0EA5E9', '#8B4513'],
    wc7: ['#FF69B4', '#7CFC00', '#4169E1', '#F0E68C', '#9370DB', '#40E0D0', '#FFA07A', '#EE82EE', '#FFDAB9'],
    wc8: ['#DC143C', '#00FF7F', '#191970', '#FFD700', '#9932CC', '#00CED1', '#FF8C00', '#BE123C', '#C71585'],
    wc9: ['#E6194B', '#3CB44B', '#4363D8', '#FFE119', '#911EB4', '#42D4F4', '#F58231', '#F032E6', '#BFEEF4']
  };

  const currentPalette = colorPalettes[customizations.color] || colorPalettes.wc1;

  // Generate gradient for liquid
  const makeGradient = (hex) => `linear-gradient(to right, ${hex}cc, ${hex}, ${hex}cc)`;

  const colors = {
    R: { hex: currentPalette[0], grad: makeGradient(currentPalette[0]) },
    B: { hex: currentPalette[1], grad: makeGradient(currentPalette[1]) },
    G: { hex: currentPalette[2], grad: makeGradient(currentPalette[2]) },
    Y: { hex: currentPalette[3], grad: makeGradient(currentPalette[3]) },
    P: { hex: currentPalette[4], grad: makeGradient(currentPalette[4]) },
    O: { hex: currentPalette[5], grad: makeGradient(currentPalette[5]) },
    W: { hex: currentPalette[6], grad: makeGradient(currentPalette[6]) },
    D: { hex: currentPalette[7], grad: makeGradient(currentPalette[7]) },
    M: { hex: currentPalette[8], grad: makeGradient(currentPalette[8]) }
  };

  const initGame = (overrideDiff = null) => {
    let numFilled;
    if (isIntermission) {
      let min = 3, max = 4;
      if (intermissionDifficulty === 'facile') { min = 3; max = 4; }
      else if (intermissionDifficulty === 'moyen') { min = 5; max = 6; }
      else if (intermissionDifficulty === 'difficile') { min = 7; max = 9; }
      do {
        numFilled = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (numFilled === lastNumFilledRef.current && (max - min) > 0);
    } else {
      numFilled = parseInt(overrideDiff || customizations.difficulty) || 5;
    }
    lastNumFilledRef.current = numFilled;
    const numEmpty = numFilled >= 7 ? 2 : 1;
    const activeColorsKeys = ['R', 'B', 'G', 'Y', 'P', 'O', 'W', 'D', 'M'].slice(0, numFilled);

    const liquidPool = [];
    activeColorsKeys.forEach(col => {
      for (let i = 0; i < defaultCap; i++) liquidPool.push(col);
    });

    for (let i = liquidPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [liquidPool[i], liquidPool[j]] = [liquidPool[j], liquidPool[i]];
    }

    const initialTubes = [];
    for (let i = 0; i < numFilled; i++) {
      initialTubes.push(liquidPool.slice(i * defaultCap, i * defaultCap + defaultCap));
    }

    for (let i = 0; i < numEmpty; i++) {
      initialTubes.push([]);
    }

    setTubes(initialTubes);
    setSelectedTube(null);
    setHistory([]);
    setVictoryPhase(0);
    setMoves(0);
    setStartTime(Date.now());
    setPouringTubes(null);
    setExtraTubesCount(0);
    setHintTubes(null);
  };

  useEffect(() => {
    initGame();

    const handleResize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 60; // 30px padding on sides
      // 6 tubes of 50px + 5 gaps of 15px = 300 + 75 = 375px
      const requiredWidth = 6 * 50 + 5 * 15;
      if (availableWidth < requiredWidth) {
        setScale(availableWidth / requiredWidth);
      } else {
        setScale(1);
      }
    };

    const target = containerRef.current;
    let resizeObserver;
    if (target) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(target);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && target) {
        resizeObserver.unobserve(target);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isGameInProgress = victoryPhase === 0 && history.length > 0;
      if (isGameInProgress) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter la partie en cours ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [victoryPhase, history]);

  const getTubeCapacity = (index) => {
    return (extraTubesCount > 0 && index === tubes.length - 1) ? 1 : defaultCap;
  };

  const getTopColorGroupCount = (tube) => {
    if (tube.length === 0) return 0;
    const topColor = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0; i--) {
      if (tube[i] === topColor) count++;
      else break;
    }
    return count;
  };

  const getBottomColorGroupCount = (tube) => {
    if (tube.length === 0) return 0;
    const bottomColor = tube[0];
    let count = 0;
    for (let i = 0; i < tube.length; i++) {
      if (tube[i] === bottomColor) count++;
      else break;
    }
    return count;
  };

  const handleTubeClick = (index) => {
    if (victoryPhase !== 0 || pouringTubes) return;
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
        moveWater(selectedTube, index);
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
    const destCap = getTubeCapacity(destIdx);

    if (src.length === 0) return false;
    if (dest.length >= destCap) return false;

    const liquidToMove = pourFromBottom ? src[0] : src[src.length - 1];
    const destTopLiquid = dest[dest.length - 1];

    if (dest.length === 0 || destTopLiquid === liquidToMove) {
      const spaceLeft = destCap - dest.length;
      return spaceLeft >= 1;
    }
    return false;
  };

  const moveWater = (srcIdx, destIdx) => {
    setHistory([...history, JSON.stringify(tubes)]);
    setPouringTubes({ src: srcIdx, dest: destIdx });
    setSelectedTube(null);
    sound.playWaterPour(); // <--- Water pouring sound

    setTimeout(() => {
      const nextTubes = tubes.map(t => [...t]);
      const destCap = getTubeCapacity(destIdx);
      const spaceLeft = destCap - nextTubes[destIdx].length;

      const sameColorCount = pourFromBottom ? getBottomColorGroupCount(nextTubes[srcIdx]) : getTopColorGroupCount(nextTubes[srcIdx]);
      const countToMove = Math.min(sameColorCount, spaceLeft);

      const liquidsToMove = [];
      for (let i = 0; i < countToMove; i++) {
        liquidsToMove.push(pourFromBottom ? nextTubes[srcIdx].shift() : nextTubes[srcIdx].pop());
      }
      for (let i = 0; i < countToMove; i++) {
        nextTubes[destIdx].push(liquidsToMove[i]);
      }

      const isDestCompleted = nextTubes[destIdx].length === destCap && nextTubes[destIdx].every(color => color === nextTubes[destIdx][0]);
      if (isDestCompleted) {
        sound.playTubeComplete();
        setCompletedTubeIndex(destIdx);
        setTimeout(() => setCompletedTubeIndex(null), 1000);
      }

      setTubes(nextTubes);
      setPouringTubes(null);
      setMoves(m => m + 1);
      checkWin(nextTubes);
    }, 400); // Wait for pouring animation
  };

  const addExtraTube = () => {
    if (victoryPhase !== 0 || extraTubesCount >= 1 || pouringTubes) return;
    setHistory([...history, JSON.stringify(tubes)]);
    setTubes([...tubes, []]);
    setExtraTubesCount(1);
    sound.playPowerup();
  };

  const getHint = () => {
    if (pouringTubes) return;
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

  const checkWin = (currentTubes) => {
    const isWon = currentTubes.every((tube, idx) => {
      if (tube.length === 0) return true;
      const cap = getTubeCapacity(idx);
      if (tube.length === cap) {
        return tube.every(l => l === tube[0]);
      }
      return false;
    });

    if (isWon && victoryPhase === 0) {
      if (isIntermission && onIntermissionComplete) {
        setTimeout(() => onIntermissionComplete(), 1000);
        return;
      }
      setVictoryPhase(-1);

      setTimeout(() => {
        setVictoryPhase(1);

        // Stage 1 -> Stage 2
        setTimeout(() => {
          setVictoryPhase(2);
          sound.playExplosion(); // Bubble burst/fireworks
        }, 2000);

        // Stage 2 -> Stage 3 (Final)
        setTimeout(() => {
          setVictoryPhase(3);
          sound.playScore();
          if (onScoreSave) {
            onScoreSave({
              game: 'watersort',
              score: Math.max(1000 - moves * 10, 100),
              date: new Date().toISOString(),
              moves: moves + 1,
              timeMs: Date.now() - startTime
            });
          }
        }, 4500);
      }, 1500);
    }
  };

  const undo = () => {
    if (history.length === 0 || pouringTubes) return;
    const prev = history[history.length - 1];
    const prevTubes = JSON.parse(prev);
    setTubes(prevTubes);
    if (prevTubes.length === 11) setExtraTubesCount(0);
    setHistory(history.slice(0, -1));
    setSelectedTube(null);
    setHintTubes(null);
    sound.playClick();
  };

  if (showCollection) {
    return (
      <WaterSortCollection
        onClose={() => {
          setShowCollection(false);
          initGame(); // Refresh game in case difficulty was changed
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('water', 'customizations', next);
            return next;
          });
          setShowCollection(false);
          if (category === 'difficulty') {
            initGame(id);
          }
        }}
      />
    );
  }

  const getBackground = () => {
    switch (customizations.theme) {
      case 'bg1': return '#1A1A1A'; // Sombre
      case 'bg2': return 'url("https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Nature
      case 'bg3': return 'url("https://images.unsplash.com/photo-1513569771920-c9e1d31714cb?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Zen Galets
      case 'bg4': return 'url("https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Rosée
      case 'bg5': return 'url("https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Kawaii Art
      case 'bg6': return 'url("https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Pastel
      case 'bg7': return 'url("https://images.unsplash.com/photo-1508739773402-3ce9cef36851?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Cosmos
      case 'bg8': return 'url("https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Forêt
      case 'bg9': return 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Aurore
      default: return '#1A1A1A'; // Fallback to Dark
    }
  };

  return (
    <>
      {showIntro && !isIntermission && <GameIntro
        gameName="TRI EAU"
        icon="💧"
        colors={['#33CCFF', '#FF3366', '#FFD700']}
        particleType="bubbles"
        onComplete={() => setShowIntro(false)}
      />}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: getBackground(),

          color: 'white',
          fontFamily: '"Nunito", "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Background Overlay to soften image */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }} />

        {/* Header */}
        {!isIntermission && (
          <GameHeader
            title="WATER SORT"
            onBack={() => {
              if (victoryPhase === 0 && history.length > 0) {
                if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) onBack();
              } else onBack();
            }}
            onRestart={() => {
              if (window.confirm("Recommencer ce niveau ?")) {
                initGame();
                setVictoryPhase(0);
                sound.playClick();
              }
            }}
            onUndo={undo}
            undoDisabled={history.length === 0}
            onHint={getHint}
            hintDisabled={false}
            onShop={() => setShowCollection(true)}
            showBgmToggle={false} // bgm is global
            extraControls={
              <button
                onClick={() => { setPourFromBottom(!pourFromBottom); sound.playClick(); }}
                style={{
                  background: pourFromBottom ? 'linear-gradient(45deg, #FF3366, #FF99CC)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: pourFromBottom ? '0 4px 10px rgba(255, 51, 102, 0.4)' : 'none',
                  transition: 'all 0.3s',
                }}
                title={pourFromBottom ? "Verser depuis le bas" : "Verser depuis le haut"}
              >
                {pourFromBottom ? 'Bas ↓' : 'Haut ↑'}
              </button>
            }
          />
        )}

        {isIntermission && victoryPhase === 0 && (
          <div className="entract-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: '8px', marginBottom: '10px' }}>
            <div className="entract-header-text">
              Entracte ! Triez l'eau pour retourner au jeu principal.
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

        {/* Main Game Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          zIndex: 5,
          gap: '60px' // increased gap for pouring clearance
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            padding: "1em",
            background: 'rgba(0, 0, 0, 0.8)',
            boxShadow: '0 0 10px 5px white',
            borderRadius: '5px',
          }}>
            {(() => {
              const baseTubesCount = tubes.length - extraTubesCount;
              const mid = Math.ceil(baseTubesCount / 2);
              return (
                <>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'nowrap', justifyContent: 'center' }}>
                    {tubes.slice(0, mid).map((tube, i) => (
                      <div key={i} style={{
                        animation: completedTubeIndex === i ? 'tubeCompletePulse 1s ease-out' : 'none',
                        transformOrigin: 'bottom center'
                      }}>
                        <LiquidTube
                          tube={tube}
                          idx={i}
                          capacity={getTubeCapacity(i)}
                          selected={selectedTube === i}
                          hint={hintTubes && (hintTubes[0] === i || hintTubes[1] === i)}
                          pouring={pouringTubes && pouringTubes.src === i}
                          receiving={pouringTubes && pouringTubes.dest === i}
                          colors={colors}
                          customization={customizations}
                          onClick={() => handleTubeClick(i)}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {tubes.slice(mid, baseTubesCount).map((tube, i) => {
                      const idx = i + mid;
                      return (
                        <div key={idx} style={{
                          animation: completedTubeIndex === idx ? 'tubeCompletePulse 1s ease-out' : 'none',
                          transformOrigin: 'bottom center'
                        }}>
                          <LiquidTube
                            tube={tube}
                            idx={idx}
                            capacity={getTubeCapacity(idx)}
                            selected={selectedTube === idx}
                            hint={hintTubes && (hintTubes[0] === idx || hintTubes[1] === idx)}
                            pouring={pouringTubes && pouringTubes.src === idx}
                            receiving={pouringTubes && pouringTubes.dest === idx}
                            colors={colors}
                            customization={customizations}
                            onClick={() => handleTubeClick(idx)}
                          />
                        </div>
                      );
                    })}

                    {extraTubesCount > 0 ? (
                      <div style={{
                        animation: completedTubeIndex === tubes.length - 1 ? 'tubeCompletePulse 1s ease-out' : 'none',
                        transformOrigin: 'bottom center'
                      }}>
                        <LiquidTube
                          tube={tubes[tubes.length - 1]}
                          idx={tubes.length - 1}
                          capacity={getTubeCapacity(tubes.length - 1)}
                          selected={selectedTube === tubes.length - 1}
                          hint={hintTubes && (hintTubes[0] === tubes.length - 1 || hintTubes[1] === tubes.length - 1)}
                          pouring={pouringTubes && pouringTubes.src === tubes.length - 1}
                          receiving={pouringTubes && pouringTubes.dest === tubes.length - 1}
                          colors={colors}
                          customization={customizations}
                          onClick={() => handleTubeClick(tubes.length - 1)}
                        />
                      </div>
                    ) : (
                      <div
                        onClick={addExtraTube}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '10px',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '24px',
                          marginBottom: '10px'
                        }}
                      >
                        +
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>



        </div>

        {/* Transition Phase */}
        {victoryPhase === -1 && <WinLossTransition type="win" />}

        {/* Victory Overlay Stages */}
        {victoryPhase > 0 && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.5s',
            overflow: 'hidden'
          }}>
            {/* Confetti & Fireworks Backgrounds */}
            {victoryPhase >= 2 && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'url("https://cdn.pixabay.com/photo/2017/12/26/16/06/confetti-3040854_1280.png") center/cover',
                opacity: 0.5,
                animation: 'slideDown 10s linear infinite'
              }} />
            )}

            {/* Stage 1: Initial WOW */}
            {victoryPhase === 1 && (
              <div style={{ animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <h2 style={{
                  fontSize: '4rem',
                  color: '#33CCFF',
                  textShadow: '0 0 20px rgba(51,204,255,0.8), 2px 2px 0px white',
                  margin: 0,
                  transform: 'rotate(5deg)'
                }}>EAU PURE !</h2>
                <div style={{ fontSize: '6rem', textAlign: 'center', animation: 'bounce 1s infinite' }}>💧</div>
              </div>
            )}

            {/* Stage 2: Stats & Fireworks */}
            {victoryPhase === 2 && (
              <div style={{
                animation: 'slideUpFade 0.6s ease-out',
                background: 'rgba(255,255,255,0.9)',
                padding: '40px',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                textAlign: 'center',
                zIndex: 10
              }}>
                <h3 style={{ fontSize: '2.5rem', color: '#FF3366', margin: '0 0 20px 0' }}>Analyse du flux...</h3>
                <div style={{ fontSize: '1.8rem', color: '#666', margin: '10px 0' }}>
                  Temps : <strong style={{ color: '#FF9933' }}>{Math.floor((Date.now() - startTime) / 1000)}s</strong>
                </div>
                <div style={{ fontSize: '1.8rem', color: '#666', margin: '10px 0', animation: 'popIn 0.5s 0.5s backwards' }}>
                  Transvasements : <strong style={{ color: '#33CCFF' }}>{moves}</strong>
                </div>
              </div>
            )}

            {/* Stage 3: Final Master Screen */}
            {victoryPhase === 3 && (
              <div style={{
                textAlign: 'center',
                animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: 10
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🌸</div>
                <h2 style={{
                  fontSize: '3.5rem',
                  background: 'linear-gradient(45deg, #33CCFF, #FF3366, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 30px 0',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>MAÎTRE ZEN</h2>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      if (isIntermission && onIntermissionComplete) onIntermissionComplete();
                      else if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') onIntermissionRequest();
                      else initGame();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #33FF77, #009933)',
                      border: '4px solid white',
                      color: 'white',
                      padding: '15px 40px',
                      borderRadius: '40px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px rgba(51,255,119,0.4)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isIntermission ? "Retour au Mahjong" : "Rejouer 🔄"}
                  </button>
                  {!isIntermission && (
                    <button
                      onClick={onBack}
                      style={{
                        background: 'rgba(0,0,0,0.1)',
                        border: 'none',
                        color: '#666',
                        padding: '15px 30px',
                        borderRadius: '40px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                    >
                      Quitter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { 0% { background-position: 0 -1000px; } 100% { background-position: 0 1000px; } }
        @keyframes slideUpFade { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes corkSlam {
          0% { transform: translateY(-100px) scale(1.5); opacity: 0; filter: drop-shadow(0 0 20px white); }
          60% { transform: translateY(0) scale(1.1); opacity: 1; filter: drop-shadow(0 0 10px white); }
          80% { transform: scaleY(0.5) scaleX(1.4) translateY(10px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes tubeCompletePulse {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05) translateY(-10px); filter: brightness(1.3) drop-shadow(0 0 20px rgba(57,255,20,0.8)); }
          100% { transform: scale(1); filter: brightness(1); }
        }
      `}} />
      </div>
    </>
  );
}

function LiquidTube({ tube, capacity, selected, hint, pouring, receiving, colors, customization, onClick }) {
  const isFull = tube.length === capacity;
  const isComplete = isFull && capacity >= 1 && tube.every(b => b === tube[0]);

  const unitHeight = 60;
  const tubeHeight = capacity * unitHeight + 20;

  // Render liquid as blocks
  // We combine contiguous colors to form larger blocks
  const liquidBlocks = [];
  if (tube.length > 0) {
    let currentColor = tube[0];
    let currentCount = 1;
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] === currentColor) {
        currentCount++;
      } else {
        liquidBlocks.push({ color: currentColor, count: currentCount });
        currentColor = tube[i];
        currentCount = 1;
      }
    }
    liquidBlocks.push({ color: currentColor, count: currentCount });
  }

  // Animation states
  let transform = 'translateY(0) rotate(0)';
  if (selected) transform = 'translateY(-20px)';
  if (pouring) transform = 'translate(30px, -40px) rotate(45deg)';

  const getTubeStyle = () => {
    const baseColor = selected ? '#00F0FF' : hint ? '#FF00CC' : isComplete && capacity > 1 ? '#39FF14' : 'rgba(255, 255, 255, 0.4)';
    const bgComplete = isComplete && capacity > 1 ? 'rgba(39, 255, 20, 0.2)' : 'rgba(255, 255, 255, 0.05)';
    switch (customization?.tube) {
      case 'wt1': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 15px 15px', background: bgComplete };
      case 'wt2': return { border: `1px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(255,255,255,0.02)' };
      case 'wt3': return { border: `3px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 20px 20px', background: bgComplete };
      case 'wt4': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 5px 5px', background: bgComplete, width: '60px' };
      case 'wt5': return { border: `3px double ${baseColor}`, borderTop: 'none', borderRadius: '0 0 20px 20px', background: bgComplete };
      case 'wt6': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 8px 8px', background: bgComplete, width: '60px' };
      case 'wt7': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 12px 12px', background: bgComplete };
      case 'wt8': return { borderLeft: `3px solid ${baseColor}`, borderRight: `3px solid ${baseColor}`, borderBottom: `4px solid ${baseColor}`, borderRadius: '0 0 3px 3px', background: bgComplete };
      case 'wt9': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 0 0', background: bgComplete };
      default: return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 15px 15px', background: bgComplete };
    }
  };

  const currentTubeStyle = getTubeStyle();

  return (
    <div
      onClick={onClick}
      style={{
        ...currentTubeStyle,
        position: 'relative',
        width: currentTubeStyle.width || '50px',
        height: `${tubeHeight}px`,
        display: 'flex',
        flexDirection: 'column-reverse',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 20px rgba(0, 240, 255, 0.5)'
          : hint ? '0 0 20px rgba(255, 0, 204, 0.5)'
            : isComplete && capacity > 1 ? '0 0 20px rgba(57, 255, 20, 0.5)'
              : 'inset 0 -5px 15px rgba(0,0,0,0.5)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform,
        overflow: 'hidden',
        zIndex: pouring ? 50 : selected ? 20 : 10
      }}
    >
      {/* Cork (Bouchon) when completed */}
      {isComplete && capacity > 1 && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '14px',
          background: 'linear-gradient(to right, #D2B48C, #8B4513, #D2B48C)',
          borderBottom: '2px solid rgba(0,0,0,0.3)',
          zIndex: 15,
          boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.5)',
          animation: 'corkSlam 0.6s cubic-bezier(0.25, 1.5, 0.5, 1) forwards',
          transformOrigin: 'bottom center'
        }} />
      )}
      {/* Glossy highlight */}
      <div style={{
        position: 'absolute',
        top: 0, left: '5px',
        width: '12px', height: '100%',
        background: 'linear-gradient(to right, rgba(255,255,255,0.5), transparent)',
        zIndex: 10,
        pointerEvents: 'none',
        borderRadius: currentTubeStyle.borderRadius
      }} />

      {/* Liquids */}
      <div style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        width: '100%',
        borderRadius: currentTubeStyle.borderRadius ? `0 0 calc(${currentTubeStyle.borderRadius.split(' ')[2]} - 2px) calc(${currentTubeStyle.borderRadius.split(' ')[2]} - 2px)` : '0 0 22px 22px',
        overflow: 'hidden'
      }}>
        {liquidBlocks.map((block, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: `${block.count * unitHeight}px`,
              background: colors[block.color].hex,
              boxShadow: `inset 0 0 10px rgba(0,0,0,0.3)`,
              position: 'relative',
              transition: 'height 0.3s ease'
            }}
          >
            {/* Add a little bubble texture */}
            <div style={{
              position: 'absolute',
              top: '20%', left: '30%',
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '30%', right: '20%',
              width: '4px', height: '4px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)'
            }} />
          </div>
        ))}
      </div>

      {/* Pouring stream visual hack */}
      {pouring && (
        <div style={{
          position: 'absolute',
          top: '-20px', left: '-15px',
          width: '10px', height: '60px',
          background: colors[tube[tube.length - 1]]?.hex || 'white',
          transform: 'rotate(-45deg)',
          zIndex: 60,
          borderRadius: '5px',
          boxShadow: '0 0 10px currentColor'
        }} />
      )}
    </div>
  );
}
