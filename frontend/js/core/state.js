/* The saved game state and the current session (who is signed in, which exercise is running). */
import { store } from './utils.js';

const DEFAULT_STATE = {
  gradeProgress: {}, gems: 0, owned: [], equipped: { hat:null, item:null },
  streak: { count:0, last:null, freezes:2 },
  log: [],
  settings: { fs:1, contrast:false, reduceMotion:false, sessionCap:15 }
};

export function normalizeState(raw){
  const s = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), raw || {});
  s.settings = Object.assign({}, DEFAULT_STATE.settings, s.settings || {});
  s.streak   = Object.assign({}, DEFAULT_STATE.streak, s.streak || {});
  s.equipped = Object.assign({}, DEFAULT_STATE.equipped, s.equipped || {});
  s.gradeProgress = s.gradeProgress || {};
  return s;
}

export let game = normalizeState(null);
export function setGame(value){ game = value; }
export let view = { mode:'map', tab:'progress', sheet:null };
export let run = null;
export function setRun(value){ run = value; }
export let session = { start: Date.now(), capShown:false };
export function setSession(value){ session = value; }
export const TOKEN_KEY = 'mvq.token';
export let token = store.read(TOKEN_KEY, null);
export function setToken(value){ token = value; }
export let user = null;
export function setUser(value){ user = value; }
