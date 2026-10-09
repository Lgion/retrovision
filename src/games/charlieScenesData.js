/**
 * charlieScenesData.js
 * Définition des scènes avec images d'arrière-plan HD et zonage sémantique précis.
 * Assure un placement logique : voitures et vélos sur la route, animaux dans les prairies,
 * piétons sur les trottoirs, ciel pur exempt d'objets terrestres incohérents.
 */

export const getCharlieBgUrl = (bgPath) => {
  const base = import.meta.env.BASE_URL || '/';
  const safeBase = base.endsWith('/') ? base : `${base}/`;
  return `${safeBase}${bgPath.startsWith('/') ? bgPath.slice(1) : bgPath}`;
};

// Types d'objets cibles à retrouver
export const TARGET_DEFINITIONS = {
  charlie: {
    id: 'charlie',
    name: 'Charlie',
    icon: '🕵️‍♂️',
    points: 100,
    color: '#ef4444',
    badge: 'Cible principale',
    preferredZones: ['sidewalk', 'meadow', 'pathway']
  },
  dog: {
    id: 'dog',
    name: 'Ouaf le Chien',
    icon: '🐶',
    points: 60,
    color: '#f59e0b',
    badge: 'Compagnon fidèle',
    preferredZones: ['meadow', 'sidewalk', 'pathway']
  },
  glasses: {
    id: 'glasses',
    name: 'Lunettes',
    icon: '👓',
    points: 40,
    color: '#0284c7',
    badge: 'Objet égaré',
    preferredZones: ['sidewalk', 'meadow', 'pathway', 'props']
  },
  cane: {
    id: 'cane',
    name: 'Canne de marche',
    icon: '🦯',
    points: 40,
    color: '#854d0e',
    badge: 'Objet égaré',
    preferredZones: ['sidewalk', 'meadow', 'pathway']
  },
  camera: {
    id: 'camera',
    name: 'Appareil photo',
    icon: '📷',
    points: 40,
    color: '#475569',
    badge: 'Souvenir',
    preferredZones: ['sidewalk', 'pathway', 'props']
  },
  key: {
    id: 'key',
    name: 'Clé secrète',
    icon: '🗝️',
    points: 40,
    color: '#eab308',
    badge: 'Trésor',
    preferredZones: ['meadow', 'sidewalk', 'pathway']
  },
  beanie: {
    id: 'beanie',
    name: 'Bonnet rayé',
    icon: '🧶',
    points: 40,
    color: '#dc2626',
    badge: 'Vêtement',
    preferredZones: ['meadow', 'sidewalk', 'pathway']
  },
  compass: {
    id: 'compass',
    name: 'Boussole',
    icon: '🧭',
    points: 40,
    color: '#0d9488',
    badge: 'Navigation',
    preferredZones: ['meadow', 'pathway', 'sidewalk']
  }
};

// Catalogue complet d'émojis classés par compatibilité sémantique
export const CATEGORY_ITEMS = {
  // Voitures, camionnettes et deux-roues motorisés sur route
  vehicles_road: [
    { emoji: '🚗', name: 'Voiture Rouge', minDistance: 6.5, baseScale: 1.15, isVehicle: true },
    { emoji: '🚙', name: 'SUV Bleu', minDistance: 6.5, baseScale: 1.15, isVehicle: true },
    { emoji: '🚕', name: 'Taxi Jaune', minDistance: 6.5, baseScale: 1.15, isVehicle: true },
    { emoji: '🏎️', name: 'Bolide Sport', minDistance: 6.5, baseScale: 1.1, isVehicle: true },
    { emoji: '🚌', name: 'Bus Urbain', minDistance: 8.5, baseScale: 1.3, isVehicle: true },
    { emoji: '🚚', name: 'Camionnette', minDistance: 8.0, baseScale: 1.25, isVehicle: true },
    { emoji: '🚓', name: 'Patrouille', minDistance: 6.5, baseScale: 1.15, isVehicle: true },
    { emoji: '🛵', name: 'Scooter', minDistance: 4.8, baseScale: 0.95, isVehicle: true },
    { emoji: '🏍️', name: 'Moto Veloce', minDistance: 5.2, baseScale: 1.0, isVehicle: true }
  ],
  // Vélos et cyclistes
  bicycles_cyclists: [
    { emoji: '🚲', name: 'Bicyclette', minDistance: 4.8, baseScale: 1.0, isVehicle: true },
    { emoji: '🚴', name: 'Cycliste Course', minDistance: 5.2, baseScale: 1.05, isVehicle: true },
    { emoji: '🚴‍♀️', name: 'Cycliste Casquée', minDistance: 5.2, baseScale: 1.05, isVehicle: true },
    { emoji: '🛴', name: 'Trottinette', minDistance: 4.2, baseScale: 0.95, isVehicle: true }
  ],
  // Faune campagnarde et animaux domestiques
  animals_meadow: [
    { emoji: '🐄', name: 'Vache Laitière', minDistance: 6.0, baseScale: 1.2 },
    { emoji: '🐑', name: 'Mouton Blanc', minDistance: 4.5, baseScale: 1.0 },
    { emoji: '🐎', name: 'Cheval Pur-Sang', minDistance: 6.5, baseScale: 1.25 },
    { emoji: '🐖', name: 'Petit Cochon', minDistance: 4.5, baseScale: 0.95 },
    { emoji: '🐐', name: 'Chèvre Blanche', minDistance: 4.5, baseScale: 0.95 },
    { emoji: '🐕', name: 'Chien Berger', minDistance: 4.5, baseScale: 1.0 },
    { emoji: '🐈', name: 'Chat Tigré', minDistance: 3.8, baseScale: 0.85 },
    { emoji: '🐇', name: 'Lapin Sauvage', minDistance: 3.5, baseScale: 0.8 },
    { emoji: '🦊', name: 'Renard Roux', minDistance: 4.0, baseScale: 0.9 },
    { emoji: '🦔', name: 'Hérisson Curieux', minDistance: 3.2, baseScale: 0.75 },
    { emoji: '🦆', name: 'Canard Colvert', minDistance: 3.5, baseScale: 0.85 },
    { emoji: '🐓', name: 'Coq Hardi', minDistance: 3.5, baseScale: 0.85 }
  ],
  // Végétation et vie champêtre
  nature_meadow: [
    { emoji: '🌻', name: 'Tournesol Éclatant', minDistance: 3.5, baseScale: 0.85 },
    { emoji: '🌷', name: 'Tulipe Sauvage', minDistance: 3.0, baseScale: 0.75 },
    { emoji: '🧺', name: 'Pique-Nique', minDistance: 5.0, baseScale: 1.0 },
    { emoji: '⛺', name: 'Tente Rayée', minDistance: 6.5, baseScale: 1.2 },
    { emoji: '🍄', name: 'Champignon des Bois', minDistance: 3.0, baseScale: 0.7 }
  ],
  // Piétons et marcheurs
  pedestrians: [
    { emoji: '🚶‍♂️', name: 'Promeneur Bleu', minDistance: 4.0, baseScale: 1.0 },
    { emoji: '🚶‍♀️', name: 'Promeneuse Rose', minDistance: 4.0, baseScale: 1.0 },
    { emoji: '🏃‍♂️', name: 'Joggeur Actif', minDistance: 4.5, baseScale: 1.05 },
    { emoji: '🏃‍♀️', name: 'Joggeuse Sportive', minDistance: 4.5, baseScale: 1.05 },
    { emoji: '🧍‍♂️', name: 'Passant Observateur', minDistance: 3.8, baseScale: 1.0 },
    { emoji: '🧍‍♀️', name: 'Passante Égérie', minDistance: 3.8, baseScale: 1.0 },
    { emoji: '👩‍🦽', name: 'Promeneuse Mobile', minDistance: 4.5, baseScale: 1.0 },
    { emoji: '🧘', name: 'Moment Zen', minDistance: 4.0, baseScale: 0.95 },
    { emoji: '👨‍🦯', name: 'Explorateur', minDistance: 4.0, baseScale: 1.0 }
  ],
  // Décors urbains & terrasses
  city_props: [
    { emoji: '☕', name: 'Café Expresso', minDistance: 3.5, baseScale: 0.75 },
    { emoji: '🪑', name: 'Chaise Bistrot', minDistance: 3.5, baseScale: 0.8 },
    { emoji: '🪴', name: 'Plante en Pot', minDistance: 3.5, baseScale: 0.85 },
    { emoji: '🥖', name: 'Baguette Dorée', minDistance: 3.0, baseScale: 0.75 },
    { emoji: '📰', name: 'Journal du Jour', minDistance: 3.0, baseScale: 0.75 }
  ],
  // Flottille & éléments marins (exclusivement sur l'eau)
  water_craft: [
    { emoji: '⛵', name: 'Voilier Blanc', minDistance: 7.0, baseScale: 1.1, isVehicle: true },
    { emoji: '🚤', name: 'Hors-Bord', minDistance: 7.5, baseScale: 1.15, isVehicle: true },
    { emoji: '🛶', name: 'Kayak Léger', minDistance: 6.0, baseScale: 0.95, isVehicle: true },
    { emoji: '🏊‍♂️', name: 'Nageur Sportif', minDistance: 5.5, baseScale: 0.9 },
    { emoji: '🏄‍♂️', name: 'Surfeur des Vagues', minDistance: 6.0, baseScale: 1.0 },
    { emoji: '🦆', name: 'Canard Flottant', minDistance: 4.5, baseScale: 0.8 },
    { emoji: '🐬', name: 'Dauphin Joueur', minDistance: 7.0, baseScale: 1.1 }
  ],
  // Objets et baigneurs sur le sable
  beach_props: [
    { emoji: '⛱️', name: 'Grand Parasol', minDistance: 6.0, baseScale: 1.15 },
    { emoji: '🏖️', name: 'Parasol Plante', minDistance: 6.0, baseScale: 1.15 },
    { emoji: '🏐', name: 'Ballon de Plage', minDistance: 4.0, baseScale: 0.8 },
    { emoji: '🦀', name: 'Petit Crabe', minDistance: 3.5, baseScale: 0.75 },
    { emoji: '🩴', name: 'Tongs Colorées', minDistance: 3.0, baseScale: 0.7 },
    { emoji: '🧴', name: 'Crème Solaire', minDistance: 3.0, baseScale: 0.7 },
    { emoji: '🍦', name: 'Cornet Glace', minDistance: 3.2, baseScale: 0.75 }
  ],
  // Éléments du ciel (exclusivement aériens et en nombre très restreint)
  sky_decor: [
    { emoji: '🕊️', name: 'Colombe Céleste', minDistance: 8.0, baseScale: 0.85 },
    { emoji: '🦅', name: 'Aigle Altier', minDistance: 10.0, baseScale: 0.9 },
    { emoji: '🎈', name: 'Ballon de Fête', minDistance: 8.0, baseScale: 0.85 },
    { emoji: '🪁', name: 'Cerf-Volant Coloré', minDistance: 9.0, baseScale: 0.9 }
  ]
};

// Configuration des scènes avec zonage spatial rigoureux
export const CHARLIE_SCENES = {
  beach: {
    id: 'beach',
    name: 'La Grande Plage',
    icon: '🏖️',
    description: 'Bord de mer, vagues turquoise, sable doré & parasols',
    useVectorFallback: true,
    aspectRatio: '16 / 9',
    zones: [
      {
        id: 'sky',
        type: 'sky',
        name: 'Ciel bleu marin',
        bounds: { xMin: 5, xMax: 95, yMin: 2, yMax: 22 },
        allowedCategories: ['sky_decor'],
        maxItems: 2,
        allowTargets: false
      },
      {
        id: 'sea',
        type: 'water',
        name: 'Mer turquoise & vagues',
        bounds: { xMin: 4, xMax: 96, yMin: 26, yMax: 44 },
        allowedCategories: ['water_craft'],
        maxItems: 8,
        allowTargets: false,
        scaleModifier: 0.85
      },
      {
        id: 'beach_sand',
        type: 'sidewalk',
        name: 'Sable fin doré',
        bounds: { xMin: 4, xMax: 96, yMin: 50, yMax: 96 },
        allowedCategories: ['beach_props', 'pedestrians'],
        maxItems: 28,
        allowTargets: true,
        scaleModifier: 1.15
      }
    ]
  },
  countryside: {
    id: 'countryside',
    name: 'La Vallée Champêtre',
    icon: '🌄',
    description: 'Prairies verdoyantes, route sinueuse & sentier de promenade',
    bgImage: 'assets/charlie/countryside_valley.webp',
    aspectRatio: '16 / 9',
    zones: [
      {
        id: 'sky',
        type: 'sky',
        name: 'Ciel azuréen',
        bounds: { xMin: 5, xMax: 95, yMin: 4, yMax: 22 },
        allowedCategories: ['sky_decor'],
        maxItems: 2, // Strictement 1 ou 2 éléments célestes discrets
        allowTargets: false
      },
      {
        id: 'meadow_distant',
        type: 'meadow',
        name: 'Pâturage du lointain',
        bounds: { xMin: 12, xMax: 88, yMin: 32, yMax: 50 },
        allowedCategories: ['animals_meadow', 'nature_meadow', 'pedestrians'],
        maxItems: 14,
        allowTargets: true,
        scaleModifier: 0.75
      },
      {
        id: 'meadow_main',
        type: 'meadow',
        name: 'Grande prairie fleurie',
        bounds: { xMin: 6, xMax: 70, yMin: 52, yMax: 66 },
        allowedCategories: ['animals_meadow', 'nature_meadow', 'pedestrians'],
        maxItems: 22,
        allowTargets: true,
        scaleModifier: 1.0
      },
      {
        id: 'road_main',
        type: 'road',
        name: 'Route asphaltée départementale',
        bounds: { xMin: 2, xMax: 76, yMin: 69, yMax: 82 },
        allowedCategories: ['vehicles_road', 'bicycles_cyclists'],
        maxItems: 15,
        allowTargets: false, // Pas de Charlie écrasé sur la route !
        flowDirection: 'horizontal',
        scaleModifier: 1.15
      },
      {
        id: 'road_right_curve',
        type: 'road',
        name: 'Virage montant vers la colline',
        bounds: { xMin: 72, xMax: 92, yMin: 52, yMax: 68 },
        allowedCategories: ['vehicles_road', 'bicycles_cyclists'],
        maxItems: 8,
        allowTargets: false,
        flowDirection: 'diagonal',
        scaleModifier: 0.95
      },
      {
        id: 'pathway_gravel',
        type: 'pathway',
        name: 'Sentier champêtre de premier plan',
        bounds: { xMin: 4, xMax: 96, yMin: 85, yMax: 96 },
        allowedCategories: ['pedestrians', 'bicycles_cyclists', 'animals_meadow'],
        maxItems: 18,
        allowTargets: true,
        scaleModifier: 1.25
      }
    ]
  },

  city: {
    id: 'city',
    name: 'L’Avenue Urbaine & Carrefour',
    icon: '🏙️',
    description: 'Grand boulevard, piste cyclable & terrasses animées',
    bgImage: 'assets/charlie/city_avenue.webp',
    aspectRatio: '16 / 9',
    zones: [
      {
        id: 'sky',
        type: 'sky',
        name: 'Ciel au-dessus des toits',
        bounds: { xMin: 5, xMax: 95, yMin: 3, yMax: 18 },
        allowedCategories: ['sky_decor'],
        maxItems: 2,
        allowTargets: false
      },
      {
        id: 'sidewalk_cafe',
        type: 'sidewalk',
        name: 'Trottoir des boutiques & terrasses',
        bounds: { xMin: 6, xMax: 50, yMin: 54, yMax: 68 },
        allowedCategories: ['pedestrians', 'city_props'],
        maxItems: 20,
        allowTargets: true,
        scaleModifier: 0.95
      },
      {
        id: 'sidewalk_lower',
        type: 'sidewalk',
        name: 'Esplanade piétonne premier plan',
        bounds: { xMin: 2, xMax: 20, yMin: 72, yMax: 92 },
        allowedCategories: ['pedestrians', 'city_props'],
        maxItems: 10,
        allowTargets: true,
        scaleModifier: 1.2
      },
      {
        id: 'sidewalk_distant',
        type: 'sidewalk',
        name: 'Promenade de l’avenue est',
        bounds: { xMin: 70, xMax: 92, yMin: 36, yMax: 48 },
        allowedCategories: ['pedestrians', 'city_props'],
        maxItems: 10,
        allowTargets: true,
        scaleModifier: 0.75
      },
      {
        id: 'road_crossroad',
        type: 'road',
        name: 'Grand boulevard de circulation',
        bounds: { xMin: 22, xMax: 80, yMin: 70, yMax: 95 },
        allowedCategories: ['vehicles_road'],
        maxItems: 18,
        allowTargets: false,
        flowDirection: 'diagonal',
        scaleModifier: 1.2
      },
      {
        id: 'road_northeast',
        type: 'road',
        name: 'Avenue en perspective nord-est',
        bounds: { xMin: 55, xMax: 95, yMin: 48, yMax: 70 },
        allowedCategories: ['vehicles_road'],
        maxItems: 12,
        allowTargets: false,
        flowDirection: 'diagonal',
        scaleModifier: 0.9
      },
      {
        id: 'bike_lane_red',
        type: 'bike_lane',
        name: 'Piste cyclable rouge dédiée',
        bounds: { xMin: 76, xMax: 96, yMin: 62, yMax: 96 },
        allowedCategories: ['bicycles_cyclists'],
        maxItems: 10,
        allowTargets: false,
        flowDirection: 'diagonal',
        scaleModifier: 1.15
      }
    ]
  }
};

// Configuration des manches de jeu
export const ROUNDS_CONFIG = [
  {
    round: 1,
    name: 'Manche 1 : Les Premiers Pas',
    baseTime: 60,
    targetScoreToPass: 180,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane']
  },
  {
    round: 2,
    name: 'Manche 2 : La Foule s’Anime',
    baseTime: 55,
    targetScoreToPass: 240,
    requiredItems: ['charlie', 'dog', 'camera', 'key', 'beanie']
  },
  {
    round: 3,
    name: 'Manche 3 : Grand Rassemblement',
    baseTime: 50,
    targetScoreToPass: 280,
    requiredItems: ['charlie', 'glasses', 'cane', 'camera', 'compass', 'key']
  },
  {
    round: 4,
    name: 'Manche 4 : L’Œil de Lynx',
    baseTime: 45,
    targetScoreToPass: 320,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane', 'camera', 'key', 'beanie']
  },
  {
    round: 5,
    name: 'Manche 5 : Le Défi Suprême',
    baseTime: 40,
    targetScoreToPass: 360,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane', 'camera', 'key', 'beanie', 'compass']
  }
];

export const ENCOURAGEMENTS = [
  "Votre regard balaie le décor avec une magnifique finesse.",
  "Chaque trouvaille aiguise votre perception spatiale et votre concentration.",
  "Prenez un instant pour savourer cette belle clarté visuelle.",
  "Bravo ! Vous distinguez les détails les plus subtils avec aisance.",
  "Votre persévérance et votre calme font toute la différence."
];
