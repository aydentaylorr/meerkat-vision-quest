/* The always-visible bar: streak, progress, gems and the exit and profile buttons. */
import { EXIT_ICON, PROFILE_ICON } from '../art/icons.js';
import { ART } from '../art/primitives.js';
import { currentGrade, gradeFullyDone, gradeModulesDoneCount } from '../core/progress.js';
import { game, run, user, view } from '../core/state.js';
import { $ } from '../core/utils.js';
import { GRADES_COUNT } from '../data/grades.js';
import { MODULE_META } from '../data/modules.js';

export function renderHud(){
  if(!user){ $('#hud').innerHTML = ''; return; }
  let ringsHtml;
  if(run){
    const meta = MODULE_META[run.moduleKey];
    ringsHtml = `<div style="display:flex;flex-direction:column;align-items:center;line-height:1.15;padding:.1rem .4rem">
      <b style="font-size:.92rem;white-space:nowrap">${meta.icon} ${meta.name}</b>
      <span class="cmuted" style="font-size:.66rem;white-space:nowrap">Grade ${run.grade}</span></div>`;
  } else if(gradeFullyDone(GRADES_COUNT)){
    ringsHtml = `<div style="display:flex;flex-direction:column;align-items:center;line-height:1.15;padding:.1rem .4rem">
      <b style="font-size:.92rem;white-space:nowrap">All done! 🎉</b>
      <span class="cmuted" style="font-size:.66rem;white-space:nowrap">12 / 12 grades</span></div>`;
  } else {
    const grade = currentGrade();
    ringsHtml = `<div style="display:flex;flex-direction:column;align-items:center;line-height:1.15;padding:.1rem .4rem">
      <b style="font-size:.92rem;white-space:nowrap">Grade ${grade}</b>
      <span class="cmuted" style="font-size:.66rem;white-space:nowrap">${gradeModulesDoneCount(grade)} / 4 modules</span></div>`;
  }
  $('#hud').innerHTML = `
    <div id="streak" class="shadowbox">${ART.flame}
      <div class="n">${game.streak.count}<small>DAY STREAK</small></div></div>
    <div id="rings" class="shadowbox" title="${run ? 'Current module' : 'Your progress'}">${ringsHtml}</div>
    <div id="topright" class="shadowbox" onclick="openSheet('rewards')">
      ${ART.coin}<b>${game.gems}</b>${ART.chest}</div>
    <button id="gearbtn" class="cornerbtn shadowbox" title="For grown-ups" onclick="openSheet('parent')">⚙️</button>
    <button id="profbtn" class="cornerbtn shadowbox" title="My profile" onclick="openSheet('profile')">${PROFILE_ICON}</button>
    ${run ? `<button id="homebtn" class="cornerbtn exitbtn shadowbox" title="Exit" onclick="confirmQuit()">${EXIT_ICON}Exit</button>` : ''}
    ${view.msg ? `<div id="hudmsg" class="shadowbox">${view.msg}</div>` : ''}`;
}
