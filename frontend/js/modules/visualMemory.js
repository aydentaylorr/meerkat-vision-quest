/* Visual Memory module: number, letter and word memory, and card match. */
import { ART } from '../art/primitives.js';
import { setRun, view } from '../core/state.js';
import { later } from '../core/timers.js';
import { $, pick, rnd, shuffle } from '../core/utils.js';
import { flashMemoryRounds, gradeT, memConfig } from '../data/difficulty.js';
import { gradeInfo } from '../data/grades.js';
import { finishModule, runModule } from './runner.js';
import { card, toast } from '../ui/cards.js';
import { renderHud } from '../ui/hud.js';

/* flashes `target` in a fixed spot for `flashMs`, then asks the child to type
   what they saw. Shared by Reading's word check and every Visual Memory game. */
function flashTypeRound(opts, onResult){
  const { target, flashMs, title, roundLabel } = opts;
  card(`<div class="ctitle">${title}</div>
    <div class="center cmuted" style="font-size:.92rem">${roundLabel}</div>
    <p class="cmuted center" style="margin:0 0 .3rem">Press Flash, then watch closely.</p>
    <div class="flashbox" id="flashBox"></div>
    <button class="abtn" id="flashBtn" onclick="__doFlash()">Flash</button>`, 'focus');
  window.__doFlash = () => {
    window.__doFlash = () => {};
    const btn = document.getElementById('flashBtn');
    if(btn) btn.disabled = true;
    const box = document.getElementById('flashBox');
    if(box) box.innerHTML = `<div class="cbig">${target}</div>`;
    later(() => {
      if(box) box.innerHTML = '';
      later(() => {
        card(`<div class="ctitle">${title}</div>
          <div class="center cmuted" style="font-size:.92rem">${roundLabel}</div>
          <div class="chead" style="margin:.5rem 0 .6rem">What did you see?</div>
          <input type="text" id="flashInput" class="vinput" autocomplete="off" autocapitalize="off" spellcheck="false" />
          <button class="abtn" onclick="__flashSubmit()">OK</button>`, 'focus');
        const inp = document.getElementById('flashInput');
        if(inp){ inp.focus(); inp.onkeydown = e => { if(e.key === 'Enter') window.__flashSubmit(); }; }
        window.__flashSubmit = () => {
          window.__flashSubmit = () => {};
          const inputEl = document.getElementById('flashInput');
          const typed = (inputEl.value || '').trim();
          const ok = typed.toLowerCase() === String(target).toLowerCase();
          inputEl.disabled = true;
          inputEl.classList.add(ok ? 'right' : 'wrong');
          if(!ok) inputEl.value = String(target);
          document.querySelectorAll('button.abtn').forEach(b => b.disabled = true);
          later(() => onResult({ ok, typed }), ok ? 700 : 1300);
        };
      }, 200);
    }, flashMs);
  };
}

export function openVisualMemoryMenu(grade){
  setRun({ grade, moduleKey:'mem', retryFn:null });
  view.mode = 'intro'; view.msg = null; renderHud();
  card(`<div class="ctitle">Visual Memory</div>
    <div class="chead">Choose a game</div>
    <div class="stack">
      <button class="abtn" onclick="startFlashMemory(${grade},'number')">🔢 Number Memory</button>
      <button class="abtn o" onclick="startFlashMemory(${grade},'lower')">🔡 Small Letter Memory</button>
      <button class="abtn b" onclick="startFlashMemory(${grade},'upper')">🔠 Capital Letter Memory</button>
      <button class="abtn p" onclick="startFlashMemory(${grade},'word')">🔤 Word Memory</button>
      <button class="abtn r" onclick="startCardMatch(${grade})">🃏 Card Match Memory</button>
    </div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="openGrade(${grade})">Back</button>`, 'dock');
}

const FLASH_MEMORY_NAME = { number:'Number Memory', lower:'Small Letter Memory', upper:'Capital Letter Memory', word:'Word Memory' };

function flashMemoryTarget(kind, grade){
  const t = gradeT(grade);
  if(kind === 'number'){
    const digits = Math.round(1 + t * 2);
    let n = ''; for(let i = 0; i < digits; i++) n += String(rnd(10));
    return n;
  }
  if(kind === 'lower' || kind === 'upper'){
    const count = Math.round(1 + t * 2);
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let s = ''; for(let i = 0; i < count; i++) s += letters[rnd(26)];
    return kind === 'upper' ? s.toUpperCase() : s;
  }
  return pick(gradeInfo(grade).words);
}

export function startFlashMemory(grade, kind){
  const rounds = flashMemoryRounds(grade);
  runModule(grade, 'mem', {
    art: ART.wordCard, headline: FLASH_MEMORY_NAME[kind],
    params: `${rounds} rounds · 500ms flash`,
    prompt: 'Press Flash, watch closely, then type what you saw.'
  }, () => playFlashMemory(grade, kind, rounds));
}

function playFlashMemory(grade, kind, rounds){
  let round = 0, correct = 0;
  function next(){
    if(round >= rounds){
      const score = correct / rounds;
      finishModule(grade, 'mem', score, score >= 0.5, `${correct} of ${rounds} correct`);
      return;
    }
    const target = flashMemoryTarget(kind, grade);
    flashTypeRound({ target, flashMs:500, title:FLASH_MEMORY_NAME[kind], roundLabel:`Round ${round + 1} of ${rounds}` }, res => {
      if(res.ok) correct++;
      round++; next();
    });
  }
  next();
}

export function startCardMatch(grade){
  const c = memConfig(grade);
  runModule(grade, 'mem', {
    art: ART.chest, headline: 'Card Match Memory',
    params: `${c.pairs} pairs${c.time ? ' · ' + c.time + 's limit' : ''}`,
    prompt: 'Find the matching pairs.'
  }, () => playCardMatch(grade));
}

function playCardMatch(grade){
  const c = memConfig(grade);
  let deck = [];
  if(c.mode === 'category') shuffle(c.categories).slice(0, c.pairs).forEach((p,k) => deck.push({ k, f:p[0] }, { k, f:p[1] }));
  else shuffle(c.pool).slice(0, c.pairs).forEach((p,k) => deck.push({ k, f:p }, { k, f:p }));
  deck = shuffle(deck).map((d, idx) => Object.assign({ id:idx, up:false, matched:false }, d));

  let up = [], matched = 0, moves = 0, lock = false, reshuffled = false, timeUp = false, left = c.time;
  const rows = Math.ceil(deck.length / c.cols);

  // The board is built once; flips only change the card that was touched, so nothing re-animates.
  card(`<div class="ctitle">${c.label}</div>
    <div class="center cmuted" id="mmStatus"></div>
    <div class="mmgrid" id="mmGrid" style="grid-template-columns:repeat(${c.cols},1fr);max-width:min(100%,calc((100vh - 17rem) * ${c.cols} / ${rows}))">
      ${deck.map((d, i) => `<div class="mmcard" id="mm${i}" onclick="__flip(${i})"></div>`).join('')}
    </div>
    <div class="center cmuted" style="margin-top:.6rem">${c.prompt}</div>`, 'focus');

  const status = () => { const el = $('#mmStatus'); if(el) el.textContent = `${moves} tries${c.time ? ' · ⏳ ' + left + 's' : ''}`; };
  const paint = d => {
    const el = $('#mm' + d.id); if(!el) return;
    el.className = 'mmcard' + (d.matched ? ' matched' : d.up ? ' up' : '');
    el.innerHTML = d.matched || d.up ? d.f : '<span class="back">🐾</span>';
  };
  const grid = $('#mmGrid');
  const fit = () => { const first = $('#mm0'); if(grid && first) grid.style.setProperty('--mfs', (first.clientWidth * 0.58) + 'px'); };
  new ResizeObserver(fit).observe(grid);
  fit(); deck.forEach(paint); status();

  window.__flip = id => {
    if(lock || timeUp) return;
    const d = deck.find(x => x.id === id);
    if(!d || d.up || d.matched) return;
    d.up = true; up.push(d); paint(d);
    if(up.length === 2){
      moves++; status(); lock = true;
      const [x, y] = up;
      if(x.k === y.k){
        later(() => {
          x.matched = y.matched = true; up = []; lock = false; matched++; paint(x); paint(y);
          if(c.reshuffle && !reshuffled && matched === Math.ceil(c.pairs/2) && matched < c.pairs){
            reshuffled = true; toast('The cards shuffle!');
            later(() => {
              const open = deck.filter(z => !z.matched);
              const pos = shuffle(open.map(z => z.id));
              open.forEach((z, n) => { z.id = pos[n]; });
              deck.sort((p, q) => p.id - q.id); deck.forEach(paint);
            }, 700);
          }
          if(matched === c.pairs) end();
        }, 380);
      } else {
        later(() => { x.up = y.up = false; up = []; lock = false; paint(x); paint(y); }, 850);
      }
    }
  };
  function end(){
    const score = (matched / c.pairs) * (c.pairs / Math.max(moves, c.pairs));
    finishModule(grade, 'mem', score, score >= c.pass, `${matched} of ${c.pairs} pairs · ${moves} tries${timeUp ? ' · time ran out' : ''}`);
  }
  if(c.time){
    const tick = () => { left--; status(); if(left <= 0){ timeUp = true; end(); return; } later(tick, 1000); };
    later(tick, 1000);
  }
}
