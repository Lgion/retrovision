import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/sound';
import GameIntro from '../components/GameIntro';

export default function FlappyNeon({ onBack, onScoreSave }) {
  const [showIntro, setShowIntro] = useState(true);
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_flappy_highscore') || '0', 10);
  });
  const [gameStarted, setGameStarted] = useState(false);

  // Use refs to share values with the animation loop without re-triggering effects
  const stateRef = useRef({
    gameStarted: false,
    gameOver: false,
    score: 0,
    bird: {
      y: 200,
      vy: 0,
      radius: 12,
      gravity: 0.35,
      jump: -6.5,
      angle: 0
    },
    pipes: [],
    particles: [],
    stars: [],
    frame: 0,
    lastPipeFrame: 0,
    width: 600,
    height: 400
  });

  // Handle keys and touch/clicks to jump
  const handleAction = (e) => {
    if (e) e.preventDefault();
    const state = stateRef.current;

    if (state.gameOver) {
      resetGame();
      return;
    }

    if (!state.gameStarted) {
      state.gameStarted = true;
      setGameStarted(true);
    }

    // Jump!
    state.bird.vy = state.bird.jump;
    sound.playLaser();
    
    // Add jump particles
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x: 100,
        y: state.bird.y,
        vx: -2 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 4,
        size: 2 + Math.random() * 4,
        color: '#00f0ff',
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02
      });
    }
  };

  const resetGame = () => {
    const state = stateRef.current;
    state.bird.y = 200;
    state.bird.vy = 0;
    state.bird.angle = 0;
    state.pipes = [];
    state.particles = [];
    state.score = 0;
    state.frame = 0;
    state.lastPipeFrame = 0;
    state.gameOver = false;
    state.gameStarted = false;
    
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize stars and resize logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = Math.min(parent.clientWidth, 600);
      const h = 400; // Fixed relative height for simplicity
      canvas.width = w;
      canvas.height = h;
      state.width = w;
      state.height = h;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars for background
    state.stars = [];
    for (let i = 0; i < 40; i++) {
      state.stars.push({
        x: Math.random() * 600,
        y: Math.random() * 400,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.1 + Math.random() * 0.3
      });
    }

    let animationFrameId;

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);
      updateAndDraw(ctx, state);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const updateAndDraw = (ctx, state) => {
    const w = state.width;
    const h = state.height;

    // Clear background
    ctx.fillStyle = '#0a0813';
    ctx.fillRect(0, 0, w, h);

    // Draw grid background (synthwave horizon)
    ctx.strokeStyle = '#181432';
    ctx.lineWidth = 1;
    // Horizontal lines
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Vertical grid lines scrolling
    const scrollOffset = (state.frame * 0.5) % 40;
    for (let x = -scrollOffset; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    state.stars.forEach(star => {
      ctx.fillRect(star.x, star.y, star.size, star.size);
      if (state.gameStarted && !state.gameOver) {
        star.x -= star.speed;
        if (star.x < 0) star.x = w;
      }
    });

    state.frame++;

    if (state.gameStarted && !state.gameOver) {
      // Bird Physics
      state.bird.vy += state.bird.gravity;
      state.bird.y += state.bird.vy;
      state.bird.angle = Math.min(Math.PI / 6, Math.max(-Math.PI / 8, state.bird.vy * 0.08));

      // Ceiling and floor collision
      if (state.bird.y - state.bird.radius < 0) {
        state.bird.y = state.bird.radius;
        state.bird.vy = 0;
      }
      if (state.bird.y + state.bird.radius > h - 10) {
        handleGameOver();
      }

      // Add jetpack-like trail particles
      if (state.frame % 2 === 0) {
        state.particles.push({
          x: 100 - 10,
          y: state.bird.y + (Math.random() - 0.5) * 6,
          vx: -2 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 1.5,
          size: 2 + Math.random() * 3,
          color: '#ff007f',
          alpha: 0.9,
          decay: 0.04
        });
      }

      // Spawn pipes
      if (state.frame - state.lastPipeFrame > 100) {
        const gap = 110;
        const minHeight = 40;
        const maxHeight = h - gap - minHeight - 20;
        const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
        state.pipes.push({
          x: w,
          topHeight: topHeight,
          bottomY: topHeight + gap,
          width: 55,
          passed: false
        });
        state.lastPipeFrame = state.frame;
      }

      // Update Pipes
      state.pipes.forEach(pipe => {
        pipe.x -= 2.2;

        // Collision check
        const bx = 100;
        const by = state.bird.y;
        const br = state.bird.radius;

        // Check top pipe collision
        if (bx + br > pipe.x && bx - br < pipe.x + pipe.width) {
          if (by - br < pipe.topHeight || by + br > pipe.bottomY) {
            handleGameOver();
          }
        }

        // Pass check
        if (!pipe.passed && pipe.x + pipe.width < bx) {
          pipe.passed = true;
          state.score++;
          setScore(state.score);
          sound.playScore();
        }
      });

      // Filter offscreen pipes
      state.pipes = state.pipes.filter(pipe => pipe.x + pipe.width > 0);
    }

    // Update particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    state.particles = state.particles.filter(p => p.alpha > 0);

    // Draw Particles
    state.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Pipes
    state.pipes.forEach(pipe => {
      ctx.save();
      
      // Glow settings
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff007f';

      // Top pipe
      const gradTop = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      gradTop.addColorStop(0, '#ff007f');
      gradTop.addColorStop(0.5, '#ff80bf');
      gradTop.addColorStop(1, '#ff007f');
      ctx.fillStyle = gradTop;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      // Top pipe rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x - 2, pipe.topHeight - 12, pipe.width + 4, 12);
      ctx.fillRect(pipe.x - 2, pipe.topHeight - 12, pipe.width + 4, 12);

      // Bottom pipe
      const gradBottom = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipe.width, h);
      gradBottom.addColorStop(0, '#ff007f');
      gradBottom.addColorStop(0.5, '#ff80bf');
      gradBottom.addColorStop(1, '#ff007f');
      ctx.fillStyle = gradBottom;
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, h - pipe.bottomY);

      // Bottom pipe rim
      ctx.strokeRect(pipe.x - 2, pipe.bottomY, pipe.width + 4, 12);
      ctx.fillRect(pipe.x - 2, pipe.bottomY, pipe.width + 4, 12);

      ctx.restore();
    });

    // Draw Floor
    ctx.fillStyle = '#0d0b1d';
    ctx.fillRect(0, h - 10, w, 10);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - 10);
    ctx.lineTo(w, h - 10);
    ctx.stroke();

    // Draw Bird
    ctx.save();
    ctx.translate(100, state.bird.y);
    ctx.rotate(state.bird.angle);
    
    // Add bird neon glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';

    // Ship shape (triangle facing right)
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(state.bird.radius * 1.5, 0);
    ctx.lineTo(-state.bird.radius, -state.bird.radius);
    ctx.lineTo(-state.bird.radius * 0.5, 0);
    ctx.lineTo(-state.bird.radius, state.bird.radius);
    ctx.closePath();
    ctx.fill();

    // Thruster fire core
    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-state.bird.radius * 0.8, -3);
    ctx.lineTo(-state.bird.radius - 8 - Math.random() * 8, 0);
    ctx.lineTo(-state.bird.radius * 0.8, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Show Start Helper inside canvas if not started
    if (!state.gameStarted && !state.gameOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 8, 19, 0.6)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.font = 'bold 22px Orbitron';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillText('FLAPPY NEON', w / 2, h / 2 - 40);
      
      ctx.font = '14px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText('Cliquez ou Espace pour voler', w / 2, h / 2 + 10);
      ctx.fillText('Évitez les portails magnétiques roses', w / 2, h / 2 + 35);
      ctx.restore();
    }
  };

  const handleGameOver = () => {
    const state = stateRef.current;
    state.gameOver = true;
    setGameOver(true);
    sound.playExplosion();

    // Trigger full screen particles
    for (let i = 0; i < 30; i++) {
      state.particles.push({
        x: 100,
        y: state.bird.y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: 3 + Math.random() * 6,
        color: i % 2 === 0 ? '#ff007f' : '#00f0ff',
        alpha: 1,
        decay: 0.02
      });
    }

    // Save score if it's highscore
    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem('retrovision_flappy_highscore', state.score.toString());
      if (onScoreSave) {
        onScoreSave('Flappy Neon', state.score);
      }
    }
  };

  return (
    <>
      {showIntro && <GameIntro 
        gameName="FLAPPY NEON" 
        icon="🚀" 
        colors={['#00f0ff', '#ff007f', '#ffffff']} 
        particleType="neon" 
        onComplete={() => setShowIntro(false)} 
      />}
      <div className="game-container neon-border" style={containerStyle}>
        <div style={headerStyle}>
        <button onClick={onBack} className="retro-btn" style={backBtnStyle}>
          &lt; Retour Hub
        </button>
        <div style={titleStyle}>FLAPPY NEON</div>
        <div style={scoreBoardStyle}>
          Score: <span style={{ color: '#ff007f', fontWeight: 'bold' }}>{score}</span> | Max: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{highScore}</span>
        </div>
      </div>

      <div 
        style={canvasWrapperStyle} 
        onClick={() => handleAction()}
        onTouchStart={(e) => handleAction(e)}
      >
        <canvas ref={canvasRef} style={canvasStyle} />

        {gameOver && (
          <div style={overlayStyle}>
            <div style={gameOverTitleStyle}>CRASH IMMINENT</div>
            <div style={gameOverStatsStyle}>
              Score: <span style={{ color: '#ff007f' }}>{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div style={newRecordStyle}>NOUVEAU RECORD !</div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }} 
              className="retro-btn pulse-glow"
              style={restartBtnStyle}
            >
              Recommencer
            </button>
          </div>
        )}
      </div>

      <div style={footerHelpStyle}>
        Astuce: Cliquez n'importe où dans la zone noire ou appuyez sur [ESPACE] pour propulser le vaisseau.
      </div>
    </div>
    </>
  );
}

// Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '600px',
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
  marginBottom: '12px',
  flexWrap: 'wrap',
  gap: '10px'
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

const scoreBoardStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '14px',
  color: '#ffffff',
};

const canvasWrapperStyle = {
  position: 'relative',
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
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
  backgroundColor: 'rgba(10, 8, 19, 0.85)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
  animation: 'fadeIn 0.3s ease-out',
};

const gameOverTitleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '32px',
  color: '#ff007f',
  textShadow: '0 0 12px #ff007f',
  marginBottom: '16px',
  fontWeight: 'bold',
  letterSpacing: '2px'
};

const gameOverStatsStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '20px',
  color: '#ffffff',
  marginBottom: '20px',
};

const newRecordStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '16px',
  color: '#ffd700',
  textShadow: '0 0 10px #ffd700',
  marginBottom: '20px',
  fontWeight: 'bold',
  animation: 'pulse 1s infinite alternate',
};

const restartBtnStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  border: '2px solid #00f0ff',
  background: 'transparent',
  color: '#00f0ff',
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
};

const footerHelpStyle = {
  marginTop: '12px',
  fontSize: '12px',
  color: '#8e8a9f',
  textAlign: 'center',
  lineHeight: '1.4'
};
