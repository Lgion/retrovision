import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.tangram || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const silhouetteItems = [
  { id: 0, name: 'Maison Zen', icon: '🏡', description: 'Toit protecteur et base solide' },
  { id: 1, name: 'Bateau Paisible', icon: '⛵', description: 'Voilure au gré du vent' },
  { id: 2, name: 'Sapin des Monts', icon: '🌲', description: 'Symétrie et élévation' }
];

const categories = [
  {
    id: 'silhouette',
    name: 'Choix de Silhouette',
    icon: '📐',
    items: silhouetteItems
  },
  {
    id: 'theme',
    name: 'Matière des Pièces',
    icon: '🧩',
    items: themeItems
  }
];

export default function TangramSilhouettesCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE TANGRAM"
      icon="🧩"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
