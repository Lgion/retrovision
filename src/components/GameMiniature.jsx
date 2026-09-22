import React from 'react';

/**
 * GameMiniature - Renders a clean, iconic, and representative vector illustration 
 * of the actual gameplay for each game (e.g. test tubes with moving balls, 
 * pouring liquid, sudoku numbers, 2048 tiles, falling blocks, etc.).
 */
export default function GameMiniature({ gameKey, width = '100%', height = '100%', style = {} }) {
  const normalizedKey = (gameKey || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (normalizedKey) {
    // ==========================================
    // 1. BALL SORT : Tubes with balls + moving ball in progress
    // ==========================================
    case 'ball':
    case 'ballsort':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bs-tube-glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="25%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="75%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
            <radialGradient id="bs-ball-red" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>
            <radialGradient id="bs-ball-green" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#065F46" />
            </radialGradient>
            <radialGradient id="bs-ball-blue" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="40%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </radialGradient>
            <radialGradient id="bs-ball-purple" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="40%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#86198F" />
            </radialGradient>
            <radialGradient id="bs-ball-amber" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </radialGradient>
            <filter id="bs-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Tube 1 (Left) */}
          <rect x="13" y="24" width="18" height="50" rx="9" fill="url(#bs-tube-glass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <path d="M12 24 H32" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          {/* Balls in Tube 1 */}
          <circle cx="22" cy="64" r="7" fill="url(#bs-ball-green)" />
          <circle cx="22" cy="49" r="7" fill="url(#bs-ball-amber)" />
          <circle cx="22" cy="34" r="7" fill="url(#bs-ball-red)" />

          {/* Tube 2 (Middle) */}
          <rect x="41" y="24" width="18" height="50" rx="9" fill="url(#bs-tube-glass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <path d="M40 24 H60" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          {/* Balls in Tube 2 */}
          <circle cx="50" cy="64" r="7" fill="url(#bs-ball-blue)" />
          <circle cx="50" cy="49" r="7" fill="url(#bs-ball-blue)" />

          {/* Tube 3 (Right) */}
          <rect x="69" y="24" width="18" height="50" rx="9" fill="url(#bs-tube-glass)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <path d="M68 24 H88" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
          {/* Bottom Ball in Tube 3 */}
          <circle cx="78" cy="64" r="7" fill="url(#bs-ball-green)" />

          {/* Curved trajectory path for moving ball */}
          <path d="M50 22 Q64 4 78 20" stroke="#F472B6" strokeWidth="1.5" strokeDasharray="3,2" fill="none" opacity="0.8" />
          {/* Arrowhead on trajectory */}
          <polygon points="76,17 80,21 75,23" fill="#F472B6" />

          {/* The Moving Ball in Air (Suspended mid-flight) */}
          <g filter="url(#bs-glow)">
            <circle cx="64" cy="11" r="7.5" fill="url(#bs-ball-purple)" />
            {/* Specular highlight */}
            <circle cx="62" cy="9" r="2.5" fill="white" opacity="0.75" />
          </g>

          {/* Motion sparkle */}
          <path d="M64 1 L65 3 L67 4 L65 5 L64 7 L63 5 L61 4 L63 3 Z" fill="#FDE68A" />
        </svg>
      );

    // ==========================================
    // 2. WATER SORT : Liquid layers + tilted tube pouring liquid
    // ==========================================
    case 'water':
    case 'watersort':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="ws-tube-left-clip">
              <rect x="13" y="26" width="18" height="48" rx="8" />
            </clipPath>
            <clipPath id="ws-tube-right-clip">
              <rect x="69" y="26" width="18" height="48" rx="8" />
            </clipPath>
          </defs>

          {/* Left Tube with layered colored water */}
          <rect x="13" y="26" width="18" height="48" rx="8" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <g clipPath="url(#ws-tube-left-clip)">
            {/* Bottom: Purple layer */}
            <rect x="13" y="60" width="18" height="15" fill="#8B5CF6" />
            {/* Middle: Amber layer */}
            <rect x="13" y="46" width="18" height="14" fill="#F59E0B" />
            {/* Top: Emerald layer */}
            <rect x="13" y="34" width="18" height="12" fill="#10B981" />
          </g>
          <path d="M12 26 H32" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />

          {/* Right Receiving Tube */}
          <rect x="69" y="26" width="18" height="48" rx="8" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <g clipPath="url(#ws-tube-right-clip)">
            {/* Bottom: Red layer */}
            <rect x="69" y="58" width="18" height="17" fill="#EF4444" />
            {/* Rising: Cyan liquid poured */}
            <rect x="69" y="42" width="18" height="16" fill="#06B6D4" />
            {/* Surface ripple */}
            <ellipse cx="78" cy="42" rx="7" ry="2" fill="#67E8F9" opacity="0.8" />
          </g>
          <path d="M68 26 H88" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />

          {/* Pouring Stream of Liquid */}
          <path d="M57 26 Q68 28 77 41" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.95" />
          <path d="M58 27 Q68 29 76 42" stroke="#67E8F9" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Splash bubbles in receiving tube */}
          <circle cx="76" cy="38" r="1.5" fill="#67E8F9" />
          <circle cx="81" cy="36" r="1" fill="#A5F3FC" />

          {/* Tilted Pouring Tube (Rotated ~40 deg) */}
          <g transform="translate(48, 14) rotate(42)">
            <rect x="-8" y="0" width="16" height="42" rx="7" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <path d="M-8 16 H8 V36 Q8 42 0 42 Q-8 42 -8 36 Z" fill="#06B6D4" opacity="0.9" />
            <path d="M-9 0 H9" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );

    // ==========================================
    // 3. BUBBLE COOL : Bubble grid + dotted aim line + bubble shooter
    // ==========================================
    case 'bubblecool':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bc-c" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0E7490" />
            </radialGradient>
            <radialGradient id="bc-m" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#9D174D" />
            </radialGradient>
            <radialGradient id="bc-y" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </radialGradient>
            <radialGradient id="bc-g" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#86EFAC" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
          </defs>

          {/* Top ceiling line */}
          <line x1="8" y1="6" x2="92" y2="6" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

          {/* Row 1 */}
          <circle cx="16" cy="14" r="6" fill="url(#bc-c)" />
          <circle cx="28" cy="14" r="6" fill="url(#bc-m)" />
          <circle cx="40" cy="14" r="6" fill="url(#bc-m)" />
          <circle cx="52" cy="14" r="6" fill="url(#bc-y)" />
          <circle cx="64" cy="14" r="6" fill="url(#bc-g)" />
          <circle cx="76" cy="14" r="6" fill="url(#bc-c)" />
          <circle cx="88" cy="14" r="6" fill="url(#bc-g)" />

          {/* Row 2 (Shifted) */}
          <circle cx="22" cy="24" r="6" fill="url(#bc-m)" />
          <circle cx="34" cy="24" r="6" fill="url(#bc-m)" />
          <circle cx="46" cy="24" r="6" fill="url(#bc-m)" />
          <circle cx="58" cy="24" r="6" fill="url(#bc-y)" />
          <circle cx="70" cy="24" r="6" fill="url(#bc-g)" />
          <circle cx="82" cy="24" r="6" fill="url(#bc-c)" />

          {/* Target Cluster Match Sparkles */}
          <circle cx="40" cy="24" r="9" stroke="#F472B6" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.8" />
          <path d="M40 18 L41 21 L44 22 L41 23 L40 26 L39 23 L36 22 L39 21 Z" fill="#FDF2F8" />

          {/* Aiming Dotted Line */}
          <line x1="50" y1="68" x2="40" y2="30" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2,3" opacity="0.85" />

          {/* Shooter at Bottom Center */}
          <path d="M42 74 A10 10 0 0 1 58 74 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          {/* Loaded Bubble in Shooter */}
          <circle cx="50" cy="68" r="6.5" fill="url(#bc-m)" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="48" cy="66" r="2" fill="white" opacity="0.8" />

          {/* Next Bubble indicator */}
          <circle cx="32" cy="73" r="4" fill="url(#bc-c)" opacity="0.75" />
        </svg>
      );

    // ==========================================
    // 4. SUDOKU : Crisp grid with numbers & active cell
    // ==========================================
    case 'sudoku':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Grid Container */}
          <rect x="20" y="8" width="60" height="64" rx="6" fill="#0F172A" stroke="#6366F1" strokeWidth="2" />

          {/* Internal Grid Lines */}
          {/* Horizontal lines */}
          <line x1="20" y1="24" x2="80" y2="24" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="20" y1="40" x2="80" y2="40" stroke="#818CF8" strokeWidth="2" />
          <line x1="20" y1="56" x2="80" y2="56" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Vertical lines */}
          <line x1="35" y1="8" x2="35" y2="72" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="50" y1="8" x2="50" y2="72" stroke="#818CF8" strokeWidth="2" />
          <line x1="65" y1="8" x2="65" y2="72" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Active Highlighted Cell */}
          <rect x="50" y="24" width="15" height="16" fill="rgba(56, 189, 248, 0.35)" stroke="#38BDF8" strokeWidth="1.5" />

          {/* Clear Bold Numbers */}
          <text x="27.5" y="20" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">5</text>
          <text x="42.5" y="20" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">3</text>
          <text x="72.5" y="20" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">7</text>

          <text x="27.5" y="36" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">6</text>
          {/* Active Cell Input */}
          <text x="57.5" y="36" fill="#38BDF8" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">4</text>
          <text x="72.5" y="36" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>

          <text x="42.5" y="52" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">9</text>
          <text x="57.5" y="52" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">8</text>
          <text x="72.5" y="52" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">2</text>

          <text x="27.5" y="68" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">8</text>
          <text x="42.5" y="68" fill="#F8FAFC" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>
          <text x="57.5" y="68" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">6</text>
        </svg>
      );

    // ==========================================
    // 5. BLOCK FANTASY : Grid + placed jewel tetrominoes + moving piece
    // ==========================================
    case 'blockfantasy':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Board Grid Background */}
          <rect x="14" y="10" width="72" height="60" rx="6" fill="#090D16" stroke="#334155" strokeWidth="1.5" />

          {/* Grid lines */}
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
            <line x1="14" y1="22" x2="86" y2="22" />
            <line x1="14" y1="34" x2="86" y2="34" />
            <line x1="14" y1="46" x2="86" y2="46" />
            <line x1="14" y1="58" x2="86" y2="58" />
            <line x1="26" y1="10" x2="26" y2="70" />
            <line x1="38" y1="10" x2="38" y2="70" />
            <line x1="50" y1="10" x2="50" y2="70" />
            <line x1="62" y1="10" x2="62" y2="70" />
            <line x1="74" y1="10" x2="74" y2="70" />
          </g>

          {/* Placed Blocks */}
          {/* Green Bar (Bottom) */}
          <rect x="26" y="58" width="12" height="12" rx="2" fill="#10B981" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="38" y="58" width="12" height="12" rx="2" fill="#10B981" stroke="#A7F3D0" strokeWidth="1" />
          <rect x="50" y="58" width="12" height="12" rx="2" fill="#10B981" stroke="#A7F3D0" strokeWidth="1" />

          {/* Amber Square (Left) */}
          <rect x="14" y="46" width="12" height="12" rx="2" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
          <rect x="26" y="46" width="12" height="12" rx="2" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />
          <rect x="14" y="58" width="12" height="12" rx="2" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1" />

          {/* Violet 3-block corner */}
          <rect x="62" y="46" width="12" height="12" rx="2" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1" />
          <rect x="74" y="46" width="12" height="12" rx="2" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1" />
          <rect x="74" y="58" width="12" height="12" rx="2" fill="#8B5CF6" stroke="#DDD6FE" strokeWidth="1" />

          {/* Floating T-shape piece moving onto board */}
          <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.8))">
            <rect x="38" y="14" width="12" height="12" rx="2" fill="#06B6D4" stroke="#CFFAFE" strokeWidth="1.2" />
            <rect x="50" y="14" width="12" height="12" rx="2" fill="#06B6D4" stroke="#CFFAFE" strokeWidth="1.2" />
            <rect x="62" y="14" width="12" height="12" rx="2" fill="#06B6D4" stroke="#CFFAFE" strokeWidth="1.2" />
            <rect x="50" y="26" width="12" height="12" rx="2" fill="#06B6D4" stroke="#CFFAFE" strokeWidth="1.2" />
          </g>

          {/* Drop arrow showing placement */}
          <path d="M56 40 L56 48 M52 44 L56 48 L60 44" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // ==========================================
    // 6. 2048 : 4x4 Grid with colorful numbers and golden 2048
    // ==========================================
    case '2048':
    case 'grid2048':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g2048" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Main Grid Frame */}
          <rect x="15" y="8" width="70" height="64" rx="8" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

          {/* Row 1 */}
          <rect x="19" y="12" width="14" height="12" rx="3" fill="#334155" />
          <text x="26" y="21" fill="#E2E8F0" fontSize="7" fontWeight="900" textAnchor="middle">2</text>

          <rect x="36" y="12" width="14" height="12" rx="3" fill="#475569" />
          <text x="43" y="21" fill="#F8FAFC" fontSize="7" fontWeight="900" textAnchor="middle">4</text>

          <rect x="53" y="12" width="14" height="12" rx="3" fill="#F97316" />
          <text x="60" y="21" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">8</text>

          <rect x="69" y="12" width="14" height="12" rx="3" fill="#EA580C" />
          <text x="76" y="21" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle">16</text>

          {/* Row 2 */}
          <rect x="19" y="27" width="14" height="12" rx="3" fill="#F59E0B" />
          <text x="26" y="36" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle">32</text>

          <rect x="36" y="27" width="14" height="12" rx="3" fill="#EF4444" />
          <text x="43" y="36" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle">64</text>

          <rect x="53" y="27" width="14" height="12" rx="3" fill="#DC2626" />
          <text x="60" y="36" fill="#FFFFFF" fontSize="5.5" fontWeight="900" textAnchor="middle">128</text>

          <rect x="69" y="27" width="14" height="12" rx="3" fill="#E11D48" />
          <text x="76" y="36" fill="#FFFFFF" fontSize="5.5" fontWeight="900" textAnchor="middle">256</text>

          {/* Row 3 - 4 : Featuring the GLORIOUS 2048 TILE */}
          <rect x="19" y="42" width="31" height="26" rx="5" fill="url(#g2048)" stroke="#FDE68A" strokeWidth="1.5" />
          <text x="34.5" y="58" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="-0.5">2048</text>
          {/* Sparkles on 2048 */}
          <path d="M44 45 L45 47 L47 48 L45 49 L44 51 L43 49 L41 48 L43 47 Z" fill="#FFFFFF" />

          <rect x="53" y="42" width="14" height="12" rx="3" fill="#7C3AED" />
          <text x="60" y="51" fill="#FFFFFF" fontSize="5.5" fontWeight="900" textAnchor="middle">512</text>

          <rect x="69" y="42" width="14" height="12" rx="3" fill="#6366F1" />
          <text x="76" y="51" fill="#FFFFFF" fontSize="5" fontWeight="900" textAnchor="middle">1024</text>

          <rect x="53" y="56" width="14" height="12" rx="3" fill="#0284C7" />
          <text x="60" y="65" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">8</text>

          <rect x="69" y="56" width="14" height="12" rx="3" fill="#0D9488" />
          <text x="76" y="65" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">4</text>
        </svg>
      );

    // ==========================================
    // 7. MINESWEEPER : Grid tiles + 1, 2 + flag + mine
    // ==========================================
    case 'mines':
    case 'demineur':
    case 'minesweeper':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* 3D beveled tile look */}
            <linearGradient id="ms-tile" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Grid frame */}
          <rect x="16" y="10" width="68" height="60" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />

          {/* Cell (0,0) - Revealed Number 1 */}
          <rect x="18" y="12" width="15" height="13" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          <text x="25.5" y="22" fill="#3B82F6" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>

          {/* Cell (0,1) - Revealed Number 2 */}
          <rect x="35" y="12" width="15" height="13" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          <text x="42.5" y="22" fill="#10B981" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">2</text>

          {/* Cell (0,2) - Revealed Number 1 */}
          <rect x="52" y="12" width="15" height="13" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          <text x="59.5" y="22" fill="#3B82F6" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>

          {/* Cell (0,3) - Unrevealed */}
          <rect x="68" y="12" width="14" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />

          {/* Cell (1,0) - Red Flagged Cell */}
          <rect x="18" y="27" width="15" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          {/* Flagpole & Flag */}
          <line x1="23" y1="36" x2="23" y2="30" stroke="#FFFFFF" strokeWidth="1.2" />
          <polygon points="23,30 29,32.5 23,35" fill="#EF4444" />
          <line x1="21" y1="37" x2="26" y2="37" stroke="#94A3B8" strokeWidth="1.5" />

          {/* Cell (1,1) - Revealed Mine */}
          <rect x="35" y="27" width="15" height="13" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" strokeWidth="1" />
          <circle cx="42.5" cy="33.5" r="4" fill="#000000" />
          {/* Spikes on Mine */}
          <line x1="42.5" y1="28" x2="42.5" y2="39" stroke="#000000" strokeWidth="1.2" />
          <line x1="37" y1="33.5" x2="48" y2="33.5" stroke="#000000" strokeWidth="1.2" />
          <line x1="38.5" y1="29.5" x2="46.5" y2="37.5" stroke="#000000" strokeWidth="1.2" />
          <line x1="38.5" y1="37.5" x2="46.5" y2="29.5" stroke="#000000" strokeWidth="1.2" />
          <circle cx="41.5" cy="32" r="1" fill="#FFFFFF" />

          {/* Cell (1,2) - Number 3 */}
          <rect x="52" y="27" width="15" height="13" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          <text x="59.5" y="37" fill="#EF4444" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">3</text>

          {/* Cell (1,3) - Unrevealed */}
          <rect x="68" y="27" width="14" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />

          {/* Row 2 - Unrevealed beveled tiles */}
          <rect x="18" y="42" width="15" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="35" y="42" width="15" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="52" y="42" width="15" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="68" y="42" width="14" height="13" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />

          {/* Row 3 - Unrevealed beveled tiles */}
          <rect x="18" y="56" width="15" height="12" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="35" y="56" width="15" height="12" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="52" y="56" width="15" height="12" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
          <rect x="68" y="56" width="14" height="12" fill="url(#ms-tile)" stroke="#64748B" strokeWidth="1" rx="1" />
        </svg>
      );

    // ==========================================
    // 8. ARROWS : Arrow tiles & exit path
    // ==========================================
    case 'arrows':
    case 'arrowpuzzle':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Maze Grid Boundary */}
          <rect x="18" y="10" width="64" height="60" rx="8" fill="#0B132B" stroke="#1C2541" strokeWidth="2" />

          {/* Exit slot on the right wall */}
          <line x1="82" y1="22" x2="82" y2="40" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <polygon points="86,31 82,27 82,35" fill="#10B981" />

          {/* Arrow Tile Up */}
          <rect x="24" y="16" width="16" height="16" rx="4" fill="#1E293B" stroke="#8B5CF6" strokeWidth="1.5" />
          <path d="M32 27 L32 21 M29 24 L32 21 L35 24" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Arrow Tile Down */}
          <rect x="44" y="48" width="16" height="16" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M52 51 L52 57 M49 54 L52 57 L55 54" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Arrow Tile Left */}
          <rect x="24" y="48" width="16" height="16" rx="4" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
          <path d="M35 56 L29 56 M32 53 L29 56 L32 59" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Arrow Tile Gliding Out towards exit */}
          <g filter="drop-shadow(0 0 4px #38BDF8)">
            {/* Motion trail line */}
            <line x1="44" y1="31" x2="58" y2="31" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.8" />
            <rect x="60" y="23" width="16" height="16" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
            <path d="M64 31 L72 31 M69 27 L73 31 L69 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      );

    // ==========================================
    // 9. JIGSAW PUZZLE : Interlocking pieces + 1 piece fitting in
    // ==========================================
    case 'jigsaw':
    case 'jigsawpuzzle':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Piece 1: Top-Left (Blue Sky) */}
          <path d="M20 16 H36 A4 4 0 0 1 44 16 H50 V34 A4 4 0 0 0 50 42 V50 H38 A4 4 0 0 0 30 50 H20 Z" 
                fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.2" />
          <circle cx="28" cy="26" r="3" fill="#FFFFFF" opacity="0.8" />

          {/* Piece 2: Bottom-Left (Green Meadow) */}
          <path d="M20 50 H30 A4 4 0 0 1 38 50 H50 V66 H20 Z" 
                fill="#10B981" stroke="#6EE7B7" strokeWidth="1.2" />

          {/* Piece 3: Bottom-Right (Golden Flower) */}
          <path d="M50 50 H62 A4 4 0 0 0 70 50 H80 V66 H50 Z" 
                fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.2" />

          {/* Piece 4: Top-Right (Slightly detached / floating into place) */}
          <g transform="translate(6, -4)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.7))">
            <path d="M50 16 H74 V34 A4 4 0 0 1 74 42 V50 H64 A4 4 0 0 1 56 50 H50 V42 A4 4 0 0 1 50 34 Z" 
                  fill="#EC4899" stroke="#F472B6" strokeWidth="1.5" />
            <circle cx="62" cy="28" r="4" fill="#FDE047" />
          </g>

          {/* Sparkle of alignment */}
          <path d="M54 22 L55 25 L58 26 L55 27 L54 30 L53 27 L50 26 L53 25 Z" fill="#FDE047" />
        </svg>
      );

    // ==========================================
    // 10. FREECELL : Cascaded card columns + card movement
    // ==========================================
    case 'freecell':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top foundation/cells */}
          <rect x="14" y="6" width="14" height="18" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="21" y="18" fill="#EF4444" fontSize="9" textAnchor="middle">♥</text>

          <rect x="32" y="6" width="14" height="18" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="39" y="18" fill="#F8FAFC" fontSize="9" textAnchor="middle">♠</text>

          <rect x="54" y="6" width="14" height="18" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <rect x="72" y="6" width="14" height="18" rx="2" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Column 1 (Left cascade) */}
          <rect x="18" y="30" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <text x="21" y="38" fill="#0F172A" fontSize="7" fontWeight="bold">K</text>
          <text x="21" y="47" fill="#0F172A" fontSize="7">♠</text>

          <rect x="18" y="42" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <text x="21" y="50" fill="#EF4444" fontSize="7" fontWeight="bold">Q</text>
          <text x="21" y="59" fill="#EF4444" fontSize="7">♥</text>

          {/* Column 2 (Right cascade) */}
          <rect x="46" y="30" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <text x="49" y="38" fill="#EF4444" fontSize="7" fontWeight="bold">K</text>
          <text x="49" y="47" fill="#EF4444" fontSize="7">♦</text>

          {/* Moving Card (in flight from col 1 to col 2) */}
          <g transform="translate(62, 38) rotate(8)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))">
            <rect x="0" y="0" width="18" height="24" rx="2" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.2" />
            <text x="3" y="9" fill="#0F172A" fontSize="7" fontWeight="bold">J</text>
            <text x="3" y="18" fill="#0F172A" fontSize="7">♣</text>
          </g>

          {/* Motion arc */}
          <path d="M36 52 Q50 38 64 44" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2,2" />
        </svg>
      );

    // ==========================================
    // 11. HANGMAN : Gallows + stickman + letter blanks
    // ==========================================
    case 'hangman':
    case 'lependu':
    case 'pendu':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wooden Gallows */}
          {/* Base */}
          <line x1="16" y1="62" x2="48" y2="62" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          {/* Upright pole */}
          <line x1="28" y1="62" x2="28" y2="12" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          {/* Top beam */}
          <line x1="26" y1="12" x2="62" y2="12" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
          {/* Support strut */}
          <line x1="28" y1="24" x2="40" y2="12" stroke="#B45309" strokeWidth="2.5" />
          {/* Noose rope */}
          <line x1="58" y1="12" x2="58" y2="24" stroke="#FDE68A" strokeWidth="1.5" />

          {/* Stickman Character */}
          {/* Head */}
          <circle cx="58" cy="29" r="5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          {/* Body */}
          <line x1="58" y1="34" x2="58" y2="46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Arms */}
          <line x1="58" y1="38" x2="52" y2="44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="38" x2="64" y2="44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Legs */}
          <line x1="58" y1="46" x2="53" y2="55" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="46" x2="63" y2="55" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

          {/* Word Guess Slots & Letters */}
          <g fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            <line x1="68" y1="66" x2="74" y2="66" stroke="#38BDF8" strokeWidth="2" />
            <text x="71" y="64">M</text>

            <line x1="77" y1="66" x2="83" y2="66" stroke="#38BDF8" strokeWidth="2" />
            <text x="80" y="64">O</text>

            <line x1="86" y1="66" x2="92" y2="66" stroke="#94A3B8" strokeWidth="2" />
            <text x="89" y="64" fill="#94A3B8">T</text>
          </g>

          {/* Joyful balloon attached */}
          <circle cx="78" cy="22" r="5" fill="#EF4444" />
          <path d="M78 27 Q80 34 76 40" stroke="#FCA5A5" strokeWidth="1" fill="none" />
        </svg>
      );

    // ==========================================
    // 12. IMPOSSIBLE 13 : Numbered circular discs merging into 13
    // ==========================================
    case 'impossible13':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="imp-13" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </radialGradient>
          </defs>

          {/* Surrounding Discs */}
          {/* Disc 9 */}
          <circle cx="20" cy="24" r="8" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.2" />
          <text x="20" y="27.5" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">9</text>

          {/* Disc 10 */}
          <circle cx="24" cy="56" r="8.5" fill="#10B981" stroke="#6EE7B7" strokeWidth="1.2" />
          <text x="24" y="59.5" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">10</text>

          {/* Disc 11 */}
          <circle cx="80" cy="56" r="8.5" fill="#EC4899" stroke="#F472B6" strokeWidth="1.2" />
          <text x="80" y="59.5" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">11</text>

          {/* Disc 12 (Merging into center) */}
          <circle cx="78" cy="24" r="9" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="1.2" />
          <text x="78" y="27.5" fill="#FFFFFF" fontSize="9" fontWeight="900" textAnchor="middle">12</text>

          {/* Merge arrows toward center */}
          <path d="M31 29 L41 35" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />
          <path d="M68 29 L58 35" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />

          {/* GLOWING MASTER 13 DISC AT CENTER */}
          <g filter="drop-shadow(0 0 8px rgba(245,158,11,0.8))">
            {/* Outer golden halo ring */}
            <circle cx="50" cy="40" r="17" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.9" />
            <circle cx="50" cy="40" r="14" fill="url(#imp-13)" stroke="#FFFFFF" strokeWidth="2" />
            <text x="50" y="45" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle" letterSpacing="-0.5" fontFamily="sans-serif">13</text>
          </g>

          {/* Radiating Sparkles */}
          <path d="M50 18 L51 21 L53 22 L51 23 L50 26 L49 23 L47 22 L49 21 Z" fill="#FDE68A" />
          <path d="M50 56 L51 58 L53 59 L51 60 L50 62 L49 60 L47 59 L49 58 Z" fill="#FDE68A" />
        </svg>
      );

    // ==========================================
    // 13. JARDIN DES LUCIOLES : Glowing fireflies in night sky
    // ==========================================
    case 'fireflies':
    case 'jardindeslucioles':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ff-glow-cyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
              <stop offset="40%" stopColor="#0284C7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ff-glow-gold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ff-glow-rose" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F472B6" stopOpacity="1" />
              <stop offset="40%" stopColor="#DB2777" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9D174D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep night background */}
          <rect width="100" height="80" rx="8" fill="#070D1B" />
          
          {/* Subtle water horizon */}
          <path d="M0 64 Q25 61 50 64 T100 64 V80 H0 Z" fill="#0C1B33" />
          <path d="M10 70 Q30 67 55 70 T95 70" stroke="#38BDF8" strokeWidth="1" opacity="0.3" strokeDasharray="6,4" />

          {/* Twinkling background stars */}
          <circle cx="20" cy="18" r="1" fill="#FFFFFF" opacity="0.8" />
          <circle cx="82" cy="14" r="1.2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="50" cy="10" r="0.8" fill="#FFFFFF" opacity="0.5" />
          <circle cx="70" cy="38" r="1" fill="#FFFFFF" opacity="0.6" />

          {/* Firefly 1 (Cyan - Left bias) */}
          <circle cx="30" cy="38" r="18" fill="url(#ff-glow-cyan)" />
          <circle cx="30" cy="38" r="4.5" fill="#38BDF8" />
          <circle cx="30" cy="38" r="2" fill="#FFFFFF" />

          {/* Firefly 2 (Gold - Center) */}
          <circle cx="68" cy="28" r="16" fill="url(#ff-glow-gold)" />
          <circle cx="68" cy="28" r="4" fill="#FDE047" />
          <circle cx="68" cy="28" r="1.8" fill="#FFFFFF" />

          {/* Firefly 3 (Rose - Right lower) */}
          <circle cx="48" cy="52" r="14" fill="url(#ff-glow-rose)" />
          <circle cx="48" cy="52" r="3.5" fill="#F472B6" />
          <circle cx="48" cy="52" r="1.5" fill="#FFFFFF" />

          {/* Sparkles */}
          <path d="M30 24 L31 27 L34 28 L31 29 L30 32 L29 29 L26 28 L29 27 Z" fill="#38BDF8" opacity="0.9" />
          <path d="M68 15 L69 17 L71 18 L69 19 L68 21 L67 19 L65 18 L67 17 Z" fill="#FDE047" opacity="0.9" />
        </svg>
      );

    // ==========================================
    // 14. FLUX ZEN : Luminous connecting pipes & gems
    // ==========================================
    case 'zenflow':
    case 'fluxzen':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background grid board */}
          <rect width="100" height="80" rx="8" fill="#080F1F" />

          {/* Grid lines */}
          <rect x="14" y="10" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="34" y="10" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="54" y="10" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="74" y="10" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />

          <rect x="14" y="31" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="34" y="31" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="54" y="31" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="74" y="31" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />

          <rect x="14" y="52" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="34" y="52" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="54" y="52" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <rect x="74" y="52" width="18" height="18" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />

          {/* Cyan Path (Crosses from left to bottom-right) */}
          <path d="M23 19 L43 19 L43 40 L63 40 L63 61 L83 61" stroke="#06B6D4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter="drop-shadow(0 0 6px #06B6D4)" />
          <path d="M23 19 L43 19 L43 40 L63 40 L63 61 L83 61" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Amber Path (Crosses top right to bottom left) */}
          <path d="M83 19 L63 19 L63 31" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter="drop-shadow(0 0 6px #F59E0B)" />
          <path d="M83 19 L63 19 L63 31" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Emerald Path */}
          <path d="M23 40 L23 61 L43 61" stroke="#10B981" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter="drop-shadow(0 0 6px #10B981)" />
          <path d="M23 40 L23 61 L43 61" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Gem Endpoints with Halos */}
          <circle cx="23" cy="19" r="6" fill="#06B6D4" filter="drop-shadow(0 0 4px #06B6D4)" />
          <circle cx="23" cy="19" r="2.2" fill="#FFFFFF" />

          <circle cx="83" cy="61" r="6" fill="#06B6D4" filter="drop-shadow(0 0 4px #06B6D4)" />
          <circle cx="83" cy="61" r="2.2" fill="#FFFFFF" />

          <circle cx="83" cy="19" r="5.5" fill="#F59E0B" filter="drop-shadow(0 0 4px #F59E0B)" />
          <circle cx="83" cy="19" r="2" fill="#FFFFFF" />

          <circle cx="23" cy="40" r="5.5" fill="#10B981" filter="drop-shadow(0 0 4px #10B981)" />
          <circle cx="23" cy="40" r="2" fill="#FFFFFF" />
        </svg>
      );

    // ==========================================
    // 15. QUÊTE DES SYMBOLES : Visual scanning grid
    // ==========================================
    case 'symbolquest':
    case 'quetedessymboles':
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background board */}
          <rect width="100" height="80" rx="8" fill="#060E1A" />

          {/* Target header preview */}
          <rect x="18" y="8" width="64" height="14" rx="7" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
          <text x="36" y="19" fill="#F8FAFC" fontSize="8" fontWeight="800">CIBLE :</text>
          <text x="64" y="20" fill="#34D399" fontSize="12" textAnchor="middle">🪷</text>

          {/* Symbol Cards */}
          {/* Cell 1: Found Lotus (Left) */}
          <rect x="14" y="28" width="21" height="21" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1.5" />
          <text x="24.5" y="43" fontSize="11" textAnchor="middle">🪷</text>
          <circle cx="31" cy="32" r="3" fill="#10B981" />
          <text x="31" y="34.5" fill="#FFFFFF" fontSize="4.5" fontWeight="900" textAnchor="middle">✓</text>

          {/* Cell 2: Crystal */}
          <rect x="40" y="28" width="21" height="21" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <text x="50.5" y="43" fontSize="11" textAnchor="middle">💎</text>

          {/* Cell 3: Moon */}
          <rect x="66" y="28" width="21" height="21" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <text x="76.5" y="43" fontSize="11" textAnchor="middle">🌙</text>

          {/* Cell 4: Leaf */}
          <rect x="14" y="53" width="21" height="21" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <text x="24.5" y="68" fontSize="11" textAnchor="middle">🍃</text>

          {/* Cell 5: Another Lotus (Target to find) */}
          <rect x="40" y="53" width="21" height="21" rx="5" fill="rgba(244, 114, 182, 0.15)" stroke="#F472B6" strokeWidth="1.2" strokeDasharray="3,2" />
          <text x="50.5" y="68" fontSize="11" textAnchor="middle">🪷</text>

          {/* Cell 6: Star */}
          <rect x="66" y="53" width="21" height="21" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
          <text x="76.5" y="68" fontSize="11" textAnchor="middle">⭐</text>

          {/* Left Anchor Guide Pulse */}
          <rect x="2" y="20" width="3" height="46" rx="1.5" fill="#10B981" filter="drop-shadow(0 0 4px #10B981)" />
        </svg>
      );

    // ==========================================
    // DEFAULT / FALLBACK (e.g. Mahjong or Generic)
    // ==========================================
    default:
      return (
        <svg viewBox="0 0 100 80" width={width} height={height} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 3D Mahjong Tiles */}
          <rect x="22" y="22" width="28" height="38" rx="4" fill="#047857" stroke="#065F46" strokeWidth="1.5" />
          <rect x="20" y="18" width="28" height="38" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x="34" y="42" fill="#047857" fontSize="18" fontWeight="bold" textAnchor="middle">發</text>

          <rect x="52" y="26" width="28" height="38" rx="4" fill="#047857" stroke="#065F46" strokeWidth="1.5" />
          <rect x="50" y="22" width="28" height="38" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x="64" y="46" fill="#DC2626" fontSize="18" fontWeight="bold" textAnchor="middle">中</text>
        </svg>
      );
  }
}
