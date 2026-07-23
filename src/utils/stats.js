const DEFAULT_GAMES = [
  { id: 'mahjong', name: 'Mahjong Zen' },
  { id: 'water', name: 'Tri de l\'eau' },
  { id: 'ball', name: 'Tri de billes' },
  { id: '2048', name: 'Neon 2048' },
  { id: 'jigsaw', name: 'Puzzle Magique' },
  { id: 'unblock', name: 'Débloque-moi' },
  { id: 'freecell', name: 'FreeCell' },
  { id: 'mines', name: 'Démineur' },
  { id: 'arrows', name: 'Arrow Puzzle' },
  { id: 'hangman', name: 'Le Pendu' },
  { id: 'sudoku', name: 'Sudoku' },
  { id: 'blockfantasy', name: 'Block Fantasy' },
  { id: 'impossible13', name: 'Impossible 13' }
];

// Map from the game name sent in onScoreSave to our game ID
const NAME_TO_ID = {
  'Mahjong Zen': 'mahjong',
  'Tri Eau': 'water',
  'Tri Billes': 'ball',
  'Neon 2048': '2048',
  'Puzzle Magique': 'jigsaw',
  'Débloque-Moi': 'unblock',
  'FreeCell': 'freecell',
  'Démineur': 'mines',
  'Flèches': 'arrows',
  'Le Pendu': 'hangman',
  'Sudoku': 'sudoku',
  'Block Fantasy': 'blockfantasy',
  'Impossible 13': 'impossible13'
};

// Map from ID to the old highscore key
const ID_TO_LEGACY_KEY = {
  mahjong: 'retrovision_mahjong_highscore',
  water: 'retrovision_water_highscore',
  ball: 'retrovision_ball_highscore',
  '2048': 'retrovision_2048_highscore',
  jigsaw: 'retrovision_jigsaw_highscore',
  unblock: 'retrovision_unblock_highscore',
  freecell: 'retrovision_freecell_highscore',
  mines: 'retrovision_mines_highscore',
  arrows: 'retrovision_arrows_highscore',
  hangman: 'retrovision_hangman_highscore',
  sudoku: 'retrovision_sudoku_highscore',
  blockfantasy: 'retrovision_blockfantasy_highscore',
  impossible13: 'retrovision_impossible13_highscore'
};

export function getStats() {
  const stored = localStorage.getItem('retrovision_detailed_stats');
  let stats = {};
  if (stored) {
    try {
      stats = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing detailed stats:', e);
    }
  }

  // Ensure all games exist in the stats, and migrate from legacy highscores if needed
  let updated = false;
  DEFAULT_GAMES.forEach(game => {
    if (!stats[game.id]) {
      // Migrate legacy highscore if present
      const legacyKey = ID_TO_LEGACY_KEY[game.id];
      const legacyVal = parseInt(localStorage.getItem(legacyKey) || '0', 10);
      stats[game.id] = {
        plays: legacyVal > 0 ? 1 : 0,
        wins: legacyVal > 0 ? 1 : 0,
        highScore: legacyVal,
        timeSpent: 0 // ms
      };
      updated = true;
    }
  });

  if (updated) {
    saveStats(stats);
  }

  return stats;
}

export function saveStats(stats) {
  localStorage.setItem('retrovision_detailed_stats', JSON.stringify(stats));
}

export function recordPlay(gameId) {
  const stats = getStats();
  if (stats[gameId]) {
    stats[gameId].plays = (stats[gameId].plays || 0) + 1;
    saveStats(stats);
  }
}

export function recordTime(gameId, ms) {
  if (ms <= 0) return;
  const stats = getStats();
  if (stats[gameId]) {
    stats[gameId].timeSpent = (stats[gameId].timeSpent || 0) + ms;
    saveStats(stats);
  }
}

export function recordScore(gameIdOrName, score) {
  // Can be passed either the ID or the Game Name
  const gameId = NAME_TO_ID[gameIdOrName] || gameIdOrName;
  const stats = getStats();
  if (stats[gameId]) {
    // If they score, it means a win/completed game
    stats[gameId].wins = (stats[gameId].wins || 0) + 1;
    if (score > (stats[gameId].highScore || 0)) {
      stats[gameId].highScore = score;
      // also save legacy highscore for backward compatibility
      const legacyKey = ID_TO_LEGACY_KEY[gameId];
      if (legacyKey) {
        localStorage.setItem(legacyKey, score.toString());
      }
    }
    saveStats(stats);
  }
}

export function resetAllStats() {
  localStorage.removeItem('retrovision_detailed_stats');
  DEFAULT_GAMES.forEach(game => {
    const legacyKey = ID_TO_LEGACY_KEY[game.id];
    if (legacyKey) {
      localStorage.removeItem(legacyKey);
    }
  });
}

export function getRecommendation() {
  const stats = getStats();
  
  // Create list of active games with their statistics
  const gamesWithStats = DEFAULT_GAMES.map(game => {
    const gameStat = stats[game.id] || { plays: 0, wins: 0, timeSpent: 0, highScore: 0 };
    const winRate = gameStat.plays > 0 ? (gameStat.wins / gameStat.plays) : 0;
    return {
      id: game.id,
      name: game.name,
      plays: gameStat.plays || 0,
      wins: gameStat.wins || 0,
      timeSpent: gameStat.timeSpent || 0,
      winRate: winRate
    };
  });

  // Recommendation logic:
  // 1. Identify unplayed games (plays === 0)
  const unplayed = gamesWithStats.filter(g => g.plays === 0);
  if (unplayed.length > 0) {
    const chosen = unplayed[Math.floor(Math.random() * unplayed.length)];
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: "Vous n'avez pas encore testé ce jeu, c'est l'occasion idéale de le découvrir !"
    };
  }

  // 2. Identify games with plays but 0 wins
  const playedButNotWon = gamesWithStats.filter(g => g.plays > 0 && g.wins === 0);
  if (playedButNotWon.length > 0) {
    const chosen = playedButNotWon[Math.floor(Math.random() * playedButNotWon.length)];
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: "Vous avez tenté ce jeu mais ne l'avez pas encore résolu avec succès. C'est le moment de relever le défi !"
    };
  }

  // 3. Find the game with the absolute lowest number of plays
  const sortedByPlays = [...gamesWithStats].sort((a, b) => a.plays - b.plays);
  const minPlays = sortedByPlays[0].plays;
  const leastPlayed = sortedByPlays.filter(g => g.plays === minPlays);
  if (leastPlayed.length > 0) {
    const chosen = leastPlayed[Math.floor(Math.random() * leastPlayed.length)];
    return {
      gameId: chosen.id,
      name: chosen.name,
      reason: `C'est l'un de vos jeux les moins pratiqués (${chosen.plays} partie${chosen.plays > 1 ? 's' : ''}). Un peu d'entraînement fera du bien !`
    };
  }

  // 4. Default: Pick the one with the lowest win rate
  const sortedByWinRate = [...gamesWithStats].sort((a, b) => a.winRate - b.winRate);
  const chosen = sortedByWinRate[0];
  return {
    gameId: chosen.id,
    name: chosen.name,
    reason: `Votre taux de réussite sur ce jeu est de ${Math.round(chosen.winRate * 100)}%. Entraînez-vous pour l'améliorer !`
  };
}
