import MahjongZen from '../games/MahjongZen';
import WaterSort from '../games/WaterSort';
import BallSort from '../games/BallSort';
import Grid2048 from '../games/Grid2048';
import JigsawPuzzle from '../games/JigsawPuzzle';
import UnblockMe from '../games/UnblockMe';
import FreeCell from '../games/FreeCell';
import Minesweeper from '../games/Minesweeper';
import ArrowPuzzle from '../games/ArrowPuzzle';
import Hangman from '../games/Hangman';
import Sudoku from '../games/Sudoku';
import BlockFantasy from '../games/BlockFantasy';
import Impossible13 from '../games/Impossible13';
import BubbleCool from '../games/BubbleCool';
import FireflyGarden from '../games/FireflyGarden';
import ZenFlow from '../games/ZenFlow';
import FindCharlie from '../games/FindCharlie';
import WordMaster from '../games/WordMaster';
import Morpion from '../games/Morpion';
import MemoryPairs from '../games/MemoryPairs';
import CarillonCeleste from '../games/CarillonCeleste';
import MotsFlottants from '../games/MotsFlottants';
import TangramSilhouettes from '../games/TangramSilhouettes';
import BrickBreaker from '../games/BrickBreaker';
import FlappyNeon from '../games/FlappyNeon';
import SnakeWave from '../games/SnakeWave';

/**
 * Fabrique de configuration de jeu avec valeurs par défaut standardisées (DRY).
 * @param {Object} def
 * @returns {Object}
 */
function defineGame(def) {
  const aliases = Array.from(
    new Set([
      def.id,
      def.name,
      ...(def.aliases || [])
    ])
  );

  return {
    id: def.id,
    component: def.component,
    name: def.name,
    aliases,
    icon: def.icon,
    settingsIcon: def.settingsIcon || def.icon,
    subtitle: def.subtitle,
    color: def.color,
    fullscreen: Boolean(def.fullscreen),
    storageKey: def.storageKey || `retrovision_${def.id}_highscore`,
    binaryScore: Boolean(def.binaryScore),
    supportsIntermission: def.supportsIntermission !== undefined ? Boolean(def.supportsIntermission) : true,
    supportsIntro: Boolean(def.supportsIntro),
    intermission: def.intermission || { category: 'oneshot' }
  };
}

/**
 * Registre centralisé de tous les jeux de RetroVision (Single Source of Truth).
 */
export const GAMES_CONFIG = {
  mahjong: defineGame({
    id: 'mahjong',
    component: MahjongZen,
    name: 'Mahjong Zen',
    icon: '🀄',
    subtitle: 'Association de tuiles relaxante',
    color: '#eab308',
    fullscreen: true,
    binaryScore: true,
    supportsIntermission: false,
    supportsIntro: true
  }),
  water: defineGame({
    id: 'water',
    component: WaterSort,
    name: "Tri de l'Eau",
    aliases: ['Tri Eau', "Tri de l'Eau", 'water'],
    icon: '💧',
    settingsIcon: '🧪',
    subtitle: 'Tri de couleurs relaxant',
    color: '#00ff7f',
    binaryScore: true
  }),
  ball: defineGame({
    id: 'ball',
    component: BallSort,
    name: 'Tri de Billes',
    aliases: ['Tri Billes', 'Tri de Billes', 'ball'],
    icon: '🔮',
    subtitle: 'Tri de billes chromatiques',
    color: '#ff007f',
    binaryScore: true
  }),
  '2048': defineGame({
    id: '2048',
    component: Grid2048,
    name: '2048 Zen',
    aliases: ['2048 Zen', 'Neon 2048', '2048', 'grid2048'],
    icon: '🔢',
    settingsIcon: '✨',
    subtitle: 'Fusion numérique zen',
    color: '#0ea5e9',
    intermission: {
      category: 'score',
      targetLabel: 'Tuile',
      targetOptions: [256, 512, 1024],
      defaultTarget: 512
    }
  }),
  jigsaw: defineGame({
    id: 'jigsaw',
    component: JigsawPuzzle,
    name: 'Puzzle Magique',
    aliases: ['Puzzle Magique', 'Jigsaw Puzzle', 'jigsaw'],
    icon: '🧩',
    subtitle: 'Reconstitution visuelle',
    color: '#39FF14',
    binaryScore: true
  }),
  unblock: defineGame({
    id: 'unblock',
    component: UnblockMe,
    name: 'Débloque-Moi',
    aliases: ['Débloque-Moi', 'Unblock Me', 'unblock'],
    icon: '🚪',
    subtitle: 'Évasion du bloc rouge',
    color: '#f97316',
    binaryScore: true,
    supportsIntermission: false
  }),
  freecell: defineGame({
    id: 'freecell',
    component: FreeCell,
    name: 'FreeCell',
    aliases: ['Freecell', 'freecell'],
    icon: '🃏',
    subtitle: 'Cartes & patience',
    color: '#c21807',
    binaryScore: true
  }),
  mines: defineGame({
    id: 'mines',
    component: Minesweeper,
    name: 'Démineur',
    aliases: ['Démineur', 'Minesweeper', 'mines', 'demineur'],
    icon: '💣',
    subtitle: 'Déminage tactique',
    color: '#ef4444',
    binaryScore: true
  }),
  arrows: defineGame({
    id: 'arrows',
    component: ArrowPuzzle,
    name: 'Flèches',
    aliases: ['Flèches', 'Fleches', 'Arrow Puzzle', 'arrows'],
    icon: '🏹',
    settingsIcon: '⬆️',
    subtitle: 'Labyrinthe directionnel',
    color: '#3b82f6',
    binaryScore: true
  }),
  hangman: defineGame({
    id: 'hangman',
    component: Hangman,
    name: 'Le Pendu',
    aliases: ['Le Pendu', 'Hangman', 'hangman', 'pendu'],
    icon: '🎈',
    subtitle: 'Mots & déduction',
    color: '#ef4444'
  }),
  sudoku: defineGame({
    id: 'sudoku',
    component: Sudoku,
    name: 'Sudoku',
    aliases: ['sudoku'],
    icon: '🔢',
    subtitle: 'Logique & chiffres',
    color: '#8b5cf6'
  }),
  blockfantasy: defineGame({
    id: 'blockfantasy',
    component: BlockFantasy,
    name: 'Block Fantasy',
    aliases: ['blockfantasy', 'block'],
    icon: '🧱',
    subtitle: 'Lignes de blocs',
    color: '#10b981',
    intermission: {
      category: 'score',
      targetLabel: 'Points',
      targetOptions: [500, 1000, 2000],
      defaultTarget: 1000
    }
  }),
  impossible13: defineGame({
    id: 'impossible13',
    component: Impossible13,
    name: 'Impossible 13',
    aliases: ['Impossible 13', 'Impossible13', 'impossible13', 'impossible'],
    icon: '1️⃣3️⃣',
    subtitle: 'Addition stratégique',
    color: '#EAB308',
    intermission: {
      category: 'score',
      targetLabel: 'Nombre',
      targetOptions: [9, 11, 13],
      defaultTarget: 11
    }
  }),
  bubblecool: defineGame({
    id: 'bubblecool',
    component: BubbleCool,
    name: 'Bubble Cool',
    aliases: ['Bubble Cool', 'BubbleCool', 'bubblecool', 'bubble'],
    icon: '🫧',
    subtitle: 'Tir de bulles relaxant',
    color: '#38BDF8',
    supportsIntro: true
  }),
  fireflies: defineGame({
    id: 'fireflies',
    component: FireflyGarden,
    name: 'Jardin des Lucioles',
    aliases: ['Jardin des Lucioles', 'Jardin Lucioles', 'Lucioles', 'fireflies'],
    icon: '✨',
    subtitle: 'Poésie & lumière zen',
    color: '#38BDF8',
    intermission: {
      category: 'score',
      targetLabel: 'Lucioles',
      targetOptions: [15, 30, 50],
      defaultTarget: 30
    }
  }),
  zenflow: defineGame({
    id: 'zenflow',
    component: ZenFlow,
    name: 'Flux Zen',
    aliases: ['Flux Zen', 'Zen Flow', 'Tracé Lumineux', 'zenflow', 'flow'],
    icon: '🌊',
    subtitle: 'Lignes & harmonie',
    color: '#06B6D4',
    supportsIntro: true,
    intermission: {
      category: 'rounds',
      roundsOptions: [1, 3, 5, 7],
      defaultRounds: 5
    }
  }),
  findcharlie: defineGame({
    id: 'findcharlie',
    component: FindCharlie,
    name: 'Trouvez Charlie',
    aliases: ['Trouvez Charlie', 'Charlie', 'Find Charlie', 'findcharlie', 'symbolquest', 'Quête des Symboles'],
    icon: '🕵️‍♂️',
    settingsIcon: '🕵️‍♂️',
    subtitle: 'Observation minutieuse & manches d\'exploration',
    color: '#ef4444',
    fullscreen: true,
    supportsIntro: true,
    intermission: {
      category: 'rounds',
      roundsOptions: [1, 2, 3, 5],
      defaultRounds: 2
    }
  }),
  wordmaster: defineGame({
    id: 'wordmaster',
    component: WordMaster,
    name: "L'Atelier des Mots",
    aliases: ["L'Atelier des Mots", 'Atelier des Mots', 'Atelier Mots', 'Word Master', 'wordmaster'],
    icon: '✍️',
    settingsIcon: '✍️',
    subtitle: 'Ortho-vocabulaire, syntaxe & glisser-déposer',
    color: '#8b5cf6',
    fullscreen: true,
    supportsIntro: true,
    intermission: {
      category: 'score',
      targetLabel: 'Points',
      targetOptions: [100, 200, 300, 500],
      defaultTarget: 200
    }
  }),
  morpion: defineGame({
    id: 'morpion',
    component: Morpion,
    name: 'Morpion',
    aliases: ['Morpion', 'Morpion Néon', 'TicTacToe', 'Tic Tac Toe', 'morpion', 'tictactoe'],
    icon: '❌⭕',
    settingsIcon: '❌',
    subtitle: 'Alignement & stratégie',
    color: '#0284c7',
    binaryScore: true,
    supportsIntro: true,
    intermission: {
      category: 'rounds',
      roundsOptions: [1, 3, 5, 7],
      defaultRounds: 5
    }
  }),
  memory: defineGame({
    id: 'memory',
    component: MemoryPairs,
    name: 'Paires Mémoire',
    aliases: ['Paires Mémoire', 'Mémoire Zen', 'Memory', 'Memory Pairs', 'memory', 'memorypairs'],
    icon: '🎴',
    settingsIcon: '🌸',
    subtitle: 'Association & mémoire zen',
    color: '#0284c7',
    fullscreen: true,
    binaryScore: true,
    supportsIntro: true,
    intermission: {
      category: 'rounds',
      roundsOptions: [1, 2, 3, 5],
      defaultRounds: 3,
      targetLabel: 'Paires',
      targetOptions: [4, 6, 8],
      defaultTarget: 6
    }
  }),
  carillon: defineGame({
    id: 'carillon',
    component: CarillonCeleste,
    name: 'Carillon Céleste',
    aliases: ['Carillon Céleste', 'Carillon', 'carillon', 'carillonceleste'],
    icon: '🔔',
    settingsIcon: '🎶',
    subtitle: 'Mémoire mélodique & résonance zen',
    color: '#0284c7',
    fullscreen: true,
    binaryScore: true,
    supportsIntro: true,
    intermission: {
      category: 'score',
      targetLabel: 'Points à atteindre',
      targetOptions: [50, 100, 150, 200],
      defaultTarget: 100
    }
  }),
  motsflottants: defineGame({
    id: 'motsflottants',
    component: MotsFlottants,
    name: 'Mots Flottants',
    aliases: ['Mots Flottants', 'Mots', 'motsflottants', 'mots'],
    icon: '📖',
    settingsIcon: '🔤',
    subtitle: 'Exploration visuelle & mots doux',
    color: '#0d9488',
    fullscreen: true,
    binaryScore: true,
    supportsIntro: true,
    intermission: {
      category: 'score',
      targetLabel: 'Mots à trouver',
      targetOptions: [1, 2, 3, 5],
      defaultTarget: 2
    }
  }),
  tangram: defineGame({
    id: 'tangram',
    component: TangramSilhouettes,
    name: 'Tangram Silhouettes',
    aliases: ['Tangram Silhouettes', 'Tangram', 'tangram', 'tangramsilhouettes'],
    icon: '🧩',
    settingsIcon: '📐',
    subtitle: 'Assemblage spatial & motricité zen',
    color: '#c2410c',
    fullscreen: true,
    binaryScore: true,
    supportsIntro: true
  }),
  brickbreaker: defineGame({
    id: 'brickbreaker',
    component: BrickBreaker,
    name: 'Casse-Briques',
    aliases: ['Casse-Briques', 'Casse Briques', 'Brick Breaker', 'brickbreaker', 'breaker'],
    icon: '🧱',
    subtitle: 'Rebonds & réflexes',
    color: '#0284c7',
    supportsIntro: true
  }),
  flappyneon: defineGame({
    id: 'flappyneon',
    component: FlappyNeon,
    name: 'Flappy Zen',
    aliases: ['Flappy Zen', 'Flappy Neon', 'flappyneon', 'flappy'],
    icon: '🚀',
    subtitle: 'Vol céleste & réflexes',
    color: '#0ea5e9',
    supportsIntro: true
  }),
  snakewave: defineGame({
    id: 'snakewave',
    component: SnakeWave,
    name: 'Snake Wave',
    aliases: ['Snake Wave', 'Snake Zen', 'snakewave', 'snake'],
    icon: '🐍',
    subtitle: 'Onde & fluidité',
    color: '#10b981',
    supportsIntro: true
  })
};

// Alias rétrocompatible transparent: GAMES_CONFIG.symbolquest -> GAMES_CONFIG.findcharlie
Object.defineProperty(GAMES_CONFIG, 'symbolquest', {
  get: () => GAMES_CONFIG.findcharlie,
  enumerable: false,
  configurable: true
});

/**
 * Résout un nom, un identifiant ou un objet en identifiant canonique de jeu.
 * @param {string|Object} input
 * @returns {string|null}
 */
export function resolveGameId(input) {
  if (!input) return null;

  if (typeof input === 'object') {
    const candidate = input.id || input.gameId || input.game || input.key || input.name;
    return candidate ? resolveGameId(candidate) : null;
  }

  if (typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (GAMES_CONFIG[trimmed]) return trimmed;

  const normalized = trimmed.toLowerCase();
  for (const game of Object.values(GAMES_CONFIG)) {
    if (game.id.toLowerCase() === normalized) return game.id;
    if (game.name.toLowerCase() === normalized) return game.id;
    if (game.aliases.some((a) => a.toLowerCase() === normalized)) return game.id;
  }

  return null;
}

/**
 * Liste des clés de jeux pouvant servir d'entracte.
 */
export const INTERMISSION_GAME_KEYS = Object.keys(GAMES_CONFIG).filter(
  (key) => GAMES_CONFIG[key].supportsIntermission
);

/**
 * Retourne la liste des configurations de jeux d'entracte, en excluant optionnellement un jeu.
 * @param {string} [excludeKey]
 * @returns {Object[]}
 */
export function getIntermissionGames(excludeKey = null) {
  return Object.values(GAMES_CONFIG).filter(
    (g) => g.supportsIntermission && (!excludeKey || g.id !== excludeKey)
  );
}

/**
 * Retourne la liste de tous les identifiants de jeux.
 * @returns {string[]}
 */
export function getAllGameIds() {
  return Object.keys(GAMES_CONFIG);
}

/**
 * Retourne la liste de tous les objets de configuration de jeux.
 * @returns {Object[]}
 */
export function getAllGames() {
  return Object.values(GAMES_CONFIG);
}

/**
 * Trouve la configuration d'un jeu par sa clé, son nom ou un de ses alias.
 * @param {string|Object} keyOrName
 * @returns {Object|null}
 */
export function findGameConfig(keyOrName) {
  const gameId = resolveGameId(keyOrName);
  return gameId ? GAMES_CONFIG[gameId] : null;
}

/**
 * Obtient le nom d'affichage d'un jeu.
 * @param {string} gameKey
 * @returns {string}
 */
export function getGameName(gameKey) {
  const resolved = resolveGameId(gameKey);
  return resolved ? GAMES_CONFIG[resolved].name : 'Jeu';
}

/**
 * Obtient l'icône d'un jeu.
 * @param {string} gameKey
 * @returns {string}
 */
export function getGameIcon(gameKey) {
  const resolved = resolveGameId(gameKey);
  return resolved ? GAMES_CONFIG[resolved].icon : '🎮';
}
