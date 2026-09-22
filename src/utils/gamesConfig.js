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
import SymbolQuest from '../games/SymbolQuest';

/**
 * Registre centralisé de tous les jeux de RetroVision.
 * Définit la configuration, les métadonnées, les composants et les comportements
 * communs tant en mode normal qu'en mode entracte.
 */
export const GAMES_CONFIG = {
  mahjong: {
    id: 'mahjong',
    component: MahjongZen,
    name: 'Mahjong Zen',
    aliases: ['Mahjong Zen', 'mahjong'],
    icon: '🀄',
    subtitle: 'Association de tuiles relaxante',
    color: '#eab308',
    fullscreen: true,
    storageKey: 'retrovision_mahjong_highscore',
    binaryScore: true,
    supportsIntermission: false,
    supportsIntro: true,
  },
  water: {
    id: 'water',
    component: WaterSort,
    name: "Tri de l'Eau",
    aliases: ['Tri Eau', "Tri de l'Eau", 'water'],
    icon: '💧',
    settingsIcon: '🧪',
    subtitle: 'Tri de couleurs relaxant',
    color: '#00ff7f',
    fullscreen: false,
    storageKey: 'retrovision_water_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  ball: {
    id: 'ball',
    component: BallSort,
    name: 'Tri de Billes',
    aliases: ['Tri Billes', 'Tri de Billes', 'ball'],
    icon: '🔮',
    settingsIcon: '🔮',
    subtitle: 'Tri de billes chromatiques',
    color: '#ff007f',
    fullscreen: false,
    storageKey: 'retrovision_ball_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  '2048': {
    id: '2048',
    component: Grid2048,
    name: 'Neon 2048',
    aliases: ['Neon 2048', '2048', 'grid2048'],
    icon: '🔢',
    settingsIcon: '✨',
    subtitle: 'Fusion numérique',
    color: '#00f0ff',
    fullscreen: false,
    storageKey: 'retrovision_2048_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  jigsaw: {
    id: 'jigsaw',
    component: JigsawPuzzle,
    name: 'Puzzle Magique',
    aliases: ['Puzzle Magique', 'Jigsaw Puzzle', 'jigsaw'],
    icon: '🧩',
    settingsIcon: '🧩',
    subtitle: 'Reconstitution visuelle',
    color: '#39FF14',
    fullscreen: false,
    storageKey: 'retrovision_jigsaw_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  unblock: {
    id: 'unblock',
    component: UnblockMe,
    name: 'Débloque-Moi',
    aliases: ['Débloque-Moi', 'Unblock Me', 'unblock'],
    icon: '🚪',
    settingsIcon: '🚪',
    subtitle: 'Évasion du bloc rouge',
    color: '#f97316',
    fullscreen: false,
    storageKey: 'retrovision_unblock_highscore',
    binaryScore: true,
    supportsIntermission: false,
    supportsIntro: false,
  },
  freecell: {
    id: 'freecell',
    component: FreeCell,
    name: 'FreeCell',
    aliases: ['Freecell', 'FreeCell', 'freecell'],
    icon: '🃏',
    settingsIcon: '🃏',
    subtitle: 'Cartes & patience',
    color: '#c21807',
    fullscreen: false,
    storageKey: 'retrovision_freecell_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  mines: {
    id: 'mines',
    component: Minesweeper,
    name: 'Démineur',
    aliases: ['Démineur', 'Minesweeper', 'mines'],
    icon: '💣',
    settingsIcon: '💣',
    subtitle: 'Déminage tactique',
    color: '#ef4444',
    fullscreen: false,
    storageKey: 'retrovision_mines_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  arrows: {
    id: 'arrows',
    component: ArrowPuzzle,
    name: 'Flèches',
    aliases: ['Flèches', 'Arrow Puzzle', 'arrows'],
    icon: '🏹',
    settingsIcon: '⬆️',
    subtitle: 'Labyrinthe directionnel',
    color: '#3b82f6',
    fullscreen: false,
    storageKey: 'retrovision_arrows_highscore',
    binaryScore: true,
    supportsIntermission: true,
    supportsIntro: false,
  },
  hangman: {
    id: 'hangman',
    component: Hangman,
    name: 'Le Pendu',
    aliases: ['Le Pendu', 'Hangman', 'hangman'],
    icon: '🎈',
    settingsIcon: '🎈',
    subtitle: 'Mots & déduction',
    color: '#ef4444',
    fullscreen: false,
    storageKey: 'retrovision_hangman_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  sudoku: {
    id: 'sudoku',
    component: Sudoku,
    name: 'Sudoku',
    aliases: ['Sudoku', 'sudoku'],
    icon: '🔢',
    settingsIcon: '🔢',
    subtitle: 'Logique & chiffres',
    color: '#8b5cf6',
    fullscreen: false,
    storageKey: 'retrovision_sudoku_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  blockfantasy: {
    id: 'blockfantasy',
    component: BlockFantasy,
    name: 'Block Fantasy',
    aliases: ['Block Fantasy', 'blockfantasy'],
    icon: '🧱',
    settingsIcon: '🧱',
    subtitle: 'Lignes de blocs',
    color: '#39FF14',
    fullscreen: false,
    storageKey: 'retrovision_blockfantasy_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  impossible13: {
    id: 'impossible13',
    component: Impossible13,
    name: 'Impossible 13',
    aliases: ['Impossible 13', 'Impossible13', 'impossible13'],
    icon: '1️⃣3️⃣',
    settingsIcon: '1️⃣3️⃣',
    subtitle: 'Addition stratégique',
    color: '#EAB308',
    fullscreen: false,
    storageKey: 'retrovision_impossible13_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  bubblecool: {
    id: 'bubblecool',
    component: BubbleCool,
    name: 'Bubble Cool',
    aliases: ['Bubble Cool', 'BubbleCool', 'bubblecool'],
    icon: '🫧',
    settingsIcon: '🫧',
    subtitle: 'Tir de bulles arcade',
    color: '#38BDF8',
    fullscreen: false,
    storageKey: 'retrovision_bubblecool_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: true,
  },
  fireflies: {
    id: 'fireflies',
    component: FireflyGarden,
    name: 'Jardin des Lucioles',
    aliases: ['Jardin des Lucioles', 'Jardin Lucioles', 'Lucioles', 'fireflies'],
    icon: '✨',
    settingsIcon: '✨',
    subtitle: 'Poésie & lumière zen',
    color: '#38BDF8',
    fullscreen: false,
    storageKey: 'retrovision_fireflies_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  zenflow: {
    id: 'zenflow',
    component: ZenFlow,
    name: 'Flux Zen',
    aliases: ['Flux Zen', 'Zen Flow', 'Tracé Lumineux', 'zenflow', 'flow'],
    icon: '🌊',
    settingsIcon: '🌊',
    subtitle: 'Lignes & harmonie',
    color: '#06B6D4',
    fullscreen: false,
    storageKey: 'retrovision_zenflow_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
  symbolquest: {
    id: 'symbolquest',
    component: SymbolQuest,
    name: 'Quête des Symboles',
    aliases: ['Quête des Symboles', 'Quête Symboles', 'Symbol Quest', 'symbolquest', 'symbols'],
    icon: '🔍',
    settingsIcon: '🔍',
    subtitle: 'Balayage & symboles zen',
    color: '#10B981',
    fullscreen: false,
    storageKey: 'retrovision_symbolquest_highscore',
    binaryScore: false,
    supportsIntermission: true,
    supportsIntro: false,
  },
};

/**
 * Liste des clés de jeux qui peuvent être joués en tant qu'entracte.
 */
export const INTERMISSION_GAME_KEYS = Object.keys(GAMES_CONFIG).filter(
  (key) => GAMES_CONFIG[key].supportsIntermission
);

/**
 * Trouve la configuration d'un jeu par sa clé ou par un de ses noms / alias.
 */
export const findGameConfig = (keyOrName) => {
  if (!keyOrName) return null;
  if (typeof keyOrName !== 'string') {
    if (typeof keyOrName === 'object') {
      const candidate = keyOrName.game || keyOrName.gameId || keyOrName.id || keyOrName.key || keyOrName.name;
      if (candidate && typeof candidate === 'string') {
        return findGameConfig(candidate);
      }
    }
    return null;
  }
  if (GAMES_CONFIG[keyOrName]) return GAMES_CONFIG[keyOrName];

  const searchNormalized = keyOrName.trim().toLowerCase();
  return (
    Object.values(GAMES_CONFIG).find((g) =>
      g.aliases?.some((a) => a.toLowerCase() === searchNormalized)
    ) || null
  );
};

export const getGameName = (gameKey) => {
  return GAMES_CONFIG[gameKey]?.name || 'Jeu';
};

export const getGameIcon = (gameKey) => {
  return GAMES_CONFIG[gameKey]?.icon || '🎮';
};
