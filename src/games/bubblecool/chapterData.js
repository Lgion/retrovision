// chapterData.js - 10 Chapitres Évolutifs avec Variations Dynamiques pour Bubble Cool
import { shuffle, randomChoice } from '../../utils/commonUtils';

export const SPECIAL_TYPES = {
  STONE: 'stone',        // 🪨 Indestructible par couleur, doit chuter par gravité ou bombe
  BOMB: 'bomb',          // 💣 Explosion de zone rayon 2
  RAINBOW: 'rainbow',    // 🌈 Bulle Joker qui s'adapte à toute couleur touchée
  LIGHTNING: 'lightning',// ⚡ Détruit toute la rangée horizontale
  ICE: 'ice'             // ❄️ Glace qui éclate quand un cluster adjacent explose
};

export const isSpecialType = (type) => Object.values(SPECIAL_TYPES).includes(type);

export const CHAPTERS = [
  {
    id: 1,
    title: "Le Bosquet Paisible",
    subtitle: "Initiation & Rebonds",
    icon: "🍃",
    difficultyText: "Très Facile",
    description: "Apprenez l'art du tir en angle et du ricochet. Une formation aérée sans pièges.",
    hint: "Visez les parois latérales pour faire ricocher votre bulle vers les points faibles !",
    bgGradient: "radial-gradient(circle at center, #064e3b 0%, #022c22 60%, #020617 100%)",
    accentColor: "#10B981",
    allowedColors: ['green', 'blue', 'red'],
    targetScore: 2500,
    starThresholds: { star1: 1500, star2: 3500, star3: 6000 },
    layoutVariants: [
      // Variante A : Triangle en V centré
      [
        ['c1', 'c1', 'c2', 'c2', 'c3', 'c2', 'c2', 'c1', 'c1'],
        ['c1', 'c2', 'c2', 'c3', 'c3', 'c2', 'c2', 'c1'],
        [null, 'c1', 'c2', 'c3', 'c3', 'c3', 'c2', 'c1', null],
        [null, 'c1', 'c3', 'c3', 'c3', 'c3', 'c1', null],
        [null, null, 'c1', 'c3', 'c3', 'c3', 'c1', null, null],
        [null, null, null, 'c1', 'c1', null, null, null]
      ],
      // Variante B : Deux colonnes jumelles avec passerelle
      [
        ['c2', 'c2', 'c1', 'c1', 'c3', 'c1', 'c1', 'c2', 'c2'],
        ['c2', 'c1', 'c1', null, null, 'c1', 'c1', 'c2'],
        ['c2', 'c1', null, 'c3', 'c3', 'c3', null, 'c1', 'c2'],
        ['c3', 'c3', null, 'c3', 'c3', null, 'c3', 'c3'],
        [null, 'c3', null, null, null, null, 'c3', null]
      ]
    ]
  },
  {
    id: 2,
    title: "La Caverne Turquoise",
    subtitle: "Chutes d'Orphelins",
    icon: "💎",
    difficultyText: "Facile",
    description: "Visez haut ! En brisant les attaches supérieures, toute la grappe inférieure s'effondre.",
    hint: "Les bulles isolées tombent et rapportent 250 points bonus chacune !",
    bgGradient: "radial-gradient(circle at center, #0e7490 0%, #155e75 50%, #020617 100%)",
    accentColor: "#06B6D4",
    allowedColors: ['blue', 'green', 'yellow', 'red'],
    targetScore: 4000,
    starThresholds: { star1: 2500, star2: 5000, star3: 8500 },
    layoutVariants: [
      // Variante A : Diamant suspendu
      [
        ['c1', 'c1', 'c3', 'c3', 'c1', 'c3', 'c3', 'c1', 'c1'],
        ['c1', 'c3', 'c2', 'c2', 'c2', 'c2', 'c3', 'c1'],
        ['c3', 'c2', 'c4', 'c4', 'c3', 'c4', 'c4', 'c2', 'c3'],
        ['c2', 'c4', 'c1', 'c1', 'c1', 'c1', 'c4', 'c2'],
        [null, 'c3', 'c4', 'c2', 'c2', 'c2', 'c4', 'c3', null],
        [null, null, 'c3', 'c3', 'c3', 'c3', null, null]
      ],
      // Variante B : Grappes en sablier
      [
        ['c4', 'c4', 'c2', 'c2', 'c1', 'c2', 'c2', 'c4', 'c4'],
        ['c4', 'c2', 'c2', 'c1', 'c1', 'c2', 'c2', 'c4'],
        [null, 'c4', 'c1', 'c1', 'c3', 'c1', 'c1', 'c4', null],
        [null, null, 'c3', 'c3', 'c3', 'c3', null, null],
        [null, 'c2', 'c2', 'c3', 'c3', 'c3', 'c2', 'c2', null],
        [null, null, 'c1', 'c1', 'c1', 'c1', null, null]
      ]
    ]
  },
  {
    id: 3,
    title: "Les Ruines de Granit",
    subtitle: "Introduction : Bulles de Pierre 🪨",
    icon: "🪨",
    difficultyText: "Modéré",
    description: "Les pierres ancestrales sont indestructibles par couleur. Détruisez leurs ancres au plafond !",
    hint: "Ne tirez pas inutilement sur les pierres : éliminez les bulles de couleur situées au-dessus.",
    bgGradient: "radial-gradient(circle at center, #334155 0%, #1e293b 50%, #020617 100%)",
    accentColor: "#94A3B8",
    allowedColors: ['red', 'blue', 'yellow', 'purple'],
    targetScore: 5000,
    starThresholds: { star1: 3000, star2: 6000, star3: 10000 },
    layoutVariants: [
      // Variante A : Piliers de pierre
      [
        ['c4', 'c4', 'c2', 'c2', 'c1', 'c2', 'c2', 'c4', 'c4'],
        ['c4', 'c2', 'stone', 'c1', 'c1', 'stone', 'c2', 'c4'],
        ['c2', 'stone', 'c3', 'c3', 'c1', 'c3', 'c3', 'stone', 'c2'],
        ['c2', 'c3', 'c3', 'stone', 'stone', 'c3', 'c3', 'c2'],
        [null, 'c4', 'stone', 'c4', 'c4', 'c4', 'stone', 'c4', null],
        [null, null, 'c4', 'c3', 'c3', 'c4', null, null]
      ],
      // Variante B : Mur de soutènement
      [
        ['c1', 'c1', 'c3', 'c3', 'c2', 'c3', 'c3', 'c1', 'c1'],
        ['c1', 'stone', 'stone', 'c2', 'c2', 'stone', 'stone', 'c1'],
        ['c3', 'c3', 'c4', 'c4', 'c2', 'c4', 'c4', 'c3', 'c3'],
        ['c4', 'stone', 'c1', 'c1', 'c1', 'c1', 'stone', 'c4'],
        [null, 'c4', 'c4', 'stone', 'stone', 'c4', 'c4', null]
      ]
    ]
  },
  {
    id: 4,
    title: "Le Récif Phosphorescent",
    subtitle: "Introduction : Bulles Bombes 💣",
    icon: "💣",
    difficultyText: "Modéré +",
    description: "Les bombes pulvérisent toutes les bulles dans un rayon de 2 cases ! Activez-les au bon moment.",
    hint: "Une bombe détruit même les pierres adjacentes et provoque de gigantesques réactions en chaîne.",
    bgGradient: "radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)",
    accentColor: "#EF4444",
    allowedColors: ['red', 'blue', 'green', 'yellow'],
    targetScore: 6500,
    starThresholds: { star1: 4000, star2: 8000, star3: 13000 },
    layoutVariants: [
      // Variante A : Nœud central explosif
      [
        ['c3', 'c3', 'c1', 'c1', 'bomb', 'c1', 'c1', 'c3', 'c3'],
        ['c3', 'stone', 'c4', 'c4', 'c4', 'c4', 'stone', 'c3'],
        ['c2', 'c2', 'bomb', 'c2', 'c3', 'c2', 'bomb', 'c2', 'c2'],
        ['c2', 'c3', 'c3', 'c4', 'c4', 'c3', 'c3', 'c2'],
        [null, 'c1', 'c1', 'stone', 'bomb', 'stone', 'c1', 'c1', null],
        [null, null, 'c2', 'c2', 'c2', 'c2', null, null]
      ],
      // Variante B : Réseau en damier
      [
        ['bomb', 'c2', 'c2', 'c3', 'bomb', 'c3', 'c2', 'c2', 'bomb'],
        ['c1', 'c1', 'stone', 'c4', 'c4', 'stone', 'c1', 'c1'],
        ['c4', 'bomb', 'c4', 'c1', 'stone', 'c1', 'c4', 'bomb', 'c4'],
        ['c2', 'c2', 'c3', 'c3', 'c3', 'c3', 'c2', 'c2'],
        [null, 'c1', 'stone', 'bomb', 'bomb', 'stone', 'c1', null]
      ]
    ]
  },
  {
    id: 5,
    title: "La Fonderie de Rubis",
    subtitle: "Réactions en Chaîne",
    icon: "🌋",
    difficultyText: "Difficile",
    description: "Une forteresse de pierres protège des nœuds de bombes. Précision chirurgicale exigée !",
    hint: "Infiltrez vos tirs à travers les failles étroites pour faire sauter le cœur volcanique.",
    bgGradient: "radial-gradient(circle at center, #7c2d12 0%, #451a03 50%, #020617 100%)",
    accentColor: "#F97316",
    allowedColors: ['red', 'yellow', 'purple', 'pink', 'blue'],
    targetScore: 7500,
    starThresholds: { star1: 5000, star2: 9500, star3: 15000 },
    layoutVariants: [
      [
        ['stone', 'c1', 'c1', 'stone', 'bomb', 'stone', 'c1', 'c1', 'stone'],
        ['c3', 'c3', 'stone', 'c2', 'c2', 'stone', 'c3', 'c3'],
        ['stone', 'bomb', 'c3', 'c4', 'c4', 'c4', 'c3', 'bomb', 'stone'],
        ['c4', 'c4', 'stone', 'bomb', 'bomb', 'stone', 'c4', 'c4'],
        [null, 'c2', 'c2', 'c3', 'stone', 'c3', 'c2', 'c2', null],
        [null, null, 'c1', 'c1', 'c4', 'c4', 'c1', 'c1', null]
      ],
      [
        ['c2', 'stone', 'bomb', 'c1', 'c1', 'c1', 'bomb', 'stone', 'c2'],
        ['c2', 'c2', 'stone', 'stone', 'stone', 'stone', 'c2', 'c2'],
        ['c5', 'bomb', 'c3', 'c3', 'bomb', 'c3', 'c3', 'bomb', 'c5'],
        ['c5', 'c5', 'stone', 'c4', 'c4', 'stone', 'c5', 'c5'],
        [null, 'c1', 'c1', 'bomb', 'stone', 'bomb', 'c1', 'c1', null]
      ]
    ]
  },
  {
    id: 6,
    title: "La Nébuleuse Mystique",
    subtitle: "Introduction : Prismes Arc-en-Ciel 🌈",
    icon: "🌈",
    difficultyText: "Difficile",
    description: "Les prismes célestes s'adaptent à n'importe quelle couleur connectée pour créer des super-combos.",
    hint: "Combinez un prisme avec une grappe de 2 bulles identiques pour déclencher un éclat instantané.",
    bgGradient: "radial-gradient(circle at center, #581c87 0%, #3b0764 50%, #020617 100%)",
    accentColor: "#A855F7",
    allowedColors: ['purple', 'pink', 'blue', 'green', 'yellow'],
    targetScore: 9000,
    starThresholds: { star1: 6000, star2: 11000, star3: 17000 },
    layoutVariants: [
      [
        ['c1', 'rainbow', 'c1', 'c3', 'rainbow', 'c3', 'c2', 'rainbow', 'c2'],
        ['c1', 'c1', 'c3', 'c3', 'c2', 'c2', 'c4', 'c4'],
        ['c4', 'stone', 'rainbow', 'c5', 'c5', 'rainbow', 'stone', 'c4', 'c5'],
        ['c4', 'c4', 'c5', 'stone', 'stone', 'c5', 'c3', 'c3'],
        [null, 'c2', 'rainbow', 'c2', 'bomb', 'c1', 'rainbow', 'c1', null],
        [null, null, 'c3', 'c4', 'c4', 'c3', null, null]
      ],
      [
        ['c3', 'c3', 'rainbow', 'c1', 'c1', 'c1', 'rainbow', 'c3', 'c3'],
        ['c2', 'c2', 'stone', 'c4', 'c4', 'stone', 'c2', 'c2'],
        ['rainbow', 'c5', 'c5', 'rainbow', 'c5', 'c5', 'rainbow', 'c2', 'c2'],
        ['c1', 'stone', 'bomb', 'stone', 'stone', 'bomb', 'stone', 'c1'],
        [null, 'c4', 'rainbow', 'c3', 'c3', 'rainbow', 'c4', null]
      ]
    ]
  },
  {
    id: 7,
    title: "Le Sanctuaire du Tonnerre",
    subtitle: "Introduction : Bulles Éclair ⚡",
    icon: "⚡",
    difficultyText: "Expert",
    description: "Une décharge électrique traverse et foudroie toute la ligne horizontale de part en part !",
    hint: "La foudre pulvérise tout sur son passage, y compris les pierres et obstacles les plus solides.",
    bgGradient: "radial-gradient(circle at center, #1e1b4b 0%, #172554 50%, #020617 100%)",
    accentColor: "#EAB308",
    allowedColors: ['yellow', 'blue', 'purple', 'red', 'green'],
    targetScore: 10000,
    starThresholds: { star1: 7000, star2: 12500, star3: 19000 },
    layoutVariants: [
      [
        ['lightning', 'c2', 'c2', 'c1', 'lightning', 'c1', 'c2', 'c2', 'lightning'],
        ['stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone', 'stone'],
        ['c3', 'c3', 'lightning', 'c5', 'c5', 'c5', 'lightning', 'c3', 'c3'],
        ['c4', 'c4', 'c1', 'lightning', 'lightning', 'c1', 'c4', 'c4'],
        [null, 'stone', 'c2', 'c2', 'bomb', 'c2', 'c2', 'stone', null],
        [null, null, 'c5', 'c5', 'lightning', 'c5', 'c5', null, null]
      ],
      [
        ['c1', 'lightning', 'c2', 'c2', 'stone', 'c2', 'c2', 'lightning', 'c1'],
        ['c3', 'stone', 'c4', 'c4', 'lightning', 'c4', 'c4', 'stone'],
        ['lightning', 'c5', 'c5', 'stone', 'bomb', 'stone', 'c5', 'c5', 'lightning'],
        ['stone', 'c1', 'c1', 'c3', 'c3', 'c1', 'c1', 'stone'],
        [null, 'c2', 'lightning', 'c4', 'c4', 'lightning', 'c2', null]
      ]
    ]
  },
  {
    id: 8,
    title: "La Citadelle de Givre",
    subtitle: "Introduction : Bulles de Givre ❄️",
    icon: "❄️",
    difficultyText: "Expert",
    description: "Des couches de glace enferment les bulles. Éclatez les bulles adjacentes pour les dégeler !",
    hint: "La glace se fissure et se libère lorsque n'importe quel combo explose à son contact direct.",
    bgGradient: "radial-gradient(circle at center, #0369a1 0%, #075985 50%, #020617 100%)",
    accentColor: "#38BDF8",
    allowedColors: ['blue', 'pink', 'green', 'purple', 'yellow', 'red'],
    targetScore: 12000,
    starThresholds: { star1: 8000, star2: 14000, star3: 21000 },
    layoutVariants: [
      [
        ['c1', 'ice', 'c2', 'ice', 'c3', 'ice', 'c4', 'ice', 'c1'],
        ['ice', 'c1', 'ice', 'c2', 'ice', 'c3', 'ice', 'c4'],
        ['c2', 'ice', 'bomb', 'ice', 'rainbow', 'ice', 'bomb', 'ice', 'c2'],
        ['ice', 'stone', 'ice', 'c5', 'c5', 'ice', 'stone', 'ice'],
        [null, 'ice', 'c4', 'ice', 'ice', 'ice', 'c4', 'ice', null],
        [null, null, 'c3', 'ice', 'lightning', 'ice', 'c3', null, null]
      ],
      [
        ['ice', 'ice', 'c1', 'c1', 'ice', 'c1', 'c1', 'ice', 'ice'],
        ['c2', 'ice', 'c3', 'ice', 'ice', 'c3', 'ice', 'c2'],
        ['c4', 'c4', 'bomb', 'ice', 'rainbow', 'ice', 'bomb', 'c4', 'c4'],
        ['ice', 'stone', 'c5', 'c5', 'c5', 'c5', 'stone', 'ice'],
        [null, 'c1', 'ice', 'lightning', 'ice', 'lightning', 'ice', 'c1', null]
      ]
    ]
  },
  {
    id: 9,
    title: "La Tour des Illusions",
    subtitle: "Pression Temporelle & Blindage",
    icon: "🔮",
    difficultyText: "Maître",
    description: "Grille dense et variée. Combinez bombes, foudres et réflexes éclair !",
    hint: "Utilisez vos pouvoirs de secours dès que la situation se complique !",
    bgGradient: "radial-gradient(circle at center, #4c1d95 0%, #2e1065 50%, #020617 100%)",
    accentColor: "#C084FC",
    allowedColors: ['purple', 'pink', 'blue', 'yellow', 'green', 'red'],
    targetScore: 14000,
    starThresholds: { star1: 9500, star2: 16000, star3: 24000 },
    layoutVariants: [
      [
        ['stone', 'c1', 'bomb', 'stone', 'lightning', 'stone', 'bomb', 'c1', 'stone'],
        ['c2', 'ice', 'c2', 'stone', 'stone', 'c2', 'ice', 'c2'],
        ['stone', 'rainbow', 'stone', 'c4', 'bomb', 'c4', 'stone', 'rainbow', 'stone'],
        ['c3', 'ice', 'c3', 'c5', 'c5', 'c3', 'ice', 'c3'],
        [null, 'stone', 'c6', 'stone', 'lightning', 'stone', 'c6', 'stone', null],
        [null, null, 'c2', 'c1', 'rainbow', 'c1', 'c2', null, null],
        [null, null, null, 'c4', 'bomb', 'c4', null, null, null]
      ],
      [
        ['bomb', 'stone', 'c3', 'c3', 'rainbow', 'c3', 'c3', 'stone', 'bomb'],
        ['ice', 'c1', 'ice', 'c4', 'c4', 'ice', 'c1', 'ice'],
        ['c2', 'lightning', 'c2', 'stone', 'bomb', 'stone', 'c2', 'lightning', 'c2'],
        ['c5', 'stone', 'c5', 'rainbow', 'rainbow', 'c5', 'stone', 'c5'],
        [null, 'ice', 'c6', 'c6', 'lightning', 'c6', 'c6', 'ice', null]
      ]
    ]
  },
  {
    id: 10,
    title: "Le Cœur de l'Infini",
    subtitle: "Boss Final : Défi Ultime 👑",
    icon: "👑",
    difficultyText: "LÉGENDAIRE",
    description: "Le cœur dimensionnel pulsant protégé par 3 anneaux d'énergie et de granit ancestral.",
    hint: "Déclenchez le Cœur d'Énergie au sommet pour anéantir la matrice entière !",
    bgGradient: "radial-gradient(circle at center, #831843 0%, #4c0519 40%, #020617 100%)",
    accentColor: "#F43F5E",
    allowedColors: ['red', 'purple', 'blue', 'yellow', 'pink', 'green'],
    targetScore: 18000,
    starThresholds: { star1: 12000, star2: 20000, star3: 30000 },
    layoutVariants: [
      [
        ['bomb', 'lightning', 'rainbow', 'stone', 'bomb', 'stone', 'rainbow', 'lightning', 'bomb'],
        ['ice', 'ice', 'stone', 'c1', 'c1', 'stone', 'ice', 'ice'],
        ['stone', 'bomb', 'c2', 'c4', 'rainbow', 'c4', 'c2', 'bomb', 'stone'],
        ['c3', 'ice', 'stone', 'lightning', 'lightning', 'stone', 'ice', 'c3'],
        [null, 'c6', 'stone', 'c5', 'bomb', 'c5', 'stone', 'c6', null],
        [null, null, 'ice', 'c2', 'rainbow', 'c2', 'ice', null, null],
        [null, null, null, 'c4', 'lightning', 'c4', null, null, null]
      ],
      [
        ['lightning', 'stone', 'bomb', 'rainbow', 'bomb', 'rainbow', 'bomb', 'stone', 'lightning'],
        ['c1', 'ice', 'stone', 'c2', 'c2', 'stone', 'ice', 'c1'],
        ['c3', 'bomb', 'rainbow', 'c4', 'stone', 'c4', 'rainbow', 'bomb', 'c3'],
        ['stone', 'c5', 'ice', 'lightning', 'lightning', 'ice', 'c5', 'stone'],
        [null, 'c6', 'stone', 'bomb', 'bomb', 'bomb', 'stone', 'c6', null],
        [null, null, 'c1', 'c2', 'rainbow', 'c2', 'c1', null, null]
      ]
    ]
  }
];

export const getChapter = (id) => {
  return CHAPTERS.find((c) => c.id === id) || CHAPTERS[0];
};

export const calculateStars = (chapterId, score) => {
  const chapter = getChapter(chapterId);
  if (score >= chapter.starThresholds.star3) return 3;
  if (score >= chapter.starThresholds.star2) return 2;
  return 1;
};

/**
 * Génère une grille dynamique unique pour chaque partie du chapitre.
 * Sélectionne une variante de disposition et permute aléatoirement les couleurs autorisées,
 * tout en conservant les bulles spéciales (bombes, pierres, etc.) à leurs positions tactiques.
 */
export const generateDynamicChapterGrid = (chapterId, maxRows = 12, colsEven = 9, colsOdd = 8) => {
  const chapter = getChapter(chapterId);
  const grid = Array.from({ length: maxRows }, () => Array(colsEven).fill(null));

  // 1. Choisir aléatoirement une variante de structure
  const variants = chapter.layoutVariants || [];
  const chosenVariant = randomChoice(variants) || [];

  // 2. Mélanger aléatoirement les couleurs autorisées (DRY Fisher-Yates)
  const colors = shuffle(chapter.allowedColors);

  // Mapper c1, c2, c3... vers les couleurs mélangées
  const colorMap = {
    c1: colors[0] || 'red',
    c2: colors[1] || 'blue',
    c3: colors[2] || 'green',
    c4: colors[3] || 'yellow',
    c5: colors[4] || 'purple',
    c6: colors[5] || 'pink'
  };

  // 3. Peupler la grille
  for (let r = 0; r < chosenVariant.length && r < maxRows; r++) {
    const row = chosenVariant[r];
    const maxCols = r % 2 === 0 ? colsEven : colsOdd;
    for (let c = 0; c < row.length && c < maxCols; c++) {
      const cellVal = row[c];
      if (!cellVal) {
        grid[r][c] = null;
      } else if (isSpecialType(cellVal)) {
        grid[r][c] = cellVal;
      } else if (colorMap[cellVal]) {
        grid[r][c] = colorMap[cellVal];
      } else {
        // Fallback couleur directe
        grid[r][c] = cellVal;
      }
    }
  }

  return grid;
};
