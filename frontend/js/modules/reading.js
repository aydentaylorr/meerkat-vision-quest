/* Reading module: read the story twice, answer questions, word check. */
import { ARROW_DOWN, ARROW_UP } from '../art/icons.js';
import { ART } from '../art/primitives.js';
import { view } from '../core/state.js';
import { later } from '../core/timers.js';
import { clamp, pick, shuffle } from '../core/utils.js';
import { readConfig } from '../data/difficulty.js';
import { finishModule, runModule } from './runner.js';
import { BTN_COLOURS, card } from '../ui/cards.js';

/* reveals `text` as a moving "block" — only the current chunk of `chunkSize`
   words is visible at a time (everything before and after it is hidden),
   advancing through the passage at the given `wpm`. */
function revealChunksInto(elId, text, wpm, chunkSize, onDone){
  const words = text.split(' ');
  const el = document.getElementById(elId);
  if(el) el.innerHTML = words.map(w => `<span class="pw">${w}</span>`).join(' ');
  const intervalMs = Math.max(60000 / wpm, 90) * chunkSize;
  let i = 0;
  const tick = () => {
    const els = document.querySelectorAll('#' + elId + ' .pw');
    els.forEach(s => s.classList.remove('active'));
    for(let k = i; k < Math.min(i + chunkSize, els.length); k++) els[k].classList.add('active');
    i += chunkSize;
    if(i < els.length) later(tick, intervalMs);
    else later(() => {
      document.querySelectorAll('#' + elId + ' .pw').forEach(s => s.classList.remove('active'));
      onDone && onDone();
    }, intervalMs);
  };
  tick();
}

export function startReading(grade){
  const c = readConfig(grade);
  runModule(grade, 'read', {
    art: ART.wordCard, headline: 'Reading',
    params: `read the story twice · ${c.questions.length} questions · ${c.vocab.rounds} word check`,
    prompt: 'A story to read, twice, then a quick word check.',
    extraHtml: `<div class="hintbar">📖 <div><b>Take your time.</b> Read the story once, then read it again at your own pace, answer 5 questions, then a quick word check.</div></div>`
  }, () => playReading(grade));
}

/* Reading: read the story once normally (timed), read it again as a moving block at the child's
   own pace, answer five questions, then a flash-and-type word check. */
function playReading(grade){
  const c = readConfig(grade);
  const vocabRounds = Array.from({ length: c.vocab.rounds }, () => ({ target: pick(c.vocab.pool) }));
  let vi = 0, vocabCorrect = 0, qi = 0, compCorrect = 0;
  let measuredWpm = 0, practiceWpm = 0;
  const head = extra => `<div class="ctitle">${c.label}</div>
    <div class="center cmuted" style="font-size:.92rem">Word check ${Math.min(vi+1, c.vocab.rounds)} of ${c.vocab.rounds}</div>${extra}`;

  function vocabNext(){
    if(vi >= c.vocab.rounds){
      const score = (vocabCorrect / c.vocab.rounds) * 0.5 + (compCorrect / c.questions.length) * 0.5;
      const detailText = `read at ${measuredWpm} wpm, practiced at ${practiceWpm} wpm · ${compCorrect} of ${c.questions.length} questions · ${vocabCorrect} of ${c.vocab.rounds} word check`;
      finishModule(grade, 'read', score, score >= c.pass, detailText);
      return;
    }
    const r = vocabRounds[vi];
    card(head(`<p class="cmuted center" style="margin:0 0 .3rem">Press Flash, then watch closely.</p>
      <div class="flashbox" id="flashBox"></div>
      <button class="abtn" id="flashBtn" onclick="__doFlash()">Flash</button>`), 'focus');
    window.__doFlash = () => {
      window.__doFlash = () => {};
      const btn = document.getElementById('flashBtn');
      if(btn) btn.disabled = true;
      const box = document.getElementById('flashBox');
      if(box) box.innerHTML = `<div class="cbig">${r.target.toUpperCase()}</div>`;
      later(() => {
        if(box) box.innerHTML = '';
        later(() => vocabAsk(r), 200);
      }, c.vocab.flash);
    };
  }

  function vocabAsk(r){
    card(head(`<div class="chead" style="margin:.5rem 0 .6rem">What did you see?</div>
      <input type="text" id="vocabInput" class="vinput" autocomplete="off" autocapitalize="off" spellcheck="false" />
      <button class="abtn" onclick="__vocabSubmit()">OK</button>`), 'focus');
    const inp = document.getElementById('vocabInput');
    if(inp){
      inp.focus();
      inp.onkeydown = e => { if(e.key === 'Enter') window.__vocabSubmit(); };
    }
    window.__vocabSubmit = () => {
      window.__vocabSubmit = () => {};
      const inputEl = document.getElementById('vocabInput');
      const val = (inputEl.value || '').trim().toLowerCase();
      const ok = val === r.target.toLowerCase();
      if(ok) vocabCorrect++;
      inputEl.disabled = true;
      inputEl.classList.add(ok ? 'right' : 'wrong');
      if(!ok) inputEl.value = r.target.toUpperCase();
      document.querySelectorAll('button.abtn').forEach(b => b.disabled = true);
      later(() => { vi++; vocabNext(); }, ok ? 700 : 1300);
    };
  }

  function startPassage(){
    card(`<div class="ctitle">${c.label}</div>
      <div class="chead">Read the story</div>
      <p class="cbody">${c.passage}</p>
      <button class="abtn" onclick="__firstReadDone()">I’ve read it!</button>`, 'dock');
    const t0 = performance.now();
    window.__firstReadDone = () => {
      window.__firstReadDone = () => {};
      const seconds = (performance.now() - t0) / 1000;
      const wordCount = c.passage.split(' ').length;
      measuredWpm = clamp(Math.round((wordCount / Math.max(seconds, 1)) * 60), 20, 400);
      practiceWpm = measuredWpm;
      showSpeedScreen();
    };
  }

  function showSpeedScreen(){
    card(`<div class="ctitle">${c.label}</div>
      <div class="chead">Nice reading!</div>
      <p class="cmuted center">You read that at about <b>${measuredWpm} words per minute</b>.</p>
      <p class="cmuted center">Now read it again — the words will appear at your practice pace. Want to go faster?</p>
      <div style="display:flex;align-items:center;justify-content:center;gap:1.1rem;margin:.7rem 0">
        <div class="chead" style="margin:0" id="speedVal">${practiceWpm} wpm</div>
        <div class="spinner">
          <button class="arrowbtn" aria-label="Faster" title="Faster" onpointerdown="__speedHold(10)" onpointerup="__speedStop()" onpointerleave="__speedStop()" onpointercancel="__speedStop()" onclick="if(event.detail===0)__speedStep(10)">${ARROW_UP}</button>
          <button class="arrowbtn" aria-label="Slower" title="Slower" onpointerdown="__speedHold(-10)" onpointerup="__speedStop()" onpointerleave="__speedStop()" onpointercancel="__speedStop()" onclick="if(event.detail===0)__speedStep(-10)">${ARROW_DOWN}</button>
        </div>
      </div>
      <button class="abtn" onclick="__startSecondRead()">Read it again</button>`, 'focus');
    window.__speedStep = d => {
      practiceWpm = clamp(practiceWpm + d, 20, 400);
      const el = document.getElementById('speedVal');
      if(el) el.textContent = practiceWpm + ' wpm';
    };
    let speedTimer = null;
    window.__speedStop = () => { clearTimeout(speedTimer); clearInterval(speedTimer); speedTimer = null; };
    window.__speedHold = d => {
      window.__speedStop(); window.__speedStep(d);
      speedTimer = setTimeout(() => { speedTimer = setInterval(() => window.__speedStep(d), 90); }, 350);
    };
    window.__startSecondRead = () => {
      window.__speedStop(); window.__speedStep = () => {}; window.__speedHold = () => {}; window.__startSecondRead = () => {};
      startSecondRead();
    };
  }

  function startSecondRead(){
    card(`<div class="ctitle">${c.label}</div>
      <div class="chead">Read along</div>
      <p class="cbody" id="readText2"></p>`, 'dock');
    revealChunksInto('readText2', c.passage, practiceWpm, c.chunkSize, () => {
      later(askComprehension, 400);
    });
  }

  function askComprehension(){
    if(qi >= c.questions.length){ vocabNext(); return; }
    const cq = c.questions[qi];
    const opts = shuffle(cq.options);
    view.mode = 'quiz';
    card(`<div class="ctitle">Quick check</div>
      <div class="center cmuted" style="font-size:.92rem">Question ${qi + 1} of ${c.questions.length}</div>
      <div class="chead">${cq.q}</div>
      <div class="stack" id="quizOpts">${opts.map((o,k) =>
        `<button class="abtn ${BTN_COLOURS[k % BTN_COLOURS.length]}" id="qopt${k}" onclick="__quizPick(${k})">${o}</button>`).join('')}</div>`, 'focus');
    window.__quizPick = k => {
      window.__quizPick = () => {};
      const chosen = opts[k];
      const ok = chosen === cq.answer;
      if(ok) compCorrect++;
      document.querySelectorAll('#quizOpts .abtn').forEach(b => b.disabled = true);
      document.getElementById('qopt' + k).classList.add(ok ? 'right' : 'wrong');
      if(!ok){
        const el = document.getElementById('qopt' + opts.indexOf(cq.answer));
        if(el) el.classList.add('right');
      }
      later(() => { qi++; askComprehension(); }, ok ? 700 : 1300);
    };
  }

  startPassage();
}
