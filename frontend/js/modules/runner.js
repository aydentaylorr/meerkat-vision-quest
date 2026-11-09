/* Runs any module: intro, countdown, results, exit, and break reminders. */
import { meerkatSVG } from '../art/meerkat.js';
import { ART } from '../art/primitives.js';
import { save } from '../core/api.js';
import { bumpStreak, gradeFullyDone } from '../core/progress.js';
import { game, run, session, setRun, view } from '../core/state.js';
import { clearTimers, later } from '../core/timers.js';
import { $, clamp, dayKey, pct, pick } from '../core/utils.js';
import { cosmetic } from '../data/cosmetics.js';
import { gradeInfo, gradeReward } from '../data/grades.js';
import { MODULE_META } from '../data/modules.js';
import { card, night } from '../ui/cards.js';
import { renderHud } from '../ui/hud.js';
import { travel } from '../ui/world.js';

function startModuleRun(grade, moduleKey){
  if(checkSessionCap()) return true;
  clearTimers();
  setRun({ grade, moduleKey, retryFn:null });
  view.msg = null;
  night(false); $('#fx').className = ''; $('#fx').innerHTML = '';
  renderHud();
  return false;
}

/* opts: { art, headline, params, prompt, extraHtml } */
export function runModule(grade, moduleKey, opts, playFn){
  if(startModuleRun(grade, moduleKey)) return;
  run.retryFn = () => runModule(grade, moduleKey, opts, playFn);
  const gi = gradeInfo(grade);
  const meta = MODULE_META[moduleKey];
  travel(gi.scene, () => {
    renderHud();
    view.mode = 'intro';
    card(`<div class="ctitle">${meta.name}</div>
      <div style="width:${opts.artWidth || '34%'};margin:.3rem auto">${opts.art || ''}</div>
      <div class="chead">${opts.headline || meta.name}</div>
      <div class="center cmuted">${meta.clinical}</div>
      <div class="center cmuted" style="margin:.45rem 0 .7rem"><b>${opts.params || ''}</b></div>
      <button class="abtn" onclick="__moduleReady()">I’m ready</button>
      ${opts.extraHtml || ''}`, 'dock');
    window.__moduleReady = () => {
      window.__moduleReady = () => {};
      countdownThen(meta.name, opts.prompt || '', () => { view.mode = 'play'; playFn(); });
    };
  });
}

function countdownThen(label, prompt, fn){
  let n = 3;
  card(`<div class="ctitle">${label}</div>
    <div class="cbig" id="cdNum" style="font-size:6rem;color:var(--orange)">3</div>
    <div class="cmuted center">${prompt}</div>`, 'focus');
  const tick = () => {
    n--;
    if(n < 0){ fn(); return; }
    const el = $('#cdNum'); if(el) el.textContent = n > 0 ? n : 'GO!';
    later(tick, 700);
  };
  later(tick, 700);
}

export function finishModule(grade, moduleKey, score, pass, detailText){
  clearTimers(); night(false);
  $('#fx').className = ''; $('#fx').innerHTML = '';
  score = clamp(score, 0, 1);
  game.log.push({ ts:Date.now(), day:dayKey(), grade, module:moduleKey, score:Math.round(score*100), pass });
  if(game.log.length > 400) game.log = game.log.slice(-400);

  let note = null, newlyDone = false, gradeCompleteNow = false, reward = null, gemsWon = 0;
  if(pass){
    note = bumpStreak();
    if(!game.gradeProgress[grade]) game.gradeProgress[grade] = {};
    if(!game.gradeProgress[grade][moduleKey]){ game.gradeProgress[grade][moduleKey] = true; newlyDone = true; }
    gemsWon = 5 + grade;
    game.gems += gemsWon;
    if(newlyDone && gradeFullyDone(grade)){
      gradeCompleteNow = true;
      const rw = gradeReward(grade);
      game.gems += rw.gems;
      if(!game.owned.includes(rw.cosmetic)){
        game.owned.push(rw.cosmetic);
        const cos = cosmetic(rw.cosmetic);
        if(cos && !game.equipped[cos.slot]) game.equipped[cos.slot] = cos.id;
        reward = cos;
      }
    }
  }
  save();
  view.mode = 'results'; view.msg = null; renderHud();
  const meta = MODULE_META[moduleKey];
  card(`<div class="ctitle">${meta.name}</div>
    <div style="width:32%;margin:.2rem auto">${meerkatSVG()}</div>
    <div class="chead">${pass ? pick(['Great looking!','Sharp eyes!','You got it!','Well spotted!']) : 'Good try!'}</div>
    <div class="cbig" style="color:${pass ? 'var(--green-d)' : 'var(--red-d)'}">${pct(score)}</div>
    <div class="center cmuted">${detailText}</div>
    ${pass ? `<div class="center" style="margin:.5rem 0;font-weight:900">+${gemsWon} 💎 &nbsp; 🔥 ${game.streak.count} day${game.streak.count === 1 ? '' : 's'}</div>` : ''}
    ${gradeCompleteNow ? `<div class="notice"><b>Grade complete!</b> All 4 modules done — the next grade is unlocked!${reward ? ` New reward: ${reward.em} ${reward.name}.` : ''}</div>` : ''}
    ${note === 'freeze' ? `<div class="hintbar">🧊 <div>You missed a day, so a streak freeze was used. ${game.streak.freezes} left.</div></div>` : ''}
    <div class="stack" style="margin-top:.6rem">
      ${!pass ? `<button class="abtn o" onclick="retryModule()">Try again</button>` : ''}
      <button class="abtn ${pass ? '' : 'ghost sm'}" onclick="openGrade(${grade})">Back to modules</button>
      <button class="abtn ghost sm" onclick="toMap()">Back to the map</button>
    </div>`, 'focus', true);
}

export function retryModule(){ if(run && run.retryFn) run.retryFn(); }

/* a dialog laid over the exercise; "Keep playing" just closes it */
export function confirmQuit(){
  if(document.getElementById('exitdlg')) return;
  const d = document.createElement('div');
  d.id = 'exitdlg';
  d.onclick = e => { if(e.target === d) closeExit(); };
  d.innerHTML = `<div class="sheetbox" style="max-width:420px">
    <div class="ctitle">Exit</div>
    <div class="chead">Leave this exercise?</div>
    <p class="cmuted center">Your progress in this exercise won’t be saved, but you can come back and play any time.</p>
    <div class="stack">
      <button class="abtn" onclick="closeExit()">Keep playing</button>
      <button class="abtn o" onclick="closeExit(); toMap()">Exit to the map</button>
      <button class="abtn ghost sm" onclick="closeExit(); logout()">Log out</button></div></div>`;
  document.body.appendChild(d);
}

export function closeExit(){ const d = document.getElementById('exitdlg'); if(d) d.remove(); }

function checkSessionCap(){
  const mins = (Date.now() - session.start)/60000;
  if(!session.capShown && mins >= game.settings.sessionCap){
    session.capShown = true;
    card(`<div class="ctitle">Eye break</div>
      <div style="width:30%;margin:.3rem auto">${ART.drop}</div>
      <div class="chead">Time to look far away</div>
      <p class="cmuted center">You’ve been playing for ${Math.round(mins)} minutes. Rest your eyes on something distant, then come back.</p>
      <div class="stack"><button class="abtn" onclick="toMap()">Take a break</button>
      <button class="abtn ghost sm" onclick="mapCard()">Keep going</button></div>`, 'focus');
    return true;
  }
  return false;
}
