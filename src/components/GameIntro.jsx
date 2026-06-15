import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function GameIntro({ 
    gameName, 
    icon, 
    colors = ['#8A2BE2', '#4B0082', '#DC143C'], 
    particleType = 'default', 
    onComplete 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Background spheres
    gsap.to(".intro-bg-sphere", {
        y: -50,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 1
    });

    // 3D Title
    tl.fromTo(".intro-title", 
        { scale: 0, rotationY: 45, rotationZ: -10, opacity: 1 }, 
        { duration: 0.8, scale: 1, rotationY: 0, rotationZ: 0, ease: "back.out(1.7)" }
    )
    .to(".intro-vortex-green", { duration: 1, rotation: 360, repeat: 1, ease: "none" }, 0)
    .fromTo(".intro-lightning", { opacity: 0 }, { opacity: 1, duration: 0.1, yoyo: true, repeat: 5 }, 0.2)
    .to(".intro-title", { duration: 0.5, scale: 0.2, opacity: 0, ease: "power2.in" }, "+=0.5")
    .to(".intro-vortex-container", { duration: 0.5, scale: 0, opacity: 0, ease: "power2.in" }, "<")
    
    // Logo & Play Button
    .set(".intro-logo-container", { visibility: "visible" })
    .fromTo(".intro-logo-container", 
        { scale: 1.5, opacity: 0 }, 
        { duration: 0.6, scale: 1, opacity: 1, ease: "bounce.out" }
    )
    .set(".intro-btn-play", { visibility: "visible" })
    .fromTo(".intro-btn-play", 
        { y: 200, opacity: 0 }, 
        { duration: 0.6, y: 0, opacity: 1, ease: "back.out(1.5)" }, 
        "-=0.2"
    )
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

      const spawnParticle = () => {
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;

        let p = {
            x: startX,
            y: startY,
            startX: startX,
            startY: startY,
            controlX: startX + (Math.random() - 0.5) * 400,
            controlY: startY - 200 - Math.random() * 300,
            endX: startX + (Math.random() - 0.5) * window.innerWidth,
            endY: window.innerHeight + 100, // Fall down off screen
            t: 0,
            speed: 0.005 + Math.random() * 0.01,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)] || '#00FF00',
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        };
        
        if (particleType === 'water') {
            p.endY = startY - 400 - Math.random() * 300; // Splash up
            p.color = ['#00BFFF', '#87CEFA', '#4169E1', '#E0FFFF'][Math.floor(Math.random()*4)];
            p.size = Math.random() * 8 + 3;
        } else if (particleType === 'neon') {
            p.endX = startX + (Math.random() - 0.5) * 800;
            p.endY = startY + (Math.random() - 0.5) * 800;
        } else if (particleType === 'snake') {
            p.controlX = startX + (Math.random() - 0.5) * 800;
            p.controlY = startY + (Math.random() - 0.5) * 800;
            p.speed = 0.003 + Math.random() * 0.005;
        }

        particles.push(p);
      };

      spawnInterval = setInterval(spawnParticle, 80);

      const ctx = canvas.getContext('2d');
      
      const drawParticle = (p, life) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = life;
          ctx.fillStyle = p.color;

          if (particleType === 'arrows') {
              ctx.beginPath();
              ctx.moveTo(0, -p.size);
              ctx.lineTo(p.size, p.size);
              ctx.lineTo(-p.size, p.size);
              ctx.fill();
          } else if (particleType === 'bricks' || particleType === 'blocks' || particleType === 'tiles') {
              ctx.fillRect(-p.size, -p.size/2, p.size*2, p.size);
              if(particleType === 'tiles' || particleType === 'blocks') {
                  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(-p.size, -p.size/2, p.size*2, p.size);
              }
          } else if (particleType === 'cards') {
              ctx.fillStyle = 'white';
              ctx.fillRect(-p.size, -p.size*1.5, p.size*2, p.size*3);
              ctx.fillStyle = p.color;
              ctx.font = `${p.size}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(["♥","♦","♣","♠"][Math.floor(Math.random()*4)], 0, 0);
          } else if (particleType === 'mines') {
              ctx.beginPath();
              for(let i=0; i<5; i++){
                  ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*p.size, -Math.sin((18+i*72)*Math.PI/180)*p.size);
                  ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*p.size/2, -Math.sin((54+i*72)*Math.PI/180)*p.size/2);
              }
              ctx.closePath();
              ctx.fill();
          } else if (particleType === 'water') {
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI);
              ctx.lineTo(0, -p.size*2);
              ctx.closePath();
              ctx.fill();
          } else { // default, neon, snake, puzzle (circles)
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
              if (particleType === 'neon') {
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = p.color;
              }
          }
          ctx.restore();
      };

      const renderParticles = () => {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.t += p.speed;
            p.rot += p.rotSpeed;
            const u = 1 - p.t;
            p.x = u * u * p.startX + 2 * u * p.t * p.controlX + p.t * p.t * p.endX;
            p.y = u * u * p.startY + 2 * u * p.t * p.controlY + p.t * p.t * p.endY;
            
            const life = 1 - p.t;

            if (life <= 0 || p.t >= 1) {
                particles.splice(i, 1);
                continue;
            }

            drawParticle(p, Math.max(life, 0));
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
  }, [colors, particleType]);

  const mainColor = colors[0] || '#8A2BE2';
  const secColor = colors[1] || '#4B0082';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle at center, #0A0E1A 0%, #000000 100%)',
      zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden', fontFamily: '"Arial", sans-serif', perspective: 1000
    }}>
      <style>{`
        .intro-bg-sphere { position: absolute; border-radius: 50%; filter: blur(20px); opacity: 0.6; z-index: 1; }
        .intro-sphere-1 { width: 150px; height: 150px; background: ${mainColor}; bottom: -50px; left: 20%; }
        .intro-sphere-2 { width: 200px; height: 200px; background: ${secColor}; bottom: -100px; right: 15%; }
        .intro-sphere-3 { width: 120px; height: 120px; background: ${colors[2] || '#DC143C'}; bottom: -30px; left: 60%; }
        .intro-vortex-container { position: absolute; width: 400px; height: 400px; z-index: 5; display: flex; justify-content: center; align-items: center; }
        .intro-vortex-disk { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, ${mainColor}4D 0%, rgba(0,0,0,0) 70%); border: 2px dashed ${mainColor}80; animation: intro-spin 4s linear infinite; }
        @keyframes intro-spin { 100% { transform: rotate(360deg); } }
        .intro-vortex-green { position: absolute; width: 350px; height: 350px; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .intro-orb { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 20px; height: 20px; background: #FFF; border-radius: 50%; box-shadow: 0 0 20px #FFF, 0 0 40px ${mainColor}; }
        .intro-lightning { position: absolute; width: 100%; height: 100%; z-index: 6; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><path d="M200,200 L150,100 L180,90 L120,20" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/><path d="M200,200 L250,300 L220,310 L280,380" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/><path d="M200,200 L300,150 L290,120 L380,80" stroke="%23FFFFFF" stroke-width="3" fill="none" filter="drop-shadow(0 0 5px %23FFFFFF)"/></svg>') center/contain no-repeat; opacity: 0; animation: intro-flash 0.15s infinite alternate; }
        @keyframes intro-flash { 0%, 50% { filter: brightness(1); } 100% { filter: brightness(2) drop-shadow(0 0 10px white); } }
        @keyframes intro-light { 
            0% { text-shadow: 0 0 10px ${mainColor}; } 
            50% { text-shadow: 0 0 30px ${secColor}, 0 0 50px ${mainColor}; } 
            100% { text-shadow: 0 0 10px ${mainColor}; } 
        }
        .intro-title { font-family: '"Arial Black", sans-serif'; font-size: 5rem; font-weight: 900; color: #FFF; position: absolute; text-transform: uppercase; animation: intro-light 2s linear infinite; z-index: 10; text-align: center; }
        .intro-logo-container { position: absolute; font-family: '"Arial Black", sans-serif'; font-size: 3.5rem; font-weight: 900; color: white; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 20; opacity: 0; visibility: hidden; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 5px 15px rgba(0,0,0,0.5); text-align: center; }
        .intro-icon { font-size: 5rem; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5)); }
        .intro-btn-play { position: absolute; bottom: 15%; background: linear-gradient(to bottom, ${mainColor}, ${secColor}); border: 2px solid #FFF; border-radius: 50px; padding: 15px 40px; font-size: 2rem; color: white; font-weight: bold; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 5px 10px rgba(255,255,255,0.4); z-index: 20; opacity: 0; visibility: hidden; text-transform: uppercase; transition: transform 0.2s, filter 0.2s; }
        .intro-btn-play:hover { filter: brightness(1.2); transform: scale(1.05); }
      `}</style>
      <div className="intro-bg-sphere intro-sphere-1" />
      <div className="intro-bg-sphere intro-sphere-2" />
      <div className="intro-bg-sphere intro-sphere-3" />
      <div className="intro-vortex-container">
        <div className="intro-vortex-disk" />
        <div className="intro-vortex-green"><div className="intro-orb" /></div>
        <div className="intro-lightning" />
      </div>
      <div className="intro-title">{gameName.split(' ')[0]}</div>
      <div className="intro-logo-container">
        <div className="intro-icon">{icon}</div>
        <div>{gameName}</div>
      </div>
      <button className="intro-btn-play" onClick={onComplete}>JOUER</button>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }} />
    </div>
  );
}
