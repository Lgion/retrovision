import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Boutique from '../components/Boutique';

// --- GRID & CANVAS CONFIGURATION ---
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 660;

const MAX_ROWS = 12;
const COLS_EVEN = 9;
const COLS_ODD = 8;

const BUBBLE_RADIUS = 21;
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3); // ~36.37px
const TOP_PADDING = 25;
const MARGIN_LEFT = (CANVAS_WIDTH - (COLS_EVEN * BUBBLE_DIAMETER)) / 2; // (440 - 378)/2 = 31px
const SHOOTER_X = CANVAS_WIDTH / 2;
const SHOOTER_Y = CANVAS_HEIGHT - 65;
const DANGER_Y = TOP_PADDING + (MAX_ROWS - 1) * ROW_HEIGHT + BUBBLE_RADIUS;

const COLOR_KEYS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

const COLOR_PALETTES = {
  red: { main: '#EF4444', top: '#FCA5A5', shadow: '#991B1B', glow: 'rgba(239, 68, 68, 0.6)' },
  blue: { main: '#3B82F6', top: '#93C5FD', shadow: '#1E3A8A', glow: 'rgba(59, 130, 246, 0.6)' },
  green: { main: '#10B981', top: '#6EE7B7', shadow: '#065F46', glow: 'rgba(16, 185, 129, 0.6)' },
  yellow: { main: '#F59E0B', top: '#FDE68A', shadow: '#92400E', glow: 'rgba(245, 158, 11, 0.6)' },
  purple: { main: '#8B5CF6', top: '#C4B5FD', shadow: '#4C1D95', glow: 'rgba(139, 92, 246, 0.6)' },
  pink: { main: '#EC4899', top: '#FBCFE8', shadow: '#831843', glow: 'rgba(236, 72, 153, 0.6)' }
};

// --- HELPER FUNCTIONS ---
const getCols = (r) => (r % 2 === 0 ? COLS_EVEN : COLS_ODD);

const getBubbleCenter = (r, c) => {
  const isEven = r % 2 === 0;
  const x = isEven
    ? MARGIN_LEFT + BUBBLE_RADIUS + c * BUBBLE_DIAMETER
    : MARGIN_LEFT + BUBBLE_DIAMETER + c * BUBBLE_DIAMETER;
  const y = TOP_PADDING + BUBBLE_RADIUS + r * ROW_HEIGHT;
  return { x, y };
};

const getNeighbors = (r, c) => {
  const neighbors = [];
  const isEven = r % 2 === 0;

  // Left & Right
  neighbors.push({ r, c: c - 1 });
  neighbors.push({ r, c: c + 1 });

  if (isEven) {
    neighbors.push({ r: r - 1, c: c - 1 });
    neighbors.push({ r: r - 1, c });
    neighbors.push({ r: r + 1, c: c - 1 });
    neighbors.push({ r: r + 1, c });
  } else {
    neighbors.push({ r: r - 1, c });
    neighbors.push({ r: r - 1, c: c + 1 });
    neighbors.push({ r: r + 1, c });
    neighbors.push({ r: r + 1, c: c + 1 });
  }

  return neighbors.filter(
    (n) => n.r >= 0 && n.r < MAX_ROWS && n.c >= 0 && n.c < getCols(n.r)
  );
};

export default function BubbleCool({ onBack, onScoreSave, isIntermission, onIntermissionComplete }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showStore, setShowStore] = useState(false);

  const [customizations, setCustomizations] = useState(() => {
    return getGameConfig('bubblecool', 'customizations', { theme: 'candy', difficulty: 'normal' });
  });

  const activeTheme = isIntermission ? 'candy' : (customizations.theme || 'candy');
  const activeDifficulty = isIntermission ? 'normal' : (customizations.difficulty || 'normal');

  const getMaxFouls = (diff) => {
    if (diff === 'facile') return null;
    if (diff === 'expert') return 3;
    return 5;
  };

  const maxFouls = getMaxFouls(activeDifficulty);

  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_bubblecool_highscore') || '0', 10);
  });
  const [foulCounter, setFoulCounter] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [swapUsed, setSwapUsed] = useState(0);

  // References for Animation & Game Loop
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    grid: Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(null)),
    currentBubble: 'red',
    nextBubble: 'blue',
    aimAngle: -Math.PI / 2,
    projectile: null, // { x, y, vx, vy, color }
    fallingBubbles: [], // { x, y, vx, vy, color, alpha }
    particles: [], // { x, y, vx, vy, color, life, maxLife, radius }
    floatingTexts: [], // { id, text, x, y, alpha, color }
    isShooting: false,
    comboCount: 0
  });

  // Sound BGM state
  const [bgmOn, setBgmOn] = useState(false);

  // Initialize Game Board
  useEffect(() => {
    initGame();
  }, [activeDifficulty]);

  const getAvailableColorsFromGrid = (grid) => {
    const activeColors = new Set();
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (grid[r][c]) activeColors.add(grid[r][c]);
      }
    }
    return activeColors.size > 0 ? Array.from(activeColors) : COLOR_KEYS;
  };

  const getRandomColor = (grid) => {
    const available = getAvailableColorsFromGrid(grid);
    return available[Math.floor(Math.random() * available.length)];
  };

  const initGame = () => {
    const newGrid = Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(null));
    // Fill top 5 rows with random colors
    const initialRows = 5;
    for (let r = 0; r < initialRows; r++) {
      const cols = getCols(r);
      for (let c = 0; c < cols; c++) {
        newGrid[r][c] = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
      }
    }

    const firstColor = getRandomColor(newGrid);
    const secondColor = getRandomColor(newGrid);

    gameStateRef.current = {
      grid: newGrid,
      currentBubble: firstColor,
      nextBubble: secondColor,
      aimAngle: -Math.PI / 2,
      projectile: null,
      fallingBubbles: [],
      particles: [],
      floatingTexts: [],
      isShooting: false,
      comboCount: 0
    };

    setScore(0);
    setFoulCounter(maxFouls !== null ? maxFouls : 0);
    setGameOver(false);
    setVictory(false);
    setSwapUsed(0);
  };

  // Swap current and next bubble
  const handleSwapBubbles = () => {
    if (gameStateRef.current.isShooting || gameOver || victory) return;
    sound.playClick();
    const temp = gameStateRef.current.currentBubble;
    gameStateRef.current.currentBubble = gameStateRef.current.nextBubble;
    gameStateRef.current.nextBubble = temp;
    setSwapUsed((prev) => prev + 1);
  };

  // Canvas Main Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const state = gameStateRef.current;

      // 1. Draw Background Grid & Board Outline
      drawBoardBackground(ctx);

      // 2. Draw Grid Bubbles
      drawGridBubbles(ctx, state.grid);

      // 3. Draw Danger Threshold Line
      drawDangerLine(ctx);

      // 4. Draw Trajectory Aim Laser (if aiming)
      if (!state.isShooting && !gameOver && !victory) {
        drawAimTrajectory(ctx, state.aimAngle, state.currentBubble, state.grid);
      }

      // 5. Update & Draw Active Projectile
      if (state.projectile) {
        updateProjectile(state);
        if (state.projectile) {
          drawBubble(ctx, state.projectile.x, state.projectile.y, state.projectile.color, 1);
        }
      }

      // 6. Update & Draw Falling Free-Float Bubbles (Orphans)
      updateFallingBubbles(state);
      state.fallingBubbles.forEach((fb) => {
        drawBubble(ctx, fb.x, fb.y, fb.color, fb.alpha);
      });

      // 7. Update & Draw Particle Bursts
      updateParticles(state);
      drawParticles(ctx, state.particles);

      // 8. Update & Draw Floating Scores
      updateFloatingTexts(state);
      drawFloatingTexts(ctx, state.floatingTexts);

      // 9. Draw Cannon & Next Bubble Launcher
      drawLauncher(ctx, state.currentBubble, state.nextBubble, state.aimAngle);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTheme, gameOver, victory]);

  // --- DRAWING FUNCTIONS ---
  const drawBoardBackground = (ctx) => {
    // Subtle retro grid canvas back
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Wall borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT - 4, 0);
    ctx.lineTo(MARGIN_LEFT - 4, CANVAS_HEIGHT);
    ctx.moveTo(CANVAS_WIDTH - MARGIN_LEFT + 4, 0);
    ctx.lineTo(CANVAS_WIDTH - MARGIN_LEFT + 4, CANVAS_HEIGHT);
    ctx.stroke();

    ctx.restore();
  };

  const drawDangerLine = (ctx) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, DANGER_Y);
    ctx.lineTo(CANVAS_WIDTH - MARGIN_LEFT, DANGER_Y);
    ctx.stroke();
    ctx.restore();
  };

  const drawBubble = (ctx, x, y, colorKey, alpha = 1) => {
    const palette = COLOR_PALETTES[colorKey] || COLOR_PALETTES.red;

    ctx.save();
    ctx.globalAlpha = alpha;

    if (activeTheme === 'neon') {
      // Cyber Neon Style
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fill();

      ctx.strokeStyle = palette.main;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner glowing core
      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = palette.top;
      ctx.fill();

    } else if (activeTheme === 'gemstone') {
      // Gemstone Crystal Faceted Style
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, BUBBLE_RADIUS);
      grad.addColorStop(0, palette.top);
      grad.addColorStop(0.6, palette.main);
      grad.addColorStop(1, palette.shadow);
      ctx.fillStyle = grad;
      ctx.fill();

      // Facet Highlight Polygon
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 12);
      ctx.lineTo(x + 5, y - 12);
      ctx.lineTo(x + 10, y - 5);
      ctx.lineTo(x - 10, y - 5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

    } else {
      // Classic Candy Glass Style
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 8;

      // Base Glossy Radial Gradient
      const grad = ctx.createRadialGradient(x - 5, y - 6, 3, x, y, BUBBLE_RADIUS);
      grad.addColorStop(0, palette.top);
      grad.addColorStop(0.5, palette.main);
      grad.addColorStop(1, palette.shadow);

      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Shiny Top Curve Highlight
      ctx.beginPath();
      ctx.ellipse(x - 5, y - 7, BUBBLE_RADIUS * 0.4, BUBBLE_RADIUS * 0.22, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      // Bottom Rim Subtle Shadow Glow
      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawGridBubbles = (ctx, grid) => {
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = getCols(r);
      for (let c = 0; c < cols; c++) {
        const color = grid[r][c];
        if (color) {
          const { x, y } = getBubbleCenter(r, c);
          drawBubble(ctx, x, y, color);
        }
      }
    }
  };

  const drawAimTrajectory = (ctx, angle, colorKey, grid) => {
    let currX = SHOOTER_X;
    let currY = SHOOTER_Y;
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    const minX = MARGIN_LEFT + BUBBLE_RADIUS;
    const maxX = CANVAS_WIDTH - MARGIN_LEFT - BUBBLE_RADIUS;
    const stepSize = 4;
    const pathPoints = [{ x: currX, y: currY }];

    let collided = false;
    let targetCell = null;

    for (let step = 0; step < 300 && !collided; step++) {
      currX += dx * stepSize;
      currY += dy * stepSize;

      // Wall Bounce
      if (currX <= minX) {
        currX = minX;
        dx = -dx;
        pathPoints.push({ x: currX, y: currY });
      } else if (currX >= maxX) {
        currX = maxX;
        dx = -dx;
        pathPoints.push({ x: currX, y: currY });
      }

      // Ceiling Collision
      if (currY <= TOP_PADDING + BUBBLE_RADIUS) {
        currY = TOP_PADDING + BUBBLE_RADIUS;
        collided = true;
        pathPoints.push({ x: currX, y: currY });
        targetCell = findClosestEmptyCell(currX, currY, grid);
        break;
      }

      // Grid Bubble Collision
      for (let r = 0; r < MAX_ROWS && !collided; r++) {
        for (let c = 0; c < getCols(r); c++) {
          if (grid[r][c]) {
            const center = getBubbleCenter(r, c);
            const dist = Math.hypot(currX - center.x, currY - center.y);
            if (dist <= BUBBLE_DIAMETER - 2) {
              collided = true;
              pathPoints.push({ x: currX, y: currY });
              targetCell = findClosestEmptyCell(currX, currY, grid);
              break;
            }
          }
        }
      }
    }

    if (!collided) {
      pathPoints.push({ x: currX, y: currY });
    }

    // Draw Laser Trajectory Line
    ctx.save();
    ctx.strokeStyle = COLOR_PALETTES[colorKey]?.top || '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 8]);
    ctx.shadowColor = COLOR_PALETTES[colorKey]?.glow || '#fff';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 1; i < pathPoints.length; i++) {
      ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    ctx.stroke();

    // Draw Ghost Impact Preview Circle if target cell found
    if (targetCell) {
      const { x: tx, y: ty } = getBubbleCenter(targetCell.r, targetCell.c);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = COLOR_PALETTES[colorKey]?.top || '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.fillStyle = COLOR_PALETTES[colorKey]?.glow || 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    ctx.restore();
  };

  const drawLauncher = (ctx, currentBubble, nextBubble, angle) => {
    ctx.save();

    // Shooter Base Ring
    ctx.translate(SHOOTER_X, SHOOTER_Y);

    // Draw Cannon Arrow / Turret
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-12, -45, 24, 45);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-(angle + Math.PI / 2));

    // Outer Cannon Stand
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Draw Ready Current Bubble
    drawBubble(ctx, SHOOTER_X, SHOOTER_Y, currentBubble, 1);

    // Draw Next Bubble Stand (Bottom Left)
    const nextX = SHOOTER_X - 70;
    const nextY = SHOOTER_Y + 10;

    ctx.save();
    ctx.beginPath();
    ctx.arc(nextX, nextY, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawBubble(ctx, nextX, nextY, nextBubble, 0.85);

    // Text Label NEXT
    ctx.save();
    ctx.font = '700 10px Orbitron, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', nextX, nextY + 30);
    ctx.restore();
  };

  // --- GAMEPLAY LOGIC & PHYSICS ---
  const handlePointerMove = (e) => {
    if (gameStateRef.current.isShooting || gameOver || victory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    // Angle calculation from shooter center
    let angle = Math.atan2(y - SHOOTER_Y, x - SHOOTER_X);
    // Clamp angle to upper hemisphere (-165 deg to -15 deg)
    const minAngle = -Math.PI + Math.PI / 12; // -165 deg
    const maxAngle = -Math.PI / 12; // -15 deg

    if (angle > 0) {
      angle = x < SHOOTER_X ? minAngle : maxAngle;
    } else {
      angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    gameStateRef.current.aimAngle = angle;
  };

  const handleShoot = () => {
    const state = gameStateRef.current;
    if (state.isShooting || gameOver || victory) return;

    sound.playBubbleShoot();

    const speed = 16;
    const vx = Math.cos(state.aimAngle) * speed;
    const vy = Math.sin(state.aimAngle) * speed;

    state.projectile = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx,
      vy,
      color: state.currentBubble
    };

    state.isShooting = true;
  };

  const updateProjectile = (state) => {
    const p = state.projectile;
    if (!p) return;

    p.x += p.vx;
    p.y += p.vy;

    const minX = MARGIN_LEFT + BUBBLE_RADIUS;
    const maxX = CANVAS_WIDTH - MARGIN_LEFT - BUBBLE_RADIUS;

    // Bounce on walls
    if (p.x <= minX) {
      p.x = minX;
      p.vx = -p.vx;
      sound.playBubbleBounce();
    } else if (p.x >= maxX) {
      p.x = maxX;
      p.vx = -p.vx;
      sound.playBubbleBounce();
    }

    // Ceiling Collision
    if (p.y <= TOP_PADDING + BUBBLE_RADIUS) {
      p.y = TOP_PADDING + BUBBLE_RADIUS;
      snapProjectile(state);
      return;
    }

    // Grid Bubble Collision
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (state.grid[r][c]) {
          const center = getBubbleCenter(r, c);
          const dist = Math.hypot(p.x - center.x, p.y - center.y);
          if (dist <= BUBBLE_DIAMETER - 2) {
            snapProjectile(state);
            return;
          }
        }
      }
    }
  };

  const findClosestEmptyCell = (x, y, grid) => {
    let closestCell = null;
    let minDist = Infinity;

    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (!grid[r][c]) {
          const center = getBubbleCenter(r, c);
          const dist = Math.hypot(x - center.x, y - center.y);
          if (dist < minDist) {
            minDist = dist;
            closestCell = { r, c };
          }
        }
      }
    }
    return closestCell;
  };

  const snapProjectile = (state) => {
    const p = state.projectile;
    if (!p) return;

    const cell = findClosestEmptyCell(p.x, p.y, state.grid);
    state.projectile = null;

    if (!cell) {
      // Board completely full -> Game Over
      triggerGameOver();
      return;
    }

    state.grid[cell.r][cell.c] = p.color;

    // Check Match 3+ BFS
    const matches = findConnectedCluster(cell.r, cell.c, p.color, state.grid);

    if (matches.length >= 3) {
      // POP MATCHES
      state.comboCount++;
      sound.playBubblePop(state.comboCount);

      // Pop animations & score
      const points = matches.length * 100 * state.comboCount;
      const popCenter = getBubbleCenter(cell.r, cell.c);
      spawnFloatingText(state, `+${points}`, popCenter.x, popCenter.y, COLOR_PALETTES[p.color].top);

      matches.forEach(({ r, c }) => {
        const center = getBubbleCenter(r, c);
        spawnBurstParticles(state, center.x, center.y, p.color);
        state.grid[r][c] = null;
      });

      setScore((prev) => {
        const newScore = prev + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('retrovision_bubblecool_highscore', newScore.toString());
          if (onScoreSave) onScoreSave('Bubble Cool', newScore);
        }
        return newScore;
      });

      // Check Orphans (Floodfill BFS from top row)
      const orphanCount = dropOrphanBubbles(state);

      if (orphanCount > 0) {
        sound.playBubbleDrop();
        const orphanPoints = orphanCount * 250;
        spawnFloatingText(state, `CHUTE! +${orphanPoints}`, popCenter.x, popCenter.y + 20, '#FBBF24');
        setScore((prev) => {
          const newScore = prev + orphanPoints;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('retrovision_bubblecool_highscore', newScore.toString());
            if (onScoreSave) onScoreSave('Bubble Cool', newScore);
          }
          return newScore;
        });
      }

      // Check Victory Condition
      if (isBoardEmpty(state.grid)) {
        triggerVictory();
        return;
      }

    } else {
      // MISSED MATCH -> Decrease Foul Counter if difficulty != 'facile'
      state.comboCount = 0;
      sound.playClick();

      if (activeDifficulty !== 'facile' && maxFouls) {
        setFoulCounter((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            // Trigger Row Drop
            dropNewGridRow(state);
            return maxFouls;
          }
          return next;
        });
      }
    }

    // Check Defeat Condition (Bubbles crossed danger line)
    if (hasBubblesReachedDanger(state.grid)) {
      triggerGameOver();
      return;
    }

    // Prepare next turn colors
    state.currentBubble = state.nextBubble;
    state.nextBubble = getRandomColor(state.grid);
    state.isShooting = false;
  };

  // --- BFS GRAPH ALGORITHMS ---
  const findConnectedCluster = (startR, startC, targetColor, grid) => {
    const queue = [{ r: startR, c: startC }];
    const visited = new Set([`${startR},${startC}`]);
    const cluster = [{ r: startR, c: startC }];

    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const neighbors = getNeighbors(r, c);

      neighbors.forEach((n) => {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key) && grid[n.r][n.c] === targetColor) {
          visited.add(key);
          cluster.push(n);
          queue.push(n);
        }
      });
    }

    return cluster;
  };

  const dropOrphanBubbles = (state) => {
    const grid = state.grid;
    const connected = Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(false));
    const queue = [];

    // Top row connected anchors
    for (let c = 0; c < COLS_EVEN; c++) {
      if (grid[0][c]) {
        connected[0][c] = true;
        queue.push({ r: 0, c });
      }
    }

    // Flood fill connected set
    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const neighbors = getNeighbors(r, c);

      neighbors.forEach((n) => {
        if (grid[n.r][n.c] && !connected[n.r][n.c]) {
          connected[n.r][n.c] = true;
          queue.push(n);
        }
      });
    }

    // Identify Orphans & Convert to Free Falling Entities
    let orphansCount = 0;
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (grid[r][c] && !connected[r][c]) {
          const color = grid[r][c];
          const center = getBubbleCenter(r, c);
          grid[r][c] = null;
          orphansCount++;

          state.fallingBubbles.push({
            x: center.x,
            y: center.y,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * -3 - 2,
            color,
            alpha: 1
          });
        }
      }
    }

    return orphansCount;
  };

  const dropNewGridRow = (state) => {
    sound.playBubbleRowDrop();
    const grid = state.grid;

    // Shift rows down
    for (let r = MAX_ROWS - 1; r > 0; r--) {
      for (let c = 0; c < COLS_EVEN; c++) {
        grid[r][c] = grid[r - 1][c];
      }
    }

    // Generate brand new top row (row 0)
    const available = getAvailableColorsFromGrid(grid);
    for (let c = 0; c < COLS_EVEN; c++) {
      grid[0][c] = available[Math.floor(Math.random() * available.length)];
    }
  };

  const isBoardEmpty = (grid) => {
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (grid[r][c]) return false;
      }
    }
    return true;
  };

  const hasBubblesReachedDanger = (grid) => {
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (grid[r][c]) {
          const { y } = getBubbleCenter(r, c);
          if (y >= DANGER_Y) return true;
        }
      }
    }
    return false;
  };

  const triggerGameOver = () => {
    sound.playShake();
    setGameOver(true);
    gameStateRef.current.isShooting = false;
  };

  const triggerVictory = () => {
    sound.playSudokuSuccess();
    setVictory(true);
    gameStateRef.current.isShooting = false;
    if (isIntermission && onIntermissionComplete) {
      setTimeout(onIntermissionComplete, 1800);
    }
  };

  // --- PARTICLES & ANIMATION UPDATES ---
  const spawnBurstParticles = (state, x, y, colorKey) => {
    const palette = COLOR_PALETTES[colorKey];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette.top,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        radius: Math.random() * 4 + 2
      });
    }
  };

  const updateParticles = (state) => {
    state.particles.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15; // Gravity
      pt.life -= 0.03;
    });
    state.particles = state.particles.filter((pt) => pt.life > 0);
  };

  const drawParticles = (ctx, particles) => {
    particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
      ctx.restore();
    });
  };

  const updateFallingBubbles = (state) => {
    state.fallingBubbles.forEach((fb) => {
      fb.x += fb.vx;
      fb.y += fb.vy;
      fb.vy += 0.5; // Heavy gravity
      fb.alpha -= 0.015;
    });
    state.fallingBubbles = state.fallingBubbles.filter(
      (fb) => fb.y < CANVAS_HEIGHT + 40 && fb.alpha > 0
    );
  };

  const spawnFloatingText = (state, text, x, y, color = '#39FF14') => {
    state.floatingTexts.push({
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      alpha: 1,
      color
    });
  };

  const updateFloatingTexts = (state) => {
    state.floatingTexts.forEach((ft) => {
      ft.y -= 1.2;
      ft.alpha -= 0.02;
    });
    state.floatingTexts = state.floatingTexts.filter((ft) => ft.alpha > 0);
  };

  const drawFloatingTexts = (ctx, texts) => {
    texts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 18px Orbitron, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  };

  if (showStore) {
    return (
      <Boutique
        title="BOUTIQUE BUBBLE COOL"
        icon="🫧"
        categories={[
          {
            id: 'difficulty',
            name: 'Mode de Jeu',
            icon: '🎯',
            items: [
              { id: 'facile', name: 'Zen / Facile (Illimité)', icon: '🟢' },
              { id: 'normal', name: 'Normal (5 Essais)', icon: '🟡' },
              { id: 'expert', name: 'Expert (3 Essais)', icon: '🔴' }
            ]
          },
          {
            id: 'theme',
            name: 'Style de Bulles',
            icon: '🎨',
            items: [
              { id: 'candy', name: 'Bonbon Cristal', icon: '🍬' },
              { id: 'neon', name: 'Néon Cyber', icon: '⚡' },
              { id: 'gemstone', name: 'Gemmes Précieuses', icon: '💎' }
            ]
          }
        ]}
        currentSelections={{
          difficulty: activeDifficulty,
          theme: activeTheme
        }}
        onSelect={(catId, itemVal) => {
          setCustomizations((prev) => {
            const next = { ...prev, [catId]: itemVal };
            updateGameConfig('bubblecool', 'customizations', next);
            return next;
          });
        }}
        onClose={() => setShowStore(false)}
      />
    );
  }

  return (
    <>
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="BUBBLE COOL"
          icon="🫧"
          colors={['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']}
          particleType="bubbles"
          onComplete={() => setShowIntro(false)}
        />
      )}

      <div className="bubble-cool-container game-container" style={containerStyle}>
        {!isIntermission && (
          <GameHeader
            title="BUBBLE COOL"
            onBack={onBack}
            onRestart={initGame}
            showBgmToggle={true}
            bgmOn={bgmOn}
            onBgmToggle={() => setBgmOn(sound.toggleBGM())}
            onShop={() => setShowStore(true)}
            centerContent={
              <div style={{ display: 'flex', gap: '12px' }}>
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

        {/* Foul Indicator Meter */}
        <div style={foulMeterRowStyle}>
          {activeDifficulty === 'facile' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px' }}>🟢</span>
              <div style={{ ...foulLabelStyle, color: '#10B981' }}>MODE ZEN : SANS ERREURS</div>
            </div>
          ) : (
            <>
              <div style={foulLabelStyle}>ERRUERS TOLÉRÉES :</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: maxFouls || 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: idx < foulCounter ? '#38BDF8' : '#334155',
                      boxShadow: idx < foulCounter ? '0 0 8px #38BDF8' : 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <button onClick={handleSwapBubbles} className="retro-btn" style={swapBtnStyle}>
            🔄 Permuter
          </button>
        </div>

        {/* Canvas Screen */}
        <div style={canvasWrapperStyle}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onClick={handleShoot}
            style={canvasStyle}
          />

          {/* Game Over Overlay */}
          {gameOver && (
            <div style={overlayStyle}>
              <div style={titleStyle}>PARTIE TERMINÉE !</div>
              <div style={{ color: '#94a3b8', marginBottom: '16px' }}>
                Les bulles ont franchi la ligne d'alerte !
              </div>
              <div style={{ fontSize: '22px', color: '#38BDF8', fontWeight: 'bold', marginBottom: '20px' }}>
                Score: {score}
              </div>
              <button onClick={initGame} className="retro-btn pulse-glow" style={overlayBtnStyle}>
                Rejouer 🔄
              </button>
            </div>
          )}

          {/* Victory Overlay */}
          {victory && (
            <div style={overlayStyle}>
              <div style={{ ...titleStyle, color: '#38BDF8', textShadow: '0 0 12px #38BDF8' }}>
                VICTOIRE ECLATANTE !
              </div>
              <div style={{ color: '#94a3b8', marginBottom: '16px' }}>
                Vous avez entièrement vidé la grille !
              </div>
              <div style={{ fontSize: '22px', color: '#10B981', fontWeight: 'bold', marginBottom: '20px' }}>
                Score: {score}
              </div>
              <button onClick={initGame} className="retro-btn pulse-glow" style={overlayBtnStyle}>
                Prochain Niveau 🎮
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '460px',
  boxSizing: 'border-box',
  margin: '0 auto',
  padding: '12px',
  borderRadius: '20px',
  background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
  border: '2px solid rgba(56, 189, 248, 0.3)',
  boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
};

const statBoxStyle = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  padding: '4px 10px',
  textAlign: 'center'
};

const statLabelStyle = {
  fontSize: '10px',
  color: '#94a3b8',
  fontFamily: 'Orbitron, sans-serif',
  marginBottom: '2px'
};

const statValStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ffffff',
  fontFamily: 'Orbitron, sans-serif'
};

const foulMeterRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '12px',
  margin: '8px 0',
  border: '1px solid rgba(255,255,255,0.05)'
};

const foulLabelStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#94a3b8',
  fontFamily: 'Orbitron, sans-serif'
};

const swapBtnStyle = {
  padding: '4px 10px',
  fontSize: '11px',
  borderRadius: '8px',
  borderColor: '#38BDF8',
  color: '#38BDF8',
  background: 'rgba(56, 189, 248, 0.1)'
};

const canvasWrapperStyle = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '4px 0'
};

const canvasStyle = {
  width: '100%',
  maxWidth: '440px',
  height: 'auto',
  borderRadius: '16px',
  cursor: 'crosshair',
  touchAction: 'none'
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.94)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 30,
  padding: '20px',
  textAlign: 'center',
  backdropFilter: 'blur(6px)',
  borderRadius: '16px'
};

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '24px',
  color: '#EF4444',
  textShadow: '0 0 12px #EF4444',
  fontWeight: 'bold',
  marginBottom: '10px'
};

const overlayBtnStyle = {
  padding: '12px 24px',
  fontSize: '15px',
  border: '2px solid #38BDF8',
  background: 'transparent',
  color: '#38BDF8',
  cursor: 'pointer',
  borderRadius: '12px',
  fontFamily: 'Orbitron, sans-serif'
};
