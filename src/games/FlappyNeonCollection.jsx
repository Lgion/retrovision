import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.flappyneon || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const birdItems = [
  { id: 'rocket', name: 'Fusée Cyber', icon: '🚀', description: 'Propulsion stellaire agile' },
  { id: 'bird', name: 'Oiseau Zen', icon: '🕊️', description: 'Vol d’or paisible' },
  { id: 'orb', name: 'Orbe Céleste', icon: '✨', description: 'Sphère d’énergie pure' },
  { id: 'butterfly', name: 'Papillon Fluo', icon: '🦋', description: 'Battement d’ailes soyeux' }
];

const categories = [
  {
    id: 'bird',
    name: 'Vaisseau & Avatar',
    icon: '🚀',
    items: birdItems
  },
  {
    id: 'theme',
    name: 'Décor & Nébuleuse',
    icon: '🌌',
    items: themeItems
  }
];

export default function FlappyNeonCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE FLAPPY ZEN"
      icon="🚀"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
