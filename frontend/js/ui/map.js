/* The map screen and choosing a grade and module. */
import { LOCATIONS } from '../art/scenes.js';
import { currentGrade, gradeFullyDone, gradeModulesDoneCount, isGradeUnlocked, moduleDone } from '../core/progress.js';
import { setRun, user, view } from '../core/state.js';
import { clearTimers } from '../core/timers.js';
import { $, esc } from '../core/utils.js';
import { BUILD } from '../core/version.js';
import { GRADES_COUNT, gradeInfo } from '../data/grades.js';
import { MODULE_META } from '../data/modules.js';
import { closeExit } from '../modules/runner.js';
import { card, night, toast } from './cards.js';
import { renderHud } from './hud.js';
import { currentScene, renderWorld, travel } from './world.js';

export function toMap(){
  closeExit(); clearTimers(); setRun(null); view.mode = 'map'; view.msg = null;
  night(false); $('#fx').className = ''; $('#fx').innerHTML = '';
  renderHud();
  if(currentScene === 'map'){ renderWorld(); mapCard(); }
  else travel('map', () => { renderHud(); mapCard(); });
}

export function mapCard(){
  const all = gradeFullyDone(GRADES_COUNT);
  const grade = currentGrade();
  const gi = gradeInfo(grade);
  card(`<div class="center cmuted" style="font-weight:800">Hi, ${esc(user.username)}!</div>
    <div class="ctitle">${all ? 'The desert is quiet' : `Grade ${grade}`}</div>
    <div class="chead">${all ? 'Every trail explored' : gi.title}</div>
    <div class="center cmuted" style="margin-bottom:.5rem">${all ? 'You’ve completed all 12 grades!' : `${gradeModulesDoneCount(grade)} of 4 modules done`}</div>
    ${all ? '' : `<button class="abtn" onclick="openGrade(${grade})">Enter</button>`}
    <button class="abtn ghost sm" style="margin-top:.55rem" onclick="openSheet('parent')">For grown-ups</button>
    <div class="cmuted center" style="font-size:.7rem;margin-top:.5rem">Version ${esc(BUILD)}</div>`,
    'dock');
}

export function tapNode(id){
  if(!user) return;
  const l = LOCATIONS.find(x => x.id === id);
  if(!l) return;
  if(!isGradeUnlocked(l.adv)){ toast('Finish the previous grade before this one!'); return; }
  openGrade(l.adv);
}

export function openGrade(grade){
  if(!user) return;
  if(!isGradeUnlocked(grade)){ toast('Finish the previous grade before this one!'); return; }
  view.mode = 'moduleselect'; view.msg = null;
  renderHud();
  moduleSelectCard(grade);
}

function moduleSelectCard(grade){
  const gi = gradeInfo(grade);
  const btn = (key, onclick) => {
    const meta = MODULE_META[key];
    const done = moduleDone(grade, key);
    return `<button class="abtn ${done ? '' : 'o'}" style="margin-bottom:.5rem" onclick="${onclick}">
      ${meta.icon} ${meta.name}${done ? ' ✅' : ''}</button>`;
  };
  card(`<div class="ctitle">${gi.title}</div>
    <div class="chead">Choose a module</div>
    <div class="center cmuted" style="margin-bottom:.6rem">${gradeModulesDoneCount(grade)} of 4 done this grade</div>
    <div class="stack">
      ${btn('read', `startReading(${grade})`)}
      ${btn('mem',  `openVisualMemoryMenu(${grade})`)}
      ${btn('scan', `openScanningMenu(${grade})`)}
      ${btn('eye',  `openEyeMenu(${grade})`)}
    </div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="toMap()">Back to the map</button>`,
    'dock');
}
