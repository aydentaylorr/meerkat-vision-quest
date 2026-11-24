/* Sequence Recall: pictures flash one at a time, then the child taps them in the order they appeared.
   No keyboard, so it plays the same on a phone, a tablet and a computer. */
import { ART } from '../art/primitives.js';
import { later } from '../core/timers.js';
import { shuffle } from '../core/utils.js';
import { gLerp } from '../data/difficulty.js';
import { MEMORY_ICON_POOL } from '../data/words.js';
import { card } from '../ui/cards.js';
import { finishModule, runModule } from './runner.js';

const SHORTEST = 2, LONGEST = 9;

const config = grade => ({ rounds: 5, start: gLerp(grade, 2, 4), itemMs: gLerp(grade, 900, 600) });

export function start(grade){
  const c = config(grade);
  runModule(grade, 'mem', {
    art: ART.chest, headline: 'Sequence Recall', params: `${c.rounds} rounds · starts with ${c.start} pictures`,
    prompt: 'Watch the pictures, then tap them in the same order.'
  }, () => playSequenceRecall(grade));
}

function playSequenceRecall(grade){
  const c = config(grade), answers = [];
  let round = 0, correct = 0, len = c.start, best = 0;
  const head = `<div class="ctitle">Sequence Recall</div>`;
  const label = () => `<div class="center cmuted" style="font-size:.92rem">Round ${round + 1} of ${c.rounds}</div>`;

  function next(){
    if(round >= c.rounds){
      const score = correct / c.rounds;
      // the sequence grows after each right answer, so most children miss some rounds: two right is a pass
      finishModule(grade, 'mem', score, score >= 0.4, `${correct} of ${c.rounds} right · longest remembered: ${best}`,
        'sequence', { rounds:answers, span:best });
      return;
    }
    const seq = shuffle(MEMORY_ICON_POOL).slice(0, len);
    card(`${head}${label()}
      <p class="cmuted center" style="margin:0 0 .3rem">Watch the pictures.</p>
      <div class="flashbox" id="seqBox"></div>`, 'focus');
    let i = 0;
    const show = () => {
      const box = document.getElementById('seqBox');
      if(i >= seq.length){ later(() => ask(seq), 300); return; }
      if(box) box.innerHTML = `<div class="cbig">${seq[i]}</div>`;
      i++;
      later(() => { if(box) box.innerHTML = ''; later(show, 200); }, c.itemMs);
    };
    later(show, 500);
  }

  function ask(seq){
    const extras = shuffle(MEMORY_ICON_POOL.filter(x => !seq.includes(x))).slice(0, 2);
    const choices = shuffle(seq.concat(extras)), tapped = [];
    card(`${head}${label()}
      <div class="chead" style="margin-bottom:.4rem" id="seqMsg">Tap them in order</div>
      <div class="mgrid" id="seqGrid" style="grid-template-columns:repeat(${Math.min(choices.length, 4)},1fr);max-width:20rem;margin-inline:auto">
        ${choices.map((x, k) => `<div class="mcard up" style="font-size:2rem" onclick="__seqTap(${k})">${x}</div>`).join('')}
      </div>`, 'focus');
    window.__seqTap = k => {
      const el = document.querySelectorAll('#seqGrid .mcard')[k];
      if(!el || el.style.opacity) return;
      el.style.opacity = .4;
      tapped.push(choices[k]);
      if(tapped.length < seq.length) return;
      window.__seqTap = () => {};
      const ok = tapped.every((x, n) => x === seq[n]);
      // each round: what was shown, what was tapped, and whether the order matched
      answers.push([seq, tapped, ok]);
      if(ok){ correct++; best = Math.max(best, len); len = Math.min(len + 1, LONGEST); }
      else len = Math.max(len - 1, SHORTEST);
      const msg = document.getElementById('seqMsg');
      if(msg) msg.textContent = ok ? 'Right order!' : `It was ${seq.join(' ')}`;
      later(() => { round++; next(); }, ok ? 700 : 1800);
    };
  }
  next();
}
