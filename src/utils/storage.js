const USER_KEY = 'bb_user_v1';
const LB_KEY = 'bb_leaderboard_v1';

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addScore(entry) {
  const lb = getLeaderboard();
  lb.push(entry);
  lb.sort((a,b)=>b.score-a.score);
  // keep top 50
  const out = lb.slice(0,50);
  localStorage.setItem(LB_KEY, JSON.stringify(out));
  return out;
}
