import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import WinLossTransition from '../components/WinLossTransition';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';

// --- DIMENSIONS & THEME CONFIGURATION ---
const MAHJONG_THEME = {
  icon: {
    size: 50,
    fontSize: '40px'
  },
  board: {
    cellWidth: 64,
    cellHeight: 67,
    tileWidth: 64,
    tileHeight: 67
  },
  fonts: {
    roundTitleSize: '19px',
    statLabelSize: '11px',
    statValueSize: '18px',
    helperBtnSize: '13px',
    hintBulbSize: '30px',
    badgeSize: '13px',
    descSize: '17px',
    restartBtnSize: '16px',
    footerHelpSize: '12px'
  }
};

function MahjongIcon({ name }) {
  const size = MAHJONG_THEME.icon.size;
  switch (name) {
    case 'fa': // Green Dragon
      return (
        <svg width={size} height={size} viewBox="-2 -2 28 28" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            {/* Rich Emerald Gradient for the body */}
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            {/* Shimmering Gold Gradient for the stroke */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a">
                <animate attributeName="stop-color" values="#fef08a;#ca8a04;#fef08a" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#fef08a">
                <animate attributeName="stop-color" values="#fef08a;#eab308;#fef08a" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>

            {/* Glow Filter for magic effects */}
            <filter id="dragonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense Eye Glow */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <style>
            {`
              @keyframes dragonIdle {
                0%, 85%, 100% { transform: scale(1) translateY(0) rotate(0deg); filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); }
                90% { transform: scale(1.12) translateY(-2px) rotate(4deg); filter: drop-shadow(0px 10px 15px rgba(250,204,21,0.5)); }
                95% { transform: scale(1.12) translateY(-2px) rotate(-4deg); filter: drop-shadow(0px 10px 15px rgba(250,204,21,0.5)); }
              }
              @keyframes dashAnim {
                from { stroke-dashoffset: 20; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes fierceEye {
                0%, 100% { fill: #fef08a; }
                50% { fill: #ffffff; }
              }
              @keyframes floatSparkle {
                0%, 100% { opacity: 0.2; transform: translateY(0) scale(1); }
                50% { opacity: 1; transform: translateY(-3px) scale(1.5); }
              }
              .dragon-expert {
                animation: dragonIdle 8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                transform-origin: 12px 12px;
              }
              .magic-contour {
                stroke-dasharray: 4 6;
                animation: dashAnim 2s linear infinite;
              }
              .dragon-eye-expert {
                animation: fierceEye 3.5s ease-in-out infinite;
                filter: url(#eyeGlow);
              }
              .sparkle {
                animation: floatSparkle 2s ease-in-out infinite;
              }
            `}
          </style>

          <g className="dragon-expert">
            {/* Ambient Aura */}
            <circle cx="12" cy="12" r="10" fill="url(#emeraldGrad)" opacity="0.2" filter="url(#dragonGlow)" />

            {/* Main Silhouette with Emerald Gradient */}
            <path id="dragon-path"
              d="M12 1 L14.5 5.5 L20 4 L17.5 9.5 L22 13 L16.5 15.5 L18 21 L12 18.5 L6 21 L7.5 15.5 L2 13 L6.5 9.5 L4 4 L9.5 5.5 Z"
              fill="url(#emeraldGrad)"
              stroke="#022c22"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />

            {/* Scintillating Golden Contour */}
            <path
              d="M12 1 L14.5 5.5 L20 4 L17.5 9.5 L22 13 L16.5 15.5 L18 21 L12 18.5 L6 21 L7.5 15.5 L2 13 L6.5 9.5 L4 4 L9.5 5.5 Z"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              className="magic-contour"
              filter="url(#dragonGlow)"
            />

            {/* Inner Emerald Scales */}
            <path d="M12 4 L13 6 L12 7 L11 6 Z M12 8 L13.5 10 L12 11 L10.5 10 Z" fill="#86efac" opacity="0.6" />

            {/* Angry Fiery Eyes */}
            <path className="dragon-eye-expert" d="M7 11 L11 12.5 L7 14 Z" />
            <path className="dragon-eye-expert" d="M17 11 L13 12.5 L17 14 Z" />

            {/* Sharp Fangs */}
            <path d="M10 18.5 L10.5 20 L11 18.5 Z" fill="#ffffff" />
            <path d="M14 18.5 L13.5 20 L13 18.5 Z" fill="#ffffff" />

            {/* Glowing Nostrils */}
            <circle cx="10" cy="16.5" r="1.2" fill="#022c22" />
            <circle cx="14" cy="16.5" r="1.2" fill="#022c22" />

            {/* Glowing Traditional Character */}
            <text x="12" y="7.5" fontSize="4.8" fontWeight="900" fill="url(#goldGrad)" filter="url(#dragonGlow)" textAnchor="middle" dominantBaseline="middle" fontFamily='"Microsoft YaHei", "SimHei", sans-serif'>
              發
            </text>

            {/* Floating Magic Sparkles */}
            <circle cx="4" cy="4" r="0.6" fill="#fef08a" className="sparkle" style={{ animationDelay: '0s' }} />
            <circle cx="20" cy="20" r="0.8" fill="#4ade80" className="sparkle" style={{ animationDelay: '0.5s' }} />
            <circle cx="21" cy="5" r="0.5" fill="#fef08a" className="sparkle" style={{ animationDelay: '1s' }} />
            <circle cx="3" cy="18" r="0.7" fill="#4ade80" className="sparkle" style={{ animationDelay: '1.5s' }} />
          </g>
        </svg>
      );
    case 'xi': // West Wind
      return (
        <span style={{
          fontSize: MAHJONG_THEME.icon.fontSize,
          color: '#1f2937', // Very Dark Grey/Black
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1',
          textShadow: '1px 1px 0px rgba(0,0,0,0.1)'
        }}>
          西
        </span>
      );
    case 'six': // Six
      return (
        <span style={{
          fontSize: MAHJONG_THEME.icon.fontSize,
          color: '#1e3a8a', // Dark Navy Blue
          fontWeight: '900',
          fontFamily: '"Microsoft YaHei", "SimHei", "Noto Sans TC", sans-serif',
          lineHeight: '1',
          textShadow: '1px 1px 0px rgba(0,0,0,0.1)'
        }}>
          六
        </span>
      );
    case 'two': // Two
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <rect x="3" y="6" width="18" height="3" rx="1.5" fill="#1e3a8a" />
          <rect x="3" y="15" width="18" height="3" rx="1.5" fill="#1e3a8a" />
        </svg>
      );
    case 'circles': // 9 Dots (all blue like reference)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="5" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="5" r="1" fill="#ffffff" />
          <circle cx="12" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="5" r="1" fill="#ffffff" />
          <circle cx="19" cy="5" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="5" r="1" fill="#ffffff" />

          <circle cx="5" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="12" r="1" fill="#ffffff" />
          <circle cx="12" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="12" r="1" fill="#ffffff" />
          <circle cx="19" cy="12" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="12" r="1" fill="#ffffff" />

          <circle cx="5" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="5" cy="19" r="1" fill="#ffffff" />
          <circle cx="12" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="12" cy="19" r="1" fill="#ffffff" />
          <circle cx="19" cy="19" r="3" fill="#1e3a8a" />
          <circle cx="19" cy="19" r="1" fill="#ffffff" />
        </svg>
      );
    case 'eight_dots': // 8 Dots (all blue like reference)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="8" cy="3.5" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="3.5" r="1" fill="#ffffff" />
          <circle cx="16" cy="3.5" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="3.5" r="1" fill="#ffffff" />

          <circle cx="8" cy="9.1" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="9.1" r="1" fill="#ffffff" />
          <circle cx="16" cy="9.1" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="9.1" r="1" fill="#ffffff" />

          <circle cx="8" cy="14.8" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="14.8" r="1" fill="#ffffff" />
          <circle cx="16" cy="14.8" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="14.8" r="1" fill="#ffffff" />

          <circle cx="8" cy="20.5" r="2.8" fill="#1e3a8a" />
          <circle cx="8" cy="20.5" r="1" fill="#ffffff" />
          <circle cx="16" cy="20.5" r="2.8" fill="#1e3a8a" />
          <circle cx="16" cy="20.5" r="1" fill="#ffffff" />
        </svg>
      );
    case 'one_circle': // 1 Dot (Rosette)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#1e3a8a" />
          <circle cx="12" cy="12" r="7.5" fill="#16a34a" />
          <circle cx="12" cy="12" r="4.5" fill="#dc2626" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
        </svg>
      );
    case 'bamboo_green_3': // 3 green bamboos
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="10.25" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="16.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="4" y1="9" x2="7.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="4" y1="15" x2="7.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="9" x2="13.75" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="15" x2="13.75" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="9" x2="20" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="15" x2="20" y2="15" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
    case 'bamboo_green_4': // 2 bamboos with a red bar (like the reference's "2 bamboo")
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="7" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="13.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="7" y1="9" x2="10.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="7" y1="15" x2="10.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="13.5" y1="9" x2="17" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="13.5" y1="15" x2="17" y2="15" stroke="#ffffff" strokeWidth="1" />
          <rect x="9.5" y="10.5" width="5" height="3" rx="1" fill="#dc2626" />
        </svg>
      );
    case 'bamboo_red_3': // 3 bamboos with alternating colors
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <rect x="4" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <rect x="10.25" y="3" width="3.5" height="18" rx="1.5" fill="#dc2626" />
          <rect x="16.5" y="3" width="3.5" height="18" rx="1.5" fill="#16a34a" />
          <line x1="4" y1="9" x2="7.5" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="4" y1="15" x2="7.5" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="9" x2="13.75" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="10.25" y1="15" x2="13.75" y2="15" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="9" x2="20" y2="9" stroke="#ffffff" strokeWidth="1" />
          <line x1="16.5" y1="15" x2="20" y2="15" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );
    case 'flower': // Pink Sakura Blossom
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          {/* Leaves at bottom */}
          <path d="M7 17C4 17 2 13 4 11C6 9 9 14 7 17Z" fill="#16a34a" />
          <path d="M17 17C20 17 22 13 20 11C18 9 15 14 17 17Z" fill="#16a34a" />
          {/* Flower Petals */}
          <circle cx="12" cy="7" r="4.5" fill="#f472b6" />
          <circle cx="7" cy="11" r="4.5" fill="#f472b6" />
          <circle cx="17" cy="11" r="4.5" fill="#f472b6" />
          <circle cx="9.5" cy="16" r="4.5" fill="#f472b6" />
          <circle cx="14.5" cy="16" r="4.5" fill="#f472b6" />
          <circle cx="12" cy="11" r="5" fill="#fbcfe8" />
          {/* Yellow Center */}
          <circle cx="12" cy="11.5" r="2.5" fill="#eab308" />
        </svg>
      );
    case 'leaf': // Orange Maple Leaf on yellow plate
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10" fill="#fde047" />
          <path d="M12 4L14.5 9H19L16 12L17.5 17L12 14L6.5 17L8 12L5 9H9.5L12 4Z" fill="#f97316" />
          <path d="M12 14V19" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MahjongZen({ onBack, onScoreSave, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);
  const [mode, setMode] = useState(() => getGameConfig('mahjong', 'mode', 'slide'));
  const [boardSize, setBoardSize] = useState(() => getGameConfig('mahjong', 'boardSize', 'large'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showArrows, setShowArrows] = useState(false); // Hidden by default to match reference

  const [tiles, setTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [hintIds, setHintIds] = useState([]);
  const [hintMove, setHintMove] = useState(null);
  const [matchEffects, setMatchEffects] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('retrovision_mahjong_highscore_val')) || 2147;
  });

  const [dragStart, setDragStart] = useState(null);
  const [initialTilesForDrag, setInitialTilesForDrag] = useState(null);
  const [matchingLines, setMatchingLines] = useState([]);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [dragHasMoved, setDragHasMoved] = useState(false);
  const [vibratingSymbol, setVibratingSymbol] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [matchSelection, setMatchSelection] = useState(null);
  const [windGust, setWindGust] = useState(false);
  const lastTouchTime = useRef(0);
  const containerRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);
  const discreetHintTimer = useRef(null);
  const nextDiscreetHintThreshold = useRef(60000);
  const [discreetHintId, setDiscreetHintId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const isMobile = window.innerWidth <= 600;
      const headerOffset = isMobile ? 320 : 250;
      const availableWidth = containerRef.current.clientWidth - 16;
      const availableHeight = containerRef.current.clientHeight - headerOffset;

      const boardW = mode === 'zen' ? (boardSize === 'small' ? 220 : boardSize === 'medium' ? 280 : 348) : 6 * 64;
      const boardH = mode === 'zen' ? (boardSize === 'small' ? 260 : boardSize === 'medium' ? 340 : 420) : 7 * 64;

      const requiredWidth = boardW + 32;
      const requiredHeight = boardH + 32;

      const scaleX = availableWidth / requiredWidth;
      const scaleY = availableHeight / requiredHeight;
      const newScale = Math.min(1, scaleX, scaleY);

      setBoardScale(newScale);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();

    return () => observer.disconnect();
  }, [mode, boardSize]);

  useEffect(() => {
    let windTimer;
    const scheduleNextWind = () => {
      const nextDelay = 15000 + Math.random() * 20000;
      windTimer = setTimeout(() => {
        setWindGust(true);
        sound.playWind();
        setTimeout(() => setWindGust(false), 6000);
        scheduleNextWind();
      }, nextDelay);
    };
    scheduleNextWind();
    return () => clearTimeout(windTimer);
  }, []);

  useEffect(() => {
    if (won) {
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
      const newConfetti = [];
      for (let i = 0; i < 80; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 30,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 2.5,
          duration: 3 + Math.random() * 2,
          rotation: Math.random() * 360,
        });
      }
      setConfetti(newConfetti);
    } else {
      setConfetti([]);
    }
  }, [won]);

  const symbols = [
    { name: 'fa' },
    { name: 'xi' },
    { name: 'six' },
    { name: 'two' },
    { name: 'circles' },
    { name: 'eight_dots' },
    { name: 'one_circle' },
    { name: 'bamboo_green_3' },
    { name: 'bamboo_red_3' },
    { name: 'bamboo_green_4' },
    { name: 'flower' },
    { name: 'leaf' },
  ];

  const maxRows = boardSize === 'small' ? 4 : boardSize === 'medium' ? 6 : 8;

  useEffect(() => {
    initGame();
  }, [mode, boardSize]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('retrovision_mahjong_highscore_val', score.toString());
    }
  }, [score, highScore]);

  // Ask permission to leave if game is in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isGameInProgress = !won && !lost && tiles.some(t => !t.active);
      if (isGameInProgress) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter la partie en cours ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [won, lost, tiles]);

  // Alert sound for blocked state
  useEffect(() => {
    let interval;
    if (lost && mode === 'slide') {
      sound.playError(); // play once immediately
      interval = setInterval(() => {
        sound.playError();
      }, 800);
    }
    return () => clearInterval(interval);
  }, [lost, mode]);

  const handleBackWithConfirm = () => {
    const isGameInProgress = !won && !lost && tiles.some(t => !t.active);
    if (isGameInProgress) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  // Zen layout config (multiple Z-layers)
  const getLayoutPatterns = (size) => {
    const slots = [];
    if (size === 'small') {
      for (let y = 1; y <= 4; y++) {
        for (let x = 1; x <= 6; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 3; y++) {
        for (let x = 2; x <= 5; x++) {
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 2; y <= 3; y++) {
        for (let x = 3; x <= 4; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
    } else if (size === 'medium') {
      for (let y = 1; y <= 6; y++) {
        for (let x = 1; x <= 8; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 5; y++) {
        for (let x = 2; x <= 7; x++) {
          if ((x === 2 || x === 7) && (y === 2 || y === 5)) continue;
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 3; y <= 4; y++) {
        for (let x = 4; x <= 5; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
    } else {
      // 144 tiles total
      for (let y = 1; y <= 8; y++) {
        for (let x = 1; x <= 10; x++) {
          slots.push({ x, y, z: 0 });
        }
      }
      for (let y = 2; y <= 7; y++) {
        for (let x = 2; x <= 9; x++) {
          slots.push({ x, y, z: 1 });
        }
      }
      for (let y = 3; y <= 5; y++) {
        for (let x = 4; x <= 7; x++) {
          slots.push({ x, y, z: 2 });
        }
      }
      for (let y = 4; y <= 5; y++) {
        for (let x = 5; x <= 6; x++) {
          slots.push({ x, y, z: 3 });
        }
      }
    }
    return slots;
  };

  // Reversed Generation to guarantee Zen Solitaire solubility
  const generateSolubleZenLayout = (size) => {
    const slots = getLayoutPatterns(size);
    const totalTiles = slots.length;

    const pool = [];
    let symIdx = 0;
    while (pool.length < totalTiles / 2) {
      const sym = symbols[symIdx % symbols.length];
      for (let i = 0; i < 2; i++) {
        pool.push({ ...sym });
      }
      symIdx++;
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const remainingSet = new Set(slots.map(s => `${s.x},${s.y},${s.z}`));
    const boardTiles = [];
    let idCounter = 1;

    const isSlotInRemaining = (x, y, z) => remainingSet.has(`${x},${y},${z}`);

    const isSlotFreeToFill = (slot) => {
      const { x, y, z } = slot;
      if (isSlotInRemaining(x, y, z + 1)) return false;
      const leftOccupied = isSlotInRemaining(x - 1, y, z);
      const rightOccupied = isSlotInRemaining(x + 1, y, z);
      if (leftOccupied && rightOccupied) return false;
      return true;
    };

    const remainingSlots = [...slots];
    while (remainingSlots.length > 0) {
      const freeSlots = remainingSlots.filter(isSlotFreeToFill);

      if (freeSlots.length < 2) {
        // Fallback if somehow stuck (should not happen with valid layouts)
        const s1 = remainingSlots.pop();
        const s2 = remainingSlots.pop() || s1;
        if (!s1) break;

        const sym = pool.pop();
        boardTiles.push({ id: idCounter++, x: s1.x, y: s1.y, z: s1.z, sym, active: true });
        remainingSet.delete(`${s1.x},${s1.y},${s1.z}`);

        if (s2 !== s1) {
          const sym2 = pool.pop() || sym;
          boardTiles.push({ id: idCounter++, x: s2.x, y: s2.y, z: s2.z, sym: sym2, active: true });
          remainingSet.delete(`${s2.x},${s2.y},${s2.z}`);
        }
        continue;
      }

      const idx1 = Math.floor(Math.random() * freeSlots.length);
      let idx2 = Math.floor(Math.random() * freeSlots.length);
      while (idx2 === idx1 && freeSlots.length > 1) {
        idx2 = Math.floor(Math.random() * freeSlots.length);
      }

      const slot1 = freeSlots[idx1];
      const slot2 = freeSlots[idx2];

      const s1Index = remainingSlots.findIndex(s => s.x === slot1.x && s.y === slot1.y && s.z === slot1.z);
      remainingSlots.splice(s1Index, 1);
      const s2Index = remainingSlots.findIndex(s => s.x === slot2.x && s.y === slot2.y && s.z === slot2.z);
      remainingSlots.splice(s2Index, 1);

      const sym = pool.pop();
      boardTiles.push({ id: idCounter++, x: slot1.x, y: slot1.y, z: slot1.z, sym, active: true });
      remainingSet.delete(`${slot1.x},${slot1.y},${slot1.z}`);

      boardTiles.push({ id: idCounter++, x: slot2.x, y: slot2.y, z: slot2.z, sym, active: true });
      remainingSet.delete(`${slot2.x},${slot2.y},${slot2.z}`);
    }

    return boardTiles;
  };

  const initGame = () => {
    setHintIds([]);
    setSelectedTile(null);
    setMatchSelection(null);
    setHistory([]);
    setWon(false);
    setLost(false);
    setScore(0);
    setHintsLeft(3);
    setMatchingLines([]);

    if (mode === 'zen') {
      const initialTiles = generateSolubleZenLayout(boardSize);
      setTiles(initialTiles);
    } else {
      const tileCounts = boardSize === 'small' ? 24 : boardSize === 'medium' ? 36 : 48;
      const pool = [];
      let symIdx = 0;
      while (pool.length < tileCounts) {
        const sym = symbols[symIdx % symbols.length];
        pool.push({ ...sym });
        pool.push({ ...sym });
        symIdx++;
      }

      const slots = [];
      for (let y = 1; y <= maxRows; y++) {
        for (let x = 1; x <= 6; x++) {
          slots.push({ x, y });
        }
      }

      let boardTiles = [];
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 20) {
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        for (let i = slots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [slots[i], slots[j]] = [slots[j], slots[i]];
        }

        boardTiles = [];
        for (let i = 0; i < pool.length; i++) {
          const slot = slots[i];
          boardTiles.push({
            id: i + 1,
            x: slot.x,
            y: slot.y,
            z: 0,
            sym: pool[i],
            active: true,
          });
        }
        
        valid = hasAnyPossibleMovesSlider(boardTiles);
        attempts++;
      }

      setTiles(boardTiles);
      if (!valid) {
        setLost(true);
      }
    }
  };

  const saveToHistory = () => {
    const state = {
      tiles: JSON.stringify(tiles),
      score,
      selectedTile: selectedTile ? JSON.stringify(selectedTile) : null,
    };
    setHistory(prev => [...prev, state]);
  };

  const isTileFree = (tile, currentTiles = tiles) => {
    const { x, y, z } = tile;
    const hasTileOnTop = currentTiles.some(t => t.active && t.z === z + 1 && t.x === x && t.y === y);
    if (hasTileOnTop) return false;
    const hasLeft = currentTiles.some(t => t.active && t.z === z && t.x === x - 1 && t.y === y);
    const hasRight = currentTiles.some(t => t.active && t.z === z && t.x === x + 1 && t.y === y);
    if (hasLeft && hasRight) return false;
    return true;
  };

  const checkLostZen = (currentTiles) => {
    const active = currentTiles.filter(t => t.active);
    if (active.length === 0) return false;

    const freeTiles = active.filter(t => isTileFree(t, currentTiles));
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].sym.name === freeTiles[j].sym.name) {
          return false;
        }
      }
    }
    return true;
  };

  const handleZenTileClick = (tile) => {
    if (won || lost) return;
    setHintIds([]);
    setHintMove(null);

    if (!isTileFree(tile)) {
      sound.playClick();
      return;
    }

    if (matchSelection !== null) {
      if (tile.id === matchSelection.sourceTile.id) {
        setMatchSelection(null);
        setSelectedTile(null);
        sound.playClick();
      } else {
        const option = matchSelection.options.find(opt => opt.t.id === tile.id);
        if (option) {
          saveToHistory();
          sound.playScore();
          setScore(prev => prev + 10);

          const nextTiles = tiles.map(t =>
            (t.id === tile.id || t.id === matchSelection.sourceTile.id) ? { ...t, active: false } : t
          );
          setTiles(nextTiles);
          setMatchSelection(null);
          setSelectedTile(null);

          if (nextTiles.every(t => !t.active)) {
            setWon(true);
            sound.playPowerup();
            if (onScoreSave) onScoreSave('Mahjong Zen', score + 100);
          } else if (checkLostZen(nextTiles)) {
            setLost(true);
            sound.playClick();
          }
        }
      }
      return;
    }

    if (selectedTile === null) {
      // Check if there is any other free tile with the same symbol
      const active = tiles.filter(t => t.active && t.id !== tile.id && isTileFree(t) && t.sym.name === tile.sym.name);
      if (active.length === 1) {
        setSelectedTile(tile);
        sound.playClick();
      } else if (active.length > 1) {
        setMatchSelection({
          sourceTile: tile,
          options: active.map(t => ({ t, path: null }))
        });
        setSelectedTile(tile);
        sound.playClick();
      } else {
        setVibratingSymbol(tile.sym.name);
        sound.playClick();
        setTimeout(() => setVibratingSymbol(null), 400);
      }
    } else {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        sound.playClick();
      } else if (selectedTile.sym.name === tile.sym.name) {
        saveToHistory();
        sound.playScore();
        setScore(prev => prev + 10);

        const nextTiles = tiles.map(t =>
          (t.id === tile.id || t.id === selectedTile.id) ? { ...t, active: false } : t
        );
        setTiles(nextTiles);
        setSelectedTile(null);

        if (nextTiles.every(t => !t.active)) {
          setWon(true);
          sound.playPowerup();
          if (onScoreSave) onScoreSave('Mahjong Zen', score + 100);
        } else if (checkLostZen(nextTiles)) {
          setLost(true);
          sound.playClick();
        }
      } else {
        // If clicking a different symbol, check if the new one has free matches
        const active = tiles.filter(t => t.active && t.id !== tile.id && isTileFree(t) && t.sym.name === tile.sym.name);
        if (active.length === 1) {
          setSelectedTile(tile);
          sound.playClick();
        } else if (active.length > 1) {
          setMatchSelection({
            sourceTile: tile,
            options: active.map(t => ({ t, path: null }))
          });
          setSelectedTile(tile);
          sound.playClick();
        } else {
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      }
    }
  };

  const shiftRow = (y, direction) => {
    saveToHistory();
    sound.playClick();
    const originalTiles = tiles.map(t => ({ ...t }));

    const nextTiles = tiles.map(t => {
      if (t.y === y && t.z === 0) {
        let nextX = t.x + direction;
        if (nextX > 6) nextX = 1;
        if (nextX < 1) nextX = 6;
        return { ...t, x: nextX };
      }
      return t;
    });

    setTiles(nextTiles);
    setTimeout(() => {
      checkForMatchesAndResolve(nextTiles, originalTiles);
    }, 100);
  };

  const shiftColumn = (x, direction) => {
    saveToHistory();
    sound.playClick();
    const originalTiles = tiles.map(t => ({ ...t }));

    const nextTiles = tiles.map(t => {
      if (t.x === x && t.z === 0) {
        let nextY = t.y + direction;
        if (nextY > maxRows) nextY = 1;
        if (nextY < 1) nextY = maxRows;
        return { ...t, y: nextY };
      }
      return t;
    });

    setTiles(nextTiles);
    setTimeout(() => {
      checkForMatchesAndResolve(nextTiles, originalTiles);
    }, 100);
  };

  // Push Block Sliding simulation
  const canPushTile = (tileId, dx, dy, nextCoords, currentTiles, allowedGroup) => {
    const tile = currentTiles.find(t => t.id === tileId);
    if (!tile) return false;

    if (allowedGroup && !allowedGroup.has(tileId)) return false;

    const nextX = tile.x + dx;
    const nextY = tile.y + dy;

    if (nextX < 1 || nextX > 6 || nextY < 1 || nextY > maxRows) {
      return false;
    }

    const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
    if (obstacle) {
      return canPushTile(obstacle.id, dx, dy, nextCoords, currentTiles, allowedGroup);
    }
    return true;
  };

  const pushTile = (tileId, dx, dy, nextCoords, currentTiles) => {
    const tile = currentTiles.find(t => t.id === tileId);
    if (!tile) return;
    const nextX = tile.x + dx;
    const nextY = tile.y + dy;

    const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
    if (obstacle) {
      pushTile(obstacle.id, dx, dy, nextCoords, currentTiles);
    }
    nextCoords.set(tileId, { x: nextX, y: nextY });
  };

  const handleTileMouseDown = (e, tile) => {
    if (Date.now() - lastTouchTime.current < 500) return; // Prevent ghost click
    if (mode !== 'slide' || won || lost || matchingLines.length > 0) return;
    setHintIds([]);
    setHintMove(null);
    setDragStart({
      tileId: tile.id,
      screenX: e.clientX,
      screenY: e.clientY
    });
    setInitialTilesForDrag(tiles.map(t => ({ ...t })));
    setDragHasMoved(false);
  };

  const handleTileTouchStart = (e, tile) => {
    lastTouchTime.current = Date.now();
    if (mode !== 'slide' || won || lost || matchingLines.length > 0) return;
    setHintIds([]);
    setHintMove(null);
    if (e.cancelable) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    setDragStart({
      tileId: tile.id,
      screenX: touch.clientX,
      screenY: touch.clientY
    });
    setInitialTilesForDrag(tiles.map(t => ({ ...t })));
    setDragHasMoved(false);
  };

  const handleTileMouseMove = (e) => {
    if (!dragStart || !initialTilesForDrag) return;
    const dx = e.clientX - dragStart.screenX;
    const dy = e.clientY - dragStart.screenY;
    processDrag(dx, dy);
  };

  const handleTileTouchMove = (e) => {
    if (!dragStart || !initialTilesForDrag) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.screenX;
    const dy = touch.clientY - dragStart.screenY;
    processDrag(dx, dy);
  };

  const processDrag = (dx, dy) => {
    const boardEl = document.querySelector('.board-scaler');
    let scale = 1;
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      if (rect.width && boardEl.offsetWidth) {
        scale = rect.width / boardEl.offsetWidth;
      }
    }
    const adjustedDx = dx / scale;
    const adjustedDy = dy / scale;

    const cellWidth = MAHJONG_THEME.board.cellWidth;
    const cellHeight = MAHJONG_THEME.board.cellHeight;

    let gridDx = 0;
    let gridDy = 0;

    if (Math.abs(adjustedDx) > Math.abs(adjustedDy)) {
      gridDx = Math.round(adjustedDx / cellWidth);
    } else {
      gridDy = Math.round(adjustedDy / cellHeight);
    }

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setDragHasMoved(true);
    }

    if (gridDx === 0 && gridDy === 0) {
      setTiles(initialTilesForDrag);
      return;
    }

    let currentLayout = initialTilesForDrag.map(t => ({ ...t }));
    const dragTile = currentLayout.find(t => t.id === dragStart.tileId);
    if (!dragTile) return;

    const stepX = gridDx > 0 ? 1 : gridDx < 0 ? -1 : 0;
    const stepY = gridDy > 0 ? 1 : gridDy < 0 ? -1 : 0;
    const totalSteps = Math.max(Math.abs(gridDx), Math.abs(gridDy));

    const allowedGroup = new Set();
    let currentDrag = dragTile;
    while (currentDrag) {
      allowedGroup.add(currentDrag.id);
      currentDrag = initialTilesForDrag.find(t => t.active && t.x === currentDrag.x + stepX && t.y === currentDrag.y + stepY);
    }

    for (let step = 0; step < totalSteps; step++) {
      const nextCoords = new Map();
      currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));

      if (canPushTile(dragTile.id, stepX, stepY, nextCoords, currentLayout, allowedGroup)) {
        pushTile(dragTile.id, stepX, stepY, nextCoords, currentLayout);
        currentLayout = currentLayout.map(t => {
          const coord = nextCoords.get(t.id);
          return { ...t, x: coord.x, y: coord.y };
        });
      } else {
        break;
      }
    }

    setTiles(currentLayout);
  };

  const handleDragRelease = () => {
    if (!dragStart) return;
    const finalTiles = [...tiles];
    const originalTiles = initialTilesForDrag;
    const isClick = !dragHasMoved;

    const clickTileId = dragStart.tileId;

    setDragStart(null);
    setInitialTilesForDrag(null);

    if (isClick) {
      const clickedTile = tiles.find(t => t.id === clickTileId);
      if (clickedTile) {
        handleSlideTileClick(clickedTile);
      }
    } else {
      checkForMatchesAndResolve(finalTiles, originalTiles, clickTileId);
    }
  };

  // Helper to check if a straight line segment path is clear of active tiles
  const checkPathClear = (x1, y1, x2, y2, activeTiles, ignoreIds = []) => {
    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY + 1; y < maxY; y++) {
        if (y < 1 || y > maxRows) continue;
        if (x1 < 1 || x1 > 6) continue;
        const hasTile = activeTiles.some(t => t.active && t.x === x1 && t.y === y && !ignoreIds.includes(t.id));
        if (hasTile) return false;
      }
      return true;
    }
    if (y1 === y2) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX + 1; x < maxX; x++) {
        if (x < 1 || x > 6) continue;
        if (y1 < 1 || y1 > maxRows) continue;
        const hasTile = activeTiles.some(t => t.active && t.x === x && t.y === y1 && !ignoreIds.includes(t.id));
        if (hasTile) return false;
      }
      return true;
    }
    return false;
  };

  // Find connection path (0 turns only for straight line matching in Slider)
  const findConnectionPath = (t1, t2, activeTiles) => {
    const ignoreIds = [t1.id, t2.id];

    // Direct (0 turns)
    if (t1.x === t2.x && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) {
      return [t1, t2];
    }
    if (t1.y === t2.y && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) {
      return [t1, t2];
    }

    return null;
  };

  // Gravity and Column Merging
  const applyGravityAndColumnMerging = (currentTiles) => {
    let tempTiles = currentTiles.map(t => ({ ...t }));

    // Vertical Gravity
    for (let x = 1; x <= 6; x++) {
      const colTiles = tempTiles.filter(t => t.active && t.x === x);
      colTiles.sort((a, b) => b.y - a.y);
      let nextY = maxRows;
      colTiles.forEach(tile => {
        const tObj = tempTiles.find(t => t.id === tile.id);
        if (tObj) tObj.y = nextY;
        nextY--;
      });
    }

    // Horizontal Column Merging
    let emptyColFound = true;
    while (emptyColFound) {
      emptyColFound = false;
      for (let x = 1; x < 6; x++) {
        const currentColActive = tempTiles.some(t => t.active && t.x === x);
        const rightColActive = tempTiles.some(t => t.active && t.x > x);
        if (!currentColActive && rightColActive) {
          tempTiles = tempTiles.map(t => {
            if (t.active && t.x > x) return { ...t, x: t.x - 1 };
            return t;
          });
          emptyColFound = true;
          break;
        }
      }
    }

    return tempTiles;
  };

  const handleSlideTileClick = (tile) => {
    if (won || lost || matchingLines.length > 0) return;
    setDragStart(null);
    setHintIds([]);

    if (matchSelection !== null) {
      if (tile.id === matchSelection.sourceTile.id) {
        if (matchSelection.revertTiles) {
          setTiles(matchSelection.revertTiles);
        }
        setMatchSelection(null);
        setSelectedTile(null);
        sound.playClick();
      } else {
        const option = matchSelection.options.find(opt => opt.t.id === tile.id);
        if (option) {
          saveToHistory();
          sound.playScore();
          const newScore = score + 20;
          setScore(newScore);
          resolveClickMatch(matchSelection.sourceTile.id, tile.id, option.path, newScore);
          setMatchSelection(null);
          setSelectedTile(null);
        }
      }
      return;
    }

    if (selectedTile === null) {
      // Check if there is exactly one aligned match on the board
      const alignedMatches = [];
      const active = tiles.filter(t => t.active && t.id !== tile.id);
      for (const t of active) {
        if (t.sym.name === tile.sym.name) {
          const path = findConnectionPath(tile, t, tiles);
          if (path) {
            alignedMatches.push({ t, path });
          }
        }
      }

      if (alignedMatches.length === 1) {
        // One-click match!
        const match = alignedMatches[0];
        saveToHistory();
        sound.playScore();
        const newScore = score + 20;
        setScore(newScore);
        resolveClickMatch(tile.id, match.t.id, match.path, newScore);
      } else if (alignedMatches.length > 1) {
        // Multiple matches: enter matchSelection state!
        setMatchSelection({
          sourceTile: tile,
          options: alignedMatches
        });
        setSelectedTile(tile);
        sound.playClick();
      } else {
        // No aligned matches! Vibrate all tiles of this symbol
        setVibratingSymbol(tile.sym.name);
        sound.playClick();
        setTimeout(() => setVibratingSymbol(null), 400);
      }
    } else {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        sound.playClick();
      } else if (selectedTile.sym.name === tile.sym.name) {
        const path = findConnectionPath(selectedTile, tile, tiles);
        if (path) {
          saveToHistory();
          sound.playScore();
          const newScore = score + 20;
          setScore(newScore);
          resolveClickMatch(selectedTile.id, tile.id, path, newScore);
          setSelectedTile(null);
        } else {
          // Not aligned: vibrate both and deselect
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      } else {
        // Different symbol: check if the new one has any aligned matches, else vibrate
        const alignedMatches = [];
        const active = tiles.filter(t => t.active && t.id !== tile.id);
        for (const t of active) {
          if (t.sym.name === tile.sym.name) {
            const path = findConnectionPath(tile, t, tiles);
            if (path) {
              alignedMatches.push({ t, path });
            }
          }
        }

        if (alignedMatches.length === 1) {
          setSelectedTile(tile);
          sound.playClick();
        } else if (alignedMatches.length > 1) {
          setMatchSelection({
            sourceTile: tile,
            options: alignedMatches
          });
          setSelectedTile(tile);
          sound.playClick();
        } else {
          setVibratingSymbol(tile.sym.name);
          sound.playClick();
          setTimeout(() => setVibratingSymbol(null), 400);
          setSelectedTile(null);
        }
      }
    }
  };

  const resolveClickMatch = async (tileId1, tileId2, path, newScore) => {
    // 1. Show connection line first
    setMatchingLines([path]);

    const matchedIds = new Set([tileId1, tileId2]);
    let nextTiles = tiles.map(t =>
      matchedIds.has(t.id) ? { ...t, matching: true } : t
    );
    setTiles(nextTiles);

    // Wait 180ms to show the cyan line
    await new Promise(resolve => setTimeout(resolve, 180));

    // Get positions for particles
    const tile1 = tiles.find(t => t.id === tileId1);
    const tile2 = tiles.find(t => t.id === tileId2);

    if (tile1 && tile2) {
      const effectId1 = Math.random();
      const effectId2 = Math.random();
      const newEffects = [
        { id: effectId1, x: tile1.x, y: tile1.y, type: 'particles' },
        { id: effectId2, x: tile2.x, y: tile2.y, type: 'particles' },
        { id: effectId1 + 10, x: tile1.x, y: tile1.y, type: 'text', text: '+20' },
        { id: effectId2 + 10, x: tile2.x, y: tile2.y, type: 'text', text: '+20' },
      ];
      setMatchEffects(newEffects);

      // Clean up effects after 800ms
      setTimeout(() => {
        setMatchEffects(prev => prev.filter(e => e.id !== effectId1 && e.id !== effectId2 && e.id !== effectId1 + 10 && e.id !== effectId2 + 10));
      }, 800);
    }

    // 2. Hide tiles and line
    nextTiles = nextTiles.map(t =>
      matchedIds.has(t.id) ? { ...t, active: false, matching: false } : t
    );
    setTiles(nextTiles);
    setMatchingLines([]);

    // Wait for the remaining particle animation to finish
    await new Promise(resolve => setTimeout(resolve, 450));

    if (nextTiles.every(t => !t.active)) {
      setWon(true);
      sound.playPowerup();
      if (onScoreSave) onScoreSave('Mahjong Slide', newScore + 100);
    } else if (mode === 'slide' && !hasAnyPossibleMovesSlider(nextTiles)) {
      setLost(true);
      sound.playClick();
    }
  };

  const hasAnyPossibleMovesSlider = (currentTiles) => {
    const active = currentTiles.filter(t => t.active);
    if (active.length === 0) return false;

    const symbolGroups = new Map();
    active.forEach(t => {
      if (!symbolGroups.has(t.sym.name)) {
        symbolGroups.set(t.sym.name, []);
      }
      symbolGroups.get(t.sym.name).push(t);
    });

    for (const [sym, list] of symbolGroups.entries()) {
      if (list.length < 2) continue;

      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const t1 = list[i];
          const t2 = list[j];

          if (findConnectionPath(t1, t2, active)) {
            return true;
          }

          const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
          ];

          for (const [pushTileRef, targetTileRef] of [[t1, t2], [t2, t1]]) {
            for (const dir of directions) {
              let currentLayout = active.map(t => ({ ...t }));
              const allowedGroup = new Set();
              let currentTest = pushTileRef;
              while (currentTest) {
                allowedGroup.add(currentTest.id);
                currentTest = active.find(t => t.active && t.x === currentTest.x + dir.dx && t.y === currentTest.y + dir.dy);
              }

              for (let step = 1; step <= 6; step++) {
                const nextCoords = new Map();
                currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));

                if (canPushTile(pushTileRef.id, dir.dx, dir.dy, nextCoords, currentLayout, allowedGroup)) {
                  pushTile(pushTileRef.id, dir.dx, dir.dy, nextCoords, currentLayout);
                  currentLayout = currentLayout.map(t => {
                    const coord = nextCoords.get(t.id);
                    return { ...t, x: coord.x, y: coord.y };
                  });

                  const newT1 = currentLayout.find(t => t.id === pushTileRef.id);
                  const newT2 = currentLayout.find(t => t.id === targetTileRef.id);
                  if (newT1 && newT2 && findConnectionPath(newT1, newT2, currentLayout)) {
                    return true;
                  }
                } else {
                  break;
                }
              }
            }
          }
        }
      }
    }

    return false;
  };

  const checkForMatchesAndResolve = async (currentTiles, originalTiles, draggedTileId) => {
    let nextTiles = currentTiles.map(t => ({ ...t }));
    const activeTiles = nextTiles.filter(t => t.active);

    // Track only moved tiles to prevent automatic explosion of static adjacent tiles
    const movedTileIds = new Set();
    currentTiles.forEach(tile => {
      const orig = originalTiles?.find(o => o.id === tile.id);
      if (orig && (tile.x !== orig.x || tile.y !== orig.y)) {
        movedTileIds.add(tile.id);
      }
    });

    let matchFound = null;

    if (draggedTileId) {
      const draggedTile = nextTiles.find(t => t.id === draggedTileId);
      if (draggedTile && draggedTile.active) {
        const active = nextTiles.filter(t => t.active && t.id !== draggedTileId);
        const possibleMatches = [];
        for (const t2 of active) {
          if (t2.sym.name === draggedTile.sym.name) {
            const path = findConnectionPath(draggedTile, t2, nextTiles);
            if (path) {
              possibleMatches.push({ t: t2, path });
            }
          }
        }

        if (possibleMatches.length === 1) {
          matchFound = { t1: draggedTile, t2: possibleMatches[0].t, path: possibleMatches[0].path };
        } else if (possibleMatches.length > 1) {
          // Multiple matches found! Enter matchSelection state.
          setMatchSelection({
            sourceTile: draggedTile,
            options: possibleMatches,
            revertTiles: originalTiles
          });
          setSelectedTile(draggedTile);
          sound.playClick();
          return; // Stop automatic resolution
        }
      }
    } else {
      // For helper arrows: check any moved tile, but only take at most one match
      for (let i = 0; i < activeTiles.length; i++) {
        for (let j = i + 1; j < activeTiles.length; j++) {
          const t1 = activeTiles[i];
          const t2 = activeTiles[j];

          if (!movedTileIds.has(t1.id) && !movedTileIds.has(t2.id)) {
            continue;
          }

          if (t1.sym.name === t2.sym.name) {
            const path = findConnectionPath(t1, t2, activeTiles);
            if (path) {
              matchFound = { t1, t2, path };
              break;
            }
          }
        }
        if (matchFound) break;
      }
    }

    if (matchFound) {
      sound.playScore();
      const newScore = score + 20;
      setScore(newScore);

      // Save connection path to draw
      setMatchingLines([matchFound.path]);

      const matchedIds = new Set([matchFound.t1.id, matchFound.t2.id]);
      nextTiles = nextTiles.map(t =>
        matchedIds.has(t.id) ? { ...t, matching: true } : t
      );
      setTiles(nextTiles);

      // Wait 180ms to show the cyan line
      await new Promise(resolve => setTimeout(resolve, 180));

      // Spawn particles & score floating text at both tiles
      const effectId1 = Math.random();
      const effectId2 = Math.random();
      const newEffects = [
        { id: effectId1, x: matchFound.t1.x, y: matchFound.t1.y, type: 'particles' },
        { id: effectId2, x: matchFound.t2.x, y: matchFound.t2.y, type: 'particles' },
        { id: effectId1 + 10, x: matchFound.t1.x, y: matchFound.t1.y, type: 'text', text: '+20' },
        { id: effectId2 + 10, x: matchFound.t2.x, y: matchFound.t2.y, type: 'text', text: '+20' },
      ];
      setMatchEffects(newEffects);

      // Clean up effects after 800ms
      setTimeout(() => {
        setMatchEffects(prev => prev.filter(e => e.id !== effectId1 && e.id !== effectId2 && e.id !== effectId1 + 10 && e.id !== effectId2 + 10));
      }, 800);

      // Hide tiles and line
      nextTiles = nextTiles.map(t =>
        matchedIds.has(t.id) ? { ...t, active: false, matching: false } : t
      );
      setTiles(nextTiles);
      setMatchingLines([]);

      // Wait for particle animation to finish
      await new Promise(resolve => setTimeout(resolve, 450));

      if (nextTiles.every(t => !t.active)) {
        setWon(true);
        sound.playPowerup();
        if (onScoreSave) onScoreSave('Mahjong Slide', newScore + 100);
      } else if (mode === 'slide' && !hasAnyPossibleMovesSlider(nextTiles)) {
        setLost(true);
        sound.playClick();
      }
    } else {
      // Revert if no matches were made!
      if (originalTiles) {
        sound.playClick();
        setTiles(originalTiles);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTiles(JSON.parse(prev.tiles));
    setScore(prev.score);
    setSelectedTile(prev.selectedTile ? JSON.parse(prev.selectedTile) : null);
    setHistory(history.slice(0, -1));
    setLost(false);
    setHintIds([]);
    setMatchingLines([]);
    sound.playClick();
  };

  const getHint = () => {
    if (hintsLeft <= 0) return;
    setHintIds([]);
    setHintMove(null);
    const active = tiles.filter(t => t.active);
    if (active.length === 0) return;

    if (mode === 'zen') {
      const freeTiles = active.filter(t => isTileFree(t));
      for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
          if (freeTiles[i].sym.name === freeTiles[j].sym.name) {
            setHintIds([freeTiles[i].id, freeTiles[j].id]);
            setHintsLeft(prev => prev - 1);
            sound.playPowerup();
            return;
          }
        }
      }

      // Fallback for Zen: if no free pairs, show any active pair
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          if (active[i].sym.name === active[j].sym.name) {
            setHintIds([active[i].id, active[j].id]);
            setHintsLeft(prev => prev - 1);
            sound.playPowerup();
            return;
          }
        }
      }
    } else {
      // 1. Try to find a pair that is already aligned and clear
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          if (active[i].sym.name === active[j].sym.name) {
            const path = findConnectionPath(active[i], active[j], active);
            if (path) {
              setHintIds([active[i].id, active[j].id]);
              setHintsLeft(prev => prev - 1);
              sound.playPowerup();
              return;
            }
          }
        }
      }

      // 2. Fallback: simulate a slide movement to find a connectable pair
      const symbolGroups = new Map();
      active.forEach(t => {
        if (!symbolGroups.has(t.sym.name)) symbolGroups.set(t.sym.name, []);
        symbolGroups.get(t.sym.name).push(t);
      });

      for (const [sym, list] of symbolGroups.entries()) {
        if (list.length < 2) continue;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const t1 = list[i];
            const t2 = list[j];
            const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];

            for (const dir of directions) {
              let currentLayout = active.map(t => ({ ...t }));
              const allowedGroup = new Set();
              let currentTest = t1;
              while (currentTest) {
                allowedGroup.add(currentTest.id);
                currentTest = active.find(t => t.active && t.x === currentTest.x + dir.dx && t.y === currentTest.y + dir.dy);
              }

              for (let step = 1; step <= 6; step++) {
                const nextCoords = new Map();
                currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));

                if (canPushTile(t1.id, dir.dx, dir.dy, nextCoords, currentLayout, allowedGroup)) {
                  pushTile(t1.id, dir.dx, dir.dy, nextCoords, currentLayout);
                  currentLayout = currentLayout.map(t => {
                    const coord = nextCoords.get(t.id);
                    return { ...t, x: coord.x, y: coord.y };
                  });
                  const newT1 = currentLayout.find(t => t.id === t1.id);
                  const newT2 = currentLayout.find(t => t.id === t2.id);

                  if (newT1 && newT2 && findConnectionPath(newT1, newT2, currentLayout)) {
                    // Valid simulation found!
                    setHintIds([t1.id, t2.id]);
                    setHintMove({ tileId: t1.id, dx: dir.dx * step, dy: dir.dy * step });
                    setHintsLeft(prev => prev - 1);
                    sound.playPowerup();
                    return;
                  }
                } else {
                  break; // blocked
                }
              }
            }
          }
        }
      }
    }
  };

  const shuffleTiles = () => {
    const active = tiles.filter(t => t.active);
    if (active.length === 0) return;
    saveToHistory();

    const activeSymbols = active.map(t => t.sym);
    for (let i = activeSymbols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activeSymbols[i], activeSymbols[j]] = [activeSymbols[j], activeSymbols[i]];
    }

    let activeIdx = 0;
    const nextTiles = tiles.map(t => {
      if (t.active) {
        return { ...t, sym: activeSymbols[activeIdx++] };
      }
      return t;
    });

    setTiles(nextTiles);
    setHintIds([]);
    setSelectedTile(null);
    setLost(false);
    sound.playPowerup();
  };

  const saveSettings = (newMode, newSize, newShowArrows) => {
    setMode(newMode);
    setBoardSize(newSize);
    setShowArrows(newShowArrows);
    updateGameConfig('mahjong', 'mode', newMode);
    updateGameConfig('mahjong', 'boardSize', newSize);
    setIsSettingsOpen(false);
  };

  const resetInteraction = () => {
    lastTouchTime.current = Date.now();
    nextDiscreetHintThreshold.current = 60000;
    setDiscreetHintId(null);
  };

  useEffect(() => {
    resetInteraction();
  }, [history]); // Reset timer and hint when a move is made (pair matched or tile slid)

  useEffect(() => {
    const checkDiscreetHint = () => {
      if (won || lost || showIntro || isSettingsOpen || discreetHintId) return;
      const now = Date.now();
      if (now - lastTouchTime.current > nextDiscreetHintThreshold.current) {
        const active = tiles.filter(t => t.active);
        if (active.length === 0) return;

        let foundId = null;

        if (mode === 'zen') {
          for (let i = 0; i < active.length; i++) {
            for (let j = i + 1; j < active.length; j++) {
              if (active[i].sym.name === active[j].sym.name) {
                foundId = active[i].id;
                break;
              }
            }
            if (foundId) break;
          }
        } else {
          for (let i = 0; i < active.length; i++) {
            for (let j = i + 1; j < active.length; j++) {
              if (active[i].sym.name === active[j].sym.name) {
                if (findConnectionPath(active[i], active[j], active)) {
                  foundId = active[i].id;
                  break;
                }
              }
            }
            if (foundId) break;
          }

          if (!foundId) {
            const symbolGroups = new Map();
            active.forEach(t => {
              if (!symbolGroups.has(t.sym.name)) symbolGroups.set(t.sym.name, []);
              symbolGroups.get(t.sym.name).push(t);
            });
            for (const [sym, list] of symbolGroups.entries()) {
              if (list.length < 2) continue;
              for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                  const t1 = list[i];
                  const t2 = list[j];
                  const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
                  for (const dir of directions) {
                    let currentLayout = active.map(t => ({ ...t }));
                    const allowedGroup = new Set();
                    let currentTest = t1;
                    while (currentTest) {
                      allowedGroup.add(currentTest.id);
                      currentTest = active.find(t => t.active && t.x === currentTest.x + dir.dx && t.y === currentTest.y + dir.dy);
                    }
                    for (let step = 1; step <= 6; step++) {
                      const nextCoords = new Map();
                      currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));
                      if (canPushTile(t1.id, dir.dx, dir.dy, nextCoords, currentLayout, allowedGroup)) {
                        pushTile(t1.id, dir.dx, dir.dy, nextCoords, currentLayout);
                        currentLayout = currentLayout.map(t => {
                          const coord = nextCoords.get(t.id);
                          return { ...t, x: coord.x, y: coord.y };
                        });
                        const newT1 = currentLayout.find(t => t.id === t1.id);
                        const newT2 = currentLayout.find(t => t.id === t2.id);
                        if (newT1 && newT2 && findConnectionPath(newT1, newT2, currentLayout)) {
                          foundId = t1.id;
                          break;
                        }
                      } else {
                        break;
                      }
                    }
                    if (foundId) break;
                  }
                  if (foundId) break;
                }
                if (foundId) break;
              }
              if (foundId) break;
            }
          }
        }

        if (foundId) {
          setDiscreetHintId(foundId);
        } else {
          // If no hint can be found, check again in 10s
          nextDiscreetHintThreshold.current += 10000;
        }
      }
    };

    discreetHintTimer.current = setInterval(checkDiscreetHint, 1000);
    return () => clearInterval(discreetHintTimer.current);
  }, [tiles, won, lost, showIntro, isSettingsOpen, mode]);

  // Grid dimensions
  const cellWidth = MAHJONG_THEME.board.cellWidth;
  const cellHeight = MAHJONG_THEME.board.cellHeight;
  const tileWidth = MAHJONG_THEME.board.tileWidth;
  const tileHeight = MAHJONG_THEME.board.tileHeight;

  const maxBoardWidth = mode === 'zen' ? (boardSize === 'small' ? 220 : boardSize === 'medium' ? 280 : 348) : 6 * cellWidth;
  const maxBoardHeight = mode === 'zen' ? (boardSize === 'small' ? 260 : boardSize === 'medium' ? 340 : 420) : maxRows * cellHeight;

  const gridSlots = [];
  for (let y = 1; y <= maxRows; y++) {
    for (let x = 1; x <= 6; x++) {
      gridSlots.push({ x, y });
    }
  }

  return (
    <>
      {showIntro && <GameIntro
        gameName="MAHJONG ZEN"
        icon="🀄"
        colors={['#10b981', '#3b82f6', '#f59e0b']}
        particleType="tiles"
        onComplete={() => setShowIntro(false)}
      />}
      <div
        ref={containerRef}
        className="game-container"
        style={containerStyle}
        onMouseMove={handleTileMouseMove}
        onTouchMove={handleTileTouchMove}
        onMouseUp={handleDragRelease}
        onTouchEnd={handleDragRelease}
      >
        {/* Jungle bottom silhouette overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '110px',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
          borderBottomLeftRadius: '25px',
          borderBottomRightRadius: '25px',
        }}>
          <svg viewBox="0 0 430 110" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path d="M 0 110 Q 50 65 100 85 Q 150 55 200 80 Q 250 45 300 75 Q 350 55 400 85 T 430 75 L 430 110 Z" fill="#047857" opacity="0.25" />
            <path d="M 0 110 Q 60 75 120 90 Q 180 65 240 85 Q 300 60 360 85 T 430 80 L 430 110 Z" fill="#065f46" opacity="0.5" />
            <path d="M 0 110 Q 70 85 140 95 Q 210 75 280 90 Q 350 70 420 90 T 430 85 L 430 110 Z" fill="#022c22" opacity="0.9" />
          </svg>
        </div>

        {/* Wind Breeze Animation */}
        {windGust && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            zIndex: 50,
            overflow: 'hidden'
          }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="wind-leaf" style={{
                position: 'absolute',
                left: `-20px`,
                top: `${Math.random() * 80}%`,
                width: `${10 + Math.random() * 10}px`,
                height: `${10 + Math.random() * 10}px`,
                background: '#4ade80',
                borderRadius: '12px 0px 12px 0px',
                animation: `blowLeaf ${2.5 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
                opacity: 0,
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.3)'
              }} />
            ))}
          </div>
        )}

        <style>{`
        @keyframes blowLeaf {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(120vw, -100px) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes leaf-spin-out {
          0% {
            transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.3);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes sparkle-glow {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }
        @keyframes float-up-fade {
          0% {
            transform: translate(-50%, -50%) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-50px);
            opacity: 0;
          }
        }
        @keyframes victory-bounce {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes victory-glow {
          from { text-shadow: 0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(56, 189, 248, 0.4); }
          to { text-shadow: 0 0 20px rgba(56, 189, 248, 1), 0 0 30px rgba(56, 189, 248, 0.6); }
        }
        @keyframes pulse-glow-anim {
          0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.4); }
          100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
        }
        .pulse-glow {
          animation: pulse-glow-anim 1s infinite alternate;
        }
        @keyframes hint-simulate {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(calc(var(--hint-dx) * 1px), calc(var(--hint-dy) * 1px)) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .hint-simulating {
          animation: hint-simulate 1.2s infinite ease-in-out;
          z-index: 100 !important;
        }
        @keyframes shake-vibrate {
          0% { transform: translate(0, 0) rotate(0deg); }
          15% { transform: translate(-6px, 0px) rotate(-4deg); }
          30% { transform: translate(6px, 0px) rotate(4deg); }
          45% { transform: translate(-4px, 2px) rotate(-3deg); }
          60% { transform: translate(4px, -2px) rotate(3deg); }
          75% { transform: translate(-2px, -1px) rotate(-1deg); }
          90% { transform: translate(2px, 1px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .tile-vibrating {
          animation: shake-vibrate 0.4s cubic-bezier(.36,.07,.19,.97) both;
          z-index: 999 !important;
        }

        @keyframes discreet-hint-anim {
          0%, 100% { box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.3); filter: brightness(1); transform: scale(1); }
          50% { box-shadow: inset 0 0 20px rgba(56, 189, 248, 0.9), 0 0 15px rgba(56, 189, 248, 0.8); filter: brightness(1.2); transform: scale(1.05); z-index: 99; }
        }
        .discreet-hint-glow {
          animation: discreet-hint-anim 1.5s ease-in-out infinite;
        }

        @keyframes shuffle-glow {
          0%, 100% { box-shadow: 0 8px 15px rgba(234, 88, 12, 0.4), inset 0 6px 8px rgba(255,255,255,0.6), inset 0 -4px 6px rgba(0,0,0,0.4); transform: scale(1); filter: brightness(1); }
          50% { box-shadow: 0 8px 25px rgba(234, 88, 12, 0.9), inset 0 6px 8px rgba(255,255,255,0.8), inset 0 -4px 6px rgba(0,0,0,0.4); transform: scale(1.1); filter: brightness(1.2); }
        }
        @keyframes shuffle-panic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); transform: scale(1); background: radial-gradient(circle at 30% 30%, #ef4444, #b91c1c); }
          50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); transform: scale(1.2); background: radial-gradient(circle at 30% 30%, #f87171, #ef4444); }
        }
        .btn-shuffle {
          background: radial-gradient(circle at 30% 30%, #fb923c, #ea580c);
          border-bottom: 4px solid #c2410c;
          width: 44px;
          height: 44px;
          margin-left: 10px;
        }
        .pulse-shuffle {
          animation: shuffle-panic 0.8s infinite !important;
          border-bottom-color: #991b1b !important;
        }

        @keyframes vapor-move {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes aggressive-flash {
          0%, 100% { opacity: 0.6; filter: brightness(1); }
          25% { opacity: 1; filter: brightness(1.5); }
          50% { opacity: 0.8; filter: brightness(1.2); }
          75% { opacity: 1; filter: brightness(1.8); }
        }
        @keyframes bar-vibrate {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(2px) scaleY(1.01); }
          50% { transform: translateX(-1px) scaleY(0.99); }
          75% { transform: translateX(3px) scaleY(1.02); }
        }
        .left-attention-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 20px;
          z-index: 100;
          pointer-events: none;
          animation: bar-vibrate 0.15s linear infinite;
          overflow: hidden;
          border-right: 2px solid rgba(255, 255, 255, 0.4);
        }
        .left-attention-bar::before {
          content: '';
          position: absolute;
          top: -10px; left: -10px; right: 0px; bottom: -10px;
          background: linear-gradient(45deg, #ff0044, #ffea00, #00ffaa, #00d4ff, #8400ff, #ff00bb);
          background-size: 600% 600%;
          animation: vapor-move 2.5s ease infinite, aggressive-flash 1.2s infinite;
          filter: blur(8px);
          opacity: 0.9;
          mix-blend-mode: screen;
          border-radius: 20px;
        }
        .left-attention-bar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.9));
          animation: vapor-move 0.8s linear infinite;
          background-size: 100% 200%;
          border-right: 3px solid #fff;
          border-radius: 10px 0 0 10px;
        }

        :root {
          --container-padding: 24px;
          --board-padding: 16px;
        }
      `}</style>
        <GameHeader
          title="MAHJONG ZEN"
          onBack={handleBackWithConfirm}
          onRestart={initGame}
          onUndo={undo}
          undoDisabled={history.length === 0}
          onShop={() => setIsSettingsOpen(true)}
          showBgmToggle={false} // bgm is not toggled here directly
          centerContent={
            <div className="stats_header" style={{ display: 'flex', gap: '10px', alignItems: 'center', fontFamily: 'Orbitron, sans-serif' }}>
              <div style={{
                background: 'linear-gradient(180deg, rgba(250, 204, 21, 0.2), rgba(202, 138, 4, 0.4))',
                border: '2px solid rgba(250, 204, 21, 0.6)',
                borderRadius: '12px',
                padding: '4px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(250, 204, 21, 0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>🏆 Record</span>
                <span style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '900' }}>{highScore}</span>
              </div>

              <div style={{
                background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.2), rgba(8, 145, 178, 0.4))',
                border: '2px solid rgba(34, 211, 238, 0.6)',
                borderRadius: '12px',
                padding: '4px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(34, 211, 238, 0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#cffafe', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>⭐ Score</span>
                <span style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '900' }}>{score}</span>
              </div>
            </div>
          }
          style={{ marginBottom: '15px' }}
        />

        {/* Hint Button & Shuffle Button */}
        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', /*maxWidth: `${maxBoardWidth + 32}px`,*/ marginBottom: '10px' }}>
          <button
            onClick={getHint}
            disabled={hintsLeft <= 0}
            className="candy-btn btn-hint"
            title="Indice"
            style={{ width: '44px', height: '44px', padding: 0 }}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" style={{ width: '22px', height: '22px', fill: 'currentColor' }}>
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
            </svg>
            <span className="badge">{hintsLeft}</span>
          </button>
          <button
            onClick={() => { shuffleTiles(); setLost(false); }}
            className={`candy-btn btn-shuffle ${lost ? 'pulse-shuffle' : ''}`}
            title="Mélanger"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" style={{ width: '22px', height: '22px', fill: 'currentColor' }}>
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
        </div>



        {/* Playfield wrapper styled to match screenshots */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: `${(maxBoardHeight + 32) * boardScale}px`,
          position: 'relative'
        }}>
          {/* New Banner Position - Completely outside the overflow:hidden wrapper */}
          {lost && mode === 'slide' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(10, 15, 30, 0.95)',
              color: '#ef4444',
              padding: '15px 30px',
              borderRadius: '16px',
              border: '3px solid #ef4444',
              fontSize: '1.4rem',
              fontWeight: '900',
              textAlign: 'center',
              zIndex: 9999,
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.8), inset 0 0 15px rgba(239, 68, 68, 0.5)',
              animation: 'victory-bounce 1s infinite alternate',
              width: 'max-content',
              pointerEvents: 'none',
              textTransform: 'uppercase'
            }}>
              plus aucun coup possible... mélanger
            </div>
          )}

          <div style={{
            ...boardWrapperStyle,
            background: mode === 'slide' ? 'rgba(8, 60, 84, 0.2)' : '#f8fafc',
            border: mode === 'slide' ? '6px solid #38bdf8' : '2px solid var(--border-color)',
            borderLeft: mode === 'slide' ? '12px solid red' : '2px solid var(--border-color)',
            boxShadow: mode === 'slide' ? 'inset 0 4px 12px rgba(0,0,0,0.4), 0 10px 25px rgba(0,0,0,0.15)' : 'inset 0 2px 8px rgba(0,0,0,0.02)',
            position: 'relative',
            zIndex: 2,
            width: `${maxBoardWidth + 32}px`,
            height: `${maxBoardHeight + 32}px`,
            transform: `scale(${boardScale})`,
            transformOrigin: 'top center',
            flexShrink: 0
          }}>
            {/* Left Attention Bar for Accessibility (Hemispatial neglect) */}
            <div className="left-attention-bar" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }} />

            <div className="board-scaler" style={{ ...boardStyle, width: `${maxBoardWidth}px`, height: `${maxBoardHeight}px` }}>
              {/* Overlay for "lost" state (Option 2: Grid darkening) */}
              {lost && mode === 'slide' && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 200,
                  borderRadius: 'inherit',
                  pointerEvents: 'none'
                }} />
              )}

              {/* Alert Banner has been moved completely outside this container to avoid z-index and clipping issues */}

              {/* Faint grid guide lines in slider mode */}
              {mode === 'slide' && gridSlots.map(slot => (
                <div
                  key={`bg-${slot.x}-${slot.y}`}
                  style={{
                    position: 'absolute',
                    left: `${(slot.x - 1) * cellWidth}px`,
                    top: `${(slot.y - 1) * cellHeight}px`,
                    width: `${tileWidth}px`,
                    height: `${tileHeight}px`,
                    borderRadius: '8px',
                    border: '1px dotted black',
                    background: 'rgba(255, 255, 255, 0.01)',
                    pointerEvents: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              ))}

              {/* Glowing laser crosshair guides for active drag */}
              {mode === 'slide' && dragStart && dragHasMoved && (() => {
                const draggedTile = tiles.find(t => t.id === dragStart.tileId);
                if (!draggedTile) return null;

                const crosshairX = (draggedTile.x - 0.5) * cellWidth;
                const crosshairY = (draggedTile.y - 0.5) * cellHeight;
                const boardW = 6 * cellWidth;
                const boardH = maxRows * cellHeight;

                return (
                  <>
                    {/* Horizontal crosshair laser */}
                    <div style={{
                      position: 'absolute',
                      top: `${crosshairY - 2}px`,
                      left: 0,
                      width: `${boardW}px`,
                      height: '4px',
                      background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1), #00f0ff, rgba(0, 240, 255, 0.1))',
                      boxShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff',
                      zIndex: 90,
                      pointerEvents: 'none',
                      borderRadius: '2px'
                    }} />
                    {/* Vertical crosshair laser */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: `${crosshairX - 2}px`,
                      width: '4px',
                      height: `${boardH}px`,
                      background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.1), #00f0ff, rgba(0, 240, 255, 0.1))',
                      boxShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff',
                      zIndex: 90,
                      pointerEvents: 'none',
                      borderRadius: '2px'
                    }} />
                  </>
                );
              })()}

              {/* Golden bands for hint */}
              {mode === 'slide' && hintIds.length === 2 && (() => {
                const t1 = tiles.find(t => t.id === hintIds[0]);
                const t2 = tiles.find(t => t.id === hintIds[1]);
                if (!t1 || !t2) return null;

                const boardW = 6 * cellWidth;
                const boardH = maxRows * cellHeight;

                const renderBand = (isHoriz, pos, key) => {
                  const style = isHoriz ? {
                    position: 'absolute',
                    top: `${(pos - 1) * cellHeight}px`,
                    left: 0,
                    width: `${boardW}px`,
                    height: `${cellHeight}px`,
                    background: 'linear-gradient(90deg, rgba(250, 204, 21, 0.0), rgba(250, 204, 21, 0.3), rgba(250, 204, 21, 0.0))',
                    zIndex: 85,
                    pointerEvents: 'none',
                  } : {
                    position: 'absolute',
                    top: 0,
                    left: `${(pos - 1) * cellWidth}px`,
                    width: `${cellWidth}px`,
                    height: `${boardH}px`,
                    background: 'linear-gradient(180deg, rgba(250, 204, 21, 0.0), rgba(250, 204, 21, 0.3), rgba(250, 204, 21, 0.0))',
                    zIndex: 85,
                    pointerEvents: 'none',
                  };
                  return <div key={key} style={style} />;
                };

                const bands = [];
                if (hintMove) {
                  if (hintMove.dx !== 0) {
                    bands.push(renderBand(true, t1.y, 'h-t1'));
                    bands.push(renderBand(false, t2.x, 'v-t2'));
                  } else {
                    bands.push(renderBand(false, t1.x, 'v-t1'));
                    bands.push(renderBand(true, t2.y, 'h-t2'));
                  }
                } else {
                  if (t1.x === t2.x) {
                    bands.push(renderBand(false, t1.x, 'v-shared'));
                  } else if (t1.y === t2.y) {
                    bands.push(renderBand(true, t1.y, 'h-shared'));
                  } else {
                    bands.push(renderBand(true, t1.y, 'h-t1'));
                    bands.push(renderBand(false, t1.x, 'v-t1'));
                    bands.push(renderBand(true, t2.y, 'h-t2'));
                    bands.push(renderBand(false, t2.x, 'v-t2'));
                  }
                }

                return <>{bands}</>;
              })()}

              {/* Render glowing matching lines */}
              {matchingLines.length > 0 && (
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 95,
                    pointerEvents: 'none',
                  }}
                >
                  {matchingLines.map((path, idx) => {
                    const pointsStr = path.map(p => {
                      const px = (p.x - 1) * cellWidth + cellWidth / 2;
                      const py = (p.y - 1) * cellHeight + cellHeight / 2;
                      return `${px},${py}`;
                    }).join(' ');

                    return (
                      <polyline
                        key={`path-${idx}`}
                        points={pointsStr}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          filter: 'drop-shadow(0 0 3px #06b6d4) drop-shadow(0 0 8px #22d3ee)',
                        }}
                      />
                    );
                  })}
                </svg>
              )}

              {/* Render particle explosion & floating score effects */}
              {matchEffects.map(effect => {
                if (effect.type === 'particles') {
                  return (
                    <div
                      key={effect.id}
                      style={{
                        position: 'absolute',
                        left: `${(effect.x - 1) * cellWidth}px`,
                        top: `${(effect.y - 1) * cellHeight}px`,
                        width: `${tileWidth}px`,
                        height: `${tileHeight}px`,
                        pointerEvents: 'none',
                        zIndex: 100,
                      }}
                    >
                      {/* Central glowing ring */}
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: '30px',
                        height: '30px',
                        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(34, 197, 94, 0) 70%)',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        animation: 'sparkle-glow 0.6s forwards ease-out',
                      }} />
                      {/* Floating leaves */}
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * 360) / 8;
                        const rad = (angle * Math.PI) / 180;
                        const tx = Math.cos(rad) * 45;
                        const ty = Math.sin(rad) * 45;
                        return (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              animation: 'leaf-spin-out 0.6s forwards ease-out',
                              animationDelay: `${i * 0.02}s`,
                              '--tx': `${tx}px`,
                              '--ty': `${ty}px`,
                              '--rot': `${angle + 180}deg`,
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#22c55e">
                              <path d="M12 2C8 6 8 10 12 12C16 10 16 6 12 2Z" />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else if (effect.type === 'text') {
                  return (
                    <div
                      key={effect.id}
                      style={{
                        position: 'absolute',
                        left: `${(effect.x - 1) * cellWidth + cellWidth / 2}px`,
                        top: `${(effect.y - 1) * cellHeight + cellHeight / 2}px`,
                        transform: 'translate(-50%, -50%)',
                        color: '#facc15', // Gold color
                        fontWeight: '900',
                        fontSize: '26px',
                        fontFamily: 'var(--font-main), sans-serif',
                        textShadow: '0 0 6px #eab308, 0 1px 3px rgba(0,0,0,0.6)',
                        animation: 'float-up-fade 0.8s forwards ease-out',
                        pointerEvents: 'none',
                        zIndex: 101,
                      }}
                    >
                      {effect.text}
                    </div>
                  );
                }
                return null;
              })}

              {/* Slider circular shifting arrows (optional, hidden by default) */}
              {mode === 'slide' && showArrows && (
                <>
                  {Array.from({ length: maxRows }).map((_, rIdx) => {
                    const y = rIdx + 1;
                    return (
                      <React.Fragment key={`row-ctrl-${y}`}>
                        <button
                          onClick={() => shiftRow(y, -1)}
                          style={{ ...rowArrowStyle, left: '-30px', top: `${(y - 1) * cellHeight + 16}px` }}
                        >
                          ◀
                        </button>
                        <button
                          onClick={() => shiftRow(y, 1)}
                          style={{ ...rowArrowStyle, right: '-30px', top: `${(y - 1) * cellHeight + 16}px` }}
                        >
                          ▶
                        </button>
                      </React.Fragment>
                    );
                  })}

                  {Array.from({ length: 6 }).map((_, cIdx) => {
                    const x = cIdx + 1;
                    return (
                      <React.Fragment key={`col-ctrl-${x}`}>
                        <button
                          onClick={() => shiftColumn(x, -1)}
                          style={{ ...colArrowStyle, top: '-30px', left: `${(x - 1) * cellWidth + 10}px` }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => shiftColumn(x, 1)}
                          style={{ ...colArrowStyle, bottom: '-30px', left: `${(x - 1) * cellWidth + 10}px` }}
                        >
                          ▼
                        </button>
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              {/* Render Active Tiles */}
              {tiles.map((tile) => {
                if (!tile.active) return null;

                const isSelected = selectedTile?.id === tile.id;
                const isHint = hintIds.includes(tile.id);
                const isFree = mode === 'zen' ? isTileFree(tile) : true;

                // Determine if this tile is grayed out/unclickable due to matchSelection
                let isGreyedOut = false;
                let isMatchOption = false;
                if (matchSelection !== null) {
                  const isSource = tile.id === matchSelection.sourceTile.id;
                  const isOption = matchSelection.options.some(opt => opt.t.id === tile.id);
                  if (isOption) {
                    isMatchOption = true;
                  }
                  if (!isSource && !isOption) {
                    isGreyedOut = true;
                  }
                }

                let left = 0;
                let top = 0;
                let zIndex = 80;

                if (mode === 'zen') {
                  left = (tile.x - 1) * 30 + tile.z * 5;
                  top = (tile.y - 1) * 44 - tile.z * 7;
                  zIndex = 80 + tile.z + (isSelected ? 50 : 0);
                } else {
                  left = (tile.x - 1) * cellWidth;
                  top = (tile.y - 1) * cellHeight;
                  zIndex = 80 + (isSelected ? 50 : 0) + (isMatchOption ? 40 : 0);
                }

                return (
                  <div
                    key={tile.id}
                    onClick={() => mode === 'zen' ? handleZenTileClick(tile) : null}
                    onMouseDown={(e) => handleTileMouseDown(e, tile)}
                    onTouchStart={(e) => handleTileTouchStart(e, tile)}
                    className={`mahjong-tile-3d ${isSelected ? 'selected' : ''} ${isHint ? 'hinted' : ''} ${!isFree && mode === 'zen' ? 'blocked' : ''} ${tile.sym.name === vibratingSymbol ? 'tile-vibrating' : ''} ${hintMove && hintMove.tileId === tile.id ? 'hint-simulating' : ''} ${discreetHintId === tile.id ? 'discreet-hint-glow' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${mode === 'zen' ? 44 : tileWidth}px`,
                      height: `${mode === 'zen' ? 56 : tileHeight}px`,
                      zIndex,
                      transform: isSelected ? 'translate3d(0, -8px, 10px)' : 'none',
                      cursor: isGreyedOut ? 'not-allowed' : (isFree ? 'pointer' : 'not-allowed'),
                      opacity: isGreyedOut ? 0.25 : (tile.matching ? 0.7 : isFree ? 1 : 0.6),
                      filter: isGreyedOut ? 'grayscale(100%) brightness(0.6)' : (isFree ? 'none' : 'brightness(0.8) grayscale(20%)'),
                      pointerEvents: isGreyedOut ? 'none' : 'auto',
                      '--hint-dx': hintMove && hintMove.tileId === tile.id ? hintMove.dx * cellWidth : 0,
                      '--hint-dy': hintMove && hintMove.tileId === tile.id ? hintMove.dy * cellHeight : 0,
                      background: '#ffffff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                      borderBottom: tile.sym.name === vibratingSymbol
                        ? '5px solid #ef4444'
                        : '5px solid #16a34a', // Thicker green bottom layer
                      borderRight: tile.sym.name === vibratingSymbol
                        ? '3px solid #dc2626'
                        : '3px solid #15803d',
                      boxShadow: tile.sym.name === vibratingSymbol
                        ? '0 0 20px #ef4444'
                        : isSelected
                          ? '0 0 20px #00f0ff, inset 0 0 10px #00f0ff'
                          : isMatchOption
                            ? '0 0 20px #38bdf8, inset 0 0 10px #38bdf8'
                            : isHint
                              ? '0 0 20px #facc15, inset 0 0 10px #facc15'
                              : `0 4px 6px rgba(0, 0, 0, 0.15), ${tile.z * 2}px ${tile.z * 2 + 2}px 6px rgba(0,0,0,0.18)`,
                      outline: isSelected
                        ? '3px solid #00f0ff'
                        : isMatchOption
                          ? '3px solid #38bdf8'
                          : isHint
                            ? '3px dashed #facc15'
                            : 'none',
                      outlineOffset: '2px',
                      transition: dragStart ? 'none' : 'left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1), transform 0.15s, opacity 0.2s',
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                  >
                    <MahjongIcon name={tile.sym.name} />

                    {isMatchOption && (
                      <div style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: '900',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        border: '1.5px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                        whiteSpace: 'nowrap',
                        zIndex: 100,
                        animation: 'victory-bounce 0.6s infinite alternate'
                      }}>
                        CHOISIR
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </div>



        {won && <WinLossTransition type="win" />}
        {won && (
          <div style={{
            ...overlayStyle,
            animation: 'delayFadeIn 2s forwards',
            background: 'rgba(8, 60, 84, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '4px solid #38bdf8',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.6), inset 0 0 20px rgba(56, 189, 248, 0.3)',
            color: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Confetti pieces falling */}
            {confetti.map(c => (
              <div
                key={c.id}
                style={{
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: `${c.y}px`,
                  width: `${c.size}px`,
                  height: `${c.size * 1.5}px`,
                  backgroundColor: c.color,
                  borderRadius: '2px',
                  zIndex: 999,
                  animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
                  transform: `rotate(${c.rotation}deg)`,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Animated Trophy / Crown Icon */}
            <div className="victory-crown" style={{ fontSize: '70px', marginBottom: '16px', animation: 'victory-bounce 1s infinite alternate', zIndex: 10 }}>
              🏆
            </div>

            <div style={{
              fontFamily: 'var(--font-main)',
              fontSize: '32px',
              color: '#38bdf8',
              fontWeight: '900',
              textShadow: '0 0 15px rgba(56, 189, 248, 0.8)',
              marginBottom: '10px',
              letterSpacing: '1px',
              animation: 'victory-glow 1.5s ease-in-out infinite alternate',
              zIndex: 10
            }}>
              FÉLICITATIONS !
            </div>

            <div style={{
              color: '#e0f2fe',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '28px',
              maxWidth: '300px',
              lineHeight: '1.5',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              zIndex: 10
            }}>
              Vous avez brillamment complété le plateau avec un score de <strong style={{ color: '#f59e0b' }}>{score}</strong> points !
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '240px', zIndex: 10 }}>
              <button
                onClick={() => {
                  if (onIntermissionRequest) onIntermissionRequest();
                  else initGame();
                }}
                className="retro-btn pulse-glow"
                style={{
                  ...restartBtnStyle,
                  background: '#10b981',
                  borderColor: '#10b981',
                  color: '#ffffff',
                  width: '100%',
                  fontWeight: '800',
                  fontSize: '16px',
                  padding: '12px 0',
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                }}
              >
                🔄 Nouveau Niveau
              </button>
              <button
                onClick={onBack}
                className="retro-btn"
                style={{
                  ...restartBtnStyle,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#e0f2fe',
                  width: '100%',
                  fontWeight: '700',
                  fontSize: '15px',
                  padding: '10px 0',
                  borderRadius: '12px',
                }}
              >
                &lt; Retour au Hub
              </button>
            </div>
          </div>
        )}

        {/* 'lost' overlay removed as user cannot 'lose' anymore, only shuffle. */}

        {isSettingsOpen && (
          <div className="accessibility-modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
            <div className="accessibility-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="accessibility-modal-title">Paramètres de Mahjong</h3>

              <div className="accessibility-setting-row">
                <span className="accessibility-setting-label">Mode de Jeu :</span>
                <div className="accessibility-setting-options">
                  <button
                    className={`accessibility-setting-btn ${mode === 'zen' ? 'active' : ''}`}
                    onClick={() => saveSettings('zen', boardSize, showArrows)}
                  >
                    Zen (Solitaire)
                  </button>
                  <button
                    className={`accessibility-setting-btn ${mode === 'slide' ? 'active' : ''}`}
                    onClick={() => saveSettings('slide', boardSize, showArrows)}
                  >
                    Slider (Glisser/Aligner)
                  </button>
                </div>
              </div>

              <div className="accessibility-setting-row">
                <span className="accessibility-setting-label">Taille / Tuiles :</span>
                <div className="accessibility-setting-options">
                  <button
                    className={`accessibility-setting-btn ${boardSize === 'small' ? 'active' : ''}`}
                    onClick={() => saveSettings(mode, 'small', showArrows)}
                  >
                    Petite ({mode === 'zen' ? '36' : '24'} tuiles)
                  </button>
                  <button
                    className={`accessibility-setting-btn ${boardSize === 'medium' ? 'active' : ''}`}
                    onClick={() => saveSettings(mode, 'medium', showArrows)}
                  >
                    Moyenne ({mode === 'zen' ? '72' : '36'} tuiles)
                  </button>
                  <button
                    className={`accessibility-setting-btn ${boardSize === 'large' ? 'active' : ''}`}
                    onClick={() => saveSettings(mode, 'large', showArrows)}
                  >
                    Grande ({mode === 'zen' ? '144' : '48'} tuiles)
                  </button>
                </div>
              </div>

              <div className="accessibility-setting-row">
                <span className="accessibility-setting-label">Flèches d'aide :</span>
                <div className="accessibility-setting-options">
                  <button
                    className={`accessibility-setting-btn ${showArrows ? 'active' : ''}`}
                    onClick={() => saveSettings(mode, boardSize, true)}
                  >
                    Afficher
                  </button>
                  <button
                    className={`accessibility-setting-btn ${!showArrows ? 'active' : ''}`}
                    onClick={() => saveSettings(mode, boardSize, false)}
                  >
                    Masquer
                  </button>
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

        <div style={{ padding: '0 20px 20px 20px' }}>
          <div style={footerHelpStyle}>
            {mode === 'zen'
              ? 'Mahjong Zen : Sélectionnez deux tuiles identiques libres pour les éliminer.'
              : 'Mahjong Slider : Glissez une tuile pour pousser les autres. Alignez deux tuiles identiques en ligne droite dégagée pour les faire disparaître.'}
          </div>
        </div>
      </div>
    </>
  );
}

// Styles matching the reference visual theme
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(to bottom, #0ea5e9 0%, rgba(14, 165, 233, 0) 50%), linear-gradient(to top, #022c22 0%, rgba(2, 44, 34, 0) 80%), url("https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop") center bottom / cover no-repeat',
  backgroundBlendMode: 'normal',
  boxSizing: 'border-box',
  margin: '0',
  position: 'relative',
  overflow: 'hidden'
};

const headerWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px',
  gap: '10px',
};

const blueSquareBtnStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '12px',
  background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
  border: '2px solid #ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
  position: 'relative',
};

const redDotStyle = {
  position: 'absolute',
  top: '-2px',
  right: '-2px',
  width: '10px',
  height: '10px',
  background: '#ef4444',
  borderRadius: '50%',
  border: '2px solid #ffffff',
};

const referenceStatsStyle = {
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
  border: '2.5px solid #60a5fa',
  borderRadius: '16px',
  padding: '6px 12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
};

const statItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const statLabelStyle = {
  fontSize: MAHJONG_THEME.fonts.statLabelSize,
  fontWeight: 'bold',
  color: '#93c5fd',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statValueStyle = {
  fontSize: MAHJONG_THEME.fonts.statValueSize,
  fontWeight: '900',
  color: '#ffffff',
};

const roundTitleStyle = {
  fontSize: MAHJONG_THEME.fonts.roundTitleSize,
  fontWeight: '800',
  color: '#ffffff',
  textAlign: 'center',
  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  margin: '10px 0 12px 0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const helpersContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const helperBtnStyle = {
  padding: '6px 14px',
  fontSize: MAHJONG_THEME.fonts.helperBtnSize,
  fontWeight: '800',
  color: '#1e3a8a',
  background: '#ffffff',
  border: '2px solid #60a5fa',
  borderRadius: '12px',
  cursor: 'pointer',
  minHeight: '38px',
  boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
};

const boardWrapperStyle = {
  width: '100%',
  borderRadius: '24px',
  padding: 'var(--board-padding, 16px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  transition: 'background-color 0.3s, border-color 0.3s',
  overflow: 'hidden',
  minHeight: "min-content"
};

const boardStyle = {
  position: 'relative',
  margin: '0 auto',
};

const bottomControlsStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '16px',
  position: 'relative',
  zIndex: 2,
};

const hintCircleBtnStyle = {
  position: 'relative',
  width: '68px',
  height: '68px',
  borderRadius: '50%',
  background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
  border: '3.5px solid #ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
  transition: 'transform 0.1s active',
};

const badgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '24px',
  height: '24px',
  background: '#ef4444',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: MAHJONG_THEME.fonts.badgeSize,
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #ffffff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(2, 132, 199, 0.96)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 150,
  padding: '24px',
  textAlign: 'center',
  borderRadius: '24px',
  border: '3px solid #ffffff'
};

const victoryTitleStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '32px',
  color: '#ffffff',
  fontWeight: '900',
  marginBottom: '12px',
  textShadow: '0 2px 6px rgba(0,0,0,0.3)',
};

const descStyle = {
  color: '#e0f2fe',
  fontSize: MAHJONG_THEME.fonts.descSize,
  fontWeight: '600',
  marginBottom: '24px',
};

const restartBtnStyle = {
  padding: '14px 28px',
  fontSize: MAHJONG_THEME.fonts.restartBtnSize,
  border: '2px solid #ffffff',
  background: '#ffffff',
  color: '#0284c7',
  fontWeight: '800',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
};

const footerHelpStyle = {
  marginTop: '16px',
  fontSize: MAHJONG_THEME.fonts.footerHelpSize,
  fontWeight: 'bold',
  color: '#e0f2fe',
  textAlign: 'center',
  lineHeight: '1.45',
  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
};

const rowArrowStyle = {
  position: 'absolute',
  width: '24px',
  height: '32px',
  borderRadius: '6px',
  background: '#ffffff',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const colArrowStyle = {
  position: 'absolute',
  width: '32px',
  height: '24px',
  borderRadius: '6px',
  background: '#ffffff',
  border: '1.5px solid var(--border-color)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

// End of file

