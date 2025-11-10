import React from 'react';
import { getLeaderboard } from '../utils/storage';

export default function Leaderboard({ currentUser }) {
  const lb = getLeaderboard();

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <table className="lb-table">
        <thead>
          <tr><th>#</th><th>Player</th><th>Score</th><th>Date</th></tr>
        </thead>
        <tbody>
          {lb.length === 0 && (
            <tr><td colSpan={4}>No scores yet — play to add your name!</td></tr>
          )}
          {lb.map((r,i)=> (
            <tr key={i} className={r.name === currentUser.name ? 'you' : ''}>
              <td>{i+1}</td>
              <td>{r.name}</td>
              <td>{r.score}</td>
              <td>{new Date(r.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
