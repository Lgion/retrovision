// Utility for managing random theme preferences, allowed themes pool, and selecting random themes across RetroVision games
import { resolveGameId } from './gamesConfig';
import { storage } from './storage';
import { randomChoice } from './commonUtils';

export const THEME_MIGRATIONS = {
  bubblecool: { neon: 'midnight' },
  sudoku: { neon: 'slate_dark', cyber: 'graphite' },
  mines: { neon: 'slate' },
  arrows: { neon: 'midnight', cyberpunk: 'navy' },
  '2048': { neon: 'midnight' },
  hangman: { neon: 'night_ink' },
  blockfantasy: { cyber: 'graphite' },
  impossible13: { neon: 'night_pebbles' }
};

export function migrateTheme(gameKey, themeId) {
  if (!gameKey || !themeId) return themeId;
  const gameMigrations = THEME_MIGRATIONS[gameKey];
  if (gameMigrations && gameMigrations[themeId]) {
    return gameMigrations[themeId];
  }
  return themeId;
}

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
    { id: 'midnight', name: 'Nuit Veloutée', icon: '🌙', desc: 'Bleu nuit profond & bulles mates' },
    { id: 'gemstone', name: 'Pierres Précieuses', icon: '💎', desc: 'Rubis, saphirs & émeraudes' }
  ],
  sudoku: [
    { id: 'classic', name: 'Classique', icon: '📝', desc: 'Papier blanc épuré & bleu ardoise' },
    { id: 'slate_dark', name: 'Ardoise Nocturne', icon: '🌑', desc: 'Fond ardoise doux & chiffres ivoire' },
    { id: 'paper', name: 'Parchemin', icon: '📜', desc: 'Kraft chaud & encre sépia' },
    { id: 'graphite', name: 'Graphite Zen', icon: '✒️', desc: 'Anthracite mat & contraste reposant' },
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
    { id: 'slate', name: 'Ardoise Mate', icon: '🪨', desc: 'Gris ardoise mat et contrasté' },
    { id: 'retro_green', name: 'Terminal Vert', icon: '📟', desc: 'Moniteur phosphore rétro' },
    { id: 'glassmorphism', name: 'Verre Dépoli', icon: '🧊', desc: 'Effet verre givré translucide' }
  ],
  arrows: [
    { id: 'classic', name: 'Minimaliste', icon: '🏹', desc: 'Bleu ardoise & blanc net' },
    { id: 'light', name: 'Clair Épuré', icon: '☀️', desc: 'Fond clair doux & contraste élevé' },
    { id: 'midnight', name: 'Nuit Mate', icon: '🌙', desc: 'Tons bleu nuit & flèches douces' },
    { id: 'nature', name: 'Bambou Zen', icon: '🎋', desc: 'Tons verts organiques' },
    { id: 'navy', name: 'Encre Bleue', icon: '🖋️', desc: 'Bleu marine profond épuré' }
  ],
  '2048': [
    { id: 'midnight', name: 'Nuit Mate', icon: '🌙', desc: 'Bleu nuit apaisant & tuiles mates' },
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
    { id: 'chalk', name: 'Tableau Noir', icon: '🖍️', desc: 'Ardoise mate & craie douce' },
    { id: 'paper', name: 'Cahier d’écolier', icon: '📝', desc: 'Papier ligné & encre bleue' },
    { id: 'night_ink', name: 'Encre de Nuit', icon: '🖋️', desc: 'Fond sombre mat & encre argentée' },
    { id: 'parchment', name: 'Parchemin Ancien', icon: '📜', desc: 'Kraft chaud & typographie sépia' }
  ],
  blockfantasy: [
    { id: 'fantasy', name: 'Gemmes Célestes', icon: '💎', desc: 'Bleu nuit & gemmes vives' },
    { id: 'graphite', name: 'Graphite', icon: '✒️', desc: 'Fond ardoise mat & gemmes subtiles' },
    { id: 'sunset', name: 'Crépuscule', icon: '🌇', desc: 'Ciel orangé & blocs pourpres' }
  ],
  impossible13: [
    { id: 'night_pebbles', name: 'Galets Nocturnes', icon: '🌙', desc: 'Disques mats et doux sur fond sombre' },
    { id: 'wood', name: 'Bois Cosy', icon: '🪵', desc: 'Ambiance boisée & chaleureuse' },
    { id: 'jewel', name: 'Gemmes Translucides', icon: '💎', desc: 'Éclat cristal & reflets précieux' }
  ],
  jigsaw: [
    { id: 'forest', name: 'Forêt Magique', icon: '🌲', desc: 'Sous-bois verdoyant' },
    { id: 'cat', name: 'Chat Félin', icon: '🐱', desc: 'Ami félin espiègle' },
    { id: 'sunset', name: 'Crépuscule Doré', icon: '🌅', desc: 'Ciel couchant flamboyant' }
  ],
  memory: [
    { id: 'japanese_paper', name: 'Papier Japonais', icon: '🎴', desc: 'Washi crème & vagues indigo seigaiha' },
    { id: 'natural_wood', name: 'Bois Naturel', icon: '🪵', desc: 'Cartes en bois chaleureux & gravure' },
    { id: 'watercolor', name: 'Aquarelle', icon: '🎨', desc: 'Tons pastel lavés & douceur' },
    { id: 'herbarium', name: 'Herbier Zen', icon: '🌿', desc: 'Papier kraft & silhouettes végétales' },
    { id: 'minimal', name: 'Épuré', icon: '⬜', desc: 'Design blanc contemporain sobre' }
  ]
};

// Simple list of theme ids for backward compatibility
export const GAME_THEMES = Object.fromEntries(
  Object.entries(GAME_THEME_DETAILS).map(([key, details]) => [key, details.map((d) => d.id)])
);

/**
 * Normalise un identifiant ou nom de jeu vers son identifiant canonique.
 * @param {string} nameOrId
 * @returns {string}
 */
export const normalizeGameId = (nameOrId) => {
  const resolved = resolveGameId(nameOrId);
  if (resolved) return resolved;
  if (!nameOrId) return 'generic';
  const n = String(nameOrId).toLowerCase();
  if (n.includes('brick') || n.includes('casse')) return 'brickbreaker';
  if (n.includes('snake')) return 'snakewave';
  if (n.includes('flappy')) return 'flappyneon';
  return n.replace(/[^a-z0-9]/g, '');
};

export const isRandomThemeEnabled = (gameIdOrName) => {
  const gameId = normalizeGameId(gameIdOrName);
  return storage.getBoolean(`retrovision_random_theme_${gameId}`);
};

export const setRandomThemeEnabled = (gameIdOrName, enabled) => {
  const gameId = normalizeGameId(gameIdOrName);
  storage.setItem(`retrovision_random_theme_${gameId}`, enabled ? 'true' : 'false');
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
  const allThemes = (GAME_THEME_DETAILS[gameId] || []).map((t) => t.id);
  if (!allThemes || allThemes.length === 0) return [];

  const parsed = storage.getJSON(`retrovision_allowed_themes_${gameId}`, null);
  if (Array.isArray(parsed) && parsed.length > 0) {
    const valid = parsed.filter((t) => allThemes.includes(t));
    if (valid.length > 0) return valid;
  }

  return allThemes;
};

/**
 * Saves the list of allowed themes for a game.
 */
export const setAllowedThemes = (gameIdOrName, allowedThemes) => {
  const gameId = normalizeGameId(gameIdOrName);
  storage.setJSON(`retrovision_allowed_themes_${gameId}`, allowedThemes);
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
    next = current.filter((t) => t !== themeId);
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
  const allThemes = (GAME_THEME_DETAILS[gameId] || []).map((t) => t.id);
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
    const all = (GAME_THEME_DETAILS[gameId] || []).map((t) => t.id);
    return all[0] || currentTheme;
  }
  if (allowed.length === 1) return allowed[0];

  const pool = currentTheme ? allowed.filter((t) => t !== currentTheme) : allowed;
  const finalPool = pool.length > 0 ? pool : allowed;
  return randomChoice(finalPool) || finalPool[0];
};
