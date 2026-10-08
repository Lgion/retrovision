import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.symbolquest || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const packItems = [
  { id: 0, name: 'Sérénité Simple (4x4)', icon: '🟢', description: '1 cible • 5 à repérer' },
  { id: 5, name: 'Double Harmonie (4x5)', icon: '🟡', description: '2 cibles • 7 à repérer' },
  { id: 10, name: 'Jardin Secret (5x5)', icon: '🔴', description: '2 cibles • 8 à repérer' }
];

const categories = [
  {
    id: 'pack',
    name: 'Pack de Niveaux',
    icon: '🎯',
    items: packItems
  },
  {
    id: 'theme',
    name: 'Ambiance Visuelle',
    icon: '🔍',
    items: themeItems
  }
];

export default function SymbolQuestCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE DES SYMBOLES"
      icon="🔍"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
