// levelsData.js - 10 Niveaux Aventure pour Block Fantasy

export const BLOCK_SPECIAL_TYPES = {
  STONE: 'stone',       // 🧱 Bloc de pierre : se brise quand sa rangée ou colonne est complétée, ou par le marteau
  ICE: 'ice',           // ❄️ Gemme gelée : nécessite 2 éliminations pour se libérer
  GOLD: 'gold'          // ✨ Gemme dorée : rapporte un bonus de 500 pts et remplit la jauge Fever
};

export const ADVENTURE_LEVELS = [
  {
    id: 1,
    title: "L'Éveil des Cristaux",
    subtitle: "Initiation & Lignes",
    icon: "✨",
    difficultyText: "Très Facile",
    description: "Complétez des lignes ou des colonnes pour récolter vos premiers éclats d'énergie.",
    hint: "Formez des lignes d'un bout à l'autre de la grille pour les faire disparaître !",
    goal: { type: 'lines', target: 4, current: 0 },
    starThresholds: { star1: 800, star2: 1500, star3: 2500 },
    prePlaced: []
  },
  {
    id: 2,
    title: "La Double Lame",
    subtitle: "Combos & Multiplicateurs",
    icon: "⚔️",
    difficultyText: "Facile",
    description: "Enchaînez les éliminations ou détruisez 2 lignes d'un seul coup !",
    hint: "Placez vos pièces de manière à compléter deux lignes simultanément pour un bonus.",
    goal: { type: 'double_clears', target: 2, current: 0 },
    starThresholds: { star1: 1200, star2: 2400, star3: 3800 },
    prePlaced: []
  },
  {
    id: 3,
    title: "Les Pierres Scellées",
    subtitle: "Introduction : Pierres 🧱",
    icon: "🧱",
    difficultyText: "Modéré",
    description: "Des pierres ancestrales bloquent les quatre coins. Complétez leurs rangées pour les briser !",
    hint: "Complétez la ligne ou la colonne contenant une pierre pour la pulvériser.",
    goal: { type: 'clear_stone', target: 4, current: 0 },
    starThresholds: { star1: 1500, star2: 3000, star3: 4500 },
    prePlaced: [
      { r: 0, c: 0, color: '#64748b', isStone: true },
      { r: 0, c: 9, color: '#64748b', isStone: true },
      { r: 9, c: 0, color: '#64748b', isStone: true },
      { r: 9, c: 9, color: '#64748b', isStone: true }
    ]
  },
  {
    id: 4,
    title: "La Croix Arcanique",
    subtitle: "Défi Cross Blast ⚡",
    icon: "⚡",
    difficultyText: "Modéré",
    description: "Réussissez à éliminer simultanément une ligne HORIZONTALE et une colonne VERTICALE !",
    hint: "Construisez une croix presque complète et posez la tuile charnière au centre !",
    goal: { type: 'cross_blast', target: 1, current: 0 },
    starThresholds: { star1: 2000, star2: 3500, star3: 5000 },
    prePlaced: [
      { r: 4, c: 4, color: '#a855f7' },
      { r: 4, c: 5, color: '#a855f7' },
      { r: 5, c: 4, color: '#a855f7' },
      { r: 5, c: 5, color: '#a855f7' }
    ]
  },
  {
    id: 5,
    title: "Les Cristaux Gelés",
    subtitle: "Introduction : Gemmes de Glace ❄️",
    icon: "❄️",
    difficultyText: "Intermédiaire",
    description: "Des cristaux de glace sont piégés. Brisez les lignes environnantes pour les libérer.",
    hint: "Les gemmes de glace s'effritent quand leur ligne est complétée.",
    goal: { type: 'clear_ice', target: 4, current: 0 },
    starThresholds: { star1: 2500, star2: 4500, star3: 6500 },
    prePlaced: [
      { r: 2, c: 2, color: '#38bdf8', isIce: true, hits: 1 },
      { r: 2, c: 7, color: '#38bdf8', isIce: true, hits: 1 },
      { r: 7, c: 2, color: '#38bdf8', isIce: true, hits: 1 },
      { r: 7, c: 7, color: '#38bdf8', isIce: true, hits: 1 }
    ]
  },
  {
    id: 6,
    title: "Le Labyrinthe d'Améthyste",
    subtitle: "Désengorgement Tactique",
    icon: "🔮",
    difficultyText: "Avancé",
    description: "Une grille chargée de reliques violettes. Nettoyez 10 lignes sans vous laisser submerger !",
    hint: "Utilisez le marteau ou la relance si une pièce volumineuse ne rentre pas.",
    goal: { type: 'lines', target: 10, current: 0 },
    starThresholds: { star1: 3000, star2: 5500, star3: 8000 },
    prePlaced: [
      { r: 1, c: 3, color: '#8b5cf6' }, { r: 1, c: 6, color: '#8b5cf6' },
      { r: 3, c: 1, color: '#8b5cf6' }, { r: 3, c: 8, color: '#8b5cf6' },
      { r: 6, c: 1, color: '#8b5cf6' }, { r: 6, c: 8, color: '#8b5cf6' },
      { r: 8, c: 3, color: '#8b5cf6' }, { r: 8, c: 6, color: '#8b5cf6' }
    ]
  },
  {
    id: 7,
    title: "La Fièvre Dorée",
    subtitle: "Mode Fever & Frénésie",
    icon: "🔥",
    difficultyText: "Avancé",
    description: "Déclenchez le mode Fantasy Fever et atteignez un score astronomique !",
    hint: "Enchaînez rapidement les lignes pour remplir la jauge de fièvre avant qu'elle ne baisse !",
    goal: { type: 'fever_count', target: 1, current: 0 },
    starThresholds: { star1: 3500, star2: 6000, star3: 9000 },
    prePlaced: [
      { r: 4, c: 2, color: '#fbbf24', isGold: true },
      { r: 4, c: 7, color: '#fbbf24', isGold: true },
      { r: 5, c: 2, color: '#fbbf24', isGold: true },
      { r: 5, c: 7, color: '#fbbf24', isGold: true }
    ]
  },
  {
    id: 8,
    title: "Les Bastions Jumelés",
    subtitle: "Pierres & Glaces Entremêlées",
    icon: "🛡️",
    difficultyText: "Expert",
    description: "Les coins sont verrouillés par des pierres et le centre par de la glace. Libérez-les tous !",
    hint: "Priorisez les lignes centrales pour libérer la glace puis attaquez les bordures.",
    goal: { type: 'clear_stone_and_ice', target: 8, current: 0 },
    starThresholds: { star1: 4000, star2: 7000, star3: 10500 },
    prePlaced: [
      { r: 1, c: 1, color: '#64748b', isStone: true },
      { r: 1, c: 8, color: '#64748b', isStone: true },
      { r: 8, c: 1, color: '#64748b', isStone: true },
      { r: 8, c: 8, color: '#64748b', isStone: true },
      { r: 4, c: 4, color: '#38bdf8', isIce: true },
      { r: 4, c: 5, color: '#38bdf8', isIce: true },
      { r: 5, c: 4, color: '#38bdf8', isIce: true },
      { r: 5, c: 5, color: '#38bdf8', isIce: true }
    ]
  },
  {
    id: 9,
    title: "Le Maître des Combos",
    subtitle: "Enchaînement Parfait",
    icon: "👑",
    difficultyText: "Expert",
    description: "Atteignez un Combo Streak x3 consécutif sans rater d'élimination !",
    hint: "Préparez plusieurs lignes prêtes à être déclenchées coup sur coup.",
    goal: { type: 'combo_streak', target: 3, current: 0 },
    starThresholds: { star1: 4500, star2: 8000, star3: 12000 },
    prePlaced: []
  },
  {
    id: 10,
    title: "Le Grand Cataclysme",
    subtitle: "Le Défi Suprême",
    icon: "🌌",
    difficultyText: "Légendaire",
    description: "Éliminez 15 lignes tout en nettoyant les reliques sacrées. Utilisez tous vos pouvoirs !",
    hint: "Le Marteau et le Joker 1x1 seront vos meilleurs alliés dans ce niveau épique !",
    goal: { type: 'lines', target: 15, current: 0 },
    starThresholds: { star1: 6000, star2: 10000, star3: 15000 },
    prePlaced: [
      { r: 0, c: 4, color: '#64748b', isStone: true },
      { r: 0, c: 5, color: '#64748b', isStone: true },
      { r: 9, c: 4, color: '#64748b', isStone: true },
      { r: 9, c: 5, color: '#64748b', isStone: true },
      { r: 4, c: 0, color: '#38bdf8', isIce: true },
      { r: 5, c: 0, color: '#38bdf8', isIce: true },
      { r: 4, c: 9, color: '#38bdf8', isIce: true },
      { r: 5, c: 9, color: '#38bdf8', isIce: true }
    ]
  }
];

export const getLevelData = (levelId) => {
  return ADVENTURE_LEVELS.find(lvl => lvl.id === levelId) || ADVENTURE_LEVELS[0];
};

export const calculateLevelStars = (levelId, score) => {
  const level = getLevelData(levelId);
  if (score >= level.starThresholds.star3) return 3;
  if (score >= level.starThresholds.star2) return 2;
  return 1;
};
