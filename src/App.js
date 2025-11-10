import React, { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import { getUser, clearUser } from './utils/storage';

function App() {
  const [user, setUser] = useState(getUser());
  const [view, setView] = useState('game'); // 'game' | 'leaderboard'

  useEffect(() => {
    setUser(getUser());
  }, []);

  if (!user) {
    return (
      <div className="App root-center">
        <Login onLogin={() => setUser(getUser())} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="brand">Block Blast</div>
        <nav className="nav">
          <button className={view === 'game' ? 'active' : ''} onClick={() => setView('game')}>Play</button>
          <button className={view === 'leaderboard' ? 'active' : ''} onClick={() => setView('leaderboard')}>Leaderboard</button>
        </nav>
        <div className="user">
          <span className="user-name">{user.name}</span>
          <button className="signout" onClick={() => { clearUser(); setUser(null); }}>Sign out</button>
        </div>
      </header>

      <main className="main-area">
        {view === 'game' && <Game user={user} />}
        {view === 'leaderboard' && <Leaderboard currentUser={user} />}
      </main>

      <footer className="app-footer">Made with ❤️ — simple local leaderboard (localStorage)</footer>
    </div>
  );
}

export default App;
