/**
 * charliePlacementEngine.js
 * Moteur algorithmique de placement sémantique spatial pour le jeu Trouvez Charlie.
 * 
 * Règles d'or :
 * 1. Zéro objet au sol dans le ciel (seuls 1 ou 2 oiseaux/ballons discrets autorisés).
 * 2. Voitures, camions et bus uniquement sur les routes asphaltées.
 * 3. Vélos et trottinettes sur routes, pistes cyclables et voies vertes.
 * 4. Animaux de ferme et sauvages uniquement dans les prairies et pâturages.
 * 5. Piétons, terrasses et promeneurs sur les trottoirs et sentiers.
 * 6. Échelle asservie à la perspective (axe Y) et tri de profondeur z-index.
 * 7. Anti-collision stricte (Poisson/Jittered disk sampling avec distance minimale).
 */

import { TARGET_DEFINITIONS, CATEGORY_ITEMS } from '../games/charlieScenesData';
import { randomChoice } from './commonUtils';

// Distance euclidienne en pourcentage entre deux points (x, y)
function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Vérifie si un point candidate est assez éloigné de tous les points occupés
function isSpotAvailable(occupiedSpots, x, y, requiredDist) {
  for (let i = 0; i < occupiedSpots.length; i++) {
    const spot = occupiedSpots[i];
    const effectiveMinDist = Math.max(requiredDist, spot.minDist);
    if (getDistance({ x, y }, spot) < effectiveMinDist) {
      return false;
    }
  }
  return true;
}

// Trouve un point valide dans une zone en respectant les bornes et l'espacement
function findValidSpotInZone(zone, occupiedSpots, minDist, maxAttempts = 80) {
  const { xMin, xMax, yMin, yMax } = zone.bounds;
  const width = xMax - xMin;
  const height = yMax - yMin;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Échantillonnage avec marges internes de 1.5% pour ne pas coller aux bords stricts
    const x = xMin + 1.5 + Math.random() * Math.max(1, width - 3);
    const y = yMin + 1.5 + Math.random() * Math.max(1, height - 3);

    if (isSpotAvailable(occupiedSpots, x, y, minDist)) {
      occupiedSpots.push({ x, y, minDist });
      return { x, y };
    }
  }

  // Fallback avec distance légèrement assouplie si la zone est bien remplie
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = xMin + 2 + Math.random() * Math.max(1, width - 4);
    const y = yMin + 2 + Math.random() * Math.max(1, height - 4);
    if (isSpotAvailable(occupiedSpots, x, y, minDist * 0.75)) {
      occupiedSpots.push({ x, y, minDist: minDist * 0.75 });
      return { x, y };
    }
  }

  return null;
}

/**
 * Génère la scène complète (cibles + foule de leurres) de manière intelligente.
 * @param {Object} sceneConfig - Définition de la scène sélectionnée avec ses zones
 * @param {Object} roundConfig - Paramètres de la manche (cibles requises, difficulté)
 * @param {number} sizeScale - Échelle globale choisie par le joueur (1.0, 1.2, 1.4)
 */
export function generateIntelligentScene(sceneConfig, roundConfig, sizeScale = 1.0) {
  const occupiedSpots = [];
  const targets = [];
  const elements = [];

  const zones = sceneConfig?.zones || [];
  const targetAllowedZones = zones.filter((z) => z.allowTargets);

  // --- 1. PLACEMENT DES CIBLES OBLIGATOIRES DE LA MANCHE ---
  const requiredItems = roundConfig.requiredItems || ['charlie'];

  requiredItems.forEach((targetKey, index) => {
    const def = TARGET_DEFINITIONS[targetKey] || {
      id: targetKey,
      name: targetKey,
      icon: '❓',
      points: 50,
      color: '#ef4444',
      badge: 'Cible'
    };

    // Sélection de la zone la plus adaptée pour cette cible
    let candidateZones = targetAllowedZones;
    if (def.preferredZones && def.preferredZones.length > 0) {
      const preferred = targetAllowedZones.filter((z) => def.preferredZones.includes(z.type));
      if (preferred.length > 0) {
        candidateZones = preferred;
      }
    }

    if (candidateZones.length === 0) {
      candidateZones = targetAllowedZones.length > 0 ? targetAllowedZones : zones;
    }

    const targetZone = randomChoice(candidateZones);
    const targetMinDist = 7.0; // Espace de confort autour des cibles
    const spot = findValidSpotInZone(targetZone, occupiedSpots, targetMinDist) || {
      x: targetZone.bounds.xMin + 5,
      y: targetZone.bounds.yMin + 5
    };

    // Calcul de la perspective Y : profondeur naturelle
    const yRatio = (spot.y - targetZone.bounds.yMin) / Math.max(1, (targetZone.bounds.yMax - targetZone.bounds.yMin));
    const perspectiveFactor = 0.85 + yRatio * 0.35;
    const zoneModifier = targetZone.scaleModifier || 1.0;
    const finalScale = (perspectiveFactor * zoneModifier * sizeScale).toFixed(2);
    const zIndex = Math.round(spot.y * 10);

    targets.push({
      id: `target_${targetKey}_${index}`,
      type: 'target',
      targetKey,
      name: def.name,
      icon: def.icon,
      points: def.points,
      color: def.color,
      badge: def.badge,
      zoneId: targetZone.id,
      zoneType: targetZone.type,
      x: spot.x,
      y: spot.y,
      scale: finalScale,
      rotation: (Math.random() * 8 - 4).toFixed(1),
      zIndex,
      found: false
    });
  });

  // --- 2. PLACEMENT DE LA FOULE & DES LEURRES RESPECTANT LE ZONAGE SÉMANTIQUE ---
  const roundDifficultyFactor = 0.65 + (roundConfig.round || 1) * 0.08;

  zones.forEach((zone) => {
    // Rassembler tous les items autorisés pour cette zone
    const allowedPool = [];
    (zone.allowedCategories || []).forEach((catKey) => {
      const items = CATEGORY_ITEMS[catKey];
      if (items && items.length > 0) {
        allowedPool.push(...items);
      }
    });

    if (allowedPool.length === 0) return;

    // Calcul du nombre d'objets à placer dans cette zone
    const targetCount = Math.min(
      zone.maxItems,
      Math.max(1, Math.round(zone.maxItems * roundDifficultyFactor))
    );

    let placedInZone = 0;
    let attempts = 0;

    while (placedInZone < targetCount && attempts < targetCount * 4) {
      attempts++;
      const itemTemplate = randomChoice(allowedPool);
      const spot = findValidSpotInZone(zone, occupiedSpots, itemTemplate.minDistance);

      if (!spot) continue;

      // Calcul d'échelle avec perspective
      const yNormalized = spot.y / 100;
      const perspectiveFactor = 0.8 + yNormalized * 0.4;
      const zoneModifier = zone.scaleModifier || 1.0;
      const itemScale = (
        itemTemplate.baseScale *
        perspectiveFactor *
        zoneModifier *
        sizeScale
      ).toFixed(2);

      // Orientation : pour les voitures et cyclistes, direction gauche/droite
      const flipX = itemTemplate.isVehicle ? Math.random() > 0.45 : Math.random() > 0.5;

      elements.push({
        id: `decoy_${zone.id}_${placedInZone}`,
        type: 'decoy',
        emoji: itemTemplate.emoji,
        name: itemTemplate.name,
        zoneId: zone.id,
        zoneType: zone.type,
        x: spot.x,
        y: spot.y,
        scale: itemScale,
        flipX,
        rotation: itemTemplate.isVehicle
          ? (zone.flowDirection === 'diagonal' ? (flipX ? 12 : -12) : (Math.random() * 4 - 2)).toFixed(1)
          : (Math.random() * 10 - 5).toFixed(1),
        zIndex: Math.round(spot.y * 10)
      });

      placedInZone++;
    }
  });

  return { targets, elements };
}
