/* Scanning module: tracking and symbol search. */
import { ART } from '../art/primitives.js';
import { setRun, view } from '../core/state.js';
import { later } from '../core/timers.js';
import { clamp, pick, shuffle } from '../core/utils.js';
import { symbolSearchConfig, trackingConfig } from '../data/difficulty.js';
import { ELEMENT_META, elementPool } from '../data/words.js';
import { finishModule, runModule } from './runner.js';
import { BTN_COLOURS, card } from '../ui/cards.js';
import { renderHud } from '../ui/hud.js';

export function openScanningMenu(grade){
  setRun({ grade, moduleKey:'scan', retryFn:null });
  view.mode = 'intro'; view.msg = null; renderHud();
  card(`<div class="ctitle">Scanning</div>
    <div class="chead">Choose a game</div>
    <div class="stack">
      <button class="abtn" onclick="openElementMenu(${grade},'tracking')">🧮 Tracking</button>
      <button class="abtn o" onclick="openElementMenu(${grade},'symbol')">🔍 Symbol Search</button>
    </div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="openGrade(${grade})">Back</button>`, 'dock');
}

export function openElementMenu(grade, subMode){
  view.mode = 'intro';
  const items = ELEMENT_META.map((e,i) =>
    `<button class="abtn ${BTN_COLOURS[i % BTN_COLOURS.length]}" style="margin-bottom:.4rem" onclick="startScanning(${grade},'${subMode}','${e.key}')">${e.label}</button>`).join('');
  card(`<div class="ctitle">${subMode === 'tracking' ? 'Tracking' : 'Symbol Search'}</div>
    <div class="chead">Choose an element</div>
    <div class="stack">${items}</div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="openScanningMenu(${grade})">Back</button>`, 'dock');
}

export function startScanning(grade, subMode, elementKey){
  const label = ELEMENT_META.find(e => e.key === elementKey).label;
  if(subMode === 'tracking'){
    const c = trackingConfig(grade);
    runModule(grade, 'scan', {
      art: ART.wordCard, headline: 'Tracking', params: `${label} · ${c.seqLen} items in a row`,
      prompt: `Silently count how many times you see the target ${label.toLowerCase()}.`
    }, () => playTracking(grade, elementKey));
  } else {
    const c = symbolSearchConfig(grade);
    runModule(grade, 'scan', {
      art: ART.wordCard, headline: 'Symbol Search', params: `${label} · ${c.cols * c.rows} cells to search`,
      prompt: `Find every matching ${label.toLowerCase()} in the grid.`
    }, () => playSymbolSearch(grade, elementKey));
  }
}

function playTracking(grade, elementKey){
  const pool = elementPool(elementKey);
  const cfg = trackingConfig(grade);
  const target = pick(pool.items);
  const seq = [];
  for(let i = 0; i < cfg.targetCount; i++) seq.push(target);
  while(seq.length < cfg.seqLen) seq.push(pick(pool.items));
  const finalSeq = shuffle(seq);
  const actualCount = finalSeq.filter(x => x === target).length;

  card(`<div class="ctitle">Tracking</div>
    <div class="chead">Count the target</div>
    <p class="cmuted center" style="font-size:1.3rem;font-weight:800">${target}</p>
    <p class="cmuted center">Watch closely and silently count how many times it appears.</p>
    <div class="flashbox" id="trackBox"></div>
    <button class="abtn" id="trackStartBtn" onclick="__trackStart()">Start</button>`, 'focus');

  window.__trackStart = () => {
    window.__trackStart = () => {};
    const btn = document.getElementById('trackStartBtn');
    if(btn){ btn.disabled = true; btn.textContent = 'Watching…'; }
    let i = 0;
    const box = document.getElementById('trackBox');
    function tick(){
      if(i >= finalSeq.length){ later(askTrackingCount, 200); return; }
      if(box) box.innerHTML = `<div class="cbig">${finalSeq[i]}</div>`;
      i++;
      later(() => { if(box) box.innerHTML = ''; later(tick, 120); }, cfg.itemMs);
    }
    tick();
  };

  function askTrackingCount(){
    card(`<div class="ctitle">Tracking</div>
      <div class="chead">How many times did you see it?</div>
      <p class="cmuted center" style="font-size:1.3rem;font-weight:800">${target}</p>
      <input type="text" inputmode="numeric" id="trackInput" class="vinput" autocomplete="off" />
      <button class="abtn" onclick="__trackSubmit()">OK</button>`, 'focus');
    const inp = document.getElementById('trackInput');
    if(inp){ inp.focus(); inp.onkeydown = e => { if(e.key === 'Enter') window.__trackSubmit(); }; }
    window.__trackSubmit = () => {
      window.__trackSubmit = () => {};
      const typed = parseInt((document.getElementById('trackInput').value || '').trim(), 10);
      const ok = Number.isFinite(typed);
      const diff = ok ? Math.abs(typed - actualCount) : actualCount;
      const score = clamp(1 - diff / Math.max(actualCount, 1), 0, 1);
      finishModule(grade, 'scan', score, score >= 0.6, `You said ${ok ? typed : '—'} · it appeared ${actualCount} time${actualCount === 1 ? '' : 's'}`);
    };
  }
}

function playSymbolSearch(grade, elementKey){
  const pool = elementPool(elementKey);
  const cfg = symbolSearchConfig(grade);
  const target = pick(pool.items);
  const total = cfg.cols * cfg.rows;
  const cells = [];
  for(let i = 0; i < cfg.targetCount; i++) cells.push(target);
  while(cells.length < total) cells.push(pick(pool.items));
  const grid = shuffle(cells);
  const totalTargets = grid.filter(x => x === target).length;
  let found = 0, wrong = 0;
  const smallText = pool.kind === 'word';

  function draw(){
    card(`<div class="ctitle">Symbol Search</div>
      <div class="center cmuted" id="foundCount" style="font-size:.92rem">Found ${found} of ${totalTargets}</div>
      <div class="chead" style="margin-bottom:.4rem">Find: ${target}</div>
      <div class="mgrid" id="searchGrid" style="grid-template-columns:repeat(${cfg.cols},1fr)">
        ${grid.map((item,i) => `<div class="mcard" style="font-size:${smallText ? '.62rem' : '1.15rem'}" data-i="${i}" onclick="__searchClick(${i})">${item}</div>`).join('')}
      </div>
      <button class="abtn ghost sm" style="margin-top:.6rem" onclick="__searchDone()">Done</button>`, 'focus');
  }
  draw();

  window.__searchClick = i => {
    const cellEl = document.querySelector(`#searchGrid [data-i="${i}"]`);
    if(!cellEl || cellEl.classList.contains('matched')) return;
    if(grid[i] === target){
      cellEl.classList.add('matched'); cellEl.onclick = null;
      found++;
      const fc = document.getElementById('foundCount');
      if(fc) fc.textContent = `Found ${found} of ${totalTargets}`;
      if(found >= totalTargets) later(finishSearch, 500);
    } else {
      wrong++;
      cellEl.classList.add('wrong');
      later(() => cellEl.classList.remove('wrong'), 300);
    }
  };
  window.__searchDone = () => finishSearch();
  function finishSearch(){
    window.__searchClick = () => {}; window.__searchDone = () => {};
    const score = clamp(found / totalTargets - wrong * 0.03, 0, 1);
    finishModule(grade, 'scan', score, score >= 0.6, `${found} of ${totalTargets} found · ${wrong} wrong tap${wrong === 1 ? '' : 's'}`);
  }
}
