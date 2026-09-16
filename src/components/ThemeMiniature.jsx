import React from 'react';

/**
 * ThemeMiniature - Renders an authentic, crisp vector miniature representing 
 * a specific visual theme for any RetroVision game.
 */
export default function ThemeMiniature({ 
  gameId = 'mahjong', 
  themeId = 'classic', 
  width = '100%', 
  height = '100%', 
  style = {} 
}) {
  const g = (gameId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = (themeId || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

  // =========================================================================
  // 1. MAHJONG ZEN THEMES
  // =========================================================================
  if (g.includes('mahjong')) {
    switch (t) {
      case 'nature': // Créatures Célestes (Onyx & Or & Dragon)
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#0B0F19" stroke="#EAB308" strokeWidth="1.5" />
            <rect x="25" y="11" width="30" height="40" rx="3" fill="#030712" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="0.8" />
            {/* Dragon celestial badge */}
            <circle cx="40" cy="27" r="11" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" strokeWidth="1" />
            <path d="M36 24 Q40 19 44 23 Q42 28 45 32 Q40 31 38 27 Z" fill="#34D399" />
            <circle cx="40" cy="22" r="1.5" fill="#FDE047" />
            <text x="40" y="46" fill="#EAB308" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">龍</text>
          </svg>
        );

      case 'cyber': // Marbre Noir & Or (Gravure Or & Rubis)
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#090D16" stroke="#D97706" strokeWidth="1.5" />
            {/* Gold marble veins */}
            <path d="M23 15 Q32 26 30 38 Q28 46 36 53" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1" fill="none" />
            <path d="M48 9 Q44 20 54 32 Q56 42 50 53" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.8" fill="none" />
            {/* Ruby Gem in center */}
            <polygon points="40,20 47,27 40,34 33,27" fill="#DC2626" stroke="#F87171" strokeWidth="1" />
            <polygon points="40,23 44,27 40,31 36,27" fill="#EF4444" />
            <circle cx="39" cy="25" r="1" fill="#FFFFFF" opacity="0.8" />
            <text x="40" y="47" fill="#FDE68A" fontSize="7" fontWeight="bold" textAnchor="middle">⚜️</text>
          </svg>
        );

      case 'modern': // Chiffres Kanjis Bois
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#78350F" stroke="#92400E" strokeWidth="1.5" />
            {/* Wood grain lines */}
            <line x1="26" y1="8" x2="26" y2="54" stroke="#9A3412" strokeWidth="1" opacity="0.4" />
            <line x1="33" y1="8" x2="33" y2="54" stroke="#5B21B6" strokeWidth="0.8" opacity="0.2" />
            <line x1="44" y1="8" x2="44" y2="54" stroke="#9A3412" strokeWidth="1.2" opacity="0.35" />
            <line x1="52" y1="8" x2="52" y2="54" stroke="#451A03" strokeWidth="0.9" opacity="0.5" />
            {/* Carved Kanji */}
            <rect x="28" y="16" width="24" height="30" rx="3" fill="rgba(0,0,0,0.25)" />
            <text x="40" y="32" fill="#FEF3C7" fontSize="13" fontWeight="bold" textAnchor="middle">萬</text>
            <text x="40" y="43" fill="#D97706" fontSize="8" fontWeight="bold" textAnchor="middle">五</text>
          </svg>
        );

      case 'mosaic': // Art Botanique (Porcelaine Blanche & Flore)
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#F8FAFC" stroke="#0284C7" strokeWidth="1.5" />
            <rect x="25" y="11" width="30" height="40" rx="3" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1" />
            {/* Botanical vine */}
            <path d="M40 44 Q35 34 40 24 Q45 16 40 14" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Leaves */}
            <path d="M38 36 Q32 35 34 31 Q38 33 38 36 Z" fill="#10B981" />
            <path d="M41 30 Q47 29 45 25 Q41 27 41 30 Z" fill="#34D399" />
            <path d="M38 23 Q33 22 35 18 Q39 20 38 23 Z" fill="#10B981" />
            {/* Flower bud */}
            <circle cx="40" cy="14" r="2.5" fill="#EC4899" />
          </svg>
        );

      case 'luxury_marble_2': // Marbre & Bijoux (Carrare & Saphir)
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#F1F5F9" stroke="#0284C7" strokeWidth="1.5" />
            {/* Marble grey veining */}
            <path d="M25 10 Q36 22 32 34 Q30 44 42 53" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
            <path d="M48 10 Q42 22 52 35" stroke="#E2E8F0" strokeWidth="1" fill="none" />
            {/* Saphir jewel */}
            <polygon points="40,21 46,27 40,33 34,27" fill="#2563EB" stroke="#60A5FA" strokeWidth="1" />
            <circle cx="39" cy="25" r="1.2" fill="#FFFFFF" opacity="0.9" />
            {/* Gold accents */}
            <circle cx="32" cy="42" r="2.5" fill="#F59E0B" />
            <circle cx="48" cy="42" r="2.5" fill="#10B981" />
            <text x="40" y="45" fill="#0369A1" fontSize="9" fontWeight="bold" textAnchor="middle">👑</text>
          </svg>
        );

      default: // Classique (Porcelaine & Bambou vert)
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="22" y="8" width="36" height="46" rx="5" fill="#047857" stroke="#065F46" strokeWidth="1.5" />
            <rect x="20" y="6" width="36" height="46" rx="5" fill="#FFFDF8" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="38" y="30" fill="#DC2626" fontSize="18" fontWeight="bold" textAnchor="middle">中</text>
            <path d="M28 38 H48" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M33 42 H43" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  }

  // =========================================================================
  // 2. BUBBLE COOL THEMES
  // =========================================================================
  if (g.includes('bubble')) {
    switch (t) {
      case 'neon':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="8" y="6" width="64" height="48" rx="8" fill="#080C16" stroke="#1E293B" strokeWidth="1" />
            {/* Glowing neon bubbles */}
            <circle cx="28" cy="26" r="11" fill="#00F0FF" opacity="0.3" filter="drop-shadow(0 0 6px #00F0FF)" />
            <circle cx="28" cy="26" r="9" fill="none" stroke="#00F0FF" strokeWidth="2.2" />
            <circle cx="26" cy="23" r="2" fill="#FFFFFF" />

            <circle cx="50" cy="30" r="13" fill="#EC4899" opacity="0.3" filter="drop-shadow(0 0 6px #EC4899)" />
            <circle cx="50" cy="30" r="11" fill="none" stroke="#EC4899" strokeWidth="2.2" />
            <circle cx="47" cy="26" r="2.5" fill="#FFFFFF" />

            <circle cx="36" cy="42" r="9" fill="#FACC15" opacity="0.3" filter="drop-shadow(0 0 6px #FACC15)" />
            <circle cx="36" cy="42" r="7" fill="none" stroke="#FACC15" strokeWidth="2" />
          </svg>
        );

      case 'gemstone':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="8" y="6" width="64" height="48" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="1" />
            {/* Gem 1: Ruby */}
            <polygon points="28,16 36,23 33,33 23,33 20,23" fill="#EF4444" stroke="#FCA5A5" strokeWidth="1.2" />
            <polygon points="28,19 33,24 28,30 23,24" fill="#B91C1C" />
            <circle cx="27" cy="21" r="1" fill="#FFFFFF" />

            {/* Gem 2: Sapphire */}
            <polygon points="50,22 58,29 55,40 45,40 42,29" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1.2" />
            <polygon points="50,25 55,30 50,37 45,30" fill="#1D4ED8" />
            <circle cx="49" cy="27" r="1" fill="#FFFFFF" />

            {/* Gem 3: Emerald */}
            <polygon points="36,36 43,41 40,49 32,49 29,41" fill="#10B981" stroke="#A7F3D0" strokeWidth="1" />
          </svg>
        );

      default: // candy
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="8" y="6" width="64" height="48" rx="8" fill="#1E1B4B" stroke="#3730A3" strokeWidth="1" />
            {/* Glossy Candy Bubbles */}
            <circle cx="28" cy="26" r="10" fill="#F472B6" />
            <circle cx="26" cy="23" r="3" fill="#FFFFFF" opacity="0.8" />
            <circle cx="29" cy="27" r="8.5" fill="none" stroke="#FDF2F8" strokeWidth="1" opacity="0.6" />

            <circle cx="50" cy="30" r="12" fill="#38BDF8" />
            <circle cx="47" cy="26" r="3.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="51" cy="31" r="10.5" fill="none" stroke="#F0F9FF" strokeWidth="1" opacity="0.6" />

            <circle cx="36" cy="42" r="8" fill="#FDE047" />
            <circle cx="34" cy="40" r="2" fill="#FFFFFF" opacity="0.8" />
          </svg>
        );
    }
  }

  // =========================================================================
  // 3. SUDOKU THEMES
  // =========================================================================
  if (g.includes('sudoku')) {
    switch (t) {
      case 'neon':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="16" y="6" width="48" height="48" rx="6" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <text x="24" y="19" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">3</text>
            <text x="40" y="35" fill="#A78BFA" fontSize="8" fontWeight="bold" textAnchor="middle">9</text>
            <text x="56" y="51" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">7</text>
          </svg>
        );

      case 'paper':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="16" y="6" width="48" height="48" rx="6" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="#D97706" strokeWidth="1" opacity="0.6" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="#D97706" strokeWidth="1" opacity="0.6" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="#D97706" strokeWidth="1" opacity="0.6" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="#D97706" strokeWidth="1" opacity="0.6" />
            <text x="24" y="19" fill="#78350F" fontSize="8" fontWeight="bold" textAnchor="middle">5</text>
            <text x="40" y="35" fill="#92400E" fontSize="8" fontWeight="bold" textAnchor="middle">1</text>
            <text x="56" y="51" fill="#78350F" fontSize="8" fontWeight="bold" textAnchor="middle">8</text>
          </svg>
        );

      case 'cyber':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="16" y="6" width="48" height="48" rx="6" fill="#0A0A0A" stroke="#FACC15" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="#EAB308" strokeWidth="1" opacity="0.7" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="#EAB308" strokeWidth="1" opacity="0.7" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="#EAB308" strokeWidth="1" opacity="0.7" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="#EAB308" strokeWidth="1" opacity="0.7" />
            <text x="24" y="19" fill="#FACC15" fontSize="8" fontWeight="bold" textAnchor="middle">4</text>
            <text x="40" y="35" fill="#00F0FF" fontSize="8" fontWeight="bold" textAnchor="middle">2</text>
            <text x="56" y="51" fill="#FACC15" fontSize="8" fontWeight="bold" textAnchor="middle">6</text>
          </svg>
        );

      case 'forest':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="16" y="6" width="48" height="48" rx="6" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
            <text x="24" y="19" fill="#A7F3D0" fontSize="8" fontWeight="bold" textAnchor="middle">8</text>
            <text x="40" y="35" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle">5</text>
            <text x="56" y="51" fill="#A7F3D0" fontSize="8" fontWeight="bold" textAnchor="middle">3</text>
          </svg>
        );

      case 'sunset':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <defs>
              <linearGradient id="st-sunset" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BE123C" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <rect x="16" y="6" width="48" height="48" rx="6" fill="url(#st-sunset)" stroke="#FDE68A" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <text x="24" y="19" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">9</text>
            <text x="40" y="35" fill="#FEF08A" fontSize="8" fontWeight="bold" textAnchor="middle">6</text>
            <text x="56" y="51" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">2</text>
          </svg>
        );

      default: // classic
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="16" y="6" width="48" height="48" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            <line x1="32" y1="6" x2="32" y2="54" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="48" y1="6" x2="48" y2="54" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="16" y1="22" x2="64" y2="22" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="16" y1="38" x2="64" y2="38" stroke="#CBD5E1" strokeWidth="1" />
            <text x="24" y="19" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="middle">7</text>
            <text x="40" y="35" fill="#2563EB" fontSize="8" fontWeight="bold" textAnchor="middle">4</text>
            <text x="56" y="51" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="middle">1</text>
          </svg>
        );
    }
  }

  // =========================================================================
  // 4. WATER SORT & BALL SORT THEMES (bg1 to bg9)
  // =========================================================================
  if (g.includes('water') || g.includes('ball')) {
    const bgColors = {
      bg1: ['#0A0A0A', '#1E293B'], // Obsidienne
      bg2: ['#064E3B', '#059669'], // Nature
      bg3: ['#334155', '#475569'], // Zen Galets
      bg4: ['#0284C7', '#38BDF8'], // Rosée
      bg5: ['#EC4899', '#8B5CF6'], // Kawaii Art
      bg6: ['#F472B6', '#C084FC'], // Pastel
      bg7: ['#1E1B4B', '#4C1D95'], // Cosmos
      bg8: ['#14532D', '#166534'], // Forêt
      bg9: ['#0E7490', '#7E22CE']  // Aurore
    };
    const colors = bgColors[t] || bgColors.bg1;

    return (
      <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
        <defs>
          <linearGradient id={`bg-grad-${t}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {/* Background panel */}
        <rect x="10" y="6" width="60" height="48" rx="8" fill={`url(#bg-grad-${t})`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Mini test tube */}
        <rect x="33" y="14" width="14" height="34" rx="7" fill="rgba(255,255,255,0.2)" stroke="#FFFFFF" strokeWidth="1.2" />
        {/* Liquid or ball inside tube */}
        {g.includes('water') ? (
          <>
            <path d="M33 32 H47 V41 Q47 48 40 48 Q33 48 33 41 Z" fill="#38BDF8" />
            <path d="M33 24 H47 V32 H33 Z" fill="#F59E0B" />
          </>
        ) : (
          <>
            <circle cx="40" cy="41" r="5" fill="#EF4444" />
            <circle cx="40" cy="30" r="5" fill="#10B981" />
          </>
        )}
      </svg>
    );
  }

  // =========================================================================
  // 5. MINESWEEPER THEMES
  // =========================================================================
  if (g.includes('mine') || g.includes('demineur')) {
    switch (t) {
      case 'dark':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="14" y="8" width="52" height="44" rx="5" fill="#0B0F19" stroke="#334155" strokeWidth="1.5" />
            <rect x="17" y="11" width="22" height="18" fill="#1E293B" rx="2" />
            <text x="28" y="24" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
            <rect x="41" y="11" width="22" height="18" fill="#1E293B" rx="2" />
            <text x="52" y="24" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
            <rect x="17" y="31" width="22" height="18" fill="#0F172A" stroke="#475569" strokeWidth="1" rx="2" />
            <text x="28" y="44" fill="#EF4444" fontSize="9" textAnchor="middle">🚩</text>
            <rect x="41" y="31" width="22" height="18" fill="#0F172A" stroke="#475569" strokeWidth="1" rx="2" />
          </svg>
        );

      case 'neon':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="14" y="8" width="52" height="44" rx="5" fill="#050505" stroke="#00F0FF" strokeWidth="1.5" />
            <rect x="17" y="11" width="22" height="18" fill="#111111" stroke="#00F0FF" strokeWidth="1" rx="2" />
            <text x="28" y="24" fill="#00F0FF" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
            <rect x="41" y="11" width="22" height="18" fill="#111111" stroke="#EC4899" strokeWidth="1" rx="2" />
            <text x="52" y="24" fill="#EC4899" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
            <rect x="17" y="31" width="22" height="18" fill="#111111" stroke="#FACC15" strokeWidth="1" rx="2" />
            <text x="28" y="44" fill="#FACC15" fontSize="9" textAnchor="middle">🚩</text>
            <rect x="41" y="31" width="22" height="18" fill="#111111" stroke="#00F0FF" strokeWidth="1" rx="2" />
          </svg>
        );

      case 'retro_green':
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="14" y="8" width="52" height="44" rx="5" fill="#06240E" stroke="#22C55E" strokeWidth="1.5" />
            <rect x="17" y="11" width="22" height="18" fill="#0D3818" stroke="#16A34A" strokeWidth="0.8" rx="2" />
            <text x="28" y="24" fill="#4ADE80" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">1</text>
            <rect x="41" y="11" width="22" height="18" fill="#0D3818" stroke="#16A34A" strokeWidth="0.8" rx="2" />
            <text x="52" y="24" fill="#4ADE80" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">2</text>
            <rect x="17" y="31" width="22" height="18" fill="#06240E" stroke="#15803D" strokeWidth="0.8" rx="2" />
            <text x="28" y="44" fill="#22C55E" fontSize="9" textAnchor="middle">🚩</text>
            <rect x="41" y="31" width="22" height="18" fill="#06240E" stroke="#15803D" strokeWidth="0.8" rx="2" />
          </svg>
        );

      default: // classic / glassmorphism
        return (
          <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
            <rect x="14" y="8" width="52" height="44" rx="5" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <rect x="17" y="11" width="22" height="18" fill="#1E293B" stroke="#0F172A" strokeWidth="1" rx="1" />
            <text x="28" y="24" fill="#3B82F6" fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
            <rect x="41" y="11" width="22" height="18" fill="#1E293B" stroke="#0F172A" strokeWidth="1" rx="1" />
            <text x="52" y="24" fill="#10B981" fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
            <rect x="17" y="31" width="22" height="18" fill="#475569" stroke="#94A3B8" strokeWidth="1" rx="1" />
            <text x="28" y="44" fill="#EF4444" fontSize="9" textAnchor="middle">🚩</text>
            <rect x="41" y="31" width="22" height="18" fill="#475569" stroke="#94A3B8" strokeWidth="1" rx="1" />
          </svg>
        );
    }
  }

  // =========================================================================
  // 6. FALLBACK FOR OTHER GAMES
  // =========================================================================
  return (
    <svg viewBox="0 0 80 60" width={width} height={height} style={style} fill="none">
      <rect x="12" y="8" width="56" height="44" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
      <circle cx="40" cy="30" r="14" fill="#0284C7" opacity="0.3" />
      <text x="40" y="35" fill="#38BDF8" fontSize="14" textAnchor="middle">🎨</text>
    </svg>
  );
}
