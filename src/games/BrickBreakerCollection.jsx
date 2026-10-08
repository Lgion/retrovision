import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.brickbreaker || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const speedItems = [
  { id: 'douce', name: 'Vitesse Douce', icon: '🟢', description: 'Rebonds lents et accessibles' },
  { id: 'normale', name: 'Vitesse Standard', icon: '🟡', description: 'Équilibre réflexe classique' },
  { id: 'rapide', name: 'Vitesse Tonique', icon: '🔴', description: 'Défi vif et dynamique' }
];

const categories = [
  {
    id: 'theme',
    name: 'Style Visuel',
    icon: '🧱',
    items: themeItems
  },
  {
    id: 'speed',
    name: 'Rythme de Balle',
    icon: '⚡',
    items: speedItems
  }
];

export default function BrickBreakerCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE CASSE-BRIQUES"
      icon="🧱"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
