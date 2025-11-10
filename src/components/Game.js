import React, { useEffect, useRef, useState } from 'react';
import { addScore } from '../utils/storage';

const COLORS = ['#ffd166', '#06d6a0', '#4cc9f0', '#ef476f', '#8e54e9', '#ffb86b'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function Game({ user }) {
  const [blocks, setBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [running, setRunning] = useState(true);
  const spawnRef = useRef(null);
  const idRef = useRef(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    startSpawn();
    return () => stopSpawn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    // speed up spawn as score grows
    stopSpawn();
    startSpawn(Math.max(350, 1000 - Math.floor(score/6)));
    return () => stopSpawn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, running]);

  function startSpawn(interval = 900) {
    spawnRef.current = setInterval(() => {
      spawnBlock();
    }, interval);
  }

  function stopSpawn() {
    if (spawnRef.current) {
      clearInterval(spawnRef.current);
      spawnRef.current = null;
    }
  }

  function spawnBlock() {
    const id = idRef.current++;
    const left = rand(8, 92); // pct
    const w = rand(48, 84);
    const color = COLORS[Math.floor(Math.random()*COLORS.length)];
    const duration = (rand(4200, 8500) - Math.min(3000, score*6));
    const b = { id, left, w, color, duration };
    setBlocks(prev => [...prev, b]);
  }

  function handleMissed(id) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setLives(l => {
      const nl = l - 1;
      if (nl <= 0) endGame();
      return nl;
    });
  }

  function handleHit(id, e) {
    // explode visual
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width/2;
    const y = rect.top + rect.height/2;
    burstParticles(x, y, e.currentTarget.parentElement);

    setBlocks(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setScore(s => s + 10);
    // remove after animation
    setTimeout(() => setBlocks(prev => prev.filter(b => b.id !== id)), 260);
  }

  function endGame() {
    stopSpawn();
    setRunning(false);
    // submit score to leaderboard
    addScore({ name: user.name, score, date: new Date().toISOString() });
  }

  function restart() {
    setBlocks([]);
    setScore(0);
    setLives(5);
    idRef.current = 1;
    setRunning(true);
    startSpawn(800);
  }

  function burstParticles(x, y, container) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const cx = x - rect.left;
    const cy = y - rect.top;

    const particles = [];
    for (let i=0;i<18;i++) {
      particles.push({ x:cx, y:cy, vx:(Math.random()-0.5)*6, vy:(Math.random()-0.7)*6, life:Math.random()*600+300, r:Math.random()*3+2, color: COLORS[Math.floor(Math.random()*COLORS.length)] });
    }

    let last = performance.now();
    function frame(now) {
      const dt = now - last; last = now;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let p of particles) {
        p.x += p.vx * (dt/16);
        p.y += p.vy * (dt/16);
        p.vy += 0.14 * (dt/16);
        p.life -= dt;
        if (p.life > 0) {
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life/800));
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fill();
        }
      }
      // remove dead
      const alive = particles.some(p => p.life>0);
      if (alive) requestAnimationFrame(frame);
      else ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    requestAnimationFrame(frame);
  }

  useEffect(() => {
    // resize canvas
    const canvas = canvasRef.current;
    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr,dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="game-wrap">
      <div className="hud">
        <div>Score: <strong>{score}</strong></div>
        <div>Lives: <strong>{lives}</strong></div>
        <div style={{opacity:0.9}}>Player: <strong>{user.name}</strong></div>
      </div>
      <div className="play-area" role="application">
        <canvas className="particle-canvas" ref={canvasRef} />
        {blocks.map(b => (
          <div
            key={b.id}
            className={"block" + (b.popped ? ' pop' : '')}
            onAnimationEnd={() => { if (!b.popped) handleMissed(b.id); }}
            onClick={(e)=>{ if (!b.popped && running) handleHit(b.id, e); }}
            style={{ left: `${b.left}%`, width: b.w + 'px', background: b.color, animation: `fall ${Math.max(1800, b.duration)}ms linear` }}
            title="Blast"
          >
            {/* optional label */}
          </div>
        ))}
        {!running && (
          <div style={{position:'absolute',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'rgba(3,6,12,0.6)',padding:20,borderRadius:12}}>
              <h3>Game Over</h3>
              <p>Your score: <strong>{score}</strong></p>
              <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                <button className="btn primary" onClick={restart}>Play again</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
