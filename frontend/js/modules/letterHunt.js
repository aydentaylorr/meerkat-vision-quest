/* Letter Hunt: rows of jumbled letters, read like lines of text. Find a, then b, then c.
   Each next letter sits further along, so the eyes travel left to right and sweep down to the next row. */
import { ART } from '../art/primitives.js';
import { later } from '../core/timers.js';
import { clamp, pick, shuffle } from '../core/utils.js';
import { gLerp } from '../data/difficulty.js';
import { card } from '../ui/cards.js';
import { finishModule, runModule } from './runner.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const config = grade => ({ cols: gLerp(grade, 8, 14), rows: gLerp(grade, 3, 7), letters: gLerp(grade, 5, 12) });

export function start(grade){
  const c = config(grade);
  runModule(grade, 'scan', {
    art: ART.wordCard, headline: 'Letter Hunt', params: `${c.rows} rows · find a to ${ALPHABET[c.letters - 1]}`,
    prompt: 'Find a, then b, then c. Keep moving forward along the rows.'
  }, () => playLetterHunt(grade));
}

function playLetterHunt(grade){
  const c = config(grade), total = c.cols * c.rows;
  // the hunted letters appear once each, in reading order; every other cell uses the rest of the alphabet
  const hunt = ALPHABET.slice(0, c.letters), filler = ALPHABET.slice(c.letters);
  const spots = shuffle([...Array(total).keys()]).slice(0, c.letters).sort((x, y) => x - y);
  const cells = Array.from({ length:total }, (_, i) => spots.includes(i) ? hunt[spots.indexOf(i)] : pick(filler));
  const times = [], wrong = [];
  let found = 0, last = performance.now();

  card(`<div class="ctitle">Letter Hunt</div>
    <div class="chead" style="margin-bottom:.4rem">Find: <span id="huntWant">${hunt[0]}</span></div>
    <div class="mgrid" id="huntGrid" style="grid-template-columns:repeat(${c.cols},1fr);gap:.3rem">
      ${cells.map((ch, i) => `<div class="mcard" style="font-size:1.15rem;border-radius:10px" data-i="${i}" onclick="__huntTap(${i})">${ch}</div>`).join('')}
    </div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="__huntDone()">Done</button>`, 'focus');

  window.__huntTap = i => {
    const el = document.querySelector(`#huntGrid [data-i="${i}"]`);
    if(!el || el.classList.contains('matched')) return;
    if(i === spots[found]){
      el.classList.add('matched');
      times.push(Math.round(performance.now() - last)); last = performance.now();
      found++;
      const want = document.getElementById('huntWant');
      if(want) want.textContent = hunt[found] || '✓';
      if(found >= c.letters) later(finish, 500);
    } else {
      // where the wrong tap was, which letter it landed on, and which letter was being hunted
      if(wrong.length < 30) wrong.push([i, cells[i], hunt[found]]);
      el.classList.add('wrong');
      later(() => el.classList.remove('wrong'), 300);
    }
  };
  window.__huntDone = () => finish();
  function finish(){
    window.__huntTap = () => {}; window.__huntDone = () => {};
    const score = clamp(found / c.letters - wrong.length * 0.03, 0, 1);
    finishModule(grade, 'scan', score, score >= 0.6, `${found} of ${c.letters} letters found · ${wrong.length} wrong tap${wrong.length === 1 ? '' : 's'}`,
      'letterhunt', { cols:c.cols, rows:c.rows, spots, found, ms:times, wrong });
  }
}
