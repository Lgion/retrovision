import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const themeItems = (GAME_THEME_DETAILS.fireflies || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const constellationItems = [
  { id: 0, name: 'Lotus Céleste', icon: '🪷', description: '10 étoiles • Sérénité' },
  { id: 1, name: 'Cygne d’Étoiles', icon: '🦢', description: '12 étoiles • Grâce' },
  { id: 2, name: 'Tortue Sacrée', icon: '🐢', description: '15 étoiles • Patience' }
];

const tempoItems = [
  { id: 'douceur', name: 'Douceur (6s)', icon: '🟢', description: 'Rythme contemplatif et calme' },
  { id: 'eveil', name: 'Éveil (4.5s)', icon: '🟡', description: 'Balayage dynamique modéré' },
  { id: 'harmonie', name: 'Harmonie (3.5s)', icon: '🔴', description: 'Attention visuelle stimulante' }
];

const categories = [
  {
    id: 'theme',
    name: 'Ambiance Céleste',
    icon: '✨',
    items: themeItems
  },
  {
    id: 'constellation',
    name: 'Constellation',
    icon: '🌌',
    items: constellationItems
  },
  {
    id: 'tempo',
    name: 'Rythme & Vitesse',
    icon: '⏱️',
    items: tempoItems
  }
];

export default function FireflyGardenCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE DES LUCIOLES"
      icon="✨"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
