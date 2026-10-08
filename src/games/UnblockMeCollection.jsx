import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.unblock || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const levelItems = [
  { id: 'random', name: 'Aléatoire', icon: '🎲', description: 'Défi tiré au sort' },
  { id: 0, name: 'Débutant (Défi 1)', icon: '🟢', description: 'Idéal pour s’échauffer' },
  { id: 3, name: 'Intermédiaire (Défi 4)', icon: '🟡', description: 'Parcours tactique' },
  { id: 7, name: 'Avancé (Défi 8)', icon: '🔴', description: 'Évasion complexe' },
  { id: 11, name: 'Expert (Défi 12)', icon: '👑', description: 'Maîtrise spatiale' }
];

const categories = [
  {
    id: 'theme',
    name: 'Style du Plateau',
    icon: '🎨',
    items: themeItems
  },
  {
    id: 'level',
    name: 'Sélection Défi',
    icon: '🚪',
    items: levelItems
  }
];

export default function UnblockMeCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE DÉBLOQUE-MOI"
      icon="🚪"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
