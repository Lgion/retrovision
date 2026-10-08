import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.motsflottants || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const categoryItems = [
  { id: 'tous', name: 'Mélange Universel', icon: '🎲', description: 'Tous les mots apaisants' },
  { id: 'douceur', name: 'Douceur & Sérénité', icon: '🌸', description: 'Mots de réconfort et de paix' },
  { id: 'nature', name: 'Nature & Éléments', icon: '🌿', description: 'Arbres, ciel, rivières et brise' },
  { id: 'cosmos', name: 'Ciel & Lumière', icon: '✨', description: 'Étoiles, aube, lune et rayons' }
];

const categories = [
  {
    id: 'theme',
    name: 'Papier & Ambiance',
    icon: '📖',
    items: themeItems
  },
  {
    id: 'category',
    name: 'Thème des Mots',
    icon: '🔤',
    items: categoryItems
  }
];

export default function MotsFlottantsCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE MOTS FLOTTANTS"
      icon="📖"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
