/* The player profile sheet. */
import { meerkatSVG } from '../art/meerkat.js';
import { api } from '../core/api.js';
import { currentGrade, gradeModulesDoneCount } from '../core/progress.js';
import { game, setUser, user, view } from '../core/state.js';
import { $, esc } from '../core/utils.js';
import { BUILD } from '../core/version.js';
import { GRADES_COUNT } from '../data/grades.js';
import { gradeOptions, signedOut } from './auth.js';
import { renderHud } from './hud.js';
import { mapCard } from './map.js';
import { renderSheet } from './sheets.js';
import { renderWorld } from './world.js';

export function profileSheet(){
  const modulesDone = [...Array(GRADES_COUNT)].reduce((n, _, i) => n + gradeModulesDoneCount(i + 1), 0);
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <h2 class="sh" style="margin:0">My profile</h2>
      <button class="tab" onclick="closeSheet()">Close</button></div>
    <div style="width:84px;margin:.4rem auto 0">${meerkatSVG()}</div>
    <div class="center chead" style="margin:0">${esc(user.username)}</div>
    <div class="center cmuted">joined ${esc(user.created_at.slice(0, 10))}</div>
    <div class="statgrid" style="margin:1rem 0;justify-content:center;text-align:center">
      <div><span class="cmuted">Grade</span><b>${currentGrade()} / ${GRADES_COUNT}</b></div>
      <div><span class="cmuted">Modules done</span><b>${modulesDone} / ${GRADES_COUNT * 4}</b></div>
      <div><span class="cmuted">Streak</span><b>🔥 ${game.streak.count}</b></div>
      <div><span class="cmuted">Gems</span><b>💎 ${game.gems}</b></div></div>
    <h2 class="sh">Starting grade</h2>
    <select class="vinput" id="profGrade" aria-label="Starting grade">${gradeOptions(user.start_grade)}</select>
    <div class="autherr" id="profMsg"></div>
    <div class="stack">
      <button class="abtn" onclick="saveProfile()">Save grade</button>
      <button class="abtn ghost sm" onclick="logout()">Log out</button></div>
    <div class="cmuted center" style="font-size:.72rem;margin-top:.8rem">Game version ${esc(BUILD)}</div>`;
}

export async function saveProfile(){
  const msg = (t, ok) => { const e = $('#profMsg'); if(e){ e.textContent = t; e.style.color = ok ? 'var(--green-d)' : ''; } };
  try{
    setUser(await api('PATCH', '/api/me', { start_grade:parseInt($('#profGrade').value, 10) }));
    renderSheet(); msg('Saved!', true);
    renderHud(); if(view.mode === 'map'){ renderWorld(); mapCard(); }
  }catch(e){
    if(e.status === 401){ signedOut(); return; }
    msg(e.message);
  }
}
