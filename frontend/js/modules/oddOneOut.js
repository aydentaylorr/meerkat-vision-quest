/* Odd One Out: a grid of one character with a single lookalike hidden in it. Tap the different one.
   Answers are taps, so letter mix-ups show up without typing or spelling getting in the way. */
import { ART } from '../art/primitives.js';
import { later } from '../core/timers.js';
import { pick, rnd, shuffle } from '../core/utils.js';
import { gLerp } from '../data/difficulty.js';
import { card } from '../ui/cards.js';
import { finishModule, runModule } from './runner.js';

/* pairs that are easy to mistake for each other */
const LOOKALIKES = ['bd', 'pq', 'bp', 'dq', 'mn', 'nu', 'mw', 'il', 'hn', 'ft', 'ce', 'vy', '69', '25', '38', '17'];

const config = grade => ({ rounds: gLerp(grade, 6, 10), cols: gLerp(grade, 3, 6), rows: gLerp(grade, 2, 4) });

export function start(grade){
  const c = config(grade);
  runModule(grade, 'scan', {
    art: ART.wordCard, headline: 'Odd One Out', params: `${c.rounds} rounds · ${c.cols * c.rows} in each`,
    prompt: 'One of them is different. Tap it.'
  }, () => playOddOneOut(grade));
}

function playOddOneOut(grade){
  const c = config(grade), total = c.cols * c.rows, answers = [];
  let round = 0, correct = 0;
  function next(){
    if(round >= c.rounds){
      const score = correct / c.rounds;
      finishModule(grade, 'scan', score, score >= 0.6, `${correct} of ${c.rounds} found`,
        'oddone', { cols:c.cols, rows:c.rows, rounds:answers });
      return;
    }
    const [same, odd] = shuffle(pick(LOOKALIKES).split(''));
    const at = rnd(total), t0 = performance.now();
    card(`<div class="ctitle">Odd One Out</div>
      <div class="center cmuted" style="font-size:.92rem">Round ${round + 1} of ${c.rounds}</div>
      <div class="chead" style="margin-bottom:.4rem">Tap the different one</div>
      <div class="mgrid" id="oddGrid" style="grid-template-columns:repeat(${c.cols},1fr);max-width:${c.cols * 5}rem;margin-inline:auto">
        ${Array.from({ length:total }, (_, i) => `<div class="mcard" style="font-size:2rem" onclick="__oddTap(${i})">${i === at ? odd : same}</div>`).join('')}
      </div>`, 'focus');
    window.__oddTap = i => {
      window.__oddTap = () => {};
      const ok = i === at;
      if(ok) correct++;
      // each round: the repeated character, the odd one, where it was, where the child tapped, how long it took
      answers.push([same, odd, at, i, Math.round(performance.now() - t0)]);
      const cells = document.querySelectorAll('#oddGrid .mcard');
      cells[at].classList.add('matched');
      if(!ok) cells[i].classList.add('wrong');
      later(() => { round++; next(); }, ok ? 600 : 1200);
    };
  }
  next();
}
