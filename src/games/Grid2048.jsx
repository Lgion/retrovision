import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/sound';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Grid2048Collection from './Grid2048Collection';
import { getGameConfig, updateGameConfig } from '../utils/config';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { isRandomThemeEnabled, setRandomThemeEnabled, pickRandomTheme } from '../utils/themeManager';
import { useRandomTheme } from '../hooks/useRandomTheme';
import { storage } from '../utils/storage';
import { randomChoice } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';

const addRandomTile = (currentBoard) => {
  const emptyIndices = currentBoard
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null);

  if (emptyIndices.length === 0) return currentBoard;

  const randomIndex = randomChoice(emptyIndices);
  const newBoard = [...currentBoard];
  // 90% chance of 2, 10% chance of 4
  newBoard[randomIndex] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

export default function Grid2048({
  onBack,
  onScoreSave,
  onLaunchIntermission,
  isIntermission,
  intermissionDifficulty,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionConfig,
  intermissionGames
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(true);
  const [customizations, setCustomizations] = useState(() => getGameConfig('2048', 'customizations', { difficulty: 'moyen', theme: 'midnight' }));

  const getGridSize = () => {
    let diff = customizations.difficulty || 'moyen';
    if (isIntermission) {
      diff = intermissionDifficulty || 'facile';
    }
    if (diff === 'facile') return 5;
    if (diff === 'moyen') return 4;
    if (diff === 'difficile') return 3;
    return 4;
  };

  const getIntermissionTarget = () => {
    if (intermissionConfig?.['2048']?.target) {
      return Number(intermissionConfig['2048'].target);
    }
    const diff = intermissionDifficulty || 'facile';
    if (diff === 'difficile') return 1024;
    if (diff === 'moyen') return 512;
    return 256;
  };

  const gridSize = getGridSize();
  const totalCells = gridSize * gridSize;

  const [board, setBoard] = useState(() => {
    const emptyBoard = Array(totalCells).fill(null);
    return addRandomTile(addRandomTile(emptyBoard));
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return storage.getNumber('retrovision_2048_highscore', 0);
  });
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const touchStartRef = useRef(null);
  const containerRef = useRef(null);
  const boardWrapperRef = useRef(null);
  const [showCollection, setShowCollection] = useState(false);

  // Désactiver le pull-to-refresh et l'overscroll natif du navigateur mobile pendant la partie
  useEffect(() => {
    const originalOverscroll = document.body.style.overscrollBehavior;
    const originalOverscrollY = document.body.style.overscrollBehaviorY;

    document.body.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehaviorY = 'none';

    return () => {
      document.body.style.overscrollBehavior = originalOverscroll;
      document.body.style.overscrollBehaviorY = originalOverscrollY;
    };
  }, []);

  const randomThemeActive = useRandomTheme('2048');

  const handleChangeTheme = () => {
    const nextTheme = pickRandomTheme('2048', customizations.theme);
    setCustomizations(prev => {
      const next = { ...prev, theme: nextTheme };
      updateGameConfig('2048', 'customizations', next);
      return next;
    });
    sound.playPowerup?.();
  };

  // Ask permission to leave if game is in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isGameInProgress = !gameOver && !victory && score > 0;
      if (isGameInProgress) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter la partie en cours ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameOver, victory, score]);

  const handleBackWithConfirm = async () => {
    const isGameInProgress = !gameOver && !victory && score > 0;
    if (isGameInProgress) {
      const ok = await confirm({
        title: "Quitter 2048 Zen ?",
        message: "Voulez-vous vraiment quitter la partie en cours ?",
        confirmText: "Oui, quitter",
        cancelText: "Continuer à jouer",
        confirmVariant: "danger"
      });
      if (ok) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const initGame = useCallback(() => {
    const emptyBoard = Array(totalCells).fill(null);
    let b = addRandomTile(addRandomTile(emptyBoard));
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setVictory(false);
    setKeepPlaying(false);
  }, [totalCells]);

  const getTileColor = (val) => {
    switch (val) {
      case 2: return { bg: '#e0f2fe', border: '#7dd3fc', color: '#0369a1', shadow: '0 2px 6px rgba(0,0,0,0.12)' };
      case 4: return { bg: '#bae6fd', border: '#38bdf8', color: '#0284c7', shadow: '0 2px 6px rgba(0,0,0,0.14)' };
      case 8: return { bg: '#fed7aa', border: '#fb923c', color: '#9a3412', shadow: '0 2px 6px rgba(0,0,0,0.15)' };
      case 16: return { bg: '#fdba74', border: '#f97316', color: '#7c2d12', shadow: '0 3px 8px rgba(0,0,0,0.16)' };
      case 32: return { bg: '#fbcfe8', border: '#f472b6', color: '#831843', shadow: '0 3px 8px rgba(0,0,0,0.16)' };
      case 64: return { bg: '#f472b6', border: '#db2777', color: '#ffffff', shadow: '0 4px 10px rgba(0,0,0,0.18)' };
      case 128: return { bg: '#fef08a', border: '#eab308', color: '#713f12', shadow: '0 4px 10px rgba(0,0,0,0.2)' };
      case 256: return { bg: '#fde047', border: '#ca8a04', color: '#422006', shadow: '0 4px 12px rgba(0,0,0,0.22)' };
      case 512: return { bg: '#86efac', border: '#22c55e', color: '#14532d', shadow: '0 4px 12px rgba(0,0,0,0.24)' };
      case 1024: return { bg: '#4ade80', border: '#16a34a', color: '#ffffff', shadow: '0 5px 14px rgba(0,0,0,0.25)' };
      case 2048: return { bg: '#fbbf24', border: '#d97706', color: '#ffffff', shadow: '0 6px 16px rgba(0,0,0,0.28)' };
      default: return { bg: '#f59e0b', border: '#b45309', color: '#ffffff', shadow: '0 6px 18px rgba(0,0,0,0.3)' };
    }
  };

  // Matrix utility methods
  const getRow = (b, rowIdx) => b.slice(rowIdx * gridSize, rowIdx * gridSize + gridSize);
  const getCol = (b, colIdx) => {
    const col = [];
    for(let i=0; i<gridSize; i++) col.push(b[colIdx + i*gridSize]);
    return col;
  };

  const setRow = (b, rowIdx, row) => {
    const nextB = [...b];
    for (let i = 0; i < gridSize; i++) nextB[rowIdx * gridSize + i] = row[i];
    return nextB;
  };

  const setCol = (b, colIdx, col) => {
    const nextB = [...b];
    for (let i = 0; i < gridSize; i++) nextB[colIdx + i * gridSize] = col[i];
    return nextB;
  };

  const slideAndMerge = (line) => {
    // Compress non-null values
    let compressed = line.filter((val) => val !== null);
    
    // Fill the rest with null
    while (compressed.length < gridSize) compressed.push(null);

    let newLine = Array(gridSize).fill(null);
    let scoreGained = 0;
    let mergedThisTurn = false;

    // Merge adjacent values
    let i = 0;
    let newIdx = 0;
    while (i < gridSize) {
      if (compressed[i] === null) {
        i++;
        continue;
      }
      if (i < gridSize - 1 && compressed[i] === compressed[i + 1]) {
        const mergedVal = compressed[i] * 2;
        newLine[newIdx] = mergedVal;
        scoreGained += mergedVal;
        i += 2;
        mergedThisTurn = true;
      } else {
        newLine[newIdx] = compressed[i];
        i++;
      }
      newIdx++;
    }

    return { newLine, scoreGained, mergedThisTurn };
  };

  const move = (direction) => {
    if (gameOver) return;

    let nextBoard = [...board];
    let totalScoreGained = 0;
    let boardChanged = false;
    let playMergeSound = false;

    // Directives
    // left: row-by-row, slide left
    // right: row-by-row, slide right (reverse, slide, reverse)
    // up: col-by-col, slide up
    // down: col-by-col, slide down (reverse, slide, reverse)

    if (direction === 'left') {
      for (let r = 0; r < gridSize; r++) {
        const originalRow = getRow(nextBoard, r);
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(originalRow);
        nextBoard = setRow(nextBoard, r, newLine);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalRow) !== JSON.stringify(newLine)) boardChanged = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < gridSize; r++) {
        const originalRow = getRow(nextBoard, r);
        const reversedRow = [...originalRow].reverse();
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(reversedRow);
        const finalRow = [...newLine].reverse();
        nextBoard = setRow(nextBoard, r, finalRow);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalRow) !== JSON.stringify(finalRow)) boardChanged = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < gridSize; c++) {
        const originalCol = getCol(nextBoard, c);
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(originalCol);
        nextBoard = setCol(nextBoard, c, newLine);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalCol) !== JSON.stringify(newLine)) boardChanged = true;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < gridSize; c++) {
        const originalCol = getCol(nextBoard, c);
        const reversedCol = [...originalCol].reverse();
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(reversedCol);
        const finalCol = [...newLine].reverse();
        nextBoard = setCol(nextBoard, c, finalCol);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalCol) !== JSON.stringify(finalCol)) boardChanged = true;
      }
    }

    if (boardChanged) {
      const finalBoard = addRandomTile(nextBoard);
      setBoard(finalBoard);
      
      const newScore = score + totalScoreGained;
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        storage.setItem('retrovision_2048_highscore', newScore.toString());
        if (onScoreSave) {
          onScoreSave('Neon 2048', newScore);
        }
      }

      if (playMergeSound) {
        sound.playScore();
      } else {
        sound.playClick();
      }

      // Check if target achieved (calibrated: facile 32, moyen 64, difficile 128 in intermission; 2048 in normal)
      const currentTarget = isIntermission ? getIntermissionTarget() : 2048;
      if (!victory && !keepPlaying && finalBoard.some((v) => v >= currentTarget)) {
        setVictory(true);
        if (isIntermission && replaySameIntermission) {
          if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
          setTimeout(() => initGame(), 1000);
          return;
        }
      }

      // Check game over
      checkGameOver(finalBoard);
    }
  };

  const checkGameOver = (b) => {
    // If board contains any empty spaces, not game over
    if (b.includes(null)) return;

    // Check if adjacent tiles have identical values
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const val = b[r * gridSize + c];
        // Right neighbor
        if (c < gridSize - 1 && val === b[r * gridSize + c + 1]) return;
        // Bottom neighbor
        if (r < gridSize - 1 && val === b[(r + 1) * gridSize + c]) return;
      }
    }

    // No moves possible
    setGameOver(true);
    sound.playExplosion();
  };

  const moveRef = useRef(move);
  useEffect(() => {
    moveRef.current = move;
  });

  // Handle Keyboard Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        if (e.code === 'ArrowUp') moveRef.current?.('up');
        if (e.code === 'ArrowDown') moveRef.current?.('down');
        if (e.code === 'ArrowLeft') moveRef.current?.('left');
        if (e.code === 'ArrowRight') moveRef.current?.('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch Swipe Handlers for Mobile (Anti-Pull-To-Refresh)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (!touch) {
      touchStartRef.current = null;
      return;
    }

    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    
    const threshold = 32; // seuil de balayage optimisé pour mobile
    
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) > threshold) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Balayage horizontal
        if (diffX > 0) {
          move('right');
        } else {
          move('left');
        }
      } else {
        // Balayage vertical
        if (diffY > 0) {
          move('down');
        } else {
          move('up');
        }
      }
    }
    
    touchStartRef.current = null;
  };

  // Empêche le pull-to-refresh et les gestes de navigation natifs lors du glissement tactile
  useEffect(() => {
    const boardEl = boardWrapperRef.current;
    const containerEl = containerRef.current;

    const handlePreventScroll = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    if (boardEl) {
      boardEl.addEventListener('touchmove', handlePreventScroll, { passive: false });
    }
    if (containerEl) {
      containerEl.addEventListener('touchmove', handlePreventScroll, { passive: false });
    }

    return () => {
      if (boardEl) boardEl.removeEventListener('touchmove', handlePreventScroll);
      if (containerEl) containerEl.removeEventListener('touchmove', handlePreventScroll);
    };
  }, []);

  if (showCollection) {
    return (
      <Grid2048Collection
        onClose={() => {
          setShowCollection(false);
          initGame(); // Re-init game with new settings if they changed grid size
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('2048', 'customizations', next);
            return next;
          });
          setShowCollection(false);
        }}
      />
    );
  }

  const getThemeStyles = () => {
    switch(customizations.theme) {
      case 'dark': return { bg: '#0f172a', tileBg: 'rgba(255,255,255,0.06)', color: '#f8fafc' };
      case 'light': return { bg: '#f8fafc', tileBg: 'rgba(0,0,0,0.05)', color: '#0f172a' };
      case 'midnight':
      default: return { bg: '#0b1329', tileBg: 'rgba(255, 255, 255, 0.04)', color: '#38bdf8' };
    }
  };
  const theme = getThemeStyles();

  return (
    <>
      {showIntro && !isIntermission && <GameIntro 
        gameName="2048 ZEN" 
        icon="🔢" 
        colors={['#0284c7', '#0d9488', '#f59e0b']} 
        particleType="blocks" 
        onComplete={(isRandomTheme) => {
          setShowIntro(false);
          const isRand = isRandomTheme || isRandomThemeEnabled('2048');
          setRandomThemeEnabled('2048', isRand);
          if (isRand) {
            const nextTheme = pickRandomTheme('2048', customizations.theme);
            setCustomizations(prev => {
              const next = { ...prev, theme: nextTheme };
              updateGameConfig('2048', 'customizations', next);
              return next;
            });
          }
        }} 
      />}
      <div 
        ref={containerRef}
        className="game-container zen-2048-container" 
        style={{...containerStyle, background: theme.bg}}
      >
        <style>{`
          .zen-2048-container {
            touch-action: none;
            overscroll-behavior: none;
            overscroll-behavior-y: none;
            -webkit-user-select: none;
            user-select: none;
          }
          .zen-2048-board-area {
            touch-action: none;
            overscroll-behavior: none;
            overscroll-behavior-y: none;
            -webkit-user-select: none;
            user-select: none;
          }
          .zen-2048-container button {
            touch-action: manipulation;
          }
        `}</style>
      {!isIntermission && (
        <GameHeader
          key={randomThemeActive ? 'rand' : 'fixed'}
          title="2048 ZEN"
          gameId="2048"
          onBack={handleBackWithConfirm}
          onRestart={initGame}
          showBgmToggle={false} // BGM global
          onShop={() => setShowCollection(true)}
          onChangeTheme={handleChangeTheme}
          onLaunchIntermission={onLaunchIntermission}
          centerContent={
            <div style={statsContainerStyle}>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>SCORE</div>
                <div style={statValStyle}>{score}</div>
              </div>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>RECORD</div>
                <div style={statValStyle}>{highScore}</div>
              </div>
            </div>
          }
        />
      )}

      {isIntermission && !victory && (() => {
        const target = getIntermissionTarget();
        const maxVal = board ? Math.max(...board.map(v => v || 0)) : 0;
        const g2048Progress = Math.min(1, maxVal / target);
        return (
          <IntermissionHeader
            instructionText={`Fusionnez les tuiles pour atteindre ${target} !`}
            onRestart={initGame}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={g2048Progress}
          />
        );
      })()}

      <div 
        ref={boardWrapperRef}
        className="neon-2048-board-area"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          flexGrow: 1, 
          margin: 'auto 0',
          touchAction: 'none',
          overscrollBehavior: 'none',
          userSelect: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div 
          style={{
            ...gridContainerStyle, 
            maxWidth: 'min(380px, 48vh)',
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`, 
            gridTemplateRows: `repeat(${gridSize}, 1fr)`, 
            background: theme.tileBg,
            touchAction: 'none',
            overscrollBehavior: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          {board.map((tileValue, index) => {
            const styles = tileValue ? getTileColor(tileValue) : null;
            return (
              <div 
                key={index} 
                style={{
                  ...tileStyle,
                  backgroundColor: styles ? styles.bg : 'rgba(255, 255, 255, 0.03)',
                  border: styles ? `2px solid ${styles.border}` : '1px solid rgba(255, 255, 255, 0.05)',
                  color: styles ? styles.color : '#ffffff',
                  boxShadow: styles ? styles.shadow : 'none',
                  animation: styles && styles.pulse ? 'pulse 1.5s infinite alternate' : 'none',
                  transform: tileValue ? 'scale(1)' : 'scale(0.96)',
                }}
                className={tileValue ? 'tile-appear' : ''}
              >
                {tileValue}
              </div>
            );
          })}

          {/* Unified Victory Overlay */}
          <GameVictoryOverlay
            isOpen={victory && !keepPlaying}
            gameKey="2048"
            score={score}
            title="VICTOIRE !"
            badgeIcon="🏆"
            subtitle={isIntermission ? `Objectif atteint ! Tuile ${getIntermissionTarget()} fusionnée !` : "Vous avez atteint la mythique tuile 2048 !"}
            stats={[
              { label: 'Score', value: score, color: '#38bdf8' },
              { label: 'Meilleur', value: highScore, color: '#f59e0b' }
            ]}
            onRestart={initGame}
            restartText="🔄 Rejouer"
            onContinue={() => setKeepPlaying(true)}
            continueText="Poursuivre en Infini ♾️"
            onBack={onBack}
            backText="← Retour au Hub"
            isIntermission={isIntermission}
            onIntermissionComplete={onIntermissionComplete}
            onIntermissionRequest={onIntermissionRequest}
            upcomingIntermission={upcomingIntermission}
            onSelectUpcomingIntermission={onSelectUpcomingIntermission}
            onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
            intermissionConfig={intermissionConfig}
            intermissionGames={intermissionGames}
          />

          {gameOver && (
            <div style={overlayStyle}>
              <div style={gameOverTitleStyle}>BLOCAGE TOTAL</div>
              <div style={descStyle}>Plus aucun mouvement possible !</div>
              <div style={statsReportStyle}>
                Score final : <span style={{ color: '#ff007f', fontWeight: 'bold' }}>{score}</span>
              </div>
              <button 
                onClick={initGame} 
                className="retro-btn pulse-glow"
                style={overlayBtnStyle}
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={footerHelpStyle}>
        Comment jouer: Utilisez les flèches du clavier ou glissez (swipe) avec votre doigt dans la grille pour fusionner les nombres identiques et former la tuile 2048.
      </div>
    </div>

    <style>{`
      @media (max-width: 600px) {
        .zen-2048-container {
          border-radius: 0 !important;
          border: none !important;
          padding: 12px 10px !important;
          min-height: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
        }
      }
    `}</style>
    </>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '430px',
  minHeight: '100%',
  flex: 1,
  background: 'rgba(10, 8, 19, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '16px',
  boxSizing: 'border-box',
  margin: '0 auto',
  justifyContent: 'space-between',
  touchAction: 'none',
  overscrollBehavior: 'none',
  overscrollBehaviorY: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none'
};

const statsContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
};

const statBoxStyle = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  padding: '8px',
  textAlign: 'center',
};

const statLabelStyle = {
  fontSize: '11px',
  color: '#8e8a9f',
  fontFamily: 'Orbitron, sans-serif',
  marginBottom: '4px',
};

const statValStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  fontFamily: 'Orbitron, sans-serif',
};

const gridContainerStyle = {
  position: 'relative',
  display: 'grid',
  gap: '10px',
  width: '100%',
  paddingBottom: '0',
  height: 'auto',
  aspectRatio: '1 / 1',
  borderRadius: '8px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  touchAction: 'none',
  overscrollBehavior: 'none',
  overscrollBehaviorY: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none'
};

const tileStyle = {
  position: 'absolute',
  width: 'calc(25% - 7.5px)',
  height: 'calc(25% - 7.5px)',
  // We compute positions based on index
  // Col = index % 4, Row = Math.floor(index / 4)
  // These top/left values will be set inline by grid structure
  // Let's compute them programmatically instead of using top/left:
  // To avoid complex layout calculations in inline-styles, we can just use simple CSS grid!
  // Oh, wait! In gridContainerStyle, gridTemplateColumns and gridTemplateRows are repeat(4, 1fr).
  // So tiles can just be normal grid children and we don't need top/left if they are always in order!
  // Ah, the 16 elements are in order of board array index (0-15).
  // So they naturally fill the grid rows/cols! That is much simpler and cleaner.
  // Let's remove the absolute positioning stuff.
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '6px',
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '22px',
  fontWeight: 'bold',
  transition: 'all 0.12s ease-in-out',
  userSelect: 'none',
};

// Adjust gridContainerStyle to support actual CSS grid layout:
gridContainerStyle.height = 'auto';
gridContainerStyle.paddingBottom = '0';
gridContainerStyle.aspectRatio = '1 / 1';

// Override tileStyle positions:
tileStyle.position = 'static';
tileStyle.width = '100%';
tileStyle.height = '100%';

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 8, 19, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  padding: '20px',
  textAlign: 'center',
};

const victoryTitleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '32px',
  color: '#ffd700',
  textShadow: '0 0 15px #ffd700',
  fontWeight: 'bold',
  marginBottom: '10px',
  animation: 'pulse 1s infinite alternate',
};

const gameOverTitleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '28px',
  color: '#ff007f',
  textShadow: '0 0 12px #ff007f',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const descStyle = {
  color: '#ffffff',
  fontSize: '14px',
  marginBottom: '20px',
};

const statsReportStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '18px',
  color: '#ffffff',
  marginBottom: '20px',
};

const btnRowStyle = {
  display: 'flex',
  gap: '12px',
};

const overlayBtnStyle = {
  padding: '10px 20px',
  fontSize: '15px',
  border: '2px solid #00f0ff',
  background: 'transparent',
  color: '#00f0ff',
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
};

const footerHelpStyle = {
  marginTop: '16px',
  fontSize: '11px',
  color: '#8e8a9f',
  textAlign: 'center',
  lineHeight: '1.4',
};
