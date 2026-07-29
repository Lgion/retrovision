import React from 'react';
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: [
      { id: 'facile', name: 'Facile (5x5)', icon: '🟢' },
      { id: 'moyen', name: 'Moyen (4x4)', icon: '🟡' },
      { id: 'difficile', name: 'Difficile (3x3)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Thème Visuel',
    icon: '🎨',
    items: [
      { id: 'neon', name: 'Néon Original', icon: '🌌' },
      { id: 'dark', name: 'Sombre Épuré', icon: '🌑' },
      { id: 'light', name: 'Clair Lumineux', icon: '☀️' }
    ]
  }
];

export default function Grid2048Collection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE 2048"
      icon="🔢"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
