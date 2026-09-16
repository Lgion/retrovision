import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import Boutique from '../components/Boutique';
import IntermissionHeader from '../components/IntermissionHeader';
import { isRandomThemeEnabled, pickRandomTheme } from '../utils/themeManager';
import { CHAPTERS, getChapter, calculateStars, SPECIAL_TYPES, generateDynamicChapterGrid } from './bubblecool/chapterData';

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
const MARGIN_LEFT = (CANVAS_WIDTH - (COLS_EVEN * BUBBLE_DIAMETER)) / 2; // 31px
const SHOOTER_X = CANVAS_WIDTH / 2;
const SHOOTER_Y = CANVAS_HEIGHT - 65;
const DANGER_Y = TOP_PADDING + (MAX_ROWS - 1) * ROW_HEIGHT + BUBBLE_RADIUS;

// Ball travel speed in pixels per second (fast, arcade, responsive)
const PROJECTILE_SPEED = 1650;

const COLOR_KEYS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink'];

const COLOR_PALETTES = {
  red: { main: '#EF4444', top: '#FCA5A5', shadow: '#991B1B', glow: 'rgba(239, 68, 68, 0.7)', symbol: '▲' },
  blue: { main: '#3B82F6', top: '#93C5FD', shadow: '#1E3A8A', glow: 'rgba(59, 130, 246, 0.7)', symbol: '◆' },
  green: { main: '#10B981', top: '#6EE7B7', shadow: '#065F46', glow: 'rgba(16, 185, 129, 0.7)', symbol: '●' },
  yellow: { main: '#F59E0B', top: '#FDE68A', shadow: '#92400E', glow: 'rgba(245, 158, 11, 0.7)', symbol: '★' },
  purple: { main: '#8B5CF6', top: '#C4B5FD', shadow: '#4C1D95', glow: 'rgba(139, 92, 246, 0.7)', symbol: '✦' },
  pink: { main: '#EC4899', top: '#FBCFE8', shadow: '#831843', glow: 'rgba(236, 72, 153, 0.7)', symbol: '♥' },
  // Special types palettes
  stone: { main: '#64748B', top: '#94A3B8', shadow: '#334155', glow: 'rgba(148, 163, 184, 0.4)', symbol: '🪨' },
  bomb: { main: '#1E293B', top: '#F97316', shadow: '#0F172A', glow: 'rgba(239, 68, 68, 0.9)', symbol: '💣' },
  rainbow: { main: '#EC4899', top: '#38BDF8', shadow: '#8B5CF6', glow: 'rgba(168, 85, 247, 0.9)', symbol: '🌈' },
  lightning: { main: '#FACC15', top: '#FEF08A', shadow: '#A16207', glow: 'rgba(250, 204, 21, 0.9)', symbol: '⚡' },
  ice: { main: '#7DD3FC', top: '#E0F2FE', shadow: '#0284C7', glow: 'rgba(56, 189, 248, 0.8)', symbol: '❄️' }
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

export default function BubbleCool({
  onBack,
  onScoreSave,
  isIntermission,
  intermissionDifficulty,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  skipIntro = false
}) {
  const [showIntro, setShowIntro] = useState(!skipIntro);
  const [showStore, setShowStore] = useState(false);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [showChapterIntroModal, setShowChapterIntroModal] = useState(false);
  const [showChapterVictoryModal, setShowChapterVictoryModal] = useState(false);
  const [victoryStars, setVictoryStars] = useState(1);

  // Rescue Power-ups
  const [bombsCount, setBombsCount] = useState(3);
  const [rainbowsCount, setRainbowsCount] = useState(2);
  const [lightningCount, setLightningCount] = useState(1);

  // Game Mode: 'chapter' or 'arcade'
  const [gameMode, setGameMode] = useState(() => {
    return isIntermission ? 'arcade' : getGameConfig('bubblecool', 'gameMode', 'chapter');
  });

  const [currentChapterId, setCurrentChapterId] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_bubblecool_last_ch') || '1', 10);
  });

  const [unlockedChapters, setUnlockedChapters] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_bubblecool_unlocked_ch') || '1', 10);
  });

  const [chapterStars, setChapterStars] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('retrovision_bubblecool_stars') || '{}');
    } catch {
      return {};
    }
  });

  const [chapterScores, setChapterScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('retrovision_bubblecool_ch_scores') || '{}');
    } catch {
      return {};
    }
  });

  const [customizations, setCustomizations] = useState(() => {
    const saved = getGameConfig('bubblecool', 'customizations', { theme: 'candy', difficulty: 'normal' });
    if (isRandomThemeEnabled('bubblecool')) {
      const randTheme = pickRandomTheme('bubblecool');
      return { ...saved, theme: randTheme };
    }
    return saved;
  });

  const activeTheme = isIntermission ? 'candy' : (customizations.theme || 'candy');
  const activeDifficulty = isIntermission ? 'normal' : (customizations.difficulty || 'normal');

  const activeChapter = getChapter(currentChapterId);

  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_bubblecool_highscore') || '0', 10);
  });
  const [foulCounter, setFoulCounter] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [swapUsed, setSwapUsed] = useState(0);
  const [shotsFired, setShotsFired] = useState(0);

  // References for Animation & Game Loop
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    grid: Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(null)),
    currentBubble: 'red',
    nextBubble: 'blue',
    aimAngle: -Math.PI / 2,
    projectile: null,
    fallingBubbles: [],
    particles: [],
    shockwaves: [],
    lightningBeams: [],
    floatingTexts: [],
    highlightedCluster: [],
    isShooting: false,
    comboCount: 0,
    consecutiveMisses: 0,
    recoil: 0,
    screenShake: 0
  });

  // Sound BGM state
  const [bgmOn, setBgmOn] = useState(false);

  // Initialize Game Board on Mode or Chapter change
  useEffect(() => {
    initGame();
  }, [gameMode, currentChapterId, activeDifficulty]);

  const getAvailableColorsFromGrid = (grid) => {
    const activeColors = new Set();
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        const item = grid[r][c];
        if (item && COLOR_KEYS.includes(item)) {
          activeColors.add(item);
        }
      }
    }
    if (activeColors.size > 0) return Array.from(activeColors);
    if (gameMode === 'chapter' && activeChapter.allowedColors) {
      return activeChapter.allowedColors;
    }
    return COLOR_KEYS;
  };

  const getRandomColor = (grid) => {
    const available = getAvailableColorsFromGrid(grid);
    return available[Math.floor(Math.random() * available.length)];
  };

  const initGame = () => {
    if (isRandomThemeEnabled('bubblecool')) {
      const randTheme = pickRandomTheme('bubblecool', customizations.theme);
      setCustomizations((prev) => {
        const next = { ...prev, theme: randTheme };
        updateGameConfig('bubblecool', 'customizations', next);
        return next;
      });
    }

    let newGrid = Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(null));

    if (gameMode === 'chapter' && !isIntermission) {
      // Generate Dynamic Procedural Chapter Layout (Anti-monotonie)
      newGrid = generateDynamicChapterGrid(currentChapterId, MAX_ROWS, COLS_EVEN, COLS_ODD);
    } else {
      // Arcade / Intermission Mode : 5 random rows
      const initialRows = 5;
      const colorsToUse = activeDifficulty === 'facile' ? COLOR_KEYS.slice(0, 4) : COLOR_KEYS;
      for (let r = 0; r < initialRows; r++) {
        const cols = getCols(r);
        for (let c = 0; c < cols; c++) {
          newGrid[r][c] = colorsToUse[Math.floor(Math.random() * colorsToUse.length)];
        }
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
      shockwaves: [],
      lightningBeams: [],
      floatingTexts: [],
      highlightedCluster: [],
      isShooting: false,
      comboCount: 0,
      consecutiveMisses: 0,
      recoil: 0,
      screenShake: 0
    };

    setScore(0);
    setShotsFired(0);
    setFoulCounter(5);
    setBombsCount(3);
    setRainbowsCount(2);
    setLightningCount(1);
    setGameOver(false);
    setVictory(false);
    setSwapUsed(0);
    setShowChapterVictoryModal(false);
  };

  const startChapter = (chapterId) => {
    setCurrentChapterId(chapterId);
    localStorage.setItem('retrovision_bubblecool_last_ch', chapterId.toString());
    setShowChapterSelect(false);
    setShowChapterIntroModal(true);
    initGame();
  };

  // Swap current and next bubble
  const handleSwapBubbles = () => {
    if (gameStateRef.current.isShooting || gameOver || victory) return;
    sound.playClick?.();
    const temp = gameStateRef.current.currentBubble;
    gameStateRef.current.currentBubble = gameStateRef.current.nextBubble;
    gameStateRef.current.nextBubble = temp;
    setSwapUsed((prev) => prev + 1);
  };

  // --- RESCUE POWER-UPS (ANTI-BLOCAGE) ---
  const handleUseBombPower = () => {
    if (bombsCount <= 0 || gameStateRef.current.isShooting || gameOver || victory) return;
    sound.playBubbleBomb?.();
    gameStateRef.current.currentBubble = 'bomb';
    setBombsCount((prev) => Math.max(0, prev - 1));
    spawnFloatingText(gameStateRef.current, '💣 SUPER BOMBE PRÊTE !', SHOOTER_X, SHOOTER_Y - 40, '#EF4444');
  };

  const handleUseRainbowPower = () => {
    if (rainbowsCount <= 0 || gameStateRef.current.isShooting || gameOver || victory) return;
    sound.playBubbleRainbow?.();
    gameStateRef.current.currentBubble = 'rainbow';
    setRainbowsCount((prev) => Math.max(0, prev - 1));
    spawnFloatingText(gameStateRef.current, '🌈 PRISME JOKER PRÊT !', SHOOTER_X, SHOOTER_Y - 40, '#A855F7');
  };

  const handleUseLightningPower = () => {
    if (lightningCount <= 0 || gameStateRef.current.isShooting || gameOver || victory) return;
    const state = gameStateRef.current;
    sound.playBubbleLaser?.();

    // Find lowest occupied row
    let lowestRow = -1;
    for (let r = MAX_ROWS - 1; r >= 0; r--) {
      if (state.grid[r].some(Boolean)) {
        lowestRow = r;
        break;
      }
    }

    if (lowestRow >= 0) {
      detonateLightning(state, lowestRow);
      dropOrphanBubbles(state);
      setLightningCount((prev) => Math.max(0, prev - 1));
      checkBoardStatus(state);
      spawnFloatingText(state, '⚡ RANGÉE DÉGAGÉE !', CANVAS_WIDTH / 2, getBubbleCenter(lowestRow, 0).y, '#FACC15');
    }
  };

  // --- RENDER & ANIMATION LOOP WITH DELTA-TIME (dt) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();

    const render = (currentTime) => {
      const now = currentTime || performance.now();
      const dt = Math.max(0.001, Math.min((now - lastTime) / 1000, 0.05));
      lastTime = now;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const state = gameStateRef.current;

      // Handle Screen Shake
      ctx.save();
      if (state.screenShake > 0) {
        const sx = (Math.random() - 0.5) * state.screenShake;
        const sy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(sx, sy);
        state.screenShake = Math.max(0, state.screenShake - 25 * dt);
      }

      // Update Recoil
      if (state.recoil > 0) {
        state.recoil = Math.max(0, state.recoil - 40 * dt);
      }

      // 1. Draw Background Grid & Board Outline
      drawBoardBackground(ctx);

      // 2. Draw Lightning Beam Effects (behind bubbles)
      updateAndDrawLightning(ctx, state, dt);

      // 3. Draw Grid Bubbles with pulse anticipation
      drawGridBubbles(ctx, state);

      // 4. Draw Danger Threshold Line
      drawDangerLine(ctx);

      // 5. Draw Shockwaves
      updateAndDrawShockwaves(ctx, state, dt);

      // 6. Draw Trajectory Aim Laser (if aiming)
      if (!state.isShooting && !gameOver && !victory) {
        drawAimTrajectory(ctx, state);
      }

      // 7. Update & Draw Active Projectile
      if (state.projectile) {
        updateProjectile(state, dt);
        if (state.projectile) {
          ctx.save();
          ctx.shadowColor = COLOR_PALETTES[state.projectile.color]?.glow || '#fff';
          ctx.shadowBlur = 10;
          drawBubble(ctx, state.projectile.x, state.projectile.y, state.projectile.color, 1);
          ctx.restore();
        }
      }

      // 8. Update & Draw Falling Free-Float Bubbles (Orphans)
      updateFallingBubbles(state, dt);
      state.fallingBubbles.forEach((fb) => {
        drawBubble(ctx, fb.x, fb.y, fb.color, fb.alpha, fb.rot || 0);
      });

      // 9. Update & Draw Particle Bursts
      updateParticles(state, dt);
      drawParticles(ctx, state.particles);

      // 10. Update & Draw Floating Scores
      updateFloatingTexts(state, dt);
      drawFloatingTexts(ctx, state.floatingTexts);

      // 11. Draw Cannon & Next Bubble Launcher
      drawLauncher(ctx, state);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeTheme, gameOver, victory, gameMode, currentChapterId]);

  // --- DRAWING FUNCTIONS (OPTIMIZED FOR 60-144 FPS) ---
  const drawBoardBackground = (ctx) => {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.6, '#020617');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameMode === 'chapter' && activeChapter.accentColor) {
      const centerGrad = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, 160, 20,
        CANVAS_WIDTH / 2, 160, 220
      );
      centerGrad.addColorStop(0, `${activeChapter.accentColor}25`);
      centerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = MARGIN_LEFT; x <= CANVAS_WIDTH - MARGIN_LEFT; x += BUBBLE_DIAMETER) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Wall borders
    const borderColor = gameMode === 'chapter' ? activeChapter.accentColor : '#38BDF8';
    ctx.strokeStyle = `${borderColor}40`;
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
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, DANGER_Y);
    ctx.lineTo(CANVAS_WIDTH - MARGIN_LEFT, DANGER_Y);
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.font = '900 12px Orbitron, sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText('LIGNE D\'ALERTE', MARGIN_LEFT + 4, DANGER_Y - 5);
    ctx.restore();
  };

  // Ultra-fast bubble rendering using radial gradients and glossy speculars (NO shadowBlur)
  const drawBubble = (ctx, x, y, colorKey, alpha = 1, rotation = 0, scale = 1, isTargetMatch = false) => {
    const palette = COLOR_PALETTES[colorKey] || COLOR_PALETTES.red;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);
    if (scale !== 1) ctx.scale(scale, scale);

    const r = BUBBLE_RADIUS;

    // Anticipation Pulse Outer Halo (zero lag)
    if (isTargetMatch) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = palette.glow;
      ctx.fill();
      ctx.strokeStyle = palette.top || '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // SPECIAL BUBBLE RENDERING
    if (colorKey === 'stone') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const stoneGrad = ctx.createRadialGradient(-5, -6, 2, 0, 0, r);
      stoneGrad.addColorStop(0, '#94A3B8');
      stoneGrad.addColorStop(0.6, '#475569');
      stoneGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = stoneGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-2, 2);
      ctx.lineTo(6, -2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (colorKey === 'bomb') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const bombGrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, r);
      bombGrad.addColorStop(0, '#64748B');
      bombGrad.addColorStop(0.5, '#1E293B');
      bombGrad.addColorStop(1, '#050811');
      ctx.fillStyle = bombGrad;
      ctx.fill();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', 0, 1);

      const sparkSize = 2 + Math.random() * 2.5;
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(8, -10, sparkSize, 0, Math.PI * 2);
      ctx.fill();

    } else if (colorKey === 'rainbow') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const rainbowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
      rainbowGrad.addColorStop(0, '#FFFFFF');
      rainbowGrad.addColorStop(0.3, '#38BDF8');
      rainbowGrad.addColorStop(0.6, '#A855F7');
      rainbowGrad.addColorStop(0.85, '#EC4899');
      rainbowGrad.addColorStop(1, '#EAB308');
      ctx.fillStyle = rainbowGrad;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌈', 0, 1);

    } else if (colorKey === 'lightning') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const lightGrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, r);
      lightGrad.addColorStop(0, '#FEF08A');
      lightGrad.addColorStop(0.5, '#EAB308');
      lightGrad.addColorStop(1, '#854D0E');
      ctx.fillStyle = lightGrad;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 1);

    } else if (colorKey === 'ice') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const iceGrad = ctx.createRadialGradient(-5, -6, 3, 0, 0, r);
      iceGrad.addColorStop(0, '#E0F2FE');
      iceGrad.addColorStop(0.6, '#38BDF8');
      iceGrad.addColorStop(1, '#0369A1');
      ctx.fillStyle = iceGrad;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❄️', 0, 1);

    } else {
      // STANDARD COLOR BUBBLES
      if (activeTheme === 'neon') {
        ctx.beginPath();
        ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fill();

        ctx.strokeStyle = palette.main;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = palette.top;
        ctx.fill();

      } else if (activeTheme === 'gemstone') {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-6, -6, 2, 0, 0, r);
        grad.addColorStop(0, palette.top);
        grad.addColorStop(0.6, palette.main);
        grad.addColorStop(1, palette.shadow);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-5, -12);
        ctx.lineTo(5, -12);
        ctx.lineTo(10, -5);
        ctx.lineTo(-10, -5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

      } else {
        const grad = ctx.createRadialGradient(-5, -6, 3, 0, 0, r);
        grad.addColorStop(0, palette.top);
        grad.addColorStop(0.5, palette.main);
        grad.addColorStop(1, palette.shadow);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(-5, -7, r * 0.4, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (palette.symbol) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(palette.symbol, 0, 1);
      }
    }

    ctx.restore();
  };

  const drawGridBubbles = (ctx, state) => {
    const pulseScale = 1 + Math.sin(Date.now() / 140) * 0.08;

    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = getCols(r);
      for (let c = 0; c < cols; c++) {
        const color = state.grid[r][c];
        if (color) {
          const { x, y } = getBubbleCenter(r, c);
          const isTargetMatch = state.highlightedCluster.includes(`${r},${c}`);
          const scale = isTargetMatch ? pulseScale : 1;
          drawBubble(ctx, x, y, color, 1, 0, scale, isTargetMatch);
        }
      }
    }
  };

  const drawAimTrajectory = (ctx, state) => {
    let currX = SHOOTER_X;
    let currY = SHOOTER_Y;
    let dx = Math.cos(state.aimAngle);
    let dy = Math.sin(state.aimAngle);

    const minX = MARGIN_LEFT + BUBBLE_RADIUS;
    const maxX = CANVAS_WIDTH - MARGIN_LEFT - BUBBLE_RADIUS;
    const stepSize = 6;
    const pathPoints = [{ x: currX, y: currY }];

    let collided = false;
    let targetCell = null;

    for (let step = 0; step < 160 && !collided; step++) {
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
        targetCell = findClosestEmptyCell(currX, currY, state.grid);
        break;
      }

      // Grid Bubble Collision
      for (let r = 0; r < MAX_ROWS && !collided; r++) {
        for (let c = 0; c < getCols(r); c++) {
          if (state.grid[r][c]) {
            const center = getBubbleCenter(r, c);
            const dist = Math.hypot(currX - center.x, currY - center.y);
            if (dist <= BUBBLE_DIAMETER - 2) {
              collided = true;
              pathPoints.push({ x: currX, y: currY });
              targetCell = findClosestEmptyCell(currX, currY, state.grid);
              break;
            }
          }
        }
      }
    }

    if (!collided) {
      pathPoints.push({ x: currX, y: currY });
    }

    // Predict & Highlight matching clusters (Magnetic Anticipation)
    if (targetCell) {
      const predMatches = predictMatches(targetCell.r, targetCell.c, state.currentBubble, state.grid);
      state.highlightedCluster = predMatches.map((n) => `${n.r},${n.c}`);
    } else {
      state.highlightedCluster = [];
    }

    // Draw Laser Trajectory
    const palette = COLOR_PALETTES[state.currentBubble] || COLOR_PALETTES.red;
    ctx.save();
    ctx.strokeStyle = palette.top || '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 9]);
    ctx.lineDashOffset = -(Date.now() / 25) % 16;

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
      ctx.strokeStyle = palette.top || '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();

      ctx.fillStyle = palette.glow || 'rgba(255,255,255,0.3)';
      ctx.fill();
    }

    ctx.restore();
  };

  const drawLauncher = (ctx, state) => {
    ctx.save();

    // Base Turret Stand
    ctx.translate(SHOOTER_X, SHOOTER_Y);

    // Dynamic Cannon Barrel with Recoil
    ctx.save();
    ctx.rotate(state.aimAngle + Math.PI / 2);
    const recoilOffset = state.recoil || 0;
    ctx.translate(0, recoilOffset);

    // Cannon Barrel
    const barrelGrad = ctx.createLinearGradient(-14, 0, 14, 0);
    barrelGrad.addColorStop(0, '#1E293B');
    barrelGrad.addColorStop(0.5, '#475569');
    barrelGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-13, -48, 26, 48);
    ctx.fill();
    ctx.stroke();

    // Golden nozzle rings
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-14, -50, 28, 4);

    ctx.restore();

    // Outer Cannon Stand Base
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = gameMode === 'chapter' ? activeChapter.accentColor : '#38BDF8';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Ready Current Bubble in Cannon
    drawBubble(ctx, SHOOTER_X, SHOOTER_Y, state.currentBubble, 1);

    // Draw Next Bubble Stand (Bottom Left)
    const nextX = SHOOTER_X - 74;
    const nextY = SHOOTER_Y + 10;

    ctx.save();
    ctx.beginPath();
    ctx.arc(nextX, nextY, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawBubble(ctx, nextX, nextY, state.nextBubble, 0.9);

    // Text Label NEXT
    ctx.save();
    ctx.font = '900 12px Orbitron, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.fillText('SUIVANT', nextX, nextY + 34);
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

    let angle = Math.atan2(y - SHOOTER_Y, x - SHOOTER_X);
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

    sound.playBubbleShoot?.();

    state.recoil = 14;

    const vx = Math.cos(state.aimAngle) * PROJECTILE_SPEED;
    const vy = Math.sin(state.aimAngle) * PROJECTILE_SPEED;

    state.projectile = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx,
      vy,
      color: state.currentBubble
    };

    state.isShooting = true;
    setShotsFired((prev) => prev + 1);
  };

  // Ultra-precise sub-stepped projectile update using delta-time
  const updateProjectile = (state, dt) => {
    const p = state.projectile;
    if (!p) return;

    const minX = MARGIN_LEFT + BUBBLE_RADIUS;
    const maxX = CANVAS_WIDTH - MARGIN_LEFT - BUBBLE_RADIUS;

    const steps = 4;
    const subDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      if (!state.projectile) break;

      p.x += p.vx * subDt;
      p.y += p.vy * subDt;

      // Bounce on walls
      if (p.x <= minX) {
        p.x = minX;
        p.vx = Math.abs(p.vx);
        sound.playBubbleBounce?.();
      } else if (p.x >= maxX) {
        p.x = maxX;
        p.vx = -Math.abs(p.vx);
        sound.playBubbleBounce?.();
      }

      // Ceiling Collision
      if (p.y <= TOP_PADDING + BUBBLE_RADIUS) {
        p.y = TOP_PADDING + BUBBLE_RADIUS;
        snapProjectile(state);
        return;
      }

      // Grid Bubble Collision
      let collided = false;
      for (let r = 0; r < MAX_ROWS && !collided; r++) {
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

  // Fast direct match predictor without array cloning
  const predictMatches = (targetR, targetC, projectileColor, grid) => {
    if (projectileColor === 'bomb') {
      const neighbors = [];
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < getCols(r); c++) {
          if (grid[r][c]) {
            const dist = Math.abs(r - targetR) + Math.abs(c - targetC);
            if (dist <= 2) neighbors.push({ r, c });
          }
        }
      }
      return neighbors;
    }

    if (projectileColor === 'lightning') {
      const rowMatches = [];
      for (let c = 0; c < getCols(targetR); c++) {
        if (grid[targetR][c]) rowMatches.push({ r: targetR, c });
      }
      return rowMatches;
    }

    const neighbors = getNeighbors(targetR, targetC);
    let targetColor = projectileColor;
    if (projectileColor === 'rainbow') {
      const coloredNb = neighbors.find((n) => grid[n.r][n.c] && COLOR_KEYS.includes(grid[n.r][n.c]));
      if (coloredNb) targetColor = grid[coloredNb.r][coloredNb.c];
    }

    const hasMatchingNeighbor = neighbors.some(
      (n) => grid[n.r][n.c] === targetColor || grid[n.r][n.c] === 'rainbow'
    );
    if (!hasMatchingNeighbor) return [];

    grid[targetR][targetC] = projectileColor;
    const matches = findConnectedCluster(targetR, targetC, targetColor, grid);
    grid[targetR][targetC] = null; // revert immediately

    return matches.length >= 3 ? matches : [];
  };

  const snapProjectile = (state) => {
    const p = state.projectile;
    if (!p) return;

    const cell = findClosestEmptyCell(p.x, p.y, state.grid);
    state.projectile = null;

    if (!cell) {
      triggerGameOver();
      return;
    }

    const targetR = cell.r;
    const targetC = cell.c;
    state.grid[targetR][targetC] = p.color;

    // Check for SPECIAL BUBBLE ACTIVATION
    // 1. BOMBS: Did we hit or shoot a bomb?
    const adjacentBombs = [];
    if (p.color === 'bomb') {
      adjacentBombs.push({ r: targetR, c: targetC });
    } else {
      getNeighbors(targetR, targetC).forEach((n) => {
        if (state.grid[n.r][n.c] === 'bomb') adjacentBombs.push(n);
      });
    }

    if (adjacentBombs.length > 0) {
      sound.playBubbleBomb?.();
      state.screenShake = 16;
      state.consecutiveMisses = 0;

      adjacentBombs.forEach((b) => {
        detonateBomb(state, b.r, b.c);
      });

      dropOrphanBubbles(state);
      checkBoardStatus(state);
      prepareNextTurn(state);
      return;
    }

    // 2. LIGHTNING: Did we hit or shoot a lightning bubble?
    const adjacentLightning = [];
    if (p.color === 'lightning') {
      adjacentLightning.push({ r: targetR, c: targetC });
    } else {
      getNeighbors(targetR, targetC).forEach((n) => {
        if (state.grid[n.r][n.c] === 'lightning') adjacentLightning.push(n);
      });
    }

    if (adjacentLightning.length > 0) {
      sound.playBubbleLaser?.();
      state.screenShake = 10;
      state.consecutiveMisses = 0;

      adjacentLightning.forEach((l) => {
        detonateLightning(state, l.r);
      });

      dropOrphanBubbles(state);
      checkBoardStatus(state);
      prepareNextTurn(state);
      return;
    }

    // 3. COLOR MATCHING (with Rainbow support)
    let effectiveColor = p.color;
    if (p.color === 'rainbow') {
      sound.playBubbleRainbow?.();
      const nbs = getNeighbors(targetR, targetC);
      const coloredNb = nbs.find((n) => state.grid[n.r][n.c] && COLOR_KEYS.includes(state.grid[n.r][n.c]));
      if (coloredNb) {
        effectiveColor = state.grid[coloredNb.r][coloredNb.c];
        state.grid[targetR][targetC] = effectiveColor;
      }
    }

    const matches = findConnectedCluster(targetR, targetC, effectiveColor, state.grid);

    if (matches.length >= 3) {
      // POP MATCHES
      state.comboCount++;
      state.consecutiveMisses = 0;
      sound.playBubblePop?.(state.comboCount);

      const points = matches.length * 100 * state.comboCount;
      const popCenter = getBubbleCenter(targetR, targetC);

      // Reward bonus power-up on combos
      if (state.comboCount >= 2) {
        setBombsCount((b) => Math.min(5, b + 1));
        spawnFloatingText(state, '+1 BOMBE BONUS ! 💣', popCenter.x, popCenter.y - 20, '#F59E0B');
      }

      // Spawn shockwave ring
      state.shockwaves.push({
        x: popCenter.x,
        y: popCenter.y,
        r: 6,
        maxR: 50 + matches.length * 5,
        alpha: 1,
        color: COLOR_PALETTES[effectiveColor]?.top || '#fff'
      });

      spawnFloatingText(
        state,
        state.comboCount > 1 ? `COMBO x${state.comboCount}! +${points}` : `+${points}`,
        popCenter.x,
        popCenter.y,
        COLOR_PALETTES[effectiveColor]?.top || '#39FF14'
      );

      // Break adjacent ICE bubbles
      const adjacentIce = new Set();
      matches.forEach(({ r, c }) => {
        getNeighbors(r, c).forEach((n) => {
          if (state.grid[n.r][n.c] === 'ice') {
            adjacentIce.add(`${n.r},${n.c}`);
          }
        });
      });

      if (adjacentIce.size > 0) {
        sound.playBubbleIceBreak?.();
        adjacentIce.forEach((key) => {
          const [ir, ic] = key.split(',').map(Number);
          state.grid[ir][ic] = null;
          const center = getBubbleCenter(ir, ic);
          spawnBurstParticles(state, center.x, center.y, 'ice');
          spawnFloatingText(state, '❄️ DÉGEL! +300', center.x, center.y, '#38BDF8');
        });
      }

      matches.forEach(({ r, c }) => {
        const center = getBubbleCenter(r, c);
        spawnBurstParticles(state, center.x, center.y, effectiveColor);
        state.grid[r][c] = null;
      });

      addScore(points);

      // Drop Orphans
      const orphanCount = dropOrphanBubbles(state);
      if (orphanCount > 0) {
        sound.playBubbleDrop?.();
        const orphanPoints = orphanCount * 250;
        spawnFloatingText(state, `CHUTE! +${orphanPoints}`, popCenter.x, popCenter.y + 24, '#FBBF24');
        addScore(orphanPoints);
      }

      checkBoardStatus(state);

    } else {
      // MISSED MATCH -> Aucune punition en mode Chapitres !
      state.comboCount = 0;
      state.consecutiveMisses = (state.consecutiveMisses || 0) + 1;
      sound.playClick?.();

      // En mode arcade uniquement : gestion des fautes
      if (gameMode === 'arcade') {
        setFoulCounter((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            dropNewGridRow(state);
            return 5;
          }
          return next;
        });
      }
    }

    // Check Defeat Condition
    if (hasBubblesReachedDanger(state.grid)) {
      triggerGameOver();
      return;
    }

    prepareNextTurn(state);
  };

  // Bomb detonation helper
  const detonateBomb = (state, bombR, bombC) => {
    state.grid[bombR][bombC] = null;
    const bombCenter = getBubbleCenter(bombR, bombC);

    state.shockwaves.push({
      x: bombCenter.x,
      y: bombCenter.y,
      r: 10,
      maxR: 90,
      alpha: 1,
      color: '#F97316'
    });

    spawnBurstParticles(state, bombCenter.x, bombCenter.y, 'bomb');
    spawnFloatingText(state, '💥 BOOM! +1500', bombCenter.x, bombCenter.y, '#F97316');
    addScore(1500);

    // Destroy all bubbles within radius 2
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getCols(r); c++) {
        if (state.grid[r][c]) {
          const center = getBubbleCenter(r, c);
          const dist = Math.hypot(center.x - bombCenter.x, center.y - bombCenter.y);
          if (dist <= BUBBLE_DIAMETER * 2.2) {
            const victimColor = state.grid[r][c];
            state.grid[r][c] = null;
            spawnBurstParticles(state, center.x, center.y, victimColor);
          }
        }
      }
    }
  };

  // Lightning detonation helper
  const detonateLightning = (state, row) => {
    const center = getBubbleCenter(row, 0);
    state.lightningBeams.push({
      y: center.y,
      life: 1,
      color: '#FACC15'
    });

    spawnFloatingText(state, '⚡ FOUDRE! +2000', CANVAS_WIDTH / 2, center.y, '#FACC15');
    addScore(2000);

    for (let c = 0; c < getCols(row); c++) {
      if (state.grid[row][c]) {
        const victimColor = state.grid[row][c];
        const bc = getBubbleCenter(row, c);
        state.grid[row][c] = null;
        spawnBurstParticles(state, bc.x, bc.y, victimColor);
      }
    }
  };

  const prepareNextTurn = (state) => {
    state.currentBubble = state.nextBubble;

    // Coup de pouce amical : Si le joueur rate 2 tirs d'affilée en mode Chapitre,
    // on lui charge automatiquement une bombe ou un prisme pour le débloquer !
    if (gameMode === 'chapter' && state.consecutiveMisses >= 2) {
      state.nextBubble = Math.random() < 0.6 ? 'bomb' : 'rainbow';
      state.consecutiveMisses = 0;
      spawnFloatingText(state, 'Coup de Pouce ! 💣', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 120, '#F59E0B');
    } else {
      state.nextBubble = getRandomColor(state.grid);
    }

    state.isShooting = false;
  };

  const addScore = (points) => {
    setScore((prev) => {
      const newScore = prev + points;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('retrovision_bubblecool_highscore', newScore.toString());
        if (onScoreSave) onScoreSave('Bubble Cool', newScore);
      }
      return newScore;
    });
  };

  const checkBoardStatus = (state) => {
    const hasRemainingColorBubbles = state.grid.some((row) =>
      row.some((b) => b && COLOR_KEYS.includes(b))
    );

    if (!hasRemainingColorBubbles || isBoardEmpty(state.grid)) {
      triggerVictory();
    }
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
        if (!visited.has(key)) {
          const neighborVal = grid[n.r][n.c];
          if (neighborVal === targetColor || neighborVal === 'rainbow') {
            visited.add(key);
            cluster.push(n);
            queue.push(n);
          }
        }
      });
    }

    return cluster;
  };

  const dropOrphanBubbles = (state) => {
    const grid = state.grid;
    const connected = Array.from({ length: MAX_ROWS }, () => Array(COLS_EVEN).fill(false));
    const queue = [];

    for (let c = 0; c < COLS_EVEN; c++) {
      if (grid[0][c]) {
        connected[0][c] = true;
        queue.push({ r: 0, c });
      }
    }

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
            alpha: 1,
            rot: 0,
            rotSpeed: (Math.random() - 0.5) * 0.1
          });
        }
      }
    }

    return orphansCount;
  };

  const dropNewGridRow = (state) => {
    if (typeof sound.playBubbleRowDrop === 'function') {
      sound.playBubbleRowDrop();
    } else {
      sound.playShake?.();
    }

    state.screenShake = 6;
    const grid = state.grid;

    for (let r = MAX_ROWS - 1; r > 0; r--) {
      for (let c = 0; c < COLS_EVEN; c++) {
        grid[r][c] = grid[r - 1][c];
      }
    }

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
    sound.playShake?.();
    setGameOver(true);
    gameStateRef.current.isShooting = false;
  };

  const triggerVictory = () => {
    setVictory(true);
    gameStateRef.current.isShooting = false;

    if (gameMode === 'chapter' && !isIntermission) {
      const stars = calculateStars(currentChapterId, score);
      setVictoryStars(stars);
      sound.playChapterVictory?.();

      const nextUnlocked = Math.min(10, Math.max(unlockedChapters, currentChapterId + 1));
      setUnlockedChapters(nextUnlocked);
      localStorage.setItem('retrovision_bubblecool_unlocked_ch', nextUnlocked.toString());

      setChapterStars((prev) => {
        const next = { ...prev, [currentChapterId]: Math.max(prev[currentChapterId] || 0, stars) };
        localStorage.setItem('retrovision_bubblecool_stars', JSON.stringify(next));
        return next;
      });

      setChapterScores((prev) => {
        const next = { ...prev, [currentChapterId]: Math.max(prev[currentChapterId] || 0, score) };
        localStorage.setItem('retrovision_bubblecool_ch_scores', JSON.stringify(next));
        return next;
      });

      setShowChapterVictoryModal(true);

    } else {
      sound.playSudokuSuccess?.();
      if (isIntermission && onIntermissionComplete) {
        if (replaySameIntermission) {
          if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
          setTimeout(initGame, 1800);
        } else {
          setTimeout(onIntermissionComplete, 1800);
        }
      }
    }
  };

  // --- PARTICLES, SHOCKWAVES & FX WITH DELTA-TIME (dt) ---
  const spawnBurstParticles = (state, x, y, colorKey) => {
    const palette = COLOR_PALETTES[colorKey] || COLOR_PALETTES.red;
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette.top || '#fff',
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        radius: Math.random() * 4 + 2
      });
    }
  };

  const updateParticles = (state, dt) => {
    const gravity = 600;
    state.particles.forEach((pt) => {
      pt.x += pt.vx * dt * 60;
      pt.vy += gravity * dt;
      pt.y += pt.vy * dt;
      pt.life -= 1.8 * dt;
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

  const updateAndDrawShockwaves = (ctx, state, dt) => {
    state.shockwaves.forEach((sw) => {
      sw.r += 240 * dt;
      sw.alpha -= 3.0 * dt;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });
    state.shockwaves = state.shockwaves.filter((sw) => sw.alpha > 0);
  };

  const updateAndDrawLightning = (ctx, state, dt) => {
    state.lightningBeams.forEach((lb) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, lb.life);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.fillRect(0, lb.y - 12, CANVAS_WIDTH, 24);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, lb.y);
      for (let x = 0; x <= CANVAS_WIDTH; x += 30) {
        ctx.lineTo(x, lb.y + (Math.random() - 0.5) * 14);
      }
      ctx.stroke();
      ctx.restore();

      lb.life -= 4.0 * dt;
    });
    state.lightningBeams = state.lightningBeams.filter((lb) => lb.life > 0);
  };

  const updateFallingBubbles = (state, dt) => {
    const gravity = 1800;
    state.fallingBubbles.forEach((fb) => {
      fb.x += fb.vx * dt * 60;
      fb.vy += gravity * dt;
      fb.y += fb.vy * dt;
      fb.rot = (fb.rot || 0) + (fb.rotSpeed || 0.05) * dt * 60;
      fb.alpha -= 1.0 * dt;
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

  const updateFloatingTexts = (state, dt) => {
    state.floatingTexts.forEach((ft) => {
      ft.y -= 75 * dt;
      ft.alpha -= 1.2 * dt;
    });
    state.floatingTexts = state.floatingTexts.filter((ft) => ft.alpha > 0);
  };

  const drawFloatingTexts = (ctx, texts) => {
    texts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '900 20px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  };

  // --- BOUTIQUE / CUSTOMIZATION MODAL ---
  if (showStore) {
    return (
      <Boutique
        title="BOUTIQUE BUBBLE COOL"
        icon="🫧"
        categories={[
          {
            id: 'difficulty',
            name: 'Mode de Jeu Arcade',
            icon: '🎯',
            items: [
              { id: 'facile', name: 'Zen (Illimité)', icon: '🟢' },
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
              { id: 'gemstone', name: 'Gemmes Royales', icon: '💎' }
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

  const totalStarsEarned = Object.values(chapterStars).reduce((acc, s) => acc + s, 0);

  return (
    <>
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="BUBBLE COOL"
          icon="🫧"
          colors={['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']}
          particleType="bubbles"
          onComplete={(isRandomTheme) => {
            setShowIntro(false);
            if (isRandomTheme || isRandomThemeEnabled('bubblecool')) {
              const randTheme = pickRandomTheme('bubblecool', customizations.theme);
              setCustomizations((prev) => {
                const next = { ...prev, theme: randTheme };
                updateGameConfig('bubblecool', 'customizations', next);
                return next;
              });
            }
          }}
        />
      )}

      {/* CHAPTER INTRO OVERLAY */}
      {showChapterIntroModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: '38px', marginBottom: '8px' }}>{activeChapter.icon}</div>
            <div style={{ fontSize: '12px', color: activeChapter.accentColor, fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold' }}>
              CHAPITRE {activeChapter.id} / 10 • {activeChapter.difficultyText.toUpperCase()}
            </div>
            <h2 style={{ fontSize: '22px', margin: '6px 0 12px', color: '#fff', fontFamily: 'Orbitron, sans-serif' }}>
              {activeChapter.title}
            </h2>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '14px', lineHeight: '1.4' }}>
              {activeChapter.description}
            </div>
            <div style={tipBoxStyle}>
              💡 <span style={{ color: '#FDE047', fontWeight: 'bold' }}>Astuce :</span> {activeChapter.hint}
            </div>
            <button
              onClick={() => setShowChapterIntroModal(false)}
              className="retro-btn pulse-glow"
              style={{ ...overlayBtnStyle, borderColor: activeChapter.accentColor, color: activeChapter.accentColor, width: '100%', marginTop: '16px' }}
            >
              Lancer le Chapitre 🚀
            </button>
          </div>
        </div>
      )}

      {/* CHAPTER VICTORY MODAL */}
      {showChapterVictoryModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: '20px', color: '#10B981', fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold', marginBottom: '6px' }}>
              CHAPITRE RÉUSSI !
            </div>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold', marginBottom: '14px' }}>
              {activeChapter.title}
            </div>

            {/* Stars Animation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '14px 0 20px' }}>
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  style={{
                    fontSize: '42px',
                    filter: starIdx <= victoryStars ? 'drop-shadow(0 0 12px #FACC15)' : 'grayscale(1)',
                    transform: starIdx <= victoryStars ? 'scale(1.15)' : 'scale(0.9)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  ⭐
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>SCORE FINAL</div>
              <div style={{ fontSize: '24px', color: '#38BDF8', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>
                {score}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Tirs effectués : {shotsFired}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {currentChapterId < 10 && (
                <button
                  onClick={() => {
                    setShowChapterVictoryModal(false);
                    startChapter(currentChapterId + 1);
                  }}
                  className="retro-btn pulse-glow"
                  style={{ ...overlayBtnStyle, borderColor: '#10B981', color: '#10B981', width: '100%' }}
                >
                  Chapitre Suivant 🚀
                </button>
              )}
              <button
                onClick={() => {
                  setShowChapterVictoryModal(false);
                  initGame();
                }}
                className="retro-btn"
                style={{ ...overlayBtnStyle, borderColor: '#38BDF8', color: '#38BDF8', width: '100%' }}
              >
                Rejouer ce Chapitre 🔄
              </button>
              <button
                onClick={() => {
                  setShowChapterVictoryModal(false);
                  setShowChapterSelect(true);
                }}
                className="retro-btn"
                style={{ ...overlayBtnStyle, borderColor: '#94a3b8', color: '#94a3b8', width: '100%' }}
              >
                Carte des Chapitres 🗺️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER SELECT MAP MODAL */}
      {showChapterSelect && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalCardStyle, maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', fontSize: '18px', color: '#38BDF8' }}>
                  LES 10 CHAPITRES
                </h3>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Étoiles : ⭐ {totalStarsEarned} / 30
                </div>
              </div>
              <button
                onClick={() => setShowChapterSelect(false)}
                className="retro-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                ✕ Fermer
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '16px' }}>
              <button
                onClick={() => {
                  setGameMode('chapter');
                  updateGameConfig('bubblecool', 'gameMode', 'chapter');
                }}
                className="retro-btn"
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '11px',
                  borderColor: gameMode === 'chapter' ? '#38BDF8' : 'rgba(255,255,255,0.1)',
                  background: gameMode === 'chapter' ? 'rgba(56,189,248,0.2)' : 'transparent',
                  color: gameMode === 'chapter' ? '#38BDF8' : '#94a3b8'
                }}
              >
                Aventure (10 Chapitres)
              </button>
              <button
                onClick={() => {
                  setGameMode('arcade');
                  updateGameConfig('bubblecool', 'gameMode', 'arcade');
                  setShowChapterSelect(false);
                  initGame();
                }}
                className="retro-btn"
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '11px',
                  borderColor: gameMode === 'arcade' ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                  background: gameMode === 'arcade' ? 'rgba(245,158,11,0.2)' : 'transparent',
                  color: gameMode === 'arcade' ? '#F59E0B' : '#94a3b8'
                }}
              >
                Arcade (Infini)
              </button>
            </div>

            {/* 10 Chapters List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {CHAPTERS.map((ch) => {
                const isUnlocked = ch.id <= unlockedChapters;
                const stars = chapterStars[ch.id] || 0;
                const bestSc = chapterScores[ch.id] || 0;
                const isCurrent = ch.id === currentChapterId;

                return (
                  <div
                    key={ch.id}
                    onClick={() => isUnlocked && startChapter(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '12px',
                      background: isCurrent ? `${ch.accentColor}25` : 'rgba(15,23,42,0.6)',
                      border: `1.5px solid ${isCurrent ? ch.accentColor : isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      opacity: isUnlocked ? 1 : 0.45,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '28px', marginRight: '12px' }}>{ch.icon}</div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: ch.accentColor, fontFamily: 'Orbitron, sans-serif', fontWeight: 'bold' }}>
                          CH. {ch.id}
                        </span>
                        <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>
                          {ch.difficultyText}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                        {ch.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ch.subtitle}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {isUnlocked ? (
                        <>
                          <div style={{ fontSize: '14px' }}>
                            {'⭐'.repeat(stars) + '☆'.repeat(3 - stars)}
                          </div>
                          {bestSc > 0 && (
                            <div style={{ fontSize: '10px', color: '#38BDF8', fontFamily: 'Orbitron, sans-serif', marginTop: '2px' }}>
                              {bestSc} pts
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ fontSize: '18px' }}>🔒</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bubble-cool-container game-container" style={containerStyle}>
        {!isIntermission && (
          <div style={compactHeaderStyle}>
            {/* Top row: Back button, Chapter Selector pill, and sleek action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
              <button
                onClick={onBack}
                className="retro-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                ← Retour
              </button>

              <button
                onClick={() => setShowChapterSelect(true)}
                className="retro-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  borderRadius: '10px',
                  background: gameMode === 'chapter' ? `${activeChapter.accentColor}25` : 'rgba(56, 189, 248, 0.15)',
                  border: `1.5px solid ${gameMode === 'chapter' ? activeChapter.accentColor : '#38BDF8'}`,
                  color: gameMode === 'chapter' ? activeChapter.accentColor : '#38BDF8',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, sans-serif'
                }}
                title="Changer de chapitre"
              >
                <span>{gameMode === 'chapter' ? activeChapter.icon : '🎮'}</span>
                <span>{gameMode === 'chapter' ? `CH. ${activeChapter.id}` : 'ARCADE'}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>▾</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setBgmOn(sound.toggleBGM?.())}
                  className="retro-btn"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    background: bgmOn ? 'rgba(168, 85, 247, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    border: `1px solid ${bgmOn ? '#A855F7' : '#64748B'}`,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  title={bgmOn ? 'Musique active' : 'Musique muette'}
                >
                  {bgmOn ? '🎵' : '🔇'}
                </button>

                {/* Random theme change button - IF AND ONLY IF random theme mode is enabled */}
                {isRandomThemeEnabled('bubblecool') && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      const randTheme = pickRandomTheme('bubblecool', customizations.theme);
                      setCustomizations(prev => ({ ...prev, theme: randTheme }));
                      updateGameConfig('bubblecool', 'theme', randTheme);
                      sound.playPowerup?.();
                    }}
                    className="retro-btn"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      background: 'rgba(56, 189, 248, 0.25)',
                      border: '1px solid #38BDF8',
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
                    }}
                    title="Changer de thème (Thème aléatoire actif)"
                  >
                    🎨
                  </button>
                )}

                <button
                  onClick={() => setShowStore(true)}
                  className="retro-btn"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid #F59E0B',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  title="Boutique"
                >
                  🛍️
                </button>

                <button
                  onClick={initGame}
                  className="retro-btn"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid #38BDF8',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                  title="Recommencer la partie"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Bottom row: High-contrast Score and Record */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>SCORE</div>
                <div style={statValStyle}>{score}</div>
              </div>
              <div style={statBoxStyle}>
                <div style={statLabelStyle}>MEILLEUR RECORD</div>
                <div style={statValStyle}>{highScore}</div>
              </div>
            </div>
          </div>
        )}

        {isIntermission && (() => {
          const totalBubbles = 40;
          const remaining = gameStateRef.current ? gameStateRef.current.grid.flat().filter(Boolean).length : 0;
          const bcProgress = victory ? 1.0 : Math.max(0, (totalBubbles - remaining) / totalBubbles);
          return (
            <IntermissionHeader
              instructionText="Videz toutes les bulles pour retourner au jeu principal."
              onRestart={initGame}
              onOtherGame={onIntermissionRequest}
              onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
              replaySame={replaySameIntermission}
              onToggleReplaySame={onToggleReplaySameIntermission}
              progress={bcProgress}
            />
          );
        })()}

        {/* Rescue Power-Ups Bar (Astuces & Aides Anti-Blocage) */}
        <div style={powerupRowStyle}>
          <button
            onClick={handleUseBombPower}
            disabled={bombsCount <= 0 || gameStateRef.current.isShooting}
            className="retro-btn"
            style={{
              ...powerupBtnStyle,
              borderColor: '#EF4444',
              color: '#FCA5A5',
              background: bombsCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.02)',
              opacity: bombsCount > 0 ? 1 : 0.4
            }}
            title="Charger une Bombe dans le canon"
          >
            💣 Bombe ({bombsCount})
          </button>

          <button
            onClick={handleUseRainbowPower}
            disabled={rainbowsCount <= 0 || gameStateRef.current.isShooting}
            className="retro-btn"
            style={{
              ...powerupBtnStyle,
              borderColor: '#A855F7',
              color: '#E9D5FF',
              background: rainbowsCount > 0 ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.02)',
              opacity: rainbowsCount > 0 ? 1 : 0.4
            }}
            title="Charger un Prisme Joker dans le canon"
          >
            🌈 Prisme ({rainbowsCount})
          </button>

          <button
            onClick={handleUseLightningPower}
            disabled={lightningCount <= 0 || gameStateRef.current.isShooting}
            className="retro-btn"
            style={{
              ...powerupBtnStyle,
              borderColor: '#FACC15',
              color: '#FEF08A',
              background: lightningCount > 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.02)',
              opacity: lightningCount > 0 ? 1 : 0.4
            }}
            title="Foudroyer la rangée la plus basse"
          >
            ⚡ Éclair ({lightningCount})
          </button>

          <button onClick={handleSwapBubbles} className="retro-btn" style={swapBtnStyle} title="Permuter les deux bulles">
            🔄
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
              <div style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '13px' }}>
                Les bulles ont franchi la ligne d'alerte !
              </div>
              <div style={{ fontSize: '24px', color: '#38BDF8', fontWeight: 'bold', marginBottom: '20px' }}>
                Score: {score}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '220px' }}>
                <button onClick={initGame} className="retro-btn pulse-glow" style={overlayBtnStyle}>
                  Réessayer 🔄
                </button>
                {gameMode === 'chapter' && (
                  <button onClick={() => setShowChapterSelect(true)} className="retro-btn" style={{ ...overlayBtnStyle, borderColor: '#94a3b8', color: '#94a3b8' }}>
                    Menu des Chapitres 🗺️
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Victory Overlay (Arcade Mode) */}
          {victory && gameMode === 'arcade' && (
            <div style={overlayStyle}>
              <div style={{ ...titleStyle, color: '#10B981', textShadow: '0 0 12px #10B981' }}>
                VICTOIRE ÉCLATANTE !
              </div>
              <div style={{ color: '#94a3b8', marginBottom: '16px' }}>
                Vous avez entièrement vidé la grille !
              </div>
              <div style={{ fontSize: '24px', color: '#10B981', fontWeight: 'bold', marginBottom: '20px' }}>
                Score: {score}
              </div>
              <button onClick={initGame} className="retro-btn pulse-glow" style={overlayBtnStyle}>
                Nouvelle Partie 🎮
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
  padding: '8px',
  borderRadius: '20px',
  background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
  border: '2px solid rgba(56, 189, 248, 0.3)',
  boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)'
};

const compactHeaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '6px 10px',
  background: 'rgba(15, 23, 42, 0.85)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: '12px',
  marginBottom: '2px'
};

const statBoxStyle = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  padding: '4px 6px',
  textAlign: 'center'
};

const statLabelStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#cbd5e1',
  fontFamily: 'Orbitron, sans-serif',
  marginBottom: '2px',
  letterSpacing: '0.5px'
};

const statValStyle = {
  fontSize: '17px',
  fontWeight: '900',
  color: '#38bdf8',
  fontFamily: 'Orbitron, sans-serif',
  textShadow: '0 0 8px rgba(56, 189, 248, 0.5)'
};

const powerupRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '6px',
  padding: '5px 8px',
  background: 'rgba(15, 23, 42, 0.8)',
  borderRadius: '12px',
  margin: '2px 0',
  border: '1px solid rgba(255,255,255,0.08)'
};

const powerupBtnStyle = {
  flex: 1,
  padding: '6px 4px',
  fontSize: '12px',
  fontWeight: '800',
  borderRadius: '8px',
  border: '1.5px solid',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s',
  fontFamily: 'Orbitron, sans-serif'
};

const swapBtnStyle = {
  padding: '6px 10px',
  fontSize: '15px',
  fontWeight: '800',
  borderRadius: '8px',
  borderColor: '#38BDF8',
  color: '#38BDF8',
  background: 'rgba(56, 189, 248, 0.15)',
  cursor: 'pointer'
};

const canvasWrapperStyle = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '2px 0'
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
  fontSize: '26px',
  color: '#EF4444',
  textShadow: '0 0 16px rgba(239, 68, 68, 0.7)',
  fontWeight: '900',
  marginBottom: '10px'
};

const overlayBtnStyle = {
  padding: '12px 22px',
  fontSize: '15px',
  fontWeight: '800',
  border: '2px solid #38BDF8',
  background: 'rgba(56, 189, 248, 0.12)',
  color: '#38BDF8',
  cursor: 'pointer',
  borderRadius: '12px',
  fontFamily: 'Orbitron, sans-serif',
  transition: 'all 0.15s ease'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(2, 6, 23, 0.88)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
  padding: '16px',
  backdropFilter: 'blur(10px)'
};

const modalCardStyle = {
  background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
  border: '1.5px solid rgba(56, 189, 248, 0.35)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.25)',
  borderRadius: '20px',
  padding: '24px',
  width: '100%',
  maxWidth: '400px',
  textAlign: 'center',
  boxSizing: 'border-box'
};

const tipBoxStyle = {
  background: 'rgba(245, 158, 11, 0.15)',
  border: '1.5px solid rgba(245, 158, 11, 0.4)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#f8fafc',
  textAlign: 'left',
  lineHeight: '1.5'
};
