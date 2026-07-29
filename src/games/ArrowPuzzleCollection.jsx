import React from 'react';
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: [
      { id: 'facile', name: 'Facile (Petit)', icon: '🟢' },
      { id: 'moyen', name: 'Moyen (Moyen)', icon: '🟡' },
      { id: 'difficile', name: 'Difficile (Grand)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Thème Visuel',
    icon: '🎨',
    items: [
      { id: 'classic', name: 'Classique Bleu', icon: '🔵' },
      { id: 'neon', name: 'Néon Violet', icon: '🌌' },
      { id: 'forest', name: 'Forêt Émeraude', icon: '🌲' }
    ]
  }
];

export default function ArrowPuzzleCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE ARROW"
      icon="🏹"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
