import React from 'react';
import Boutique from '../components/Boutique';
import { GAME_THEME_DETAILS } from '../utils/themeManager';

const pairsItems = [
  { id: '3', name: '3 Paires (6 cartes)', icon: '🌱', description: 'Session rapide & douce' },
  { id: '4', name: '4 Paires (8 cartes)', icon: '🟢', description: 'Format classique léger' },
  { id: '6', name: '6 Paires (12 cartes)', icon: '🟡', description: 'Équilibre zen idéal' },
  { id: '8', name: '8 Paires (16 cartes)', icon: '🔴', description: 'Défi de mémoire visuelle' },
  { id: '10', name: '10 Paires (20 cartes)', icon: '✨', description: 'Grand plateau immersif' }
];

export const MEMORY_BACKGROUNDS = [
  {
    id: 'tatami',
    name: 'Tatami Zen',
    icon: '🎋',
    desc: 'Tapis de jonc tressé & bambou chaud',
    boardBg: 'linear-gradient(135deg, #f5eedc 0%, #ebe0c8 50%, #dfd1b3 100%)',
    overlayPattern: 'none',
    textColor: '#451a03',
    barBg: '#fdfbf7',
    barBorder: '#d97706'
  },
  {
    id: 'starlight',
    name: 'Nuit Étoilée',
    icon: '🌌',
    desc: 'Velours nocturne & poussière d’étoiles',
    boardBg: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
    overlayPattern: 'none',
    textColor: '#f8fafc',
    barBg: 'rgba(15, 23, 42, 0.85)',
    barBorder: 'rgba(99, 102, 241, 0.3)'
  },
  {
    id: 'watercolor',
    name: 'Aquarelle Pastel',
    icon: '🎨',
    desc: 'Lavis doux d’azur & fleurs de lotus',
    boardBg: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fce7f3 100%)',
    overlayPattern: 'none',
    textColor: '#0f172a',
    barBg: 'rgba(255, 255, 255, 0.9)',
    barBorder: '#93c5fd'
  },
  {
    id: 'noble_wood',
    name: 'Bois Précieux',
    icon: '🪵',
    desc: 'Noyer sombre ciré & lumière chaleureuse',
    boardBg: 'radial-gradient(circle at 50% 30%, #3f2207 0%, #261404 100%)',
    overlayPattern: 'none',
    textColor: '#fef3c7',
    barBg: 'rgba(42, 22, 6, 0.9)',
    barBorder: '#b45309'
  },
  {
    id: 'washi_gold',
    name: 'Washi & Or Pur',
    icon: '🎴',
    desc: 'Fibres naturelles & feuilles d’or',
    boardBg: 'linear-gradient(135deg, #faf7f0 0%, #f3eee3 100%)',
    overlayPattern: 'none',
    textColor: '#1e293b',
    barBg: '#ffffff',
    barBorder: '#e2d9cc'
  }
];

const backgroundItems = MEMORY_BACKGROUNDS.map((bg) => ({
  id: bg.id,
  name: bg.name,
  icon: bg.icon,
  description: bg.desc
}));

export const getMemoryAssetUrl = (subpath) => {
  if (!subpath) return '';
  if (subpath.startsWith('http://') || subpath.startsWith('https://') || subpath.startsWith('data:')) {
    return subpath;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  if (subpath.startsWith(cleanBase)) return subpath;
  if (base !== './' && subpath.startsWith(base)) return subpath;
  if (subpath.startsWith('./')) {
    return `${cleanBase}${subpath.slice(2)}`;
  }
  const cleanSub = subpath.startsWith('/') ? subpath.slice(1) : subpath;
  return `${cleanBase}${cleanSub}`;
};

export const MEMORY_CARDS_DATA = [
  { id: 'fuji', name: 'Mont Fuji', color: '#0284c7', imageFull: getMemoryAssetUrl('assets/memory/full/fuji.jpg'), icon: '🗻' },
  { id: 'pagoda', name: 'Pagode', color: '#dc2626', imageFull: getMemoryAssetUrl('assets/memory/full/pagoda.jpg'), icon: '⛩️' },
  { id: 'koi', name: 'Carpe Koï', color: '#ea580c', imageFull: getMemoryAssetUrl('assets/memory/full/koi.jpg'), icon: '🎏' },
  { id: 'torii', name: 'Torii Sacré', color: '#e11d48', imageFull: getMemoryAssetUrl('assets/memory/full/torii.jpg'), icon: '⛩️' },
  { id: 'bamboo', name: 'Bambou Zen', color: '#16a34a', imageFull: getMemoryAssetUrl('assets/memory/full/bamboo.jpg'), icon: '🎋' },
  { id: 'crane', name: 'Grue Royale', color: '#ca8a04', imageFull: getMemoryAssetUrl('assets/memory/full/crane.jpg'), icon: '🪶' },
  { id: 'kitsune', name: 'Esprit Renard', color: '#d97706', imageFull: getMemoryAssetUrl('assets/memory/full/kitsune.jpg'), icon: '🦊' },
  { id: 'waterfall', name: 'Cascade', color: '#0891b2', imageFull: getMemoryAssetUrl('assets/memory/full/waterfall.jpg'), icon: '🌊' },
  { id: 'teahouse', name: 'Pavillon Zen', color: '#8b5cf6', imageFull: getMemoryAssetUrl('assets/memory/full/teahouse.jpg'), icon: '🏯' },
  { id: 'moon_bridge', name: 'Pont de Lune', color: '#6366f1', imageFull: getMemoryAssetUrl('assets/memory/full/moon_bridge.jpg'), icon: '🌉' }
];

const cardStyleItems = [
  { id: 'full', name: 'Plein Cadre (Estampes Ukiyo-e)', icon: '🖼️', description: 'Grandes œuvres artistiques recouvrant toute la face de la carte' },
  { id: 'centered', name: 'Symbole Centré (Transparence)', icon: '🎴', description: 'Grand emblème lumineux au centre, fond de carte transparent' }
];

const layoutItems = [
  { id: 'random', name: 'Aléatoire (Tirage au sort)', icon: '🎲', description: 'Une forme surprise à chaque manche parmi les 5 configurations' },
  { id: 'rectangle', name: 'Rectangle (Grille classique)', icon: '📐', description: 'Alignement géométrique rectangulaire ordonné' },
  { id: 'losange', name: 'Losange (Diamant)', icon: '💎', description: 'Disposition en losange avec sommet et base effilés' },
  { id: 'triangle', name: 'Triangle (Pyramide)', icon: '🔺', description: 'Disposition en pyramide élargie vers le bas' },
  { id: 'circle', name: 'Cercle (Harmonie)', icon: '⭕', description: 'Disposition ovale et circulaire équilibrée' },
  { id: 'abstract', name: 'Forme Abstraite (Constellation)', icon: '🌌', description: 'Disposition asymétrique en archipel organique' }
];

const themeItems = (GAME_THEME_DETAILS.memory || []).map((t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon,
  description: t.desc
}));

const categories = [
  {
    id: 'cardStyle',
    name: 'Gamme Visuelle des Cartes',
    icon: '🖼️',
    items: cardStyleItems
  },
  {
    id: 'pairs',
    name: 'Nombre de Paires',
    icon: '🔢',
    items: pairsItems
  },
  {
    id: 'background',
    name: 'Fond du Plateau',
    icon: '🎨',
    items: backgroundItems
  },
  {
    id: 'layout',
    name: 'Disposition',
    icon: '✨',
    items: layoutItems
  },
  {
    id: 'theme',
    name: 'Texture du Support',
    icon: '🎴',
    items: themeItems
  }
];

export default function MemoryPairsCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE PAIRES MÉMOIRE"
      icon="🎴"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
