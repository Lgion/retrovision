# Standardisation de Tous les Jeux vers le Modèle Immersif Pleine Page

## Description de l'Objectif

Harmoniser l'ensemble des 14 jeux de RetroVision sur un **modèle d'intégration unique et moderne : le modèle immersif pleine page**, actuellement utilisé avec succès par *Mahjong Zen*, *Ball Sort* et *Water Sort*.

Tous les jeux disposeront systématiquement de la même structure à 3 niveaux :
1. **Conteneur Racine Pleine Page (`100% / 100%`)** :
   - Fond et ambiance immersive (dégradés, particules, orbes zen, néons) s'étendant d'un bord à l'autre de l'écran (`inset: 0`).
2. **Bandeau Supérieur Universel (`width: 100%`)** :
   - `<GameHeader />` (en mode normal) ou `<IntermissionHeader />` (en mode entracte) traversant toute la largeur de l'écran.
   - Les boutons d'action (Retour, Titre, Rejouer, Undo, Indice, Boutique) restent sur une seule ligne équilibrée et ne sont plus écrasés sur 2 lignes.
3. **Arène Centrale de Jeu (`flex: 1`)** :
   - Espace d'affichage dédié sous le header avec centrage vertical et horizontal fluide (`align-items: center; justify-content: center; overflow-y: auto`).
   - La grille ou les éléments de jeu conservent leur `maxWidth` ergonomique (ex: 450px pour le Sudoku, 420px pour 2048, 500px pour ArrowPuzzle) pour rester confortables sur grand écran tout en bénéficiant de l'immersion pleine page.

---

## État des Lieux des Jeux

| Jeu | Modèle Actuel | Action Prévue |
|---|---|---|
| **Mahjong Zen** | Pleine page immersif | Conserver (modèle de référence) |
| **Ball Sort** | Pleine page immersif | Conserver (modèle de référence) |
| **Water Sort** | Pleine page immersif | Conserver (modèle de référence) |
| **Sudoku** | Boîte 500px avec header écrasé à l'intérieur | **Restructurer en pleine page** : Header full width + Zen orbs pleine page + Grille centrée |
| **Neon 2048** | Boîte 420px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Grille néon centrée |
| **Minesweeper** | Boîte 420px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Champ de mines centré |
| **Arrow Puzzle** | Boîte 800px avec GameHeader à l'intérieur | **Restructurer en pleine page** : Header full width + Grille de flèches centrée |
| **Hangman** | Boîte 430px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Dessin & Lettres centrés |
| **Unblock Me** | Boîte 500px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Plateau centré |
| **Impossible 13** | Boîte 430px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Plateau centré |
| **Jigsaw Puzzle** | Boîte 600px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Puzzle centré |
| **FreeCell** | Boîte 1000px avec header à l'intérieur | **Restructurer en pleine page** : Header full width + Tapis de cartes centré |
| **Block Fantasy** | Boîte 430px avec compact header | **Restructurer en pleine page** : Header full width + Grille centrée |
| **Bubble Cool** | Boîte 460px avec compact header | **Restructurer en pleine page** : Header full width + Arène bulles centrée |

---

## Modifications Proposées

### 1. Style Global et Configuration (`App.css` & `gamesConfig.js`)

#### [MODIFY] [App.css](file:///home/nihongo/Bureau/CASCADE/retrovision/src/App.css)
- Mettre `.game-wrapper` à `padding: 0;` (comme `.game-wrapper-fullscreen`) pour que tous les jeux touchent les bords de l'écran et contrôlent leur propre bandeau de header et arène centrale.

#### [MODIFY] [gamesConfig.js](file:///home/nihongo/Bureau/CASCADE/retrovision/src/utils/gamesConfig.js)
- Standardiser `fullscreen: true` sur l'ensemble des jeux ou unifier sous le conteneur plein écran.

---

### 2. Restructuration de Sudoku.jsx (Cas prioritaire)

#### [MODIFY] [Sudoku.jsx](file:///home/nihongo/Bureau/CASCADE/retrovision/src/games/Sudoku.jsx)
- Transformer le conteneur racine en layout plein écran :
  - `position: relative; width: 100%; height: 100%; display: flex; flexDirection: column; overflow: hidden;`
- Sortir `<GameHeader />` et `<IntermissionHeader />` de la boîte de 500px pour qu'ils soient positionnés tout en haut du conteneur en `width: 100%`.
- Étendre l'arrière-plan zen et les orbes lumineux flottants à tout l'écran.
- Placer l'arène de jeu dans un conteneur central `flex: 1; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 16px;`.
- Conserver la carte de jeu (`maxWidth: 500px`) pour la grille Sudoku, le menu de niveau et le pavé numérique.

---

### 3. Restructuration des autres jeux à boîte (Grid2048, Minesweeper, ArrowPuzzle, Hangman, Impossible13, JigsawPuzzle, UnblockMe, FreeCell)

Pour chaque jeu :
- Sortir le `GameHeader` / `IntermissionHeader` du `containerStyle` restrictif et le placer au niveau supérieur (`width: 100%`).
- Créer le conteneur racine plein écran `width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;`.
- Insérer la zone interactive dans un conteneur central `flex: 1` scrollable et centré.

---

## Plan de Vérification

### Tests Automatisés
- Exécuter `npm run build` pour garantir qu'aucune régression ni erreur de syntaxe n'apparaît.
- Exécuter `npx eslint` sur les composants modifiés pour maintenir 0 erreur/0 avertissement.

### Vérification Fonctionnelle et Visuelle (Navigateur)
1. **Sudoku** :
   - Vérifier que le header traverse toute la largeur de l'écran, avec le bouton Retour à gauche, le titre au centre, et les boutons Rejouer/Boutique à droite sans retour à la ligne forcé.
   - Vérifier que les orbes zen flottent sur tout l'écran.
   - Vérifier que la grille 4x4, 6x6 ou 9x9 est parfaitement centrée et fonctionnelle.
2. **Neon 2048 & Minesweeper** :
   - Vérifier le header supérieur pleine largeur et le plateau centré au milieu.
3. **Mode Entracte** :
   - Vérifier que l'`IntermissionHeader` traverse également tout le haut de l'écran dans chaque jeu.
