import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

export default function Dashboard({ onSelectGame, statsUpdated }) {
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('retrovision_player_name') || 'PATIENT_READY';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('retrovision_player_avatar') || '✦';
  });
  const [muted, setMuted] = useState(sound.muted);

  // Load high scores to calculate achievements
  const [highScores, setHighScores] = useState({
    mahjong: 0,
    water: 0,
    ball: 0,
    grid2048: 0
  });

  const avatars = ['✦', '♥', '★', '●', '☘', '☾', '☀'];

  useEffect(() => {
    const mahjong = parseInt(localStorage.getItem('retrovision_mahjong_highscore') || '0', 10);
    const water = parseInt(localStorage.getItem('retrovision_water_highscore') || '0', 10);
    const ball = parseInt(localStorage.getItem('retrovision_ball_highscore') || '0', 10);
    const grid2048 = parseInt(localStorage.getItem('retrovision_2048_highscore') || '0', 10);
    setHighScores({ mahjong, water, ball, grid2048 });
  }, [statsUpdated]);

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
    }
  ];

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

      {/* Main Arcade Titles */}
      <div style={sectionTitleStyle}>
        <span style={{ color: '#ff007f' }}>★</span> SÉLECTIONNEZ VOTRE JEU <span style={{ color: '#ff007f' }}>★</span>
      </div>

      {/* Game Cards Grid */}
      <div style={gridStyle}>
        {games.map((game) => (
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
  boxSizing: 'border-box'
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
