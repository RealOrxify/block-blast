import React, { useState } from 'react';
import { setUser } from '../utils/storage';

export default function Login({ onLogin }) {
  const [name, setName] = useState('');

  function handleLogin() {
    const trimmed = (name || '').trim();
    if (!trimmed) return alert('Please enter a display name');
    setUser({ name: trimmed });
    onLogin && onLogin();
  }

  return (
    <div className="login">
      <h2>Welcome to BlockBlast</h2>
      <p>High-score local leaderboard. Enter a display name to get started.</p>
      <label>Display name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your gamer name" />
      <div className="actions">
        <button className="btn primary" onClick={handleLogin}>Start</button>
        <button className="btn ghost" onClick={() => { setName('Guest' + Math.floor(Math.random()*999)); }}>Random</button>
      </div>
    </div>
  );
}
