import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/sound';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';

export default function BrickBreaker({ onBack, onScoreSave }) {
  const [showIntro, setShowIntro] = useState(true);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_breaker_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const stateRef = useRef({
    gameStarted: false,
    gameOver: false,
    victory: false,
    score: 0,
    lives: 3,
    paddle: {
      x: 250,
      y: 360,
      width: 80,
      height: 12,
      speed: 8,
      targetX: 250,
      laserTimer: 0,
      widthTimer: 0
    },
    balls: [],
    bricks: [],
    powerups: [],
    lasers: [],
    particles: [],
    shieldActive: false,
    width: 600,
    height: 400,
    frame: 0
  });

  const resetGame = () => {
    const state = stateRef.current;
    state.score = 0;
    state.lives = 3;
    state.gameOver = false;
    state.victory = false;
    state.gameStarted = false;
    state.shieldActive = false;
    
    state.paddle.x = 250;
    state.paddle.targetX = 250;
    state.paddle.width = 80;
    state.paddle.laserTimer = 0;
    state.paddle.widthTimer = 0;
    
    state.balls = [
      { x: 290, y: 340, vx: 3, vy: -4, radius: 6, active: true }
    ];
    state.powerups = [];
    state.lasers = [];
    state.particles = [];
    
    generateBricks(state);
    
    setScore(0);
    setLives(3);
    setGameOver(false);
    setVictory(false);
    setGameStarted(false);
  };

  const generateBricks = (state) => {
    state.bricks = [];
    const rows = 5;
    const cols = 8;
    const brickW = 60;
    const brickH = 16;
    const gap = 8;
    
    // Offset to center grid
    const totalW = cols * brickW + (cols - 1) * gap;
    const startX = (600 - totalW) / 2;
    const startY = 40;

    const colors = ['#ff007f', '#9d00ff', '#00f0ff', '#00ff7f', '#ffd700'];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        state.bricks.push({
          x: startX + c * (brickW + gap),
          y: startY + r * (brickH + gap),
          w: brickW,
          h: brickH,
          color: colors[r % colors.length],
          maxHp: r === 0 ? 2 : 1, // Top row requires 2 hits
          hp: r === 0 ? 2 : 1
        });
      }
    }
  };

  // Launch laser from paddle
  const fireLaser = (state) => {
    if (state.paddle.laserTimer <= 0) return;
    
    sound.playLaser();
    
    // Fire two lasers from edges of the paddle
    state.lasers.push({
      x: state.paddle.x,
      y: state.paddle.y,
      vy: -6,
      w: 3,
      h: 12,
      color: '#ff007f'
    });
    state.lasers.push({
      x: state.paddle.x + state.paddle.width,
      y: state.paddle.y,
      vy: -6,
      w: 3,
      h: 12,
      color: '#ff007f'
    });
  };

  const handlePointerMove = (clientX) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const state = stateRef.current;
    
    // Normalize target X to keep paddle fully inside boundaries
    const target = (relativeX / rect.width) * 600 - state.paddle.width / 2;
    state.paddle.targetX = Math.max(0, Math.min(600 - state.paddle.width, target));
    
    if (!state.gameStarted && !state.gameOver && !state.victory) {
      state.gameStarted = true;
      setGameStarted(true);
    }
  };

  // Trigger fire for lasers on touch or click
  const handlePointerDown = () => {
    const state = stateRef.current;
    if (state.paddle.laserTimer > 0) {
      fireLaser(state);
    }
  };

  useEffect(() => {
    // Keyboard inputs
    const handleKeyDown = (e) => {
      const state = stateRef.current;
      if (e.code === 'ArrowLeft') {
        state.paddle.targetX = Math.max(0, state.paddle.x - 25);
        if (!state.gameStarted) { setGameStarted(true); state.gameStarted = true; }
      }
      if (e.code === 'ArrowRight') {
        state.paddle.targetX = Math.min(600 - state.paddle.width, state.paddle.x + 25);
        if (!state.gameStarted) { setGameStarted(true); state.gameStarted = true; }
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.paddle.laserTimer > 0) {
          fireLaser(state);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update canvas size and logic loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = Math.min(parent.clientWidth, 600);
      const h = 400;
      canvas.width = w;
      canvas.height = h;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    resetGame();

    let animationFrameId;
    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);
      update(state);
      draw(ctx, state);
    };
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const update = (state) => {
    state.frame++;
    if (!state.gameStarted || state.gameOver || state.victory) return;

    // Interpolate paddle movement for smoothness
    state.paddle.x += (state.paddle.targetX - state.paddle.x) * 0.25;

    // Update timers
    if (state.paddle.laserTimer > 0) state.paddle.laserTimer--;
    if (state.paddle.widthTimer > 0) {
      state.paddle.widthTimer--;
      if (state.paddle.widthTimer === 0) {
        state.paddle.width = 80;
      }
    }

    // Spawn auto-shoots if laser timer is active
    if (state.paddle.laserTimer > 0 && state.frame % 35 === 0) {
      fireLaser(state);
    }

    // Update balls
    state.balls.forEach(ball => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
        sound.playClick();
      }
      if (ball.x + ball.radius > 600) {
        ball.x = 600 - ball.radius;
        ball.vx = -ball.vx;
        sound.playClick();
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
        sound.playClick();
      }

      // Bounce off paddle
      const px = state.paddle.x;
      const py = state.paddle.y;
      const pw = state.paddle.width;
      const ph = state.paddle.height;

      if (ball.y + ball.radius >= py && ball.y - ball.radius <= py + ph) {
        if (ball.x + ball.radius >= px && ball.x - ball.radius <= px + pw) {
          // Collision! Determine reflection angle based on where the ball hits the paddle
          const hitPos = (ball.x - px) / pw; // 0 to 1
          const angle = (hitPos - 0.5) * Math.PI * 0.45; // -40deg to +40deg approx
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.vx = speed * Math.sin(angle);
          ball.vy = -speed * Math.cos(angle);
          
          // Re-adjust position slightly to avoid clipping
          ball.y = py - ball.radius - 1;
          sound.playScore();

          // Spawn splash particles on paddle bounce
          createSplash(ball.x, py, '#00f0ff', state);
        }
      }

      // Bounce off bricks
      state.bricks.forEach(brick => {
        if (brick.hp <= 0) return;

        // Simple Circle-AABB collision check
        let closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.w));
        let closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.h));
        
        let dx = ball.x - closestX;
        let dy = ball.y - closestY;
        let distSqr = dx * dx + dy * dy;

        if (distSqr < ball.radius * ball.radius) {
          // Collision! Bounce logic
          // Determine side of collision
          const fromLeft = ball.x < brick.x;
          const fromRight = ball.x > brick.x + brick.w;
          const fromTop = ball.y < brick.y;
          const fromBottom = ball.y > brick.y + brick.h;

          if (fromLeft || fromRight) {
            ball.vx = -ball.vx;
          } else if (fromTop || fromBottom) {
            ball.vy = -ball.vy;
          } else {
            // Default fallback
            ball.vy = -ball.vy;
          }

          // Damage brick
          brick.hp--;
          state.score += 10;
          setScore(state.score);
          sound.playScore();

          createSplash(closestX, closestY, brick.color, state);

          // Spawn powerup chance
          if (brick.hp <= 0 && Math.random() < 0.22) {
            const types = ['MULTIBALL', 'LASER', 'PADDLE_WIDE', 'SHIELD'];
            const type = types[Math.floor(Math.random() * types.length)];
            state.powerups.push({
              x: brick.x + brick.w / 2,
              y: brick.y + brick.h,
              vy: 2.2,
              type,
              radius: 10
            });
          }
        }
      });
    });

    // Remove balls that fall out of bounds
    state.balls = state.balls.filter(ball => {
      if (ball.y - ball.radius > 400) {
        return false;
      }
      return true;
    });

    // If no balls remaining
    if (state.balls.length === 0) {
      // Check shield first
      if (state.shieldActive) {
        state.shieldActive = false;
        state.balls.push({
          x: state.paddle.x + state.paddle.width / 2,
          y: state.paddle.y - 12,
          vx: (Math.random() - 0.5) * 4,
          vy: -4,
          radius: 6,
          active: true
        });
        sound.playPowerup();
      } else {
        // Lose life
        state.lives--;
        setLives(state.lives);
        sound.playExplosion();
        
        if (state.lives <= 0) {
          handleGameOver(state);
        } else {
          // Respawn single ball
          state.balls.push({
            x: state.paddle.x + state.paddle.width / 2,
            y: state.paddle.y - 15,
            vx: 3 * (Math.random() > 0.5 ? 1 : -1),
            vy: -4,
            radius: 6,
            active: true
          });
          state.gameStarted = false;
          setGameStarted(false);
        }
      }
    }

    // Update lasers
    state.lasers.forEach(laser => {
      laser.y += laser.vy;

      // Check collision with bricks
      state.bricks.forEach(brick => {
        if (brick.hp <= 0) return;

        if (laser.x >= brick.x && laser.x <= brick.x + brick.w) {
          if (laser.y <= brick.y + brick.h && laser.y >= brick.y) {
            // Hit!
            brick.hp--;
            laser.y = -100; // trigger deletion
            state.score += 10;
            setScore(state.score);
            sound.playScore();
            createSplash(laser.x, brick.y + brick.h, brick.color, state);
          }
        }
      });
    });
    state.lasers = state.lasers.filter(laser => laser.y > 0);

    // Update powerups
    state.powerups.forEach(pw => {
      pw.y += pw.vy;

      // Check paddle catch
      const px = state.paddle.x;
      const py = state.paddle.y;
      const pw_width = state.paddle.width;

      if (pw.y + pw.radius >= py && pw.y - pw.radius <= py + 12) {
        if (pw.x + pw.radius >= px && pw.x - pw.radius <= px + pw_width) {
          // Catch powerup!
          applyPowerup(pw.type, state);
          pw.y = 500; // trigger deletion
        }
      }
    });
    state.powerups = state.powerups.filter(pw => pw.y < 400);

    // Particles
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
    });
    state.particles = state.particles.filter(p => p.alpha > 0);

    // Check Victory
    const activeBricks = state.bricks.some(brick => brick.hp > 0);
    if (!activeBricks) {
      state.victory = true;
      setVictory(true);
      sound.playPowerup();

      if (state.score > highScore) {
        setHighScore(state.score);
        localStorage.setItem('retrovision_breaker_highscore', state.score.toString());
      }
    }
  };

  const applyPowerup = (type, state) => {
    sound.playPowerup();
    
    // Spawn float text or splash
    createSplash(state.paddle.x + state.paddle.width / 2, state.paddle.y, '#ffd700', state);

    if (type === 'MULTIBALL') {
      const baseBall = state.balls[0] || { x: 300, y: 200, vx: 3, vy: -3, radius: 6 };
      state.balls.push({
        x: baseBall.x,
        y: baseBall.y,
        vx: baseBall.vx + (Math.random() - 0.5) * 2,
        vy: -Math.abs(baseBall.vy),
        radius: 6
      });
      state.balls.push({
        x: baseBall.x,
        y: baseBall.y,
        vx: baseBall.vx - (Math.random() - 0.5) * 2,
        vy: -Math.abs(baseBall.vy),
        radius: 6
      });
    } else if (type === 'LASER') {
      state.paddle.laserTimer = 350; // Active for frames
    } else if (type === 'PADDLE_WIDE') {
      state.paddle.width = 130;
      state.paddle.widthTimer = 400; // Frames
      state.paddle.targetX = Math.max(0, Math.min(600 - 130, state.paddle.targetX));
    } else if (type === 'SHIELD') {
      state.shieldActive = true;
    }
  };

  const createSplash = (x, y, color, state) => {
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: 1.5 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.035
      });
    }
  };

  const handleGameOver = (state) => {
    state.gameOver = true;
    setGameOver(true);
    sound.playExplosion();

    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem('retrovision_breaker_highscore', state.score.toString());
      if (onScoreSave) {
        onScoreSave('Brick Breaker', state.score);
      }
    }
  };

  const draw = (ctx, state) => {
    const w = 600;
    const h = 400;

    // Scale context to actual canvas dimensions
    const cW = canvasRef.current.width;
    const cH = canvasRef.current.height;
    ctx.save();
    ctx.scale(cW / w, cH / h);

    // Clear background
    ctx.fillStyle = '#0a0813';
    ctx.fillRect(0, 0, w, h);

    // Draw horizontal grid lines
    ctx.strokeStyle = '#141029';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // vertical grid lines
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw Shield Line if active
    if (state.shieldActive) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff7f';
      ctx.strokeStyle = '#00ff7f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 395);
      ctx.lineTo(600, 395);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Bricks
    state.bricks.forEach(brick => {
      if (brick.hp <= 0) return;

      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = brick.color;
      ctx.fillStyle = brick.hp === 2 ? '#ffffff' : brick.color; // White if needs 2 hits
      
      // Draw rounded rect brick
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 3);
      ctx.fill();

      // Border glow
      if (brick.hp === 2) {
        ctx.strokeStyle = brick.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Lasers
    state.lasers.forEach(laser => {
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = laser.color;
      ctx.fillStyle = laser.color;
      ctx.fillRect(laser.x - laser.w / 2, laser.y, laser.w, laser.h);
      ctx.restore();
    });

    // Draw Power-ups
    state.powerups.forEach(pw => {
      ctx.save();
      let color = '#ffd700'; // Default gold
      let text = 'P';
      if (pw.type === 'MULTIBALL') { color = '#00f0ff'; text = 'M'; }
      if (pw.type === 'LASER') { color = '#ff007f'; text = 'L'; }
      if (pw.type === 'PADDLE_WIDE') { color = '#9d00ff'; text = 'W'; }
      if (pw.type === 'SHIELD') { color = '#00ff7f'; text = 'S'; }

      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      
      // Draw circle badge
      ctx.fillStyle = 'rgba(10, 8, 19, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw inside symbol
      ctx.fillStyle = color;
      ctx.font = 'bold 11px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, pw.x, pw.y);

      ctx.restore();
    });

    // Draw Paddle
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = state.paddle.laserTimer > 0 ? '#ff007f' : '#00f0ff';
    ctx.fillStyle = state.paddle.laserTimer > 0 ? '#ff007f' : '#00f0ff';
    ctx.beginPath();
    ctx.roundRect(state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height, 6);
    ctx.fill();
    ctx.restore();

    // Draw Balls
    state.balls.forEach(ball => {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

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

    // Tap to Play Overlay inside Canvas
    if (!state.gameStarted && !state.gameOver && !state.victory) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 8, 19, 0.7)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.font = 'bold 20px Orbitron';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.fillText('BRICK BREAKER NEON', w / 2, h / 2 - 30);
      
      ctx.font = '13px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText('Glissez / Touchez le bas pour déplacer la raquette', w / 2, h / 2 + 10);
      ctx.fillText('Attrapez les capsules de bonus (M, L, W, S)', w / 2, h / 2 + 35);
      ctx.restore();
    }

    ctx.restore();
  };

  return (
    <>
      {showIntro && <GameIntro 
        gameName="BRICK BREAKER" 
        icon="🧱" 
        colors={['#ff007f', '#00f0ff', '#9d00ff']} 
        particleType="bricks" 
        onComplete={() => setShowIntro(false)} 
      />}
      <div className="game-container neon-border" style={containerStyle}>
      <GameHeader
        title="BREAKER NEON"
        onBack={onBack}
        showBgmToggle={false} // BGM handled globally
        centerContent={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={livesContainerStyle}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span 
                  key={i} 
                  style={{
                    ...heartStyle,
                    color: i < lives ? '#ff007f' : '#331a38',
                    textShadow: i < lives ? '0 0 6px #ff007f' : 'none'
                  }}
                >
                  ♥
                </span>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#8e8a9f', fontFamily: 'Orbitron, sans-serif' }}>
              Score: <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>{score}</span> | Max: {highScore}
            </div>
          </div>
        }
      />

      <div 
        style={canvasWrapperStyle}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onClick={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <canvas ref={canvasRef} style={canvasStyle} />

        {gameOver && (
          <div style={overlayStyle}>
            <div style={gameOverTitleStyle}>GAME OVER</div>
            <div style={gameOverStatsStyle}>Score final: {score}</div>
            {score >= highScore && score > 0 && (
              <div style={newRecordStyle}>NOUVEAU RECORD !</div>
            )}
            <button onClick={resetGame} className="retro-btn pulse-glow" style={restartBtnStyle}>
              Recommencer
            </button>
          </div>
        )}

        {victory && (
          <div style={{ ...overlayStyle, animation: 'delayFadeIn 2s forwards' }}>
            <div style={victoryTitleStyle}>NIVEAU COMPLÉTÉ</div>
            <div style={gameOverStatsStyle}>Félicitations ! Score : {score}</div>
            <button onClick={resetGame} className="retro-btn pulse-glow" style={restartBtnStyle}>
              Rejouer
            </button>
          </div>
        )}
      </div>

      <div style={footerHelpStyle}>
        Contrôles : Glissez sur le pavé tactile ou déplacez votre souris pour déplacer la raquette. Quand le bonus LASER [L] est actif, cliquez/appuyez pour tirer.
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

const livesContainerStyle = {
  display: 'flex',
  gap: '4px',
};

const heartStyle = {
  fontSize: '18px',
  userSelect: 'none'
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
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.05)',
  cursor: 'none', // Hide mouse cursor inside game area for better paddle feel
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
  backgroundColor: 'rgba(10, 8, 19, 0.9)',
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

const victoryTitleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '26px',
  color: '#00ff7f',
  textShadow: '0 0 10px #00ff7f',
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
  cursor: 'pointer'
};

const footerHelpStyle = {
  marginTop: '12px',
  fontSize: '11px',
  color: '#8e8a9f',
  textAlign: 'center',
  lineHeight: '1.4',
};
