import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.zenflow || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const levelPackItems = [
  { id: 0, name: 'Grille 5x5 (Niveau 1)', icon: '🟢', description: 'Parcours découverte apaisant' },
  { id: 5, name: 'Grille 6x6 (Niveau 6)', icon: '🟡', description: 'Chemins croisés équilibrés' },
  { id: 10, name: 'Grille 7x7 (Niveau 11)', icon: '🔴', description: 'Labyrinthe méditatif avancé' }
];

const categories = [
  {
    id: 'theme',
    name: 'Style du Flux',
    icon: '🌊',
    items: themeItems
  },
  {
    id: 'level',
    name: 'Taille de Grille',
    icon: '📐',
    items: levelPackItems
  }
];

export default function ZenFlowCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE FLUX ZEN"
      icon="🌊"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
