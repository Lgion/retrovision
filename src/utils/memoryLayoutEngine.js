/**
 * memoryLayoutEngine.js
 * Moteur de disposition géométrique des cartes pour le jeu Mémoire Paires.
 * Supporte 5 formes géométriques distinctes :
 * 1. Rectangle (Grille classique)
 * 2. Losange (Symétrie diamant effilé en haut et en bas)
 * 3. Triangle (Pyramide s'élargissant vers le bas)
 * 4. Cercle (Ovale / ronde harmonieuse)
 * 5. Forme Abstraite (Constellation asymétrique organique)
 */

export const LAYOUT_SHAPES = {
  rectangle: {
    id: 'rectangle',
    name: 'Rectangle (Grille)',
    icon: '📐',
    badge: 'Classique',
    description: 'Grille rectangulaire ordonnée et symétrique'
  },
  losange: {
    id: 'losange',
    name: 'Losange (Diamant)',
    icon: '💎',
    badge: 'Élégant',
    description: 'Sommet et base effilés avec centre élargi'
  },
  triangle: {
    id: 'triangle',
    name: 'Triangle (Pyramide)',
    icon: '🔺',
    badge: 'Ascendant',
    description: 'Pointe étroite au sommet et base large'
  },
  circle: {
    id: 'circle',
    name: 'Cercle (Harmonie)',
    icon: '⭕',
    badge: 'Zen',
    description: 'Ronde équilibrée et arrondie'
  },
  abstract: {
    id: 'abstract',
    name: 'Forme Abstraite',
    icon: '🌌',
    badge: 'Organique',
    description: 'Constellation asymétrique et décalages artistiques'
  }
};

export const SHAPE_KEYS = Object.keys(LAYOUT_SHAPES);

/**
 * Retourne la structure des rangées pour une forme et un nombre de cartes donné.
 * Chaque rangée définit le nombre de cartes, l'alignement et un décalage optionnel.
 */
export function getShapeRowSpecs(shapeKey, totalCards) {
  switch (shapeKey) {
    case 'losange': {
      if (totalCards <= 6) return [{ count: 1 }, { count: 2 }, { count: 2 }, { count: 1 }];
      if (totalCards <= 8) return [{ count: 1 }, { count: 3 }, { count: 3 }, { count: 1 }];
      if (totalCards <= 12) return [{ count: 1 }, { count: 3 }, { count: 4 }, { count: 3 }, { count: 1 }];
      if (totalCards <= 16) return [{ count: 1 }, { count: 3 }, { count: 4 }, { count: 4 }, { count: 3 }, { count: 1 }];
      return [{ count: 1 }, { count: 3 }, { count: 6 }, { count: 6 }, { count: 3 }, { count: 1 }];
    }

    case 'triangle': {
      if (totalCards <= 6) return [{ count: 1 }, { count: 2 }, { count: 3 }];
      if (totalCards <= 8) return [{ count: 1 }, { count: 3 }, { count: 4 }];
      if (totalCards <= 12) return [{ count: 1 }, { count: 2 }, { count: 4 }, { count: 5 }];
      if (totalCards <= 16) return [{ count: 1 }, { count: 3 }, { count: 5 }, { count: 7 }];
      return [{ count: 2 }, { count: 3 }, { count: 4 }, { count: 5 }, { count: 6 }];
    }

    case 'circle': {
      if (totalCards <= 6) return [{ count: 2 }, { count: 2 }, { count: 2 }];
      if (totalCards <= 8) return [{ count: 2 }, { count: 4 }, { count: 2 }];
      if (totalCards <= 12) return [{ count: 2 }, { count: 4 }, { count: 4 }, { count: 2 }];
      if (totalCards <= 16) return [{ count: 3 }, { count: 5 }, { count: 5 }, { count: 3 }];
      return [{ count: 4 }, { count: 6 }, { count: 6 }, { count: 4 }];
    }

    case 'abstract': {
      if (totalCards <= 6) {
        return [
          { count: 2, align: 'flex-start', shiftX: 18 },
          { count: 3, align: 'center', shiftX: 0 },
          { count: 1, align: 'flex-end', shiftX: -24 }
        ];
      }
      if (totalCards <= 8) {
        return [
          { count: 3, align: 'flex-start', shiftX: 20 },
          { count: 2, align: 'flex-end', shiftX: -28 },
          { count: 3, align: 'center', shiftX: 12 }
        ];
      }
      if (totalCards <= 12) {
        return [
          { count: 3, align: 'flex-start', shiftX: 24 },
          { count: 5, align: 'center', shiftX: 0 },
          { count: 4, align: 'flex-end', shiftX: -20 }
        ];
      }
      if (totalCards <= 16) {
        return [
          { count: 3, align: 'flex-start', shiftX: 28 },
          { count: 6, align: 'center', shiftX: 0 },
          { count: 4, align: 'flex-end', shiftX: -26 },
          { count: 3, align: 'center', shiftX: 16 }
        ];
      }
      return [
        { count: 3, align: 'flex-start', shiftX: 24 },
        { count: 6, align: 'center', shiftX: 0 },
        { count: 5, align: 'flex-end', shiftX: -28 },
        { count: 4, align: 'flex-start', shiftX: 32 },
        { count: 2, align: 'center', shiftX: 0 }
      ];
    }

    case 'rectangle':
    default: {
      if (totalCards <= 6) return [{ count: 3 }, { count: 3 }];
      if (totalCards <= 8) return [{ count: 4 }, { count: 4 }];
      if (totalCards <= 12) return [{ count: 4 }, { count: 4 }, { count: 4 }];
      if (totalCards <= 16) return [{ count: 4 }, { count: 4 }, { count: 4 }, { count: 4 }];
      return [{ count: 5 }, { count: 5 }, { count: 5 }, { count: 5 }];
    }
  }
}

/**
 * Organise un paquet de cartes mélangées dans la géométrie choisie.
 * Découpe les cartes en rangées avec index de colonne et rotations visuelles.
 */
export function buildShapeBoard(shuffledDeck, shapeKey) {
  const totalCards = shuffledDeck.length;
  const rowSpecs = getShapeRowSpecs(shapeKey, totalCards);

  let maxCols = 1;
  rowSpecs.forEach((spec) => {
    if (spec.count > maxCols) maxCols = spec.count;
  });

  let cardIndex = 0;
  const boardRows = rowSpecs.map((spec, rowIndex) => {
    const rowCards = [];
    for (let c = 0; c < spec.count && cardIndex < totalCards; c++) {
      const card = shuffledDeck[cardIndex];
      const isAbstract = shapeKey === 'abstract';

      // Micro-rotations pour style organique/abstrait
      const rotation = isAbstract
        ? (Math.random() * 6.5 - 3.25).toFixed(1)
        : (Math.random() * 3.2 - 1.6).toFixed(1);
      const tiltX = isAbstract ? (Math.random() * 6 - 3).toFixed(1) : 0;
      const tiltY = isAbstract ? (Math.random() * 6 - 3).toFixed(1) : 0;

      rowCards.push({
        ...card,
        r: rowIndex,
        c,
        rotation,
        tiltX,
        tiltY,
        isLeftField: c === 0
      });
      cardIndex++;
    }

    return {
      rowIndex,
      count: spec.count,
      align: spec.align || 'center',
      shiftX: spec.shiftX || 0,
      cards: rowCards
    };
  });

  return {
    boardRows,
    maxCols,
    shapeKey
  };
}
