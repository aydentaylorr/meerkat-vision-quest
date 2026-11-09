/* Signing in, creating an account and starting a session. */
import { meerkatSVG } from '../art/meerkat.js';
import { api, cancelPendingSave, pushState, save, saveTimer } from '../core/api.js';
import { TOKEN_KEY, game, normalizeState, setGame, setRun, setSession, setToken, setUser, token, user, view } from '../core/state.js';
import { clearTimers } from '../core/timers.js';
import { $, dayKey, daysBetween, esc, store } from '../core/utils.js';
import { BUILD } from '../core/version.js';
import { GRADES_COUNT } from '../data/grades.js';
import { closeExit } from '../modules/runner.js';
import { applySettings, card, clearCard, night, toast } from './cards.js';
import { renderHud } from './hud.js';
import { toMap } from './map.js';
import { closeSheet } from './sheets.js';
import { setScene } from './world.js';

let authForm = { mode:'login', username:'', grade:'', busy:false };

export const gradeOptions = (sel, placeholder) =>
  (placeholder ? `<option value="" ${sel ? '' : 'selected'} disabled>${placeholder}</option>` : '') +
  Array.from({ length:GRADES_COUNT }, (_, i) => `<option value="${i + 1}" ${+sel === i + 1 ? 'selected' : ''}>Grade ${i + 1}</option>`).join('');

function authCard(msg){
  const reg = authForm.mode === 'register';
  card(`<div style="width:26%;margin:0 auto">${meerkatSVG()}</div>
    <div class="ctitle">Meerkat Vision Quest</div>
    <div class="chead">${reg ? 'Make your account' : 'Welcome back!'}</div>
    <div class="tabs" style="justify-content:center;margin:.2rem 0">
      <button class="tab ${reg ? '' : 'on'}" onclick="authMode('login')">Log in</button>
      <button class="tab ${reg ? 'on' : ''}" onclick="authMode('register')">Create account</button></div>
    <input class="vinput" id="auUser" placeholder="Username" maxlength="20" autocomplete="username" autocapitalize="off" spellcheck="false" value="${esc(authForm.username)}">
    <input class="vinput" id="auPass" type="password" placeholder="Password" maxlength="128" autocomplete="${reg ? 'new-password' : 'current-password'}">
    ${reg ? `<select class="vinput" id="auGrade" aria-label="What grade are you in?">${gradeOptions(authForm.grade, 'What grade are you in?')}</select>
      <div class="cmuted center" style="font-size:.8rem">Tip: use a fun nickname instead of your real name, and ask a grown-up to help.</div>` : ''}
    <div class="autherr" id="auErr">${esc(msg || '')}</div>
    <button class="abtn" id="auGo" onclick="authSubmit()">${reg ? 'Create my account' : 'Log in'}</button>
    <div class="cmuted center" style="font-size:.7rem;margin-top:.5rem">Version ${esc(BUILD)}</div>`, 'focus');
  document.querySelectorAll('#auUser, #auPass').forEach(el => {
    el.onkeydown = e => { if(e.key === 'Enter') authSubmit(); };
  });
  const first = $('#auUser'); if(first) first.focus();
}

export function authMode(m){
  const u = $('#auUser'), g = $('#auGrade');
  if(u) authForm.username = u.value;
  if(g) authForm.grade = g.value;
  authForm.mode = m; authCard();
}

export async function authSubmit(){
  if(authForm.busy) return;
  const reg = authForm.mode === 'register';
  const username = $('#auUser').value.trim().toLowerCase();
  const grade = reg ? parseInt($('#auGrade').value, 10) : 0;
  const password = $('#auPass').value;
  authForm.username = username; authForm.grade = grade || '';
  const fail = t => { const e = $('#auErr'); if(e) e.textContent = t; };
  if(!/^[a-z0-9_]{3,20}$/.test(username)) return fail('Username: 3 to 20 letters, numbers or _ (no spaces)');
  if(!password) return fail('Please type your password');
  if(reg && password.length < 6) return fail('Password needs at least 6 characters');
  if(reg && !(grade >= 1 && grade <= GRADES_COUNT)) return fail('Please choose the grade you are in');
  authForm.busy = true; fail('');
  const go = $('#auGo'); if(go) go.disabled = true;
  try{
    const sess = await api('POST', reg ? '/api/auth/register' : '/api/auth/login',
      reg ? { username, password, start_grade:grade } : { username, password });
    setToken(sess.token); store.write(TOKEN_KEY, token);
    authForm.busy = false;
    enterGame(sess);
  }catch(e){
    authForm.busy = false;
    fail(e.message);
    const g = $('#auGo'); if(g) g.disabled = false;
  }
}

function enterGame(sess){
  setUser(sess.user);
  setGame(normalizeState(sess.state));
  if(game.streak.last && daysBetween(game.streak.last, dayKey()) > 2) game.streak.count = 0;
  setSession({ start: Date.now(), capShown:false });
  applySettings();
  toMap();
  if(!sess.state) save();
}

export function signedOut(){
  closeExit();
  cancelPendingSave();
  setToken(null); setUser(null); store.remove(TOKEN_KEY);
  setGame(normalizeState(null)); setRun(null); clearTimers(); night(false); clearCard();
  $('#fx').className = ''; $('#fx').innerHTML = '';
  closeSheet(); view.mode = 'map'; view.msg = null;
  authForm = { mode:'login', username:'', grade:'', busy:false };
  applySettings(); setScene('map'); renderHud(); authCard();
}

export async function logout(){
  if(saveTimer) await pushState();
  if(!user) return;
  if(saveTimer){ toast('Couldn’t save your progress yet — check your connection and try again'); return; }
  try{ await api('POST', '/api/auth/logout'); }catch(e){}
  signedOut();
}

export async function boot(){
  if(!token){ authCard(); return; }
  card(`<div class="chead">Loading your adventure…</div>`, 'focus');
  try{ enterGame(await api('GET', '/api/me')); }
  catch(e){
    if(e.status === 401){ setToken(null); store.remove(TOKEN_KEY); authCard(); }
    else card(`<div class="chead">Hmm, we can’t reach the game</div>
      <p class="cmuted center">${esc(e.message)}</p>
      <button class="abtn" onclick="boot()">Try again</button>`, 'focus');
  }
}
