/* The grown-ups area: progress, settings and about. */
import { save } from '../core/api.js';
import { currentGrade, gradeModulesDoneCount } from '../core/progress.js';
import { game, normalizeState, session, setGame, setSession, view } from '../core/state.js';
import { clamp, dayKey, rnd } from '../core/utils.js';
import { GRADES_COUNT } from '../data/grades.js';
import { MODULE_KEYS, MODULE_META } from '../data/modules.js';
import { applySettings, toast } from './cards.js';
import { renderHud } from './hud.js';
import { toMap } from './map.js';
import { closeSheet, renderSheet } from './sheets.js';

export function parentSheet(){
  const tabs = [['progress','Progress'],['settings','Settings'],['about','About & safety']]
    .map(([k,l]) => `<button class="tab ${view.tab === k ? 'on' : ''}" onclick="setTab('${k}')">${l}</button>`).join('');
  const body = { progress:tabProgress, settings:tabSettings, about:tabAbout }[view.tab]();
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
      <h2 class="sh" style="margin:0">For grown-ups</h2>
      <button class="tab" onclick="closeSheet()">Close</button></div>
    <p class="cmuted" style="margin:.2rem 0">In a real build this would sit behind a parent gate.</p>
    <div class="tabs">${tabs}</div>${body}`;
}

function tabProgress(){
  const byModule = MODULE_KEYS.map(k => {
    const rows = game.log.filter(l => l.module === k);
    return { k, avg: rows.length ? Math.round(rows.reduce((s,l) => s + l.score, 0)/rows.length) : 0, n:rows.length };
  });
  const recent = game.log.slice(-12).reverse();
  const days = [...new Set(game.log.map(l => l.day))].length;
  const modulesDone = [...Array(GRADES_COUNT)].reduce((s,_,i) => s + gradeModulesDoneCount(i+1), 0);
  return `<div class="statgrid" style="margin-bottom:1rem">
      <div><span class="cmuted">Modules done</span><b>${modulesDone} / ${GRADES_COUNT * 4}</b></div>
      <div><span class="cmuted">Grade</span><b>${currentGrade()} / ${GRADES_COUNT}</b></div>
      <div><span class="cmuted">Days practised</span><b>${days}</b></div>
      <div><span class="cmuted">Streak</span><b>🔥 ${game.streak.count}</b></div></div>
    <h2 class="sh">Average accuracy by skill</h2>
    ${game.log.length ? `<div class="bars">${byModule.map(b => `<div class="b" style="height:${Math.max(b.avg,2)}%"><span>${MODULE_META[b.k].name} ${b.avg}%</span></div>`).join('')}</div>
      <div style="height:1.6rem"></div>` : '<p class="cmuted">No sessions yet.</p>'}
    <h2 class="sh">Recent exercises</h2>
    ${recent.length ? `<table><tr><th>When</th><th>Grade</th><th>Module</th><th>Score</th></tr>
      ${recent.map(l => `<tr><td>${new Date(l.ts).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
        <td>Grade ${l.grade}</td><td>${MODULE_META[l.module].name}</td>
        <td><b style="color:${l.pass ? 'var(--green-d)' : 'var(--red-d)'}">${l.score}%</b></td></tr>`).join('')}</table>`
      : '<p class="cmuted">No sessions yet.</p>'}`;
}

function tabSettings(){
  const sw = (label, key, note) => `<div class="toggle"><div><b>${label}</b>${note ? `<div class="cmuted">${note}</div>` : ''}</div>
    <button class="switch ${game.settings[key] ? 'on' : ''}" onclick="toggleSetting('${key}')"><i></i></button></div>`;
  return `<h2 class="sh">Display</h2>
    <div class="toggle"><div><b>Text size</b><div class="cmuted">Currently ${Math.round(game.settings.fs*100)}%</div></div>
      <div style="display:flex;gap:.4rem"><button class="tab" onclick="fontStep(-1)">A−</button><button class="tab" onclick="fontStep(1)">A+</button></div></div>
    ${sw('High contrast','contrast','Darker cards and stronger text contrast')}
    ${sw('Reduce motion','reduceMotion','Turns off bobbing and pop animations')}
    <h2 class="sh" style="margin-top:1rem">Session limits</h2>
    <p class="cmuted" style="margin-top:0">Break reminder after a set amount of screen time. An eye-health app should cap sessions, not reward long ones.</p>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">
      ${[10,15,20,30].map(m => `<button class="tab ${game.settings.sessionCap === m ? 'on' : ''}" onclick="setCap(${m})">${m} min</button>`).join('')}</div>
    <p class="cmuted">This session so far: ${Math.round((Date.now() - session.start)/60000)} min</p>
    <h2 class="sh" style="margin-top:1rem">Demo tools</h2>
    <div class="stack">
      <button class="abtn ghost sm" onclick="unlockAll()">Unlock all adventures (for previewing)</button>
      <button class="abtn ghost sm" onclick="seedDemo()">Add sample progress data</button>
      <button class="abtn r sm" onclick="resetAll()">Reset everything</button></div>`;
}

function tabAbout(){
  return `<div class="notice"><b>This is a prototype, not a medical device.</b> No claim is made that it improves vision.
    Exercise design, difficulty tiers and pass thresholds need review by a pediatric optometrist or vision therapist before any release.</div>
    <h2 class="sh" style="margin-top:.8rem">What each module trains</h2>
    ${MODULE_KEYS.map(k => `<div class="srow"><div><b>${MODULE_META[k].name}</b><div class="cmuted">${MODULE_META[k].clinical}</div></div></div>`).join('')}
    <h2 class="sh" style="margin-top:.8rem">Open questions for the developer</h2>
    <ol class="cmuted" style="padding-left:1.1rem;line-height:1.8">
      <li>Target age range — does content and difficulty vary by age as well as level?</li>
      <li>Companion to professional therapy, or standalone? This decides what claims are allowed.</li>
      <li>Convergence/divergence: Focus Trek is a safe stand-in only.</li>
      <li>Launch platforms — web only, or mobile wrappers too?</li>
      <li>COPPA / GDPR-K: account model, storage and analytics designed in from day one.</li></ol>
    <p class="cmuted">Progress is saved to this player’s account on the game server. Accounts use a username and password only — no email address and no analytics.</p>`;
}

export function toggleSetting(k){ game.settings[k] = !game.settings[k]; save(); applySettings(); renderSheet(); }
export function fontStep(d){ game.settings.fs = clamp(+(game.settings.fs + d*0.1).toFixed(2), 0.85, 1.4); save(); applySettings(); renderSheet(); }
export function setCap(m){ game.settings.sessionCap = m; session.capShown = false; save(); renderSheet(); }

export function unlockAll(){
  for(let g = 1; g < GRADES_COUNT; g++){
    game.gradeProgress[g] = Object.fromEntries(MODULE_KEYS.map(k => [k, true]));
  }
  save(); closeSheet(); toMap(); toast('Unlocked through the final grade');
}

export function resetAll(){ if(!confirm('Reset all progress for this account? This cannot be undone.')) return; setGame(normalizeState(null)); save(); setSession({ start:Date.now(), capShown:false }); closeSheet(); applySettings(); toMap(); }

export function seedDemo(){
  const now = Date.now();
  const grade = currentGrade();
  for(let d = 9; d >= 1; d--){
    MODULE_KEYS.forEach(k => {
      const base = 55 + (9-d)*3 + rnd(14);
      game.log.push({ ts: now - d*86400000, day: dayKey(new Date(now - d*86400000)), grade, module:k,
        score: Math.min(base, 99), pass: base >= 65 });
    });
  }
  game.streak.count = Math.max(game.streak.count, 6);
  save(); renderHud(); renderSheet(); toast('Sample data added');
}
