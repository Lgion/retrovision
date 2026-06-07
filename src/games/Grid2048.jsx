import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';

export default function Grid2048({ onBack, onScoreSave }) {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_2048_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const touchStartRef = useRef(null);

  // Initialize board
  useEffect(() => {
    initGame();
  }, []);

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

  const handleBackWithConfirm = () => {
    const isGameInProgress = !gameOver && !victory && score > 0;
    if (isGameInProgress) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  const initGame = () => {
    const emptyBoard = Array(16).fill(null);
    let b = addRandomTile(addRandomTile(emptyBoard));
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setVictory(false);
    setKeepPlaying(false);
  };

  const addRandomTile = (currentBoard) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);

    if (emptyIndices.length === 0) return currentBoard;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const newBoard = [...currentBoard];
    // 90% chance of 2, 10% chance of 4
    newBoard[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const getTileColor = (val) => {
    switch (val) {
      case 2: return { bg: 'rgba(0, 240, 255, 0.1)', border: '#00f0ff', color: '#00f0ff', shadow: '0 0 10px rgba(0, 240, 255, 0.4)' };
      case 4: return { bg: 'rgba(0, 240, 255, 0.2)', border: '#00f0ff', color: '#ffffff', shadow: '0 0 15px rgba(0, 240, 255, 0.7)' };
      case 8: return { bg: 'rgba(255, 0, 127, 0.1)', border: '#ff007f', color: '#ff007f', shadow: '0 0 10px rgba(255, 0, 127, 0.4)' };
      case 16: return { bg: 'rgba(255, 0, 127, 0.25)', border: '#ff007f', color: '#ffffff', shadow: '0 0 15px rgba(255, 0, 127, 0.7)' };
      case 32: return { bg: 'rgba(157, 0, 255, 0.15)', border: '#9d00ff', color: '#9d00ff', shadow: '0 0 10px rgba(157, 0, 255, 0.4)' };
      case 64: return { bg: 'rgba(157, 0, 255, 0.3)', border: '#9d00ff', color: '#ffffff', shadow: '0 0 15px rgba(157, 0, 255, 0.7)' };
      case 128: return { bg: 'rgba(255, 140, 0, 0.15)', border: '#ff8c00', color: '#ff8c00', shadow: '0 0 12px rgba(255, 140, 0, 0.5)' };
      case 256: return { bg: 'rgba(255, 140, 0, 0.3)', border: '#ff8c00', color: '#ffffff', shadow: '0 0 18px rgba(255, 140, 0, 0.8)' };
      case 512: return { bg: 'rgba(0, 255, 127, 0.2)', border: '#00ff7f', color: '#00ff7f', shadow: '0 0 15px rgba(0, 255, 127, 0.5)' };
      case 1024: return { bg: 'rgba(255, 215, 0, 0.2)', border: '#ffd700', color: '#ffd700', shadow: '0 0 18px rgba(255, 215, 0, 0.6)' };
      case 2048: return { bg: 'rgba(255, 215, 0, 0.35)', border: '#ffd700', color: '#ffffff', shadow: '0 0 25px #ffd700, inset 0 0 10px #ffd700', pulse: true };
      default: return { bg: 'rgba(255, 215, 0, 0.45)', border: '#ffffff', color: '#ffffff', shadow: '0 0 35px #ffffff' };
    }
  };

  // Matrix utility methods
  const getRow = (b, rowIdx) => b.slice(rowIdx * 4, rowIdx * 4 + 4);
  const getCol = (b, colIdx) => [b[colIdx], b[colIdx + 4], b[colIdx + 8], b[colIdx + 12]];

  const setRow = (b, rowIdx, row) => {
    const nextB = [...b];
    for (let i = 0; i < 4; i++) nextB[rowIdx * 4 + i] = row[i];
    return nextB;
  };

  const setCol = (b, colIdx, col) => {
    const nextB = [...b];
    for (let i = 0; i < 4; i++) nextB[colIdx + i * 4] = col[i];
    return nextB;
  };

  const slideAndMerge = (line, isLeftOrUp, scoreAdder) => {
    // Compress non-null values
    let compressed = line.filter((val) => val !== null);
    
    // Fill the rest with null
    while (compressed.length < 4) compressed.push(null);

    let newLine = Array(4).fill(null);
    let scoreGained = 0;
    let mergedThisTurn = false;

    // Merge adjacent values
    let i = 0;
    let newIdx = 0;
    while (i < 4) {
      if (compressed[i] === null) {
        i++;
        continue;
      }
      if (i < 3 && compressed[i] === compressed[i + 1]) {
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
      for (let r = 0; r < 4; r++) {
        const originalRow = getRow(nextBoard, r);
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(originalRow, true);
        nextBoard = setRow(nextBoard, r, newLine);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalRow) !== JSON.stringify(newLine)) boardChanged = true;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const originalRow = getRow(nextBoard, r);
        const reversedRow = [...originalRow].reverse();
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(reversedRow, true);
        const finalRow = [...newLine].reverse();
        nextBoard = setRow(nextBoard, r, finalRow);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalRow) !== JSON.stringify(finalRow)) boardChanged = true;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const originalCol = getCol(nextBoard, c);
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(originalCol, true);
        nextBoard = setCol(nextBoard, c, newLine);
        totalScoreGained += scoreGained;
        if (mergedThisTurn) playMergeSound = true;
        if (JSON.stringify(originalCol) !== JSON.stringify(newLine)) boardChanged = true;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const originalCol = getCol(nextBoard, c);
        const reversedCol = [...originalCol].reverse();
        const { newLine, scoreGained, mergedThisTurn } = slideAndMerge(reversedCol, true);
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
        localStorage.setItem('retrovision_2048_highscore', newScore.toString());
        if (onScoreSave) {
          onScoreSave('Neon 2048', newScore);
        }
      }

      if (playMergeSound) {
        sound.playScore();
      } else {
        sound.playClick();
      }

      // Check if 2048 achieved
      if (!victory && !keepPlaying && finalBoard.includes(2048)) {
        setVictory(true);
        sound.playPowerup();
      }

      // Check game over
      checkGameOver(finalBoard);
    }
  };

  const checkGameOver = (b) => {
    // If board contains any empty spaces, not game over
    if (b.includes(null)) return;

    // Check if adjacent tiles have identical values
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = b[r * 4 + c];
        // Right neighbor
        if (c < 3 && val === b[r * 4 + c + 1]) return;
        // Bottom neighbor
        if (r < 3 && val === b[(r + 1) * 4 + c]) return;
      }
    }

    // No moves possible
    setGameOver(true);
    sound.playExplosion();
  };

  // Handle Keyboard Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        if (e.code === 'ArrowUp') move('up');
        if (e.code === 'ArrowDown') move('down');
        if (e.code === 'ArrowLeft') move('left');
        if (e.code === 'ArrowRight') move('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, score, gameOver, victory, keepPlaying]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    
    const threshold = 40; // minimum swipe distance in pixels
    
    if (Math.max(Math.abs(diffX), Math.abs(diffY)) > threshold) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
          move('right');
        } else {
          move('left');
        }
      } else {
        // Vertical swipe
        if (diffY > 0) {
          move('down');
        } else {
          move('up');
        }
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <div className="game-container neon-border" style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={handleBackWithConfirm} className="retro-btn" style={backBtnStyle}>
          &lt; Retour Hub
        </button>
        <div style={titleStyle}>NEON 2048</div>
        <button onClick={initGame} className="retro-btn" style={backBtnStyle}>
          Reset
        </button>
      </div>

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

      <div 
        style={gridContainerStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

        {victory && !keepPlaying && (
          <div style={overlayStyle}>
            <div style={victoryTitleStyle}>VICTOIRE !</div>
            <div style={descStyle}>Vous avez atteint la tuile 2048.</div>
            <div style={btnRowStyle}>
              <button 
                onClick={() => setKeepPlaying(true)} 
                className="retro-btn"
                style={{ ...overlayBtnStyle, borderColor: '#ff007f', color: '#ff007f' }}
              >
                Continuer
              </button>
              <button 
                onClick={initGame} 
                className="retro-btn pulse-glow"
                style={overlayBtnStyle}
              >
                Recommencer
              </button>
            </div>
          </div>
        )}

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

      <div style={footerHelpStyle}>
        Comment jouer: Utilisez les flèches du clavier ou glissez (swipe) avec votre doigt dans la grille pour fusionner les nombres identiques et former la tuile 2048.
      </div>
    </div>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(10, 8, 19, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '16px',
  boxSizing: 'border-box',
  margin: '0 auto',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const backBtnStyle = {
  padding: '6px 12px',
  fontSize: '13px',
};

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '20px',
  color: '#00f0ff',
  textShadow: '0 0 8px #00f0ff',
  letterSpacing: '1px'
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
  gridTemplateColumns: 'repeat(4, 1fr)',
  gridTemplateRows: 'repeat(4, 1fr)',
  gap: '10px',
  width: '100%',
  paddingBottom: '100%', // Perfect square trick
  height: 0,
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '8px',
  boxSizing: 'border-box',
  overflow: 'hidden',
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
