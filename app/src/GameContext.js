/* The signed-in player, their saved game and the session: loading, saving, signing in and out. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { api } from './api';
import { expireStreak, normalizeState } from './rules';
import { tokenStore } from './storage';
import { makeTheme } from './theme';

const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);
export const useTheme = () => useContext(GameContext).theme;

const SAVE_DELAY_MS = 600;
const SAVE_RETRY_MS = 5000;

export function GameProvider({ children }) {
  // 'boot' (finding out who is signed in) | 'auth' (sign-in form) | 'play' | 'offline' (server unreachable)
  const [phase, setPhase] = useState('boot');
  const [bootError, setBootError] = useState('');
  const [user, setUser] = useState(null);
  const [game, setGameState] = useState(() => normalizeState(null));
  const [toastMsg, setToastMsg] = useState(null);

  const token = useRef(null);
  const latest = useRef(game);          // the newest state, readable from timers
  const unsaved = useRef(false);
  const saveTimer = useRef(null);
  const session = useRef({ start: 0, breakOffered: false });   // set when a player enters the game

  const toast = useCallback(text => setToastMsg({ text, id: Date.now() }), []);

  const setGame = useCallback(next => { latest.current = next; setGameState(next); }, []);

  const signedOut = useCallback(() => {
    clearTimeout(saveTimer.current); saveTimer.current = null; unsaved.current = false;
    token.current = null; tokenStore.clear().catch(() => {});
    setUser(null); setGame(normalizeState(null)); setPhase('auth');
  }, [setGame]);

  /* Sends the whole state to the server. Resolves true when the server has the newest state. */
  const pushState = useCallback(async function push() {
    clearTimeout(saveTimer.current); saveTimer.current = null;
    if (!token.current) return true;
    const sent = latest.current;
    try {
      await api('PUT', '/api/progress', { state: sent }, token.current);
      if (latest.current === sent) unsaved.current = false;
      else if (!saveTimer.current) saveTimer.current = setTimeout(push, SAVE_DELAY_MS);
      return latest.current === sent;
    } catch (e) {
      if (e.status === 401) { toast('Please sign in again'); signedOut(); }
      else saveTimer.current = setTimeout(push, SAVE_RETRY_MS);
      return false;
    }
  }, [signedOut, toast]);

  const scheduleSave = useCallback(() => {
    unsaved.current = true;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(pushState, SAVE_DELAY_MS);
  }, [pushState]);

  /* Changes the game: `change` receives a copy to modify, and whatever it returns is passed back. */
  const update = useCallback(change => {
    const next = JSON.parse(JSON.stringify(latest.current));
    const result = change(next);
    setGame(next); scheduleSave();
    return result;
  }, [setGame, scheduleSave]);

  const replaceGame = useCallback(next => { setGame(next); scheduleSave(); }, [setGame, scheduleSave]);

  const enter = useCallback(sess => {
    token.current = sess.token;
    tokenStore.set(sess.token).catch(() => {});
    const state = normalizeState(sess.state);
    expireStreak(state);
    session.current = { start: Date.now(), breakOffered: false };
    setUser(sess.user); setGame(state); setPhase('play');
    if (!sess.state) scheduleSave();
  }, [setGame, scheduleSave]);

  const boot = useCallback(async () => {
    const saved = await tokenStore.get().catch(() => null);
    if (!saved) { setPhase('auth'); return; }
    try {
      enter(await api('GET', '/api/me', null, saved));
    } catch (e) {
      if (e.status === 401) { tokenStore.clear().catch(() => {}); setPhase('auth'); }
      else { setBootError(e.message); setPhase('offline'); }
    }
  }, [enter]);

  useEffect(() => { boot(); }, [boot]);
  const retryBoot = useCallback(() => { setPhase('boot'); boot(); }, [boot]);

  /* The session clock behind the grown-ups' break reminder. */
  const sessionMinutes = useCallback(() => (Date.now() - session.current.start) / 60000, []);
  /* Minutes played if it is time to suggest an eye break (asked once per session), otherwise 0. */
  const breakDue = useCallback(() => {
    const mins = sessionMinutes();
    if (session.current.breakOffered || mins < latest.current.settings.sessionCap) return 0;
    session.current.breakOffered = true;
    return Math.round(mins);
  }, [sessionMinutes]);
  const offerBreakAgain = useCallback(() => { session.current.breakOffered = false; }, []);
  const restartSession = useCallback(() => { session.current = { start: Date.now(), breakOffered: false }; }, []);

  // leaving the app is the last chance to save
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => { if (state !== 'active' && unsaved.current) pushState(); });
    return () => sub.remove();
  }, [pushState]);

  /* Both reject with { message } for the form to show. */
  const login = useCallback(async (username, password) => enter(await api('POST', '/api/auth/login', { username, password })), [enter]);
  const register = useCallback(async (username, password, start_grade) =>
    enter(await api('POST', '/api/auth/register', { username, password, start_grade })), [enter]);

  const logout = useCallback(async () => {
    if (unsaved.current && !(await pushState())) {
      toast('Couldn’t save your progress yet. Check your connection and try again.');
      return;
    }
    if (!token.current) return;
    try { await api('POST', '/api/auth/logout', null, token.current); } catch { /* signing out locally is enough */ }
    signedOut();
  }, [pushState, signedOut, toast]);

  const saveStartGrade = useCallback(async start_grade => {
    try { setUser(await api('PATCH', '/api/me', { start_grade }, token.current)); }
    catch (e) { if (e.status === 401) signedOut(); throw e; }
  }, [signedOut]);

  const theme = useMemo(() => makeTheme(game.settings), [game.settings]);

  const value = useMemo(() => ({
    phase, bootError, user, game, theme, toastMsg,
    retryBoot, login, register, logout, saveStartGrade, update, replaceGame, toast,
    sessionMinutes, breakDue, offerBreakAgain, restartSession,
  }), [phase, bootError, user, game, theme, toastMsg, retryBoot, login, register, logout, saveStartGrade, update, replaceGame, toast,
    sessionMinutes, breakDue, offerBreakAgain, restartSession]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
