import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sound } from '../utils/sound';
import BallSortCollection from './BallSortCollection';
import { getGameConfig, updateGameConfig } from '../utils/config';
import { gsap } from 'gsap';
import WinLossTransition from '../components/WinLossTransition';
import GameHeader from '../components/GameHeader';

const BallSortIntro = ({ onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    gsap.to(".bg-sphere", {
      y: -50,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 1
    });

    tl.fromTo(".text-3d-bal",
      { scale: 0, rotationY: 45, rotationZ: -10, opacity: 1 },
      { duration: 0.8, scale: 1, rotationY: 0, rotationZ: 0, ease: "back.out(1.7)" }
    )
      .to(".vortex-green-orb-container", { duration: 1, rotation: 360, repeat: 1, ease: "none" }, 0)
      .fromTo(".lightning-bolts", { opacity: 0 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 5 }, 0.2)
      .to(".text-3d-bal", { duration: 0.5, scale: 0.2, opacity: 0, ease: "power2.in" }, "+=0.5")
      .to(".vortex-container", { duration: 0.5, scale: 0, opacity: 0, ease: "power2.in" }, "<")
      .set(".logo-ball-sort", { visibility: "visible" })
      .fromTo(".logo-ball-sort",
        { scale: 1.5, opacity: 0 },
        { duration: 0.6, scale: 1, opacity: 1, ease: "bounce.out" }
      )
      .set(".btn-niveau", { visibility: "visible" })
      .fromTo(".btn-niveau",
        { y: 200, opacity: 0 },
        { duration: 0.6, y: 0, opacity: 1, ease: "back.out(1.5)" },
        "-=0.2"
      )
      .to(".ads-badge", { opacity: 1, duration: 0.5 }, "-=0.2")
      .call(() => startParticles());

    let particles = [];
    let isRunning = false;
    let animationFrameId;
    let spawnInterval;
    let resizeHandler;

    const startParticles = () => {
      if (isRunning) return;
      isRunning = true;
      const canvas = canvasRef.current;
      if (!canvas) return;

      resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resizeHandler);
      resizeHandler();

      const spawnGreenParticle = () => {
        const flask = document.getElementById('flask-origin');
        if (!flask) return;
        const rect = flask.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top;

        particles.push({
          x: startX,
          y: startY,
          startX: startX,
          startY: startY,
          controlX: startX + (Math.random() - 0.5) * 200,
          controlY: startY - 200 - Math.random() * 100,
          endX: startX + (Math.random() - 0.5) * 150,
          endY: startY - 400 - Math.random() * 200,
          t: 0,
          speed: 0.005 + Math.random() * 0.01,
          size: Math.random() * 5 + 3,
          color: '#00FF00'
        });
      };

      spawnInterval = setInterval(spawnGreenParticle, 150);

      const ctx = canvas.getContext('2d');
      const renderParticles = () => {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          let p = particles[i];
          p.t += p.speed;
          const u = 1 - p.t;
          p.x = u * u * p.startX + 2 * u * p.t * p.controlX + p.t * p.t * p.endX;
          p.y = u * u * p.startY + 2 * u * p.t * p.controlY + p.t * p.t * p.endY;

          const life = 1 - p.t;

          if (life <= 0 || p.t >= 1) {
            particles.splice(i, 1);
            continue;
          }

          const currentSize = p.size * Math.max(life, 0);

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 0, ${life})`;
          ctx.fill();
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00FF00';
        }
        animationFrameId = requestAnimationFrame(renderParticles);
      };
      renderParticles();
    };

    return () => {
      tl.kill();
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (spawnInterval) clearInterval(spawnInterval);
      if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle at center, #0A0E1A 0%, #000000 100%)',
      zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', fontFamily: '"Arial", sans-serif', perspective: 1000
    }}>
      <style>{`
        .bg-sphere { position: absolute; border-radius: 50%; filter: blur(20px); opacity: 0.6; z-index: 1; }
        .sphere-1 { width: 150px; height: 150px; background: #8A2BE2; bottom: -50px; left: 20%; }
        .sphere-2 { width: 200px; height: 200px; background: #4B0082; bottom: -100px; right: 15%; }
        .sphere-3 { width: 120px; height: 120px; background: #DC143C; bottom: -30px; left: 60%; }
        .vortex-container { position: absolute; width: 400px; height: 400px; z-index: 5; display: flex; justify-content: center; alignItems: center; }
        .vortex-disk { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(138,43,226,0.3) 0%, rgba(0,0,0,0) 70%); border: 2px dashed rgba(138,43,226,0.5); animation: spin-vortex 4s linear infinite; }
        @keyframes spin-vortex { 100% { transform: rotate(360deg); } }
        .vortex-green-orb-container { position: absolute; width: 350px; height: 350px; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .vortex-green-orb { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 20px; height: 20px; background: #00FF00; border-radius: 50%; box-shadow: 0 0 20px #00FF00, 0 0 40px #00FF00, -20px 5px 15px rgba(0,255,0,0.8), -40px 10px 15px rgba(0,255,0,0.5); }
        .lightning-bolts { position: absolute; width: 100%; height: 100%; z-index: 6; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><path d="M200,200 L150,100 L180,90 L120,20" stroke="%2300FFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %2300FFFF)"/><path d="M200,200 L250,300 L220,310 L280,380" stroke="%2300FFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %2300FFFF)"/><path d="M200,200 L300,150 L290,120 L380,80" stroke="%2300FFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %2300FFFF)"/></svg>') center/contain no-repeat; opacity: 0; animation: flash-lightning 0.15s infinite alternate; }
        @keyframes flash-lightning { 0%, 50% { filter: brightness(1); } 100% { filter: brightness(2) drop-shadow(0 0 10px white); } }
        @keyframes bal-light { 0% { text-shadow: -2px -2px 0 #FFF, 1px 1px 0 #F9A602, 2px 2px 0 #F9A602, 3px 3px 0 #D35400, 4px 4px 0 #D35400, 5px 5px 0 #A04000, 6px 6px 0 #A04000, 0 0 20px #FFD700; } 50% { text-shadow: 2px -2px 0 #FFF, 1px 1px 0 #F9A602, 2px 2px 0 #F9A602, 3px 3px 0 #D35400, 4px 4px 0 #D35400, 5px 5px 0 #A04000, 6px 6px 0 #A04000, 0 0 20px #FFD700; } 100% { text-shadow: -2px -2px 0 #FFF, 1px 1px 0 #F9A602, 2px 2px 0 #F9A602, 3px 3px 0 #D35400, 4px 4px 0 #D35400, 5px 5px 0 #A04000, 6px 6px 0 #A04000, 0 0 20px #FFD700; } }
        .text-3d-bal { font-family: '"Arial Black", sans-serif'; font-size: 8rem; font-weight: 900; color: #FFD700; position: absolute; text-transform: uppercase; animation: bal-light 2s linear infinite; z-index: 10; }
        .logo-ball-sort { position: absolute; font-family: '"Arial Black", sans-serif'; font-size: 5rem; font-weight: 900; color: transparent; background: linear-gradient(to bottom, #FFFFFF, #B0E0E6); -webkit-background-clip: text; -webkit-text-stroke: 2px #00008B; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5)); display: flex; align-items: center; gap: 10px; z-index: 20; opacity: 0; visibility: hidden; }
        .letter-a { position: relative; display: inline-block; color: transparent; }
        .letter-a::after { content: '👁'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -30%); font-size: 1.5rem; color: #000; -webkit-text-stroke: 0; }
        .letter-o-flask { display: inline-block; width: 40px; height: 70px; border: 4px solid rgba(255,255,255,0.8); border-top: none; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; position: relative; margin: 0 5px; background: linear-gradient(to top, #0000FF 0%, #FF1493 50%, transparent 50%); box-shadow: inset 0 0 10px rgba(255,255,255,0.5); }
        .letter-o-flask::after { content: ''; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 25px; height: 25px; background: #FF0000; border-radius: 50%; box-shadow: inset -5px -5px 10px rgba(0,0,0,0.5); }
        .word-sort { position: relative; }
        .word-sort::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #00FF00; filter: blur(15px); opacity: 0; z-index: -1; animation: glow-sort 2s infinite alternate; }
        @keyframes glow-sort { 0% { opacity: 0; } 100% { opacity: 0.6; } }
        .btn-niveau { position: absolute; bottom: 20%; background: linear-gradient(to bottom, #32CD32, #228B22); border: 2px solid #90EE90; border-radius: 50px; padding: 15px 40px; font-size: 2rem; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 10px 20px rgba(0,255,0,0.3), inset 0 5px 10px rgba(255,255,255,0.4); z-index: 20; opacity: 0; visibility: hidden; }
        .ads-badge { position: absolute; top: 20px; left: 20px; width: 50px; height: 50px; background: #FF0000; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 1rem; box-shadow: 0 0 15px rgba(255,0,0,0.6); z-index: 20; animation: pulse-ads 2s infinite ease-in-out; opacity: 0; }
        @keyframes pulse-ads { 0% { transform: scale(0.95); } 50% { transform: scale(1.05); } 100% { transform: scale(0.95); } }
      `}</style>
      <div className="bg-sphere sphere-1" />
      <div className="bg-sphere sphere-2" />
      <div className="bg-sphere sphere-3" />
      <div className="vortex-container">
        <div className="vortex-disk" />
        <div className="vortex-green-orb-container"><div className="vortex-green-orb" /></div>
        <div className="lightning-bolts" />
      </div>
      <div className="text-3d-bal">BAL!</div>
      <div className="logo-ball-sort">
        <div style={{ display: 'flex', alignItems: 'center' }}>B<span className="letter-a">A</span>LL</div>
        <div className="word-sort" style={{ display: 'flex', alignItems: 'center' }}>S<div className="letter-o-flask" id="flask-origin" />RT</div>
      </div>
      <button className="btn-niveau" onClick={onComplete}>Niveau 116</button>
      <div className="ads-badge">ADS</div>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }} />
    </div>
  );
};


export default function BallSort({ onBack, onScoreSave, isIntermission, intermissionDifficulty, onIntermissionComplete, onIntermissionRequest }) {
  const containerRef = useRef(null);
  const lastNumFilledRef = useRef(0);
  // Game state
  const [showIntro, setShowIntro] = useState(true);
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [history, setHistory] = useState([]);
  const [victoryPhase, setVictoryPhase] = useState(0); // 0: playing, 1: stage1, 2: stage2, 3: final
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [bouncingTube, setBouncingTube] = useState(null);
  const [extraTubesCount, setExtraTubesCount] = useState(0); // 0 or 1
  const [hintTubes, setHintTubes] = useState(null); // [srcIdx, destIdx]
  const [completedTubeIndex, setCompletedTubeIndex] = useState(null);
  const [particles, setParticles] = useState([]);
  const [scale, setScale] = useState(1);
  const [showCollection, setShowCollection] = useState(false);
  const [customizations, setCustomizations] = useState(() => getGameConfig('ball', 'customizations', { tube: 't1', theme: 'bg1', ball: 'b1', color: 'c1', difficulty: 'moyen' }));
  const [shakingTube, setShakingTube] = useState(null);
  const [bgmOn, setBgmOn] = useState(false);

  // We will determine tube counts dynamically in initGame
  const defaultCap = 4;


  const colorPalettes = {
    c1: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#14B8A6', '#4C1D95'],
    c2: ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF', '#99FFFF', '#FFCC99', '#F5F5DC', '#B266B2'],
    c3: ['#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#D2691E', '#6B21A8', '#4B0082'],
    c4: ['#FF1493', '#32CD32', '#1E90FF', '#FFD700', '#8A2BE2', '#00FA9A', '#FF4500', '#20B2AA', '#F5DEB3'],
    c5: ['#EA3323', '#75FA4C', '#3A3AFA', '#F6FA05', '#F505F1', '#05FAFA', '#FA9E05', '#F43F5E', '#8B5A2B'],
    c6: ['#8B0000', '#556B2F', '#00008B', '#B8860B', '#4B0082', '#2F4F4F', '#D2691E', '#0EA5E9', '#8B4513'],
    c7: ['#FF69B4', '#7CFC00', '#4169E1', '#F0E68C', '#9370DB', '#40E0D0', '#FFA07A', '#EE82EE', '#FFDAB9'],
    c8: ['#DC143C', '#00FF7F', '#191970', '#FFD700', '#9932CC', '#00CED1', '#FF8C00', '#BE123C', '#C71585'],
    c9: ['#E6194B', '#3CB44B', '#4363D8', '#FFE119', '#911EB4', '#42D4F4', '#F58231', '#F032E6', '#BFEEF4']
  };

  const currentPalette = colorPalettes[customizations.color] || colorPalettes.c1;

  // Generate gradient from hex
  const makeGradient = (hex) => `radial-gradient(circle at 35% 35%, ${hex}aa, ${hex}, ${hex}66)`;

  const colors = {
    R: { hex: currentPalette[0], grad: makeGradient(currentPalette[0]) },
    B: { hex: currentPalette[1], grad: makeGradient(currentPalette[1]) },
    G: { hex: currentPalette[2], grad: makeGradient(currentPalette[2]) },
    Y: { hex: currentPalette[3], grad: makeGradient(currentPalette[3]) },
    P: { hex: currentPalette[4], grad: makeGradient(currentPalette[4]) },
    O: { hex: currentPalette[5], grad: makeGradient(currentPalette[5]) },
    W: { hex: currentPalette[6], grad: makeGradient(currentPalette[6]) },
    D: { hex: currentPalette[7], grad: makeGradient(currentPalette[7]) },
    M: { hex: currentPalette[8], grad: makeGradient(currentPalette[8]) }
  };

  const initGame = (overrideDiff = null) => {
    let numFilled;
    if (isIntermission) {
      let min = 3, max = 4;
      if (intermissionDifficulty === 'facile') { min = 3; max = 4; }
      else if (intermissionDifficulty === 'moyen') { min = 5; max = 6; }
      else if (intermissionDifficulty === 'difficile') { min = 7; max = 9; }
      do {
        numFilled = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (numFilled === lastNumFilledRef.current && (max - min) > 0);
    } else {
      numFilled = parseInt(overrideDiff || customizations.difficulty) || 5;
    }
    lastNumFilledRef.current = numFilled;
    const numEmpty = numFilled >= 7 ? 2 : 1;
    const activeColorsKeys = ['R', 'B', 'G', 'Y', 'P', 'O', 'W', 'D', 'M'].slice(0, numFilled);

    const ballPool = [];
    activeColorsKeys.forEach(col => {
      for (let i = 0; i < defaultCap; i++) {
        ballPool.push(col);
      }
    });

    for (let i = ballPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ballPool[i], ballPool[j]] = [ballPool[j], ballPool[i]];
    }

    const initialTubes = [];
    for (let i = 0; i < numFilled; i++) {
      initialTubes.push(ballPool.slice(i * defaultCap, i * defaultCap + defaultCap));
    }

    for (let i = 0; i < numEmpty; i++) {
      initialTubes.push([]);
    }

    setTubes(initialTubes);
    setSelectedTube(null);
    setHistory([]);
    setVictoryPhase(0);
    setMoves(0);
    setStartTime(Date.now());
    setBouncingTube(null);
    setParticles([]);
    setExtraTubesCount(0);
    setHintTubes(null);
  };

  useEffect(() => {
    initGame();

    const handleResize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 60; // 30px padding on sides
      // 6 tubes of 64px + 5 gaps of 15px = 384 + 75 = 459px
      const requiredWidth = 6 * 64 + 5 * 15;
      if (availableWidth < requiredWidth) {
        setScale(availableWidth / requiredWidth);
      } else {
        setScale(1);
      }
    };

    const target = containerRef.current;
    let resizeObserver;
    if (target) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(target);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && target) {
        resizeObserver.unobserve(target);
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isGameInProgress = victoryPhase === 0 && history.length > 0;
      if (isGameInProgress) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter la partie en cours ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [victoryPhase, history]);

  const handleBackWithConfirm = () => {
    const isGameInProgress = victoryPhase === 0 && history.length > 0;
    if (isGameInProgress) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const getTubeCapacity = (index) => {
    return (extraTubesCount > 0 && index === tubes.length - 1) ? 1 : defaultCap;
  };

  const getTopColorGroupCount = (tube) => {
    if (tube.length === 0) return 0;
    const topColor = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0; i--) {
      if (tube[i] === topColor) count++;
      else break;
    }
    return count;
  };

  const handleTubeClick = (index) => {
    if (victoryPhase !== 0) return;
    setHintTubes(null);

    // Start BGM on first interaction (browser requires user gesture)
    if (!bgmOn) {
      sound.startBGM();
      setBgmOn(true);
    }

    if (selectedTube === null) {
      if (tubes[index].length === 0) return;
      setSelectedTube(index);
      sound.playClick();
    } else {
      if (selectedTube === index) {
        setSelectedTube(null);
        sound.playClick();
        return;
      }

      if (canMove(selectedTube, index)) {
        moveBall(selectedTube, index);
      } else {
        // Invalid move — shake the target tube
        setShakingTube(index);
        sound.playShake();
        setTimeout(() => setShakingTube(null), 400);

        if (tubes[index].length > 0) {
          setSelectedTube(index);
        } else {
          setSelectedTube(null);
        }
      }
    }
  };

  const canMove = (srcIdx, destIdx) => {
    const src = tubes[srcIdx];
    const dest = tubes[destIdx];
    const destCap = getTubeCapacity(destIdx);

    if (src.length === 0) return false;
    if (dest.length >= destCap) return false;

    const ballToMove = src[src.length - 1];
    const destTopBall = dest[dest.length - 1];

    if (dest.length === 0 || destTopBall === ballToMove) {
      const spaceLeft = destCap - dest.length;
      return spaceLeft >= 1; // Can move at least 1
    }
    return false;
  };

  const moveBall = (srcIdx, destIdx) => {
    setHistory([...history, JSON.stringify(tubes)]);

    const nextTubes = tubes.map(t => [...t]);
    const destCap = getTubeCapacity(destIdx);
    const spaceLeft = destCap - nextTubes[destIdx].length;

    const sameColorCount = getTopColorGroupCount(nextTubes[srcIdx]);
    const countToMove = Math.min(sameColorCount, spaceLeft);

    const ballsToMove = [];
    for (let i = 0; i < countToMove; i++) {
      ballsToMove.push(nextTubes[srcIdx].pop());
    }
    for (let i = 0; i < countToMove; i++) {
      nextTubes[destIdx].push(ballsToMove[i]);
    }

    setTubes(nextTubes);
    setSelectedTube(null);
    setBouncingTube(destIdx);
    setMoves(m => m + 1);
    sound.playBallDrop();

    const targetTube = nextTubes[destIdx];
    const isComplete = targetTube.length === destCap && targetTube.every(b => b === targetTube[0]);
    if (isComplete) {
      triggerSparkles(destIdx, colors[targetTube[0]].hex);
      sound.playTubeComplete();
      setCompletedTubeIndex(destIdx);
      setTimeout(() => setCompletedTubeIndex(null), 1000);
    } else if (targetTube.length >= 2 && targetTube.every(b => b === targetTube[0])) {
      // Progress chime: tube is building up with same color
      sound.playProgressChime(targetTube.length / destCap);
    }

    setTimeout(() => {
      setBouncingTube(null);
    }, 700);

    checkWin(nextTubes);
  };

  const addExtraTube = () => {
    if (victoryPhase !== 0 || extraTubesCount >= 1) return;
    setHistory([...history, JSON.stringify(tubes)]);
    setTubes([...tubes, []]);
    setExtraTubesCount(1);
    sound.playClick();
  };

  const getHint = () => {
    setHintTubes(null);
    for (let src = 0; src < tubes.length; src++) {
      for (let dest = 0; dest < tubes.length; dest++) {
        if (src !== dest && canMove(src, dest)) {
          const srcTube = tubes[src];
          const destTube = tubes[dest];
          const isSorted = srcTube.length > 0 && srcTube.every(b => b === srcTube[0]);
          const movingToEmpty = destTube.length === 0;

          if (!(isSorted && movingToEmpty)) {
            setHintTubes([src, dest]);
            sound.playPowerup();
            return;
          }
        }
      }
    }
    for (let src = 0; src < tubes.length; src++) {
      for (let dest = 0; dest < tubes.length; dest++) {
        if (src !== dest && canMove(src, dest)) {
          setHintTubes([src, dest]);
          sound.playPowerup();
          return;
        }
      }
    }
  };

  const triggerSparkles = (tubeIdx, colorHex) => {
    const newParticles = [];
    const timestamp = Date.now();
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.2;
      const speed = 40 + Math.random() * 50;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 20;
      newParticles.push({
        id: `${timestamp}-${i}`,
        tubeIdx,
        dx: `${dx}px`,
        dy: `${dy}px`,
        colorHex,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 800);
  };

  const checkWin = (currentTubes) => {
    const isWon = currentTubes.every((tube, idx) => {
      if (tube.length === 0) return true;
      const cap = getTubeCapacity(idx);
      if (tube.length === cap) {
        return tube.every(ball => ball === tube[0]);
      }
      return false;
    });

    if (isWon && victoryPhase === 0) {
      if (isIntermission && onIntermissionComplete) {
        setTimeout(() => onIntermissionComplete(), 1000);
        return;
      }
      setVictoryPhase(-1);

      setTimeout(() => {
        setVictoryPhase(1);
        sound.stopBGM();

        // Stage 1 -> Stage 2
        setTimeout(() => {
          setVictoryPhase(2);
          sound.playExplosion(); // Fireworks sound
        }, 2000);

        // Stage 2 -> Stage 3 (Final)
        setTimeout(() => {
          setVictoryPhase(3);
          sound.playScore();
          if (onScoreSave) {
            onScoreSave('Tri Billes', Math.max(1000 - moves * 10, 100));
          }
        }, 4500);
      }, 1500);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const prevTubes = JSON.parse(prev);
    setTubes(prevTubes);

    if (prevTubes.length === 11) {
      setExtraTubesCount(0);
    }

    setHistory(history.slice(0, -1));
    setSelectedTube(null);
    setHintTubes(null);
    sound.playClick();
  };

  if (showCollection) {
    return (
      <BallSortCollection
        onClose={() => {
          setShowCollection(false);
          initGame();
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('ball', 'customizations', next);
            return next;
          });
          setShowCollection(false);
          if (category === 'difficulty') {
            initGame(id);
          }
        }}
      />
    );
  }

  const getBackground = () => {
    switch (customizations.theme) {
      case 'bg1': return '#1A1A1A'; // Sombre
      case 'bg2': return 'url("https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Nature
      case 'bg3': return 'url("https://images.unsplash.com/photo-1513569771920-c9e1d31714cb?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Zen Galets
      case 'bg4': return 'url("https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Rosée
      case 'bg5': return 'url("https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Kawaii Art
      case 'bg6': return 'url("https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Pastel
      case 'bg7': return 'url("https://images.unsplash.com/photo-1508739773402-3ce9cef36851?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Cosmos
      case 'bg8': return 'url("https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Forêt
      case 'bg9': return 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop") center/cover no-repeat'; // Aurore
      default: return '#1A1A1A'; // Fallback to Dark
    }
  };

  // Ambient particle configuration per theme
  const getAmbientConfig = () => {
    switch (customizations.theme) {
      case 'bg2': // Nature
      case 'bg8': // Forêt
        return { emoji: ['🍃', '🌿', '🍂'], count: 12, speed: 'slow', direction: 'fall' };
      case 'bg3': // Zen Galets
        return { emoji: ['〰️'], count: 6, speed: 'veryslow', direction: 'horizontal' };
      case 'bg7': // Cosmos
      case 'bg9': // Aurore
        return { emoji: ['✦', '✧', '⋆'], count: 20, speed: 'slow', direction: 'twinkle' };
      case 'bg5': // Kawaii Art
      case 'bg6': // Pastel
        return { emoji: ['♡', '☆', '♪'], count: 10, speed: 'slow', direction: 'float' };
      case 'bg4': // Rosée
        return { emoji: ['💧'], count: 8, speed: 'medium', direction: 'fall' };
      default: // Sombre (bg1)
        return { emoji: ['·', '•'], count: 15, speed: 'veryslow', direction: 'twinkle' };
    }
  };

  return (
    <>
      {showIntro && !isIntermission && <BallSortIntro onComplete={() => setShowIntro(false)} />}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: getBackground(),
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          fontFamily: '"Nunito", "Segoe UI", sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Background Overlay to soften image */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }} />

        {/* Ambient Particles Layer */}
        <AmbientParticles config={getAmbientConfig()} />

        {/* Header */}
        {!isIntermission && (
          <GameHeader
            title="TRI BILLES"
            onBack={handleBackWithConfirm}
            onRestart={initGame}
            onUndo={undo}
            undoDisabled={history.length === 0}
            onHint={getHint}
            hintDisabled={false}
            onShop={() => setShowCollection(true)}
            bgmOn={bgmOn}
            onBgmToggle={() => {
              const isOn = sound.toggleBGM();
              setBgmOn(isOn);
            }}
          />
        )}
        
        {isIntermission && victoryPhase === 0 && (
          <div className="entract-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(57, 255, 20, 0.08)', border: '1px solid rgba(57, 255, 20, 0.2)', borderRadius: '8px', marginBottom: '10px' }}>
            <div className="entract-header-text">
              Entracte ! Triez les billes pour retourner au jeu principal.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onIntermissionRequest && (
                <button onClick={() => onIntermissionRequest()} className="entract-header-btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  🎲 Autre jeu
                </button>
              )}
              <button
                onClick={() => { if (onIntermissionComplete) onIntermissionComplete(false); }}
                className="entract-header-btn"
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
              >
                Passer l'entracte ⏭
              </button>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          zIndex: 5,
          gap: '40px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            padding: "1em",
            background: 'rgba(255, 255, 255, .2)'
          }}>
            {(() => {
              const baseTubesCount = tubes.length - extraTubesCount;
              const mid = Math.ceil(baseTubesCount / 2);
              return (
                <>
                  {/* Row 1 */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'nowrap', justifyContent: 'center' }}>
                    {tubes.slice(0, mid).map((tube, i) => (
                      <div key={i} style={{
                        animation: completedTubeIndex === i ? 'tubeCompletePulse 1s ease-out'
                          : shakingTube === i ? 'tubeShake 0.4s ease-out' : 'none',
                        transformOrigin: 'bottom center'
                      }}>
                        <TubeRender
                          tube={tube}
                          idx={i}
                          capacity={getTubeCapacity(i)}
                          selected={selectedTube === i}
                          hint={hintTubes && (hintTubes[0] === i || hintTubes[1] === i)}
                          bouncing={bouncingTube === i}
                          colors={colors}
                          customization={customizations}
                          onClick={() => handleTubeClick(i)}
                          particles={particles.filter(p => p.tubeIdx === i)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'nowrap', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {tubes.slice(mid, baseTubesCount).map((tube, i) => {
                      const idx = i + mid;
                      return (
                        <div key={idx} style={{
                          animation: completedTubeIndex === idx ? 'tubeCompletePulse 1s ease-out'
                            : shakingTube === idx ? 'tubeShake 0.4s ease-out' : 'none',
                          transformOrigin: 'bottom center'
                        }}>
                          <TubeRender
                            tube={tube}
                            idx={idx}
                            capacity={getTubeCapacity(idx)}
                            selected={selectedTube === idx}
                            hint={hintTubes && (hintTubes[0] === idx || hintTubes[1] === idx)}
                            bouncing={bouncingTube === idx}
                            colors={colors}
                            customization={customizations}
                            onClick={() => handleTubeClick(idx)}
                            particles={particles.filter(p => p.tubeIdx === idx)}
                          />
                        </div>
                      );
                    })}

                    {/* Extra Tube 1-ball capacity */}
                    {extraTubesCount > 0 ? (
                      <div style={{ animation: completedTubeIndex === tubes.length - 1 ? 'tubeCompletePulse 1s ease-out' : 'none', transformOrigin: 'bottom center' }}>
                        <TubeRender
                          tube={tubes[tubes.length - 1]}
                          idx={tubes.length - 1}
                          capacity={getTubeCapacity(tubes.length - 1)}
                          selected={selectedTube === tubes.length - 1}
                          hint={hintTubes && (hintTubes[0] === tubes.length - 1 || hintTubes[1] === tubes.length - 1)}
                          bouncing={bouncingTube === tubes.length - 1}
                          colors={colors}
                          customization={customizations}
                          onClick={() => handleTubeClick(tubes.length - 1)}
                          particles={particles.filter(p => p.tubeIdx === tubes.length - 1)}
                        />
                      </div>
                    ) : (
                      <div
                        onClick={addExtraTube}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '10px',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '24px',
                          transition: 'all 0.2s',
                          marginBottom: '10px'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        +
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>


        </div>

        {/* Transition Phase */}
        {victoryPhase === -1 && <WinLossTransition type="win" />}

        {/* Victory Overlays */}
        {victoryPhase > 0 && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.5s',
            overflow: 'hidden'
          }}>
            {/* Dynamic Confetti Particles */}
            {victoryPhase >= 2 && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {Array.from({ length: 40 }, (_, i) => {
                  const confettiColors = ['#FFD700', '#FF3366', '#33CCFF', '#39FF14', '#FF00FF', '#FF8800', '#00FFCC'];
                  const color = confettiColors[i % confettiColors.length];
                  const left = Math.random() * 100;
                  const delay = Math.random() * 3;
                  const duration = 2 + Math.random() * 3;
                  const size = 6 + Math.random() * 8;
                  const rotation = Math.random() * 360;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${left}%`,
                        top: '-20px',
                        width: `${size}px`,
                        height: `${size * 0.6}px`,
                        background: color,
                        borderRadius: i % 3 === 0 ? '50%' : '2px',
                        animation: `confettiFall ${duration}s linear ${delay}s infinite`,
                        transform: `rotate(${rotation}deg)`,
                        opacity: 0.8
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Stage 1: Initial WOW */}
            {victoryPhase === 1 && (
              <div style={{ animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <h2 style={{
                  fontSize: '4rem',
                  color: '#FFD700',
                  textShadow: '0 0 20px rgba(255,215,0,0.8), 2px 2px 0px white',
                  margin: 0,
                  transform: 'rotate(-5deg)'
                }}>PARFAIT !</h2>
                <div style={{ fontSize: '6rem', textAlign: 'center', animation: 'bounce 1s infinite' }}>⭐</div>
              </div>
            )}

            {/* Stage 2: Stats */}
            {victoryPhase === 2 && (
              <div style={{
                animation: 'slideUpFade 0.6s ease-out',
                background: 'rgba(255,255,255,0.9)',
                padding: '40px',
                borderRadius: '30px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                textAlign: 'center',
                zIndex: 10
              }}>
                <h3 style={{ fontSize: '2.5rem', color: '#33CCFF', margin: '0 0 20px 0' }}>Analyse des billes...</h3>
                <div style={{ fontSize: '1.8rem', color: '#666', margin: '10px 0' }}>
                  Coups : <strong style={{ color: '#FF3366' }}>{moves}</strong>
                </div>
              </div>
            )}

            {/* Stage 3: Final Master Screen */}
            {victoryPhase === 3 && (
              <div style={{
                textAlign: 'center',
                animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: 10
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '10px' }}>👑</div>
                <h2 style={{
                  fontSize: '3.5rem',
                  background: 'linear-gradient(45deg, #FFD700, #FF8C00, #FF1493)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 30px 0',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}>MAÎTRE TRIEUR</h2>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      if (isIntermission && onIntermissionComplete) onIntermissionComplete();
                      else if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') onIntermissionRequest();
                      else initGame();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #33FF77, #009933)',
                      border: '4px solid white',
                      color: 'white',
                      padding: '15px 40px',
                      borderRadius: '40px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px rgba(51,255,119,0.4)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isIntermission ? "Retour au Mahjong" : "Rejouer 🔄"}
                  </button>
                  {!isIntermission && (
                    <button
                      onClick={onBack}
                      style={{
                        background: 'rgba(0,0,0,0.1)',
                        border: 'none',
                        color: '#666',
                        padding: '15px 30px',
                        borderRadius: '40px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                    >
                      Quitter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}      <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { 0% { background-position: 0 -1000px; } 100% { background-position: 0 1000px; } }
        @keyframes slideUpFade { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes corkSlam {
          0% { transform: translateY(-100px) scale(1.5); opacity: 0; filter: drop-shadow(0 0 20px white); }
          60% { transform: translateY(0) scale(1.1); opacity: 1; filter: drop-shadow(0 0 10px white); }
          80% { transform: scaleY(0.5) scaleX(1.4) translateY(10px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes bounceGlow {
          0% { transform: translateY(0) scaleX(1) scaleY(1); filter: brightness(1); }
          30% { transform: translateY(5px) scaleX(1.2) scaleY(0.8); filter: brightness(1.3) drop-shadow(0 0 8px white); }
          50% { transform: translateY(-8px) scaleX(0.9) scaleY(1.1); filter: brightness(1.5) drop-shadow(0 0 12px white); }
          70% { transform: translateY(2px) scaleX(1.05) scaleY(0.95); filter: brightness(1.2); }
          100% { transform: translateY(0) scaleX(1) scaleY(1); filter: brightness(1); }
        }
        @keyframes floatIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        @keyframes tubeCompletePulse {
          0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
          50% { transform: scale(1.1) translateY(-10px); filter: brightness(1.3) drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
          100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
        }
        @keyframes tubeShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px) rotate(-1deg); }
          30% { transform: translateX(5px) rotate(1deg); }
          45% { transform: translateX(-4px) rotate(-0.5deg); }
          60% { transform: translateX(3px) rotate(0.5deg); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(1px); }
        }
        @keyframes ambientFall {
          0% { transform: translate(var(--startX), -20px) rotate(0deg); opacity: 0; }
          10% { opacity: var(--opacity); }
          90% { opacity: var(--opacity); }
          100% { transform: translate(calc(var(--startX) + var(--drift)), 105vh) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes ambientFloat {
          0% { transform: translate(var(--startX), 105vh) rotate(0deg); opacity: 0; }
          10% { opacity: var(--opacity); }
          90% { opacity: var(--opacity); }
          100% { transform: translate(calc(var(--startX) + var(--drift)), -20px) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes ambientTwinkle {
          0%, 100% { opacity: 0; transform: translate(var(--startX), var(--startY)) scale(0.5); }
          50% { opacity: var(--opacity); transform: translate(var(--startX), var(--startY)) scale(1.2); }
        }
        @keyframes ambientHorizontal {
          0% { transform: translate(-20px, var(--startY)); opacity: 0; }
          10% { opacity: var(--opacity); }
          90% { opacity: var(--opacity); }
          100% { transform: translate(105vw, var(--startY)); opacity: 0; }
        }
        @keyframes victoryDance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-3deg); }
          50% { transform: translateY(0) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
        }
        @keyframes shineSweep {
          0% { opacity: 0; transform: translateY(-100%); }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; transform: translateY(100%); }
        }
        @keyframes shockwave {
          0% { width: 20px; height: 6px; opacity: 0.8; border-width: 2px; }
          100% { width: 80px; height: 20px; opacity: 0; border-width: 1px; }
        }
        .bouncing-ball {
          animation: bounceGlow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .idle-ball {
          animation: floatIdle 3s ease-in-out infinite;
        }
      `}} />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  AMBIENT PARTICLES COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function AmbientParticles({ config }) {
  const particles = useMemo(() => {
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => {
      const emoji = config.emoji[i % config.emoji.length];
      const speedMap = { veryslow: 25, slow: 16, medium: 10 };
      const duration = (speedMap[config.speed] || 16) + Math.random() * 10;
      const delay = Math.random() * duration;
      const startX = `${Math.random() * 100}vw`;
      const startY = `${Math.random() * 100}vh`;
      const drift = `${(Math.random() - 0.5) * 80}px`;
      const rot = `${Math.random() * 360}deg`;
      const opacity = 0.15 + Math.random() * 0.35;
      const size = 0.6 + Math.random() * 0.8;

      let animName = 'ambientFall';
      if (config.direction === 'float') animName = 'ambientFloat';
      if (config.direction === 'twinkle') animName = 'ambientTwinkle';
      if (config.direction === 'horizontal') animName = 'ambientHorizontal';

      return { emoji, duration, delay, startX, startY, drift, rot, opacity, size, animName, id: i };
    });
  }, [config?.emoji?.join(','), config?.count, config?.speed, config?.direction]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            fontSize: `${p.size}rem`,
            '--startX': p.startX,
            '--startY': p.startY,
            '--drift': p.drift,
            '--rot': p.rot,
            '--opacity': p.opacity,
            animation: `${p.animName} ${p.duration}s linear ${p.delay}s infinite`,
            pointerEvents: 'none',
            willChange: 'transform, opacity'
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  TUBE RENDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function TubeRender({ tube, capacity, selected, hint, colors, bouncing, customization, onClick, particles }) {
  const isFull = tube.length === capacity;
  const isComplete = isFull && capacity >= 1 && tube.every(b => b === tube[0]);

  // Height calculated based on capacity
  const ballSize = 48;
  const padding = 10;
  const tubeHeight = (capacity * ballSize) + (capacity * 5) + padding * 2;

  const getTubeStyle = () => {
    const baseColor = selected ? '#00F0FF' : hint ? '#FF00CC' : isComplete && capacity > 1 ? '#39FF14' : 'rgba(255, 255, 255, 0.4)';
    const bgComplete = isComplete && capacity > 1 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)';

    switch (customization?.tube) {
      case 't1': // Classique
        return { border: `3px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 32px 32px', background: bgComplete };
      case 't2': // Verre
        return { border: `2px solid ${baseColor}`, borderRadius: '0 0 20px 20px', background: 'rgba(255,255,255,0.02)', boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2)' };
      case 't3': // Labo (Beaker)
        return { border: `4px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: bgComplete, borderBottomWidth: '8px' };
      case 't4': // Antique
        return { border: `4px double ${baseColor}`, borderTop: 'none', borderRadius: '0 0 40px 40px', background: bgComplete };
      case 't5': // Biologie
        return { border: `2px dashed ${baseColor}`, borderTop: 'none', borderRadius: '0 0 25px 25px', background: bgComplete };
      case 't6': // Science
        return { border: `3px solid ${baseColor}`, borderTop: 'none', borderRadius: '0', background: bgComplete, boxShadow: 'inset 0 -10px 10px rgba(0,0,0,0.5)' };
      case 't7': // Bébé
        return { border: `5px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 30px 30px', background: 'rgba(255,192,203,0.1)' };
      case 't8': // Exotique (Bamboo)
        return { borderLeft: `5px solid ${baseColor}`, borderRight: `5px solid ${baseColor}`, borderBottom: `8px solid ${baseColor}`, borderRadius: '0 0 5px 5px', background: 'rgba(139,69,19,0.1)' };
      case 't9': // Soda
        return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 15px 15px', background: 'rgba(173,216,230,0.1)' };
      default:
        return { border: `3px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 32px 32px', background: bgComplete };
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: '64px',
        height: `${tubeHeight}px`,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        paddingBottom: '10px',
        gap: '5px',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 20px rgba(0, 240, 255, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.3)'
          : hint ? '0 0 20px rgba(255, 0, 204, 0.5)'
            : isComplete && capacity > 1 ? '0 0 20px rgba(57, 255, 20, 0.4), inset 0 0 15px rgba(57, 255, 20, 0.2)'
              : 'inset 0 -10px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: selected ? 'translateY(-15px)' : 'translateY(0)',
        overflow: 'visible',
        ...getTubeStyle()
      }}
    >
      {/* Cork (Bouchon) when completed */}
      {isComplete && capacity > 1 && (
        <div style={{
          position: 'absolute',
          top: -4, left: -4, right: -4, // Slight overlap to fit the tube
          height: '18px',
          background: 'linear-gradient(to right, #D2B48C, #8B4513, #D2B48C)',
          borderBottom: '2px solid rgba(0,0,0,0.5)',
          borderRadius: '5px 5px 2px 2px',
          zIndex: 15,
          boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.5)',
          animation: 'corkSlam 0.6s cubic-bezier(0.25, 1.5, 0.5, 1) forwards',
          transformOrigin: 'bottom center'
        }} />
      )}

      {/* Glossy highlight on the tube */}
      <div style={{
        position: 'absolute',
        top: 0, left: '5px',
        width: '10px', height: '100%',
        background: 'linear-gradient(to right, rgba(255,255,255,0.4), transparent)',
        borderRadius: '0 0 0 25px',
        pointerEvents: 'none'
      }} />

      {/* Shine sweep overlay on select */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.3) 100%)',
          animation: 'shineSweep 1.2s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 20,
          borderRadius: 'inherit'
        }} />
      )}

      {/* Shockwave ring on bounce */}
      {bouncing && (
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '10px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.6)',
          animation: 'shockwave 0.6s ease-out forwards',
          pointerEvents: 'none',
          zIndex: 0
        }} />
      )}

      {tube.map((ball, i) => {
        const isTop = i === tube.length - 1;
        const colorData = colors[ball];

        const getBallStyle = () => {
          switch (customization?.ball) {
            case 'b1': // Mat
              return { background: colorData.hex, boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3)' };
            case 'b2': // Glossy
              return { background: colorData.grad, boxShadow: 'inset 5px 5px 15px rgba(255,255,255,0.8), inset -5px -5px 15px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.4)' };
            case 'b3': // Glitter
              return { backgroundColor: colorData.hex, backgroundImage: 'radial-gradient(white 10%, transparent 20%), radial-gradient(white 10%, transparent 20%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px', boxShadow: '0 0 10px rgba(255,255,255,0.5)' };
            case 'b4': // Bonbon
              return { background: `repeating-linear-gradient(45deg, ${colorData.hex}, ${colorData.hex} 10px, rgba(255,255,255,0.8) 10px, rgba(255,255,255,0.8) 20px)`, boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.4)' };
            case 'b5': // Sucette
              return { background: `repeating-conic-gradient(from 0deg, ${colorData.hex} 0deg 20deg, #FFFFFF 20deg 40deg)`, boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.5)' };
            case 'b6': // Coeur
              return { borderRadius: '0', background: colorData.hex, maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`, maskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', boxShadow: 'none' };
            case 'b7': // Fleur
              return { borderRadius: '0', background: colorData.hex, maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C9.24 2 7 4.24 7 7c0 .58.1 1.13.29 1.65A4.99 4.99 0 002 12c0 2.76 2.24 5 5 5 .58 0 1.13-.1 1.65-.29A4.99 4.99 0 0012 22c2.76 0 5-2.24 5-5 0-.58-.1-1.13-.29-1.65A4.99 4.99 0 0022 12c0-2.76-2.24-5-5-5-.58 0-1.13.1-1.65.29A4.99 4.99 0 0012 2zm0 13a3 3 0 110-6 3 3 0 010 6z'/%3E%3C/svg%3E")`, maskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C9.24 2 7 4.24 7 7c0 .58.1 1.13.29 1.65A4.99 4.99 0 002 12c0 2.76 2.24 5 5 5 .58 0 1.13-.1 1.65-.29A4.99 4.99 0 0012 22c2.76 0 5-2.24 5-5 0-.58-.1-1.13-.29-1.65A4.99 4.99 0 0022 12c0-2.76-2.24-5-5-5-.58 0-1.13.1-1.65.29A4.99 4.99 0 0012 2zm0 13a3 3 0 110-6 3 3 0 010 6z'/%3E%3C/svg%3E")`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', boxShadow: 'none' };
            case 'b8': // Ourson
              return { borderRadius: '0', background: colorData.hex, maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17.5 2C19.43 2 21 3.57 21 5.5c0 1.34-.76 2.5-1.88 3.1 1.25 1.54 1.88 3.44 1.88 5.4 0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.96.63-3.86 1.88-5.4C5.76 8 5 6.84 5 5.5 5 3.57 6.57 2 8.5 2c1.23 0 2.3.64 2.92 1.6.84-.39 1.77-.6 2.58-.6s1.74.21 2.58.6C17.2 2.64 18.27 2 19.5 2zM12 17c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z'/%3E%3C/svg%3E")`, maskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17.5 2C19.43 2 21 3.57 21 5.5c0 1.34-.76 2.5-1.88 3.1 1.25 1.54 1.88 3.44 1.88 5.4 0 4.42-3.58 8-8 8s-8-3.58-8-8c0-1.96.63-3.86 1.88-5.4C5.76 8 5 6.84 5 5.5 5 3.57 6.57 2 8.5 2c1.23 0 2.3.64 2.92 1.6.84-.39 1.77-.6 2.58-.6s1.74.21 2.58.6C17.2 2.64 18.27 2 19.5 2zM12 17c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z'/%3E%3C/svg%3E")`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', boxShadow: 'none' };
            case 'b9': // Oeuf
              return { borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: colorData.hex, boxShadow: 'inset -3px -5px 10px rgba(0,0,0,0.4)' };
            default:
              return { background: colorData.hex, boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3)' };
          }
        };

        const isMaskedShape = ['b6', 'b7', 'b8'].includes(customization?.ball);

        return (
          <div
            key={i}
            className={isTop && bouncing ? 'bouncing-ball' : isTop && selected ? 'idle-ball' : ''}
            style={{
              width: `${ballSize}px`,
              height: `${ballSize}px`,
              border: "2px outset black",
              borderRadius: '50%',
              zIndex: i + 1,
              position: 'relative',
              transition: 'transform 0.2s',
              transform: isTop && selected ? 'translateY(-30px)' : 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: isMaskedShape ? `drop-shadow(0px 5px 5px ${colorData.hex}88)` : 'none',
              ...getBallStyle()
            }}
          >
            {/* Specular highlight only for non-masked shapes */}
            {!isMaskedShape && (
              <div style={{
                position: 'absolute',
                top: '10%', left: '20%',
                width: '30%', height: '30%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0))',
                borderRadius: '50%'
              }} />
            )}
          </div>
        );
      })}

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: `${(capacity * ballSize) / 2}px`,
            left: '30px',
            width: '8px',
            height: '8px',
            background: p.colorHex,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${p.colorHex}`,
            pointerEvents: 'none',
            animation: 'fadeIn 0.8s ease-out forwards',
            transform: `translate(${p.dx}, ${p.dy})`,
            transition: 'transform 0.8s cubic-bezier(0.1, 0.8, 0.3, 1)'
          }}
        />
      ))}
    </div>
  );
}
