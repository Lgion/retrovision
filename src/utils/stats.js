import { GAMES_CONFIG, resolveGameId } from './gamesConfig';
import { storage } from './storage';
import { randomChoice } from './commonUtils';

const STATS_STORAGE_KEY = 'retrovision_detailed_stats';

/**
 * Liste des jeux par défaut dérivée de la configuration centralisée (SSOT).
 */
export const DEFAULT_GAMES = Object.values(GAMES_CONFIG).map((g) => ({
  id: g.id,
  name: g.name
}));

/**
 * Obtient la clé de stockage legacy pour un identifiant de jeu donné.
 * @param {string} gameId
 * @returns {string}
 */
export function getLegacyStorageKey(gameId) {
  return GAMES_CONFIG[gameId]?.storageKey || `retrovision_${gameId}_highscore`;
}

/**
 * Récupère les statistiques détaillées de tous les jeux, avec initialisation
 * et migration transparente des scores historiques.
 * @returns {Record<string, { plays: number, wins: number, highScore: number, timeSpent: number }>}
 */
export function getStats() {
  const stats = storage.getJSON(STATS_STORAGE_KEY, {}) || {};
  let updated = false;

  DEFAULT_GAMES.forEach((game) => {
    if (!stats[game.id]) {
      const legacyKey = getLegacyStorageKey(game.id);
      const legacyVal = storage.getNumber(legacyKey, 0);
      stats[game.id] = {
        plays: legacyVal > 0 ? 1 : 0,
        wins: legacyVal > 0 ? 1 : 0,
        highScore: legacyVal,
        timeSpent: 0
      };
      updated = true;
    }
  });

  if (updated) {
    saveStats(stats);
  }

  return stats;
}

/**
 * Enregistre l'ensemble des statistiques de façon persistante et résiliente.
 * @param {Object} stats
 */
export function saveStats(stats) {
  storage.setJSON(STATS_STORAGE_KEY, stats);
}

/**
 * Enregistre une partie jouée pour un jeu.
 * @param {string} gameIdOrName
 */
export function recordPlay(gameIdOrName) {
  const gameId = resolveGameId(gameIdOrName);
  if (!gameId) return;

  const stats = getStats();
  if (stats[gameId]) {
    stats[gameId].plays = (stats[gameId].plays || 0) + 1;
    saveStats(stats);
  }
}

/**
 * Enregistre le temps passé sur un jeu (en ms).
 * @param {string} gameIdOrName
 * @param {number} ms
 */
export function recordTime(gameIdOrName, ms) {
  if (ms <= 0) return;
  const gameId = resolveGameId(gameIdOrName);
  if (!gameId) return;

  const stats = getStats();
  if (stats[gameId]) {
    stats[gameId].timeSpent = (stats[gameId].timeSpent || 0) + ms;
    saveStats(stats);
  }
}

/**
 * Enregistre le score ou la victoire d'un jeu, et synchronise le highscore legacy.
 * @param {string} gameIdOrName
 * @param {number} score
 */
export function recordScore(gameIdOrName, score) {
  const gameId = resolveGameId(gameIdOrName);
  if (!gameId) return;

  const stats = getStats();
  if (stats[gameId]) {
    stats[gameId].wins = (stats[gameId].wins || 0) + 1;
    if (score > (stats[gameId].highScore || 0)) {
      stats[gameId].highScore = score;
      const legacyKey = getLegacyStorageKey(gameId);
      storage.setItem(legacyKey, score.toString());
    }
    saveStats(stats);
  }
}

/**
 * Réinitialise toutes les statistiques et les highscores legacy.
 */
export function resetAllStats() {
  storage.removeItem(STATS_STORAGE_KEY);
  DEFAULT_GAMES.forEach((game) => {
    const legacyKey = getLegacyStorageKey(game.id);
    storage.removeItem(legacyKey);
  });
}

/**
 * Fournit une recommandation intelligente de jeu basé sur l'historique du joueur (DRY).
 * @returns {{ gameId: string, name: string, reason: string }}
 */
export function getRecommendation() {
  const stats = getStats();

  const gamesWithStats = DEFAULT_GAMES.map((game) => {
    const gameStat = stats[game.id] || { plays: 0, wins: 0, timeSpent: 0, highScore: 0 };
    const winRate = gameStat.plays > 0 ? gameStat.wins / gameStat.plays : 0;
    return {
      id: game.id,
      name: game.name,
      plays: gameStat.plays || 0,
      wins: gameStat.wins || 0,
      timeSpent: gameStat.timeSpent || 0,
      winRate
    };
  });

  // 1. Jeux non encore essayés
  const unplayed = gamesWithStats.filter((g) => g.plays === 0);
  if (unplayed.length > 0) {
    const chosen = randomChoice(unplayed);
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: "Vous n'avez pas encore testé ce jeu, c'est l'occasion idéale de le découvrir !"
    };
  }

  // 2. Jeux essayés sans aucune victoire
  const playedButNotWon = gamesWithStats.filter((g) => g.plays > 0 && g.wins === 0);
  if (playedButNotWon.length > 0) {
    const chosen = randomChoice(playedButNotWon);
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: "Vous avez tenté ce jeu mais ne l'avez pas encore résolu avec succès. C'est le moment de relever le défi !"
    };
  }

  // 3. Jeu avec le plus faible nombre de parties
  const sortedByPlays = [...gamesWithStats].sort((a, b) => a.plays - b.plays);
  const minPlays = sortedByPlays[0].plays;
  const leastPlayed = sortedByPlays.filter((g) => g.plays === minPlays);
  if (leastPlayed.length > 0) {
    const chosen = randomChoice(leastPlayed);
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: `C'est l'un de vos jeux les moins pratiqués (${chosen.plays} partie${chosen.plays > 1 ? 's' : ''}). Un peu d'entraînement fera du bien !`
    };
  }

  // 4. Jeu avec le taux de victoire le plus bas
  const sortedByWinRate = [...gamesWithStats].sort((a, b) => a.winRate - b.winRate);
  const chosen = sortedByWinRate[0];
  return {
    gameId: chosen.id,
    name: chosen.name,
    reason: `Votre taux de réussite sur ce jeu est de ${Math.round(chosen.winRate * 100)}%. Entraînez-vous pour l'améliorer !`
  };
}
