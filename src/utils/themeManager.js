// Utility for managing random theme preferences, allowed themes pool, and selecting random themes across RetroVision games

export const GAME_THEME_DETAILS = {
  mahjong: [
    { id: 'classic', name: 'Classique', icon: '🀄', desc: 'Symboles traditionnels & ivoire' },
    { id: 'nature', name: 'Créatures Célestes', icon: '🐉', desc: 'Émail cloisonné & or sur onyx' },
    { id: 'cyber', name: 'Marbre Noir & Or', icon: '⚜️', desc: 'Marbre noir, gravure or & rubis' },
    { id: 'modern', name: 'Chiffres Kanjis', icon: '🪵', desc: 'Bois noble & kanjis gravés' },
    { id: 'mosaic', name: 'Art Botanique', icon: '🌿', desc: 'Porcelaine blanche & faune/flore' },
    { id: 'luxury_marble_2', name: 'Marbre & Bijoux', icon: '👑', desc: 'Marbre blanc, saphir & émeraude' }
  ],
  bubblecool: [
    { id: 'candy', name: 'Bonbon Sucré', icon: '🍬', desc: 'Pastels gourmands & reflets' },
    { id: 'neon', name: 'Néon Cyber', icon: '⚡', desc: 'Bulles fluorescentes lumineuses' },
    { id: 'gemstone', name: 'Pierres Précieuses', icon: '💎', desc: 'Rubis, saphirs & émeraudes' }
  ],
  sudoku: [
    { id: 'classic', name: 'Classique', icon: '📝', desc: 'Papier blanc épuré & bleu ardoise' },
    { id: 'neon', name: 'Néon Zen', icon: '🌌', desc: 'Fond cosmique violet & cyan' },
    { id: 'paper', name: 'Parchemin', icon: '📜', desc: 'Kraft chaud & encre sépia' },
    { id: 'cyber', name: 'Cyberpunk', icon: '⚡', desc: 'Noir profond & jaune laser' },
    { id: 'forest', name: 'Forêt Zen', icon: '🌲', desc: 'Vert mousse apaisant & sauge' },
    { id: 'sunset', name: 'Coucher de Soleil', icon: '🌅', desc: 'Dégradé pourpre & or couchant' }
  ],
  water: [
    { id: 'bg1', name: 'Obsidienne', icon: '🌑', desc: 'Noir profond minimaliste' },
    { id: 'bg2', name: 'Nature', icon: '🍃', desc: 'Feuillage vert & soleil' },
    { id: 'bg3', name: 'Zen Galets', icon: '🪨', desc: 'Galets lisses & eau claire' },
    { id: 'bg4', name: 'Rosée', icon: '💧', desc: 'Gouttes matinales & reflets' },
    { id: 'bg5', name: 'Kawaii Art', icon: '🎨', desc: 'Dégradé coloré artistique' },
    { id: 'bg6', name: 'Pastel', icon: '🧁', desc: 'Douceur nuageuse pastel' },
    { id: 'bg7', name: 'Cosmos', icon: '🌌', desc: 'Étoiles & nébuleuses' },
    { id: 'bg8', name: 'Forêt', icon: '🌲', desc: 'Forêt de pins brumeuse' },
    { id: 'bg9', name: 'Aurore', icon: '✨', desc: 'Lueurs boréales polaires' }
  ],
  ball: [
    { id: 'bg1', name: 'Obsidienne', icon: '🌑', desc: 'Noir profond minimaliste' },
    { id: 'bg2', name: 'Nature', icon: '🍃', desc: 'Feuillage vert & soleil' },
    { id: 'bg3', name: 'Zen Galets', icon: '🪨', desc: 'Galets lisses & eau claire' },
    { id: 'bg4', name: 'Rosée', icon: '💧', desc: 'Gouttes matinales & reflets' },
    { id: 'bg5', name: 'Kawaii Art', icon: '🎨', desc: 'Dégradé coloré artistique' },
    { id: 'bg6', name: 'Pastel', icon: '🧁', desc: 'Douceur nuageuse pastel' },
    { id: 'bg7', name: 'Cosmos', icon: '🌌', desc: 'Étoiles & nébuleuses' },
    { id: 'bg8', name: 'Forêt', icon: '🌲', desc: 'Forêt de pins brumeuse' },
    { id: 'bg9', name: 'Aurore', icon: '✨', desc: 'Lueurs boréales polaires' }
  ],
  mines: [
    { id: 'classic', name: 'Métal 3D', icon: '💣', desc: 'Gris ardoise en relief biseauté' },
    { id: 'dark', name: 'Nuit Sombre', icon: '🌑', desc: 'Noir bleuté nocturne discret' },
    { id: 'neon', name: 'Cyber Néon', icon: '⚡', desc: 'Lignes cyan & magenta néon' },
    { id: 'retro_green', name: 'Terminal Vert', icon: '📟', desc: 'Moniteur phosphore rétro' },
    { id: 'glassmorphism', name: 'Verre Dépoli', icon: '🧊', desc: 'Effet verre givré translucide' }
  ],
  arrows: [
    { id: 'classic', name: 'Minimaliste', icon: '🏹', desc: 'Bleu ardoise & blanc net' },
    { id: 'neon', name: 'Néon Électrique', icon: '⚡', desc: 'Flèches luminescentes' },
    { id: 'nature', name: 'Bambou Zen', icon: '🎋', desc: 'Tons verts organiques' },
    { id: 'cyberpunk', name: 'Cyber Matrix', icon: '🔮', desc: 'High-tech cyan & magenta' }
  ],
  '2048': [
    { id: 'neon', name: 'Néon Original', icon: '🌌', desc: 'Ambiance cyberpunk néon cyan' },
    { id: 'dark', name: 'Sombre Épuré', icon: '🌑', desc: 'Noir minimaliste & contraste net' },
    { id: 'light', name: 'Clair Lumineux', icon: '☀️', desc: 'Fond clair doux & épuré' }
  ],
  freecell: [
    { id: 'classic', name: 'Tapis Vert', icon: '🃏', desc: 'Vert feutre casino' },
    { id: 'dark', name: 'Onyx Noir', icon: '♠️', desc: 'Design noir profond moderne' },
    { id: 'emerald', name: 'Émeraude Royale', icon: '👑', desc: 'Vert émeraude & liserés d\'or' },
    { id: 'royal', name: 'Bleu Saphir', icon: '💎', desc: 'Velours bleu roi de prestige' }
  ],
  hangman: [
    { id: 'classic', name: 'Craie & Ardoise', icon: '✏️', desc: 'Tableau noir & craie blanche' },
    { id: 'neon', name: 'Néon Nuit', icon: '💡', desc: 'Lignes néon violettes' },
    { id: 'vintage', name: 'Vieux Parchemin', icon: '📜', desc: 'Papier vieilli & encre brune' }
  ],
  blockfantasy: [
    { id: 'fantasy', name: 'Gemmes Célestes', icon: '💎', desc: 'Bleu nuit & gemmes vives' },
    { id: 'cyber', name: 'Cyber Laser', icon: '⚡', desc: 'Grille futuriste néon cyan' },
    { id: 'sunset', name: 'Crépuscule', icon: '🌇', desc: 'Ciel orangé & blocs pourpres' }
  ],
  impossible13: [
    { id: 'neon', name: 'Néon Fantasy', icon: '✨', desc: 'Disques fluorescents lumineux' },
    { id: 'wood', name: 'Bois Cosy', icon: '🪵', desc: 'Ambiance boisée & chaleureuse' },
    { id: 'jewel', name: 'Gemmes Translucides', icon: '💎', desc: 'Éclat cristal & reflets précieux' }
  ],
  jigsaw: [
    { id: 'forest', name: 'Forêt Magique', icon: '🌲', desc: 'Sous-bois verdoyant' },
    { id: 'cat', name: 'Chat Félin', icon: '🐱', desc: 'Ami félin espiègle' },
    { id: 'sunset', name: 'Crépuscule Doré', icon: '🌅', desc: 'Ciel couchant flamboyant' }
  ]
};

// Simple list of theme ids for backward compatibility
export const GAME_THEMES = Object.fromEntries(
  Object.entries(GAME_THEME_DETAILS).map(([key, details]) => [key, details.map(d => d.id)])
);

export const normalizeGameId = (nameOrId) => {
  if (!nameOrId) return 'generic';
  const n = nameOrId.toLowerCase();
  if (n.includes('mahjong')) return 'mahjong';
  if (n.includes('bubble')) return 'bubblecool';
  if (n.includes('water') || n.includes('eau')) return 'water';
  if (n.includes('ball') || n.includes('bille')) return 'ball';
  if (n.includes('sudoku')) return 'sudoku';
  if (n.includes('freecell')) return 'freecell';
  if (n.includes('mine') || n.includes('demineur')) return 'mines';
  if (n.includes('arrow') || n.includes('fleche')) return 'arrows';
  if (n.includes('2048')) return '2048';
  if (n.includes('jigsaw') || n.includes('puzzle')) return 'jigsaw';
  if (n.includes('hangman') || n.includes('pendu')) return 'hangman';
  if (n.includes('block')) return 'blockfantasy';
  if (n.includes('brick') || n.includes('casse')) return 'brickbreaker';
  if (n.includes('snake')) return 'snakewave';
  if (n.includes('flappy')) return 'flappyneon';
  if (n.includes('unblock')) return 'unblock';
  if (n.includes('impossible')) return 'impossible13';
  return n.replace(/[^a-z0-9]/g, '');
};

const _memoryStorage = {};

const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // LocalStorage unavailable
    }
    return _memoryStorage[key] || null;
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, String(val));
      }
    } catch {
      // LocalStorage unavailable
    }
    _memoryStorage[key] = String(val);
  }
};

export const isRandomThemeEnabled = (gameIdOrName) => {
  const gameId = normalizeGameId(gameIdOrName);
  return safeStorage.getItem(`retrovision_random_theme_${gameId}`) === 'true';
};

export const setRandomThemeEnabled = (gameIdOrName, enabled) => {
  const gameId = normalizeGameId(gameIdOrName);
  safeStorage.setItem(`retrovision_random_theme_${gameId}`, enabled ? 'true' : 'false');
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('retrovision_random_theme_toggled', { detail: { gameId, enabled } }));
  }
};

/**
 * Returns the list of themes that the user has checked for this game.
 * If never customized, defaults to ALL available themes for this game.
 */
export const getAllowedThemes = (gameIdOrName) => {
  const gameId = normalizeGameId(gameIdOrName);
  const allThemes = (GAME_THEME_DETAILS[gameId] || []).map(t => t.id);
  if (!allThemes || allThemes.length === 0) return [];

  try {
    const raw = safeStorage.getItem(`retrovision_allowed_themes_${gameId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(t => allThemes.includes(t));
        if (valid.length > 0) return valid;
      }
    }
  } catch {
    // Ignore parse errors and fallback
  }

  return allThemes;
};

/**
 * Saves the list of allowed themes for a game.
 */
export const setAllowedThemes = (gameIdOrName, allowedThemes) => {
  const gameId = normalizeGameId(gameIdOrName);
  safeStorage.setItem(`retrovision_allowed_themes_${gameId}`, JSON.stringify(allowedThemes));
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('retrovision_allowed_themes_changed', { detail: { gameId, allowedThemes } }));
  }
};

/**
 * Toggles an individual theme in the allowed list for a game.
 * Guarantees that at least 1 theme remains checked.
 */
export const toggleAllowedTheme = (gameIdOrName, themeId) => {
  const gameId = normalizeGameId(gameIdOrName);
  const current = getAllowedThemes(gameId);
  let next;
  if (current.includes(themeId)) {
    // Cannot uncheck if it's the last remaining theme
    if (current.length <= 1) return current;
    next = current.filter(t => t !== themeId);
  } else {
    next = [...current, themeId];
  }
  setAllowedThemes(gameId, next);
  return next;
};

/**
 * Selects all available themes for a game.
 */
export const selectAllThemes = (gameIdOrName) => {
  const gameId = normalizeGameId(gameIdOrName);
  const allThemes = (GAME_THEME_DETAILS[gameId] || []).map(t => t.id);
  setAllowedThemes(gameId, allThemes);
  return allThemes;
};

/**
 * Picks a theme randomly from ONLY the allowed/checked themes.
 * If currentTheme is provided, prefers a different theme if more than 1 are allowed.
 */
export const pickRandomTheme = (gameIdOrName, currentTheme = null) => {
  const gameId = normalizeGameId(gameIdOrName);
  const allowed = getAllowedThemes(gameId);
  if (!allowed || allowed.length === 0) {
    const all = (GAME_THEME_DETAILS[gameId] || []).map(t => t.id);
    return all[0] || currentTheme;
  }
  if (allowed.length === 1) return allowed[0];

  const pool = currentTheme ? allowed.filter(t => t !== currentTheme) : allowed;
  const finalPool = pool.length > 0 ? pool : allowed;
  const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
  return chosen;
};
