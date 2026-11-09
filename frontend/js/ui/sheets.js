/* Pop-up sheets (rewards, profile, grown-ups) and switching between them. */
import { user, view } from '../core/state.js';
import { parentSheet } from './parentArea.js';
import { profileSheet } from './profile.js';
import { rewardsSheet } from './rewards.js';

export function openSheet(which){ if(!user) return; view.sheet = which; renderSheet(); }
export function closeSheet(){ view.sheet = null; const s = document.getElementById('sheet'); if(s) s.remove(); }
export function setTab(t){ view.tab = t; renderSheet(); }

export function renderSheet(){
  closeSheetNode();
  if(!view.sheet) return;
  const d = document.createElement('div');
  d.id = 'sheet';
  d.onclick = e => { if(e.target === d) closeSheet(); };
  d.innerHTML = `<div class="sheetbox">${view.sheet === 'rewards' ? rewardsSheet() : view.sheet === 'profile' ? profileSheet() : parentSheet()}</div>`;
  document.body.appendChild(d);
}

function closeSheetNode(){ const s = document.getElementById('sheet'); if(s) s.remove(); }
