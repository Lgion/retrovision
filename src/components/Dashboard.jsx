import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getStats, saveStats, resetAllStats, getRecommendation } from '../utils/stats';
import { getConfigs, saveConfigs, resetAllConfigs } from '../utils/config';

export default function Dashboard({ onSelectGame, statsUpdated }) {
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('retrovision_player_name') || 'PATIENT_READY';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('retrovision_player_avatar') || '✦';
  });
  const [muted, setMuted] = useState(sound.muted);

  const [stats, setStats] = useState({});
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // Load high scores to calculate achievements
  const [highScores, setHighScores] = useState({
    mahjong: 0,
    water: 0,
    ball: 0,
    grid2048: 0,
    jigsaw: 0,
    unblock: 0,
    freecell: 0,
    mines: 0,
    arrows: 0,
    hangman: 0
  });

  const avatars = ['✦', '♥', '★', '●', '☘', '☾', '☀'];

  useEffect(() => {
    const detailedStats = getStats();
    setStats(detailedStats);

    const mahjong = detailedStats.mahjong?.highScore || 0;
    const water = detailedStats.water?.highScore || 0;
    const ball = detailedStats.ball?.highScore || 0;
    const grid2048 = detailedStats['2048']?.highScore || 0;
    const jigsaw = detailedStats.jigsaw?.highScore || 0;
    const unblock = detailedStats.unblock?.highScore || 0;
    const freecell = detailedStats.freecell?.highScore || 0;
    const mines = detailedStats.mines?.highScore || 0;
    const arrows = detailedStats.arrows?.highScore || 0;
    const hangman = detailedStats.hangman?.highScore || 0;
    setHighScores({ mahjong, water, ball, grid2048, jigsaw, unblock, freecell, mines, arrows, hangman });
  }, [statsUpdated]);

  const totalPlays = Object.values(stats).reduce((acc, curr) => acc + (curr.plays || 0), 0);
  const totalWins = Object.values(stats).reduce((acc, curr) => acc + (curr.wins || 0), 0);
  const totalTime = Object.values(stats).reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);

  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return '0s';
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    let result = '';
    if (hrs > 0) result += `${hrs}h `;
    if (mins > 0 || hrs > 0) result += `${mins}m `;
    result += `${secs}s`;
    return result;
  };

  const handleExport = () => {
    const unifiedProfile = {
      retrovision_profile_v1: true,
      player: {
        name: profileName,
        avatar: avatar
      },
      stats: stats,
      configs: getConfigs()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(unifiedProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `retrovision_profile_${profileName.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playScore();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && typeof imported === 'object') {
            if (imported.retrovision_profile_v1) {
              // Unified new format
              if (imported.stats) saveStats(imported.stats);
              if (imported.configs) saveConfigs(imported.configs);
              if (imported.player) {
                if (imported.player.name) localStorage.setItem('retrovision_player_name', imported.player.name);
                if (imported.player.avatar) localStorage.setItem('retrovision_player_avatar', imported.player.avatar);
              }
            } else {
              // Backward compatibility for old stats-only file
              saveStats(imported);
            }
            window.location.reload();
          } else {
            alert("Format de fichier invalide.");
          }
        } catch (err) {
          alert("Erreur lors de la lecture du fichier.");
        }
      };
    }
  };

  const handleReset = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser TOUTES vos statistiques, préférences, et historiques ? Cette action est irréversible.")) {
      if (window.confirm("Confirmation finale : réinitialiser toutes les données ?")) {
        resetAllStats();
        resetAllConfigs();
        localStorage.removeItem('retrovision_player_name');
        localStorage.removeItem('retrovision_player_avatar');
        window.location.reload();
      }
    }
  };

  const handleRequestRecommendation = () => {
    sound.playPowerup();
    const rec = getRecommendation();
    setRecommendation(rec);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (!profileName.trim()) {
      setProfileName('PATIENT_READY');
      localStorage.setItem('retrovision_player_name', 'PATIENT_READY');
    } else {
      localStorage.setItem('retrovision_player_name', profileName.toUpperCase());
    }
    sound.playClick();
  };

  const handleAvatarChange = (selectedAvatar) => {
    setAvatar(selectedAvatar);
    localStorage.setItem('retrovision_player_avatar', selectedAvatar);
    sound.playClick();
  };

  const toggleMuted = () => {
    const newMuted = !sound.muted;
    sound.muted = newMuted;
    setMuted(newMuted);
    if (!newMuted) {
      sound.playScore();
    }
  };

  // Rehab focused achievements
  const achievementsList = [
    {
      id: 'mahjong_zen',
      title: 'Patience Infinie',
      desc: 'Résoudre une grille de Mahjong Zen',
      icon: '☘',
      unlocked: highScores.mahjong > 0,
      color: '#ffd700',
      textColor: '#b45309'
    },
    {
      id: 'water_sort',
      title: 'Maître Chimiste',
      desc: 'Trier entièrement les éprouvettes d\'eau',
      icon: '🧪',
      unlocked: highScores.water > 0,
      color: '#00ff7f',
      textColor: '#047857'
    },
    {
      id: 'ball_sort',
      title: 'Logique Sphérique',
      desc: 'Réussir un tri complet de billes',
      icon: '🔮',
      unlocked: highScores.ball > 0,
      color: '#ff007f',
      textColor: '#be123c'
    },
    {
      id: '2048_zen',
      title: 'Calculateur Calme',
      desc: 'Dépasser 512 points sur Neon 2048',
      icon: '🧠',
      unlocked: highScores.grid2048 >= 512,
      color: '#00f0ff',
      textColor: '#0369a1'
    },
    {
      id: 'jigsaw',
      title: 'Artiste Zen',
      desc: 'Reconstituer un puzzle magique',
      icon: '🖼️',
      unlocked: highScores.jigsaw > 0,
      color: '#ffaa00',
      textColor: '#b45309'
    },
    {
      id: 'unblock',
      title: 'Évasion Logique',
      desc: 'Libérer le bloc rouge du labyrinthe',
      icon: '🧩',
      unlocked: highScores.unblock > 0,
      color: '#E53E3E',
      textColor: '#991b1b'
    },
    {
      id: 'freecell',
      title: 'Stratège Patient',
      desc: 'Résoudre une partie de FreeCell',
      icon: '🃏',
      unlocked: highScores.freecell > 0,
      color: '#eab308',
      textColor: '#854d0e'
    },
    {
      id: 'mines',
      title: 'Démineur Expert',
      desc: 'Pacifier une zone minée',
      icon: '💣',
      unlocked: highScores.mines > 0,
      color: '#ef4444',
      textColor: '#991b1b'
    },
    {
      id: 'arrows',
      title: 'Robin des Bois',
      desc: 'Vider complètement un plateau de flèches',
      icon: '🎯',
      unlocked: highScores.arrows > 0,
      color: '#3b82f6',
      textColor: '#1e3a8a'
    },
    {
      id: 'hangman',
      title: 'Maître des Mots',
      desc: 'Résoudre une énigme du Pendu',
      icon: '🎈',
      unlocked: highScores.hangman > 0,
      color: '#8b5cf6',
      textColor: '#4c1d95'
    }
  ];

  const games = [
    {
      id: 'mahjong',
      title: 'MAHJONG ZEN',
      desc: 'Retrouvez les paires de tuiles identiques libres. Conçu avec des formes colorées claires pour la rééducation visuelle.',
      highscore: highScores.mahjong,
      color: '#ffd700',
      textColor: '#b45309',
      icon: '🀄'
    },
    {
      id: 'water',
      title: 'TRI DE L\'EAU',
      desc: 'Transférez les liquides colorés d\'une fiole à l\'autre pour séparer les teintes. Idéal pour l\'anticipation cognitive.',
      highscore: highScores.water,
      color: '#00ff7f',
      textColor: '#047857',
      icon: '🧪'
    },
    {
      id: 'ball',
      title: 'TRI DE BILLES',
      desc: 'Répartissez les billes de couleur dans les éprouvettes correspondantes. Stimule la motricité fine et la planification.',
      highscore: highScores.ball,
      color: '#ff007f',
      textColor: '#be123c',
      icon: '🔮'
    },
    {
      id: '2048',
      title: 'NEON 2048',
      desc: 'Faites glisser les nombres identiques pour les fusionner. Un exercice calme de calcul et d\'orientation.',
      highscore: highScores.grid2048,
      color: '#00f0ff',
      textColor: '#0369a1',
      icon: '🧠'
    },
    {
      id: 'jigsaw',
      title: 'PUZZLE MAGIQUE',
      desc: 'Reconstituez de magnifiques images apaisantes en glissant les pièces. Idéal pour stimuler l\'orientation spatiale sans stress.',
      highscore: highScores.jigsaw,
      color: '#ffaa00',
      textColor: '#b45309',
      icon: '🖼️'
    },
    {
      id: 'unblock',
      title: 'DÉBLOQUE-MOI',
      desc: 'Faites glisser les blocs en bois pour libérer le chemin au bloc rouge. Excellent pour la vision spatiale et la logique.',
      highscore: highScores.unblock,
      color: '#E53E3E',
      textColor: '#991b1b',
      icon: '🧩'
    },
    {
      id: 'freecell',
      title: 'FREECELL',
      desc: 'Le célèbre jeu de cartes solitaire. Ordonnez les suites rouges et noires pour trier le paquet. Sans chronomètre.',
      highscore: highScores.freecell,
      color: '#eab308',
      textColor: '#854d0e',
      icon: '🃏'
    },
    {
      id: 'mines',
      title: 'DÉMINEUR',
      desc: 'Le grand classique de la logique. Localisez toutes les mines de la grille. Adapté avec des touches larges et un mode "Drapeau".',
      highscore: highScores.mines,
      color: '#ef4444',
      textColor: '#991b1b',
      icon: '💣'
    },
    {
      id: 'arrows',
      title: 'ARROW PUZZLE',
      desc: 'Démêlez les flèches ! Touchez une flèche pour la faire voler. Elle ne partira que si sa trajectoire est libre.',
      highscore: highScores.arrows,
      color: '#3b82f6',
      textColor: '#1e3a8a',
      icon: '⬆️'
    },
    {
      id: 'hangman',
      title: 'LE PENDU',
      desc: 'Résolvez des charades et énigmes pour deviner le mot caché. Attention aux ballons qui éclatent !',
      highscore: highScores.hangman,
      color: '#8b5cf6',
      textColor: '#4c1d95',
      icon: '🎈'
    }
  ];

  const sortedGames = [...games].sort((a, b) => {
    const playsA = stats[a.id]?.plays || 0;
    const playsB = stats[b.id]?.plays || 0;
    if (playsA !== playsB) return playsB - playsA;
    return a.title.localeCompare(b.title);
  });

  return (
    <div style={containerStyle}>
      {/* Profile Header */}
      <div style={profileHeaderStyle} className="neon-border-subtle">
        <div style={profileInfoStyle}>
          {/* Avatar Selector */}
          <div style={avatarWrapperStyle}>
            <div style={avatarDisplayStyle} className="pulse-glow">{avatar}</div>
            <div style={avatarListStyle}>
              {avatars.map((av) => (
                <button
                  key={av}
                  onClick={() => handleAvatarChange(av)}
                  style={{
                    ...avatarBtnStyle,
                    color: avatar === av ? '#00f0ff' : '#8e8a9f',
                    borderColor: avatar === av ? '#00f0ff' : 'transparent',
                    textShadow: avatar === av ? '0 0 6px #00f0ff' : 'none'
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name Customizer */}
          <div style={nameCustomizerStyle}>
            {isEditingName ? (
              <div style={nameInputGroupStyle}>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  maxLength={15}
                  style={inputStyle}
                />
                <button onClick={handleNameSave} className="retro-btn" style={saveBtnStyle}>
                  OK
                </button>
              </div>
            ) : (
              <div style={nameDisplayGroupStyle}>
                <span style={pilotLabelStyle}>PILOTE :</span>
                <span style={nameStyle}>{profileName}</span>
                <button onClick={() => { setIsEditingName(true); sound.playClick(); }} style={editBtnStyle}>
                  ✏️
                </button>
              </div>
            )}
            <div style={statusStyle}>STATION THERAPEUTIQUE - ACTIF</div>
          </div>
        </div>

        {/* Global Controls */}
        <div style={controlsStyle}>
          <button onClick={toggleMuted} className="retro-btn" style={muteBtnStyle}>
            {muted ? '🔇 AUDIO : SOURDINE' : '🔊 AUDIO : ZEN'}
          </button>
        </div>
      </div>

      {/* Dropdown de statistiques */}
      <div style={statsDropdownWrapperStyle}>
        <button 
          onClick={() => { setIsStatsOpen(!isStatsOpen); sound.playClick(); }} 
          style={{
            ...statsDropdownHeaderStyle,
            borderColor: isStatsOpen ? 'var(--secondary)' : 'var(--primary)',
            color: isStatsOpen ? 'var(--secondary)' : 'var(--primary)',
          }}
          className="retro-btn"
        >
          <span>📊 {isStatsOpen ? 'Masquer les Statistiques' : 'Afficher les Statistiques'}</span>
          <span style={{ transform: isStatsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', fontSize: '18px' }}>▼</span>
        </button>

        {isStatsOpen && (
          <div style={statsDropdownContentStyle} className="neon-border-subtle">
            {/* Global Stats Summary */}
            <div style={globalStatsSummaryStyle}>
              <div style={globalStatBoxStyle}>
                <div style={globalStatLabelStyle}>⏱️ TEMPS DE RÉÉDUCATION</div>
                <div style={globalStatValueStyle}>{formatDuration(totalTime)}</div>
              </div>
              <div style={globalStatBoxStyle}>
                <div style={globalStatLabelStyle}>🎮 PARTIES LANCÉES</div>
                <div style={globalStatValueStyle}>{totalPlays}</div>
              </div>
              <div style={globalStatBoxStyle}>
                <div style={globalStatLabelStyle}>🏆 SUCCÈS DÉVERROUILLÉS</div>
                <div style={globalStatValueStyle}>{totalWins} / {games.length}</div>
              </div>
              <div style={globalStatBoxStyle}>
                <div style={globalStatLabelStyle}>📈 TAUX DE RÉUSSITE</div>
                <div style={globalStatValueStyle}>
                  {totalPlays > 0 ? `${Math.round((totalWins / totalPlays) * 100)}%` : '0%'}
                </div>
              </div>
            </div>

            {/* Individual Game Stats List */}
            <div style={gamesStatsTableStyle}>
              {games.map(game => {
                const gameStat = stats[game.id] || { plays: 0, wins: 0, timeSpent: 0, highScore: 0 };
                return (
                  <div key={game.id} style={gameStatRowStyle}>
                    <div style={gameStatNameColStyle}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{game.icon}</span>
                      <span style={{ fontWeight: 'bold', color: game.textColor }}>{game.title}</span>
                    </div>
                    <div style={gameStatDetailsStyle}>
                      <div style={gameStatItemStyle}>
                        Parties : <strong>{gameStat.plays || 0}</strong>
                      </div>
                      <div style={gameStatItemStyle}>
                        Victoires : <strong>{gameStat.wins || 0}</strong>
                      </div>
                      <div style={gameStatItemStyle}>
                        Temps : <strong>{formatDuration(gameStat.timeSpent || 0)}</strong>
                      </div>
                      <div style={gameStatItemStyle}>
                        Record : <strong>{gameStat.highScore || 0}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={statsActionButtonsStyle}>
              <button onClick={handleExport} className="retro-btn" style={statsActionBtnStyle}>
                📤 Exporter (.json)
              </button>
              <label className="retro-btn" style={{ ...statsActionBtnStyle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                📥 Importer (.json)
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
              <button onClick={handleReset} className="retro-btn" style={{ ...statsActionBtnStyle, borderColor: '#ef4444', color: '#ef4444' }}>
                🗑️ Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Arcade Titles */}
      <div style={sectionTitleStyle}>
        <span style={{ color: '#ff007f' }}>★</span> SÉLECTIONNEZ VOTRE JEU <span style={{ color: '#ff007f' }}>★</span>
      </div>

      {/* Bouton de recommandation intelligent */}
      <div style={recBtnContainerStyle}>
        <button 
          onClick={handleRequestRecommendation}
          className="retro-btn"
          style={recommendationBtnStyle}
        >
          🚀 Lancer un jeu conseillé par l'I.A.
        </button>
      </div>

      {/* Recommendation modal */}
      {recommendation && (
        <div className="accessibility-modal-backdrop" onClick={() => setRecommendation(null)}>
          <div className="accessibility-modal-content" onClick={(e) => e.stopPropagation()} style={recModalStyle}>
            <div style={recModalHeaderStyle}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-main)', fontWeight: '800' }}>🤖 CONSEIL DE L'I.A.</h2>
            </div>
            <div style={recModalBodyStyle}>
              <p style={recIntroTextStyle}>
                Pour optimiser votre rééducation cognitive, nous vous suggérons :
              </p>
              <div style={recGameDisplayStyle}>
                <span style={recGameIconStyle}>
                  {games.find(g => g.id === recommendation.gameId)?.icon || '🎮'}
                </span>
                <span style={recGameTitleStyle}>{recommendation.name.toUpperCase()}</span>
              </div>
              <div style={recReasonBoxStyle}>
                <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>Pourquoi ?</strong>
                <p style={recReasonTextStyle}>{recommendation.reason}</p>
              </div>
            </div>
            <div style={recModalFooterStyle}>
              <button 
                onClick={() => {
                  sound.playClick();
                  setRecommendation(null);
                }} 
                className="retro-btn"
                style={recCancelBtnStyle}
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  sound.playClick();
                  onSelectGame(recommendation.gameId);
                  setRecommendation(null);
                }} 
                className="retro-btn"
                style={recConfirmBtnStyle}
              >
                Jouer maintenant 🎮
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Cards Grid */}
      <div style={gridStyle}>
        {sortedGames.map((game) => (
          <div 
            key={game.id} 
            className="game-card neon-card"
            style={{
              ...cardStyle,
              border: `2px solid ${game.color}`,
              boxShadow: `0 0 8px ${game.color}33`,
            }}
            onClick={() => {
              sound.playClick();
              onSelectGame(game.id);
            }}
          >
            <div style={cardHeaderStyle}>
              <span style={cardIconStyle}>{game.icon}</span>
              <h3 style={{ ...cardTitleStyle, color: game.textColor }}>{game.title}</h3>
            </div>
            <p style={cardDescStyle}>{game.desc}</p>
            <div style={cardFooterStyle}>
              <div style={cardScoreStyle}>
                SUCCÈS: <span style={{ color: game.textColor, fontWeight: 'bold' }}>{game.highscore > 0 ? 'RÉUSSI' : 'À JOUER'}</span>
              </div>
              <button 
                className="retro-btn"
                style={{ 
                  ...playBtnStyle, 
                  borderColor: game.color, 
                  color: game.textColor,
                  backgroundColor: 'transparent',
                  fontWeight: '800'
                }}
              >
                ENTRER
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* External Links */}
      <div style={sectionTitleStyle}>
        <span style={{ color: '#f59e0b' }}>★</span> LIENS UTILES <span style={{ color: '#f59e0b' }}>★</span>
      </div>
      <div style={linksContainerStyle} className="neon-border-subtle">
        <a href="https://poki.com/fr" target="_blank" rel="noopener noreferrer" style={linkStyle}>Poki Jeux</a>
        <a href="https://itch.io/search?type=games&q=mahjong+zen" target="_blank" rel="noopener noreferrer" style={linkStyle}>Itch.io - Mahjong Zen</a>
        <a href="https://puzzles.twistymaze.com/" target="_blank" rel="noopener noreferrer" style={linkStyle}>TwistyMaze Puzzles</a>
        <a href="https://solitaired.com/mahjong/fish" target="_blank" rel="noopener noreferrer" style={linkStyle}>Solitaired Mahjong Fish</a>
        <a href="https://github.com/vvaldesc/BallSortPuzzle_web" target="_blank" rel="noopener noreferrer" style={linkStyle}>BallSort Puzzle Web (GitHub)</a>
        <a href="https://ffalt.github.io/mah/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Mahjong (FFALT)</a>
      </div>

      {/* Achievements / Badge Room */}
      <div style={sectionTitleStyle}>
        <span style={{ color: '#00f0ff' }}>✦</span> TABLEAU DES ACCOMPLISSEMENTS <span style={{ color: '#00f0ff' }}>✦</span>
      </div>

      <div style={achievementsGridStyle} className="neon-border-subtle">
        {achievementsList.map((ach) => (
          <div 
            key={ach.id} 
            style={{
              ...achievementCardStyle,
              opacity: ach.unlocked ? 1 : 0.4,
              border: ach.unlocked ? `1px solid ${ach.color}` : '1px dashed rgba(255,255,255,0.1)',
              boxShadow: ach.unlocked ? `0 0 8px ${ach.color}22` : 'none'
            }}
          >
            <div style={{ ...achIconStyle, filter: ach.unlocked ? 'grayscale(0)' : 'grayscale(100%)' }}>
              {ach.icon}
            </div>
            <div style={achInfoStyle}>
              <div style={{ ...achTitleStyle, color: ach.unlocked ? ach.textColor : '#8e8a9f' }}>
                {ach.title}
              </div>
              <div style={achDescStyle}>{ach.desc}</div>
            </div>
            <div style={achStatusStyle}>
              {ach.unlocked ? (
                <span style={{ color: '#00ff7f', textShadow: '0 0 5px #00ff7f' }}>ACCOMPLI</span>
              ) : (
                <span style={{ color: '#ff007f' }}>À FAIRE</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '24px',
  padding: '10px 0',
  boxSizing: 'border-box'
};

const profileHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  flexWrap: 'wrap',
  gap: '16px'
};

const profileInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap'
};

const avatarWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px'
};

const avatarDisplayStyle = {
  fontSize: '28px',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  border: '2px solid var(--primary)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'rgba(2, 132, 199, 0.05)',
  color: 'var(--primary)'
};

const avatarListStyle = {
  display: 'flex',
  gap: '4px'
};

const avatarBtnStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  fontSize: '14px',
  padding: '2px 4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: 'bold'
};

const nameCustomizerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px'
};

const nameDisplayGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const pilotLabelStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--text-muted)'
};

const nameStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--text-main)',
  letterSpacing: '-0.5px'
};

const editBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '4px'
};

const nameInputGroupStyle = {
  display: 'flex',
  gap: '6px'
};

const inputStyle = {
  background: '#f8fafc',
  border: '2px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-main)',
  padding: '6px 12px',
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  fontWeight: '700',
  outline: 'none',
  textTransform: 'uppercase'
};

const saveBtnStyle = {
  padding: '6px 12px',
  fontSize: '14px',
  borderColor: 'var(--primary)',
  minHeight: '36px'
};

const statusStyle = {
  fontSize: '12px',
  fontWeight: '700',
  color: 'var(--secondary)',
  fontFamily: 'var(--font-main)',
  letterSpacing: '0.5px'
};

const controlsStyle = {
  display: 'flex',
  gap: '10px'
};

const muteBtnStyle = {
  padding: '10px 18px',
  fontSize: '14px',
  borderColor: 'var(--primary)',
  color: 'var(--primary)',
  background: 'transparent',
  fontWeight: 'bold'
};

const sectionTitleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--text-main)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '16px'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
  gap: '24px',
  width: '100%'
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const linksContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '15px',
  justifyContent: 'center',
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px'
};

const linkStyle = {
  color: '#00f0ff',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '16px',
  padding: '8px 16px',
  background: 'rgba(0, 240, 255, 0.1)',
  borderRadius: '8px',
  transition: 'background 0.2s, transform 0.2s'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '12px'
};

const cardIconStyle = {
  fontSize: '32px'
};

const cardTitleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '20px',
  fontWeight: '800',
  margin: 0,
  letterSpacing: '-0.3px'
};

const cardDescStyle = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  lineHeight: '1.5',
  flexGrow: 1,
  marginBottom: '20px'
};

const cardFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const cardScoreStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '14px',
  fontWeight: '700',
  color: 'var(--text-main)'
};

const playBtnStyle = {
  padding: '8px 20px',
  fontSize: '14px',
  fontWeight: '800',
  border: '2px solid',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minHeight: '40px'
};

const achievementsGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  background: '#ffffff',
  padding: '20px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)'
};

const achievementCardStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 18px',
  borderRadius: '12px',
  background: 'var(--bg-app)',
  gap: '16px',
  textAlign: 'left',
  flexWrap: 'wrap'
};

const achIconStyle = {
  fontSize: '32px'
};

const achInfoStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const achTitleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  fontWeight: '800'
};

const achDescStyle = {
  fontSize: '14px',
  color: 'var(--text-muted)'
};

const achStatusStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '13px',
  fontWeight: '800'
};

// Statistics & Recommendation Styles
const statsDropdownWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '10px',
  marginTop: '10px'
};

const statsDropdownHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '12px 20px',
  fontFamily: 'var(--font-main)',
  fontSize: '16px',
  fontWeight: '700',
  background: '#ffffff',
  borderRadius: '12px',
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.2s ease-in-out',
  minHeight: '48px',
  border: '2px solid'
};

const statsDropdownContentStyle = {
  background: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const globalStatsSummaryStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
  gap: '16px'
};

const globalStatBoxStyle = {
  background: 'var(--bg-app)',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  textAlign: 'center'
};

const globalStatLabelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  letterSpacing: '0.5px'
};

const globalStatValueStyle = {
  fontSize: '20px',
  fontWeight: '800',
  color: 'var(--text-main)'
};

const gamesStatsTableStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const gameStatRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '8px',
  background: 'rgba(241, 245, 249, 0.5)',
  border: '1px solid var(--border-color)',
  flexWrap: 'wrap',
  gap: '12px'
};

const gameStatNameColStyle = {
  display: 'flex',
  alignItems: 'center',
  minWidth: '150px'
};

const gameStatDetailsStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap'
};

const gameStatItemStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)'
};

const statsActionButtonsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  flexWrap: 'wrap'
};

const statsActionBtnStyle = {
  padding: '8px 16px',
  fontSize: '14px',
  minHeight: '40px'
};

// Recommender styles
const recBtnContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  margin: '10px 0 20px 0'
};

const recommendationBtnStyle = {
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  color: '#ffffff',
  borderColor: 'transparent',
  fontSize: '16px',
  padding: '12px 24px',
  borderRadius: '12px',
  fontWeight: '800',
  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
  cursor: 'pointer'
};

const recModalStyle = {
  maxWidth: '500px',
  padding: '24px',
  textAlign: 'center'
};

const recModalHeaderStyle = {
  borderBottom: '2px solid var(--bg-app)',
  paddingBottom: '12px',
  marginBottom: '16px',
  color: 'var(--primary)'
};

const recModalBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px'
};

const recIntroTextStyle = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  margin: 0
};

const recGameDisplayStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
  background: 'rgba(2, 132, 199, 0.05)',
  borderRadius: '16px',
  border: '2px dashed var(--primary)',
  width: '80%'
};

const recGameIconStyle = {
  fontSize: '48px'
};

const recGameTitleStyle = {
  fontFamily: 'var(--font-main)',
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--primary)'
};

const recReasonBoxStyle = {
  background: 'var(--bg-app)',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  width: '100%',
  textAlign: 'left'
};

const recReasonTextStyle = {
  fontSize: '14px',
  color: 'var(--text-main)',
  margin: '6px 0 0 0',
  lineHeight: '1.4'
};

const recModalFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%'
};

const recCancelBtnStyle = {
  flex: 1,
  borderColor: 'var(--border-color)',
  color: 'var(--text-muted)',
  background: '#ffffff'
};

const recConfirmBtnStyle = {
  flex: 2,
  background: 'var(--primary)',
  color: '#ffffff',
  borderColor: 'var(--primary)'
};
