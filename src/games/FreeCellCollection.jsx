import React from 'react';
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: [
      { id: 'facile', name: 'Facile (4 Cellules)', icon: '🟢' },
      { id: 'moyen', name: 'Moyen (3 Cellules)', icon: '🟡' },
      { id: 'difficile', name: 'Difficile (2 Cellules)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Thème Visuel',
    icon: '🎨',
    items: [
      { id: 'classic', name: 'Tapis Vert Classique', icon: '🃏' },
      { id: 'dark', name: 'Mode Sombre', icon: '🌑' },
      { id: 'royal', name: 'Tapis Rouge Royal', icon: '👑' }
    ]
  }
];

export default function FreeCellCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE FREECELL"
      icon="🃏"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
