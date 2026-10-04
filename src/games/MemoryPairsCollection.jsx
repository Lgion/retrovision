import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const difficultyItems = [
  { id: 'facile', name: 'Facile (4 paires)', icon: '🟢' },
  { id: 'moyen', name: 'Moyen (6 paires)', icon: '🟡' },
  { id: 'difficile', name: 'Difficile (8 paires)', icon: '🔴' }
];

const themeItems = (GAME_THEME_DETAILS.memory || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: difficultyItems
  },
  {
    id: 'theme',
    name: 'Style des Cartes',
    icon: '🎴',
    items: themeItems
  }
];

export default function MemoryPairsCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE PAIRES MÉMOIRE"
      icon="🎴"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
