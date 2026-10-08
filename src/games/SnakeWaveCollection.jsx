import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.snakewave || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const speedItems = [
  { id: 1, name: 'Vitesse Zen (Lente)', icon: '🟢', description: 'Idéal pour le calme et l’anticipation' },
  { id: 2, name: 'Vitesse Équilibrée', icon: '🟡', description: 'Rythme standard fluide' },
  { id: 3, name: 'Vitesse Tonique', icon: '🔴', description: 'Défi vif de réflexes' }
];

const categories = [
  {
    id: 'theme',
    name: 'Style du Serpent',
    icon: '🐍',
    items: themeItems
  },
  {
    id: 'speed',
    name: 'Vitesse de Déplacement',
    icon: '⚡',
    items: speedItems
  }
];

export default function SnakeWaveCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE SNAKE WAVE"
      icon="🐍"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
