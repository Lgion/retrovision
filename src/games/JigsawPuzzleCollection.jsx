import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const difficultyItems = [
  { id: 3, name: 'Facile (3x3 - 9 pièces)', icon: '🟢', description: 'Idéal pour la détente' },
  { id: 4, name: 'Moyen (4x4 - 16 pièces)', icon: '🟡', description: 'Recherche équilibrée' },
  { id: 5, name: 'Difficile (5x5 - 25 pièces)', icon: '🔴', description: 'Défi visuel stimulant' }
];

const puzzleItems = [
  { id: 'sunset', name: 'Coucher de Soleil', icon: '🌅', description: 'Ciel couchant flamboyant' },
  { id: 'forest', name: 'Forêt Magique', icon: '🌲', description: 'Sous-bois verdoyant et mousses' },
  { id: 'cat', name: 'Chat Zen', icon: '🐱', description: 'Félin paisible et doux' }
];

const categories = [
  {
    id: 'image',
    name: 'Illustration',
    icon: '🖼️',
    items: puzzleItems
  },
  {
    id: 'difficulty',
    name: 'Découpe',
    icon: '🧩',
    items: difficultyItems
  }
];

export default function JigsawPuzzleCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE PUZZLE"
      icon="🧩"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
