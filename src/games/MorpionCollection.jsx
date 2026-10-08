import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.morpion || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const modeItems = [
  { id: 'ai_facile', name: 'IA Découverte (Facile)', icon: '🟢', description: 'Idéal pour la détente' },
  { id: 'ai_moyen', name: 'IA Stratège (Moyen)', icon: '🟡', description: 'Jeu tactique équilibré' },
  { id: 'ai_difficile', name: 'IA Maître (Difficile)', icon: '🔴', description: 'Défi maximal' },
  { id: 'pvp', name: '2 Joueurs Local', icon: '👥', description: 'Partie à deux sur le même écran' }
];

const categories = [
  {
    id: 'theme',
    name: 'Style des Symboles',
    icon: '❌',
    items: themeItems
  },
  {
    id: 'mode',
    name: 'Mode & Difficulté',
    icon: '⚡',
    items: modeItems
  }
];

export default function MorpionCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE MORPION"
      icon="❌"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
