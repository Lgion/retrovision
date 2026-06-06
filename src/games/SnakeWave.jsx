import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/sound';

export default function SnakeWave({ onBack, onScoreSave }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_snake_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1);

  const stateRef = useRef({
    gameStarted: false,
    gameOver: false,
    score: 0,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    fruit: { x: 15, y: 10, isGold: false },
    gridSize: 20,
    tileCountX: 20,
    tileCountY: 20,
    speed: 130, // ms per tick
    lastTick: 0,
    particles: [],
    frame: 0
  });

  const resetGame = () => {
    const state = stateRef.current;
    state.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    state.direction = 'RIGHT';
    state.nextDirection = 'RIGHT';
    state.score = 0;
    state.speed = 130;
    state.gameOver = false;
    state.gameStarted = false;
    state.particles = [];
    spawnFruit(state);
    
    setScore(0);
    setSpeedLevel(1);
    setGameOver(false);
    setGameStarted(false);
  };

  const spawnFruit = (state) => {
    let newX, newY;
    let onSnake = true;
    while (onSnake) {
      newX = Math.floor(Math.random() * state.tileCountX);
      newY = Math.floor(Math.random() * state.tileCountY);
      onSnake = state.snake.some(segment => segment.x === newX && segment.y === newY);
    }
    const isGold = Math.random() < 0.15; // 15% chance of gold fruit
    state.fruit = { x: newX, y: newY, isGold };
  };

  const changeDirection = (dir) => {
    const state = stateRef.current;
    if (!state.gameStarted && !state.gameOver) {
      state.gameStarted = true;
      setGameStarted(true);
    }

    const current = state.direction;
    if (dir === 'UP' && current !== 'DOWN') state.nextDirection = 'UP';
    if (dir === 'DOWN' && current !== 'UP') state.nextDirection = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') state.nextDirection = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') state.nextDirection = 'RIGHT';
    sound.playClick();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') changeDirection('UP');
      if (e.code === 'ArrowDown' || e.code === 'KeyS') changeDirection('DOWN');
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') changeDirection('LEFT');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') changeDirection('RIGHT');
      
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const size = Math.min(parent.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
      state.gridSize = size / 20;
      state.tileCountX = 20;
      state.tileCountY = 20;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    resetGame();

    let animationFrameId;

    const loop = (timestamp) => {
      animationFrameId = requestAnimationFrame(loop);
      
      if (state.gameStarted && !state.gameOver) {
        const elapsed = timestamp - state.lastTick;
        if (elapsed > state.speed) {
          tick(state);
          state.lastTick = timestamp;
        }
      }
      
      draw(ctx, state);
    };

    // Initialize tick timer
    state.lastTick = performance.now();
    loop(state.lastTick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const tick = (state) => {
    state.direction = state.nextDirection;
    const head = { ...state.snake[0] };

    if (state.direction === 'UP') head.y -= 1;
    if (state.direction === 'DOWN') head.y += 1;
    if (state.direction === 'LEFT') head.x -= 1;
    if (state.direction === 'RIGHT') head.x += 1;

    // Boundary check
    if (head.x < 0 || head.x >= state.tileCountX || head.y < 0 || head.y >= state.tileCountY) {
      handleGameOver(state);
      return;
    }

    // Self-collision check
    if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver(state);
      return;
    }

    // Insert new head
    state.snake.unshift(head);

    // Fruit check
    if (head.x === state.fruit.x && head.y === state.fruit.y) {
      // Eat fruit
      const points = state.fruit.isGold ? 3 : 1;
      state.score += points;
      setScore(state.score);
      
      if (state.fruit.isGold) {
        sound.playPowerup();
        // Burst gold particles
        createExplosion(state.fruit.x, state.fruit.y, '#ffd700', state);
      } else {
        sound.playScore();
        // Burst cyan particles
        createExplosion(state.fruit.x, state.fruit.y, '#ff007f', state);
      }

      spawnFruit(state);

      // Increase speed slightly
      state.speed = Math.max(70, 130 - Math.floor(state.score / 3) * 6);
      setSpeedLevel(Math.floor((130 - state.speed) / 10) + 1);
    } else {
      // Remove tail if didn't eat
      state.snake.pop();
    }
  };

  const createExplosion = (gx, gy, color, state) => {
    const size = state.gridSize;
    const px = gx * size + size / 2;
    const py = gy * size + size / 2;
    for (let i = 0; i < 12; i++) {
      state.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: 2 + Math.random() * 3,
        color: color,
        alpha: 1,
        decay: 0.04
      });
    }
  };

  const handleGameOver = (state) => {
    state.gameOver = true;
    setGameOver(true);
    sound.playExplosion();

    // Explode entire snake
    state.snake.forEach(seg => {
      createExplosion(seg.x, seg.y, '#00f0ff', state);
    });

    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem('retrovision_snake_highscore', state.score.toString());
      if (onScoreSave) {
        onScoreSave('Snake Wave', state.score);
      }
    }
  };

  const draw = (ctx, state) => {
    const size = state.gridSize;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    state.frame++;

    // Clear board
    ctx.fillStyle = '#0a0813';
    ctx.fillRect(0, 0, w, h);

    // Draw Grid lines
    ctx.strokeStyle = '#15112a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= state.tileCountX; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, h);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(w, i * size);
      ctx.stroke();
    }

    // Draw Fruit
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = state.fruit.isGold ? '#ffd700' : '#ff007f';
    ctx.fillStyle = state.fruit.isGold ? '#ffd700' : '#ff007f';
    
    const fx = state.fruit.x * size + size / 2;
    const fy = state.fruit.y * size + size / 2;
    const radius = (size / 2 - 2) + Math.sin(state.frame * 0.15) * 1.5;

    ctx.beginPath();
    ctx.arc(fx, fy, Math.max(3, radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Snake
    state.snake.forEach((segment, idx) => {
      ctx.save();
      ctx.shadowBlur = idx === 0 ? 12 : 5;
      
      const isHead = idx === 0;
      ctx.shadowColor = isHead ? '#00f0ff' : '#9d00ff';
      ctx.fillStyle = isHead ? '#00f0ff' : '#9d00ff';

      const padding = 1.5;
      const x = segment.x * size + padding;
      const y = segment.y * size + padding;
      const segmentSize = size - padding * 2;

      // Draw rounded rect or circle
      ctx.beginPath();
      if (isHead) {
        // Head shape pointing to direction
        ctx.arc(x + segmentSize/2, y + segmentSize/2, segmentSize/2, 0, Math.PI * 2);
      } else {
        ctx.rect(x, y, segmentSize, segmentSize);
      }
      ctx.fill();
      ctx.restore();
    });

    // Update & draw particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    state.particles = state.particles.filter(p => p.alpha > 0);

    state.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Start instructions
    if (!state.gameStarted && !state.gameOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 8, 19, 0.7)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.font = 'bold 20px Orbitron';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillText('SNAKE WAVE', w / 2, h / 2 - 30);
      
      ctx.font = '13px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText('Appuyez sur un bouton directionnel', w / 2, h / 2 + 10);
      ctx.fillText('ou Z,Q,S,D / Flèches pour démarrer', w / 2, h / 2 + 30);
      ctx.restore();
    }
  };

  return (
    <div className="game-container neon-border" style={containerStyle}>
      <div style={headerStyle}>
        <button onClick={onBack} className="retro-btn" style={backBtnStyle}>
          &lt; Hub
        </button>
        <div style={titleStyle}>SNAKE WAVE</div>
        <div style={scoreBoardStyle}>
          Score: <span style={{ color: '#00f0ff' }}>{score}</span>
        </div>
      </div>

      <div style={topStatsStyle}>
        <div>Vitesse: Lvl {speedLevel}</div>
        <div>Max Score: {highScore}</div>
      </div>

      <div style={canvasWrapperStyle}>
        <canvas ref={canvasRef} style={canvasStyle} />

        {gameOver && (
          <div style={overlayStyle}>
            <div style={gameOverTitleStyle}>DÉSAINTÉGRATION</div>
            <div style={gameOverStatsStyle}>Score final: {score}</div>
            {score >= highScore && score > 0 && (
              <div style={newRecordStyle}>NOUVEAU RECORD !</div>
            )}
            <button onClick={resetGame} className="retro-btn pulse-glow" style={restartBtnStyle}>
              Recommencer
            </button>
          </div>
        )}
      </div>

      {/* D-Pad Controls for Mobile */}
      <div style={dpadContainerStyle}>
        <div style={dpadRowStyle}>
          <button 
            className="retro-btn dpad-btn" 
            style={dpadBtnStyle} 
            onTouchStart={() => changeDirection('UP')}
            onClick={() => changeDirection('UP')}
          >
            ▲
          </button>
        </div>
        <div style={dpadRowStyle}>
          <button 
            className="retro-btn dpad-btn" 
            style={dpadBtnStyle} 
            onTouchStart={() => changeDirection('LEFT')}
            onClick={() => changeDirection('LEFT')}
          >
            ◀
          </button>
          <div style={{ width: '45px' }} />
          <button 
            className="retro-btn dpad-btn" 
            style={dpadBtnStyle} 
            onTouchStart={() => changeDirection('RIGHT')}
            onClick={() => changeDirection('RIGHT')}
          >
            ▶
          </button>
        </div>
        <div style={dpadRowStyle}>
          <button 
            className="retro-btn dpad-btn" 
            style={dpadBtnStyle} 
            onTouchStart={() => changeDirection('DOWN')}
            onClick={() => changeDirection('DOWN')}
          >
            ▼
          </button>
        </div>
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
  marginBottom: '10px',
};

const backBtnStyle = {
  padding: '5px 10px',
  fontSize: '12px',
};

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '18px',
  color: '#00f0ff',
  textShadow: '0 0 8px #00f0ff',
  letterSpacing: '1px'
};

const scoreBoardStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '13px',
  color: '#ffffff',
};

const topStatsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#8e8a9f',
  marginBottom: '10px',
  fontFamily: 'Orbitron, sans-serif',
};

const canvasWrapperStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.05)',
};

const canvasStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  backgroundColor: '#0a0813',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(10, 8, 19, 0.88)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  animation: 'fadeIn 0.25s ease-out',
};

const gameOverTitleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '26px',
  color: '#ff007f',
  textShadow: '0 0 10px #ff007f',
  marginBottom: '10px',
  fontWeight: 'bold',
};

const gameOverStatsStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '16px',
  color: '#ffffff',
  marginBottom: '15px',
};

const newRecordStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '14px',
  color: '#ffd700',
  textShadow: '0 0 8px #ffd700',
  marginBottom: '20px',
  fontWeight: 'bold',
  animation: 'pulse 1s infinite alternate',
};

const restartBtnStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  border: '2px solid #00f0ff',
  background: 'transparent',
  color: '#00f0ff',
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
};

const dpadContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: '16px',
  gap: '5px',
  userSelect: 'none',
};

const dpadRowStyle = {
  display: 'flex',
  gap: '5px',
};

const dpadBtnStyle = {
  width: '45px',
  height: '45px',
  fontSize: '18px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 0,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#ffffff',
  cursor: 'pointer',
};
