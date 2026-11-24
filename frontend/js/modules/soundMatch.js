/* Sound Match: the game says a word out loud and the child picks what they heard.
   Early grades pick the letter the word starts with; later grades pick the written word.
   The browser does the speaking, so there are no recordings to ship. */
import { ART } from '../art/primitives.js';
import { later } from '../core/timers.js';
import { shuffle } from '../core/utils.js';
import { gLerp, gradeT } from '../data/difficulty.js';
import { gradeInfo } from '../data/grades.js';
import { BTN_COLOURS, card, toast } from '../ui/cards.js';
import { finishModule, runModule } from './runner.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const config = grade => ({ rounds: gLerp(grade, 6, 10), letters: gradeT(grade) < 0.3 });

function say(word){
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en'; u.rate = 0.8;
  speechSynthesis.speak(u);
}

export function start(grade){
  if(!('speechSynthesis' in window)){ toast('This device can’t say words out loud'); return; }
  const c = config(grade);
  runModule(grade, 'read', {
    art: ART.wordCard, headline: 'Sound Match',
    params: `${c.rounds} rounds · ${c.letters ? 'pick the first letter' : 'pick the word'}`,
    prompt: 'Listen to the word, then pick what you heard.',
    extraHtml: `<div class="hintbar">🔊 <div><b>Turn the sound on.</b> Nomi says each word out loud.</div></div>`
  }, () => playSoundMatch(grade));
}

function playSoundMatch(grade){
  const c = config(grade), words = shuffle(gradeInfo(grade).words), answers = [];
  let round = 0, correct = 0;
  function next(){
    if(round >= c.rounds){
      speechSynthesis.cancel();
      const score = correct / c.rounds;
      finishModule(grade, 'read', score, score >= 0.6, `${correct} of ${c.rounds} correct`,
        'sound', { mode: c.letters ? 'letter' : 'word', rounds:answers });
      return;
    }
    const word = words[round % words.length];
    const answer = c.letters ? word[0] : word;
    // ponytail: wrong options are random letters or words from this grade; use rhymes and lookalikes once there is a curated list
    const others = shuffle((c.letters ? ALPHABET : words).filter(x => x !== answer)).slice(0, 3);
    const opts = shuffle([answer, ...others]);
    let replays = 0;
    card(`<div class="ctitle">Sound Match</div>
      <div class="center cmuted" style="font-size:.92rem">Round ${round + 1} of ${c.rounds}</div>
      <div class="chead">${c.letters ? 'Which letter does it start with?' : 'Which word did you hear?'}</div>
      <button class="abtn ghost sm" style="margin-bottom:.6rem" onclick="__soundSay()">🔊 Hear it again</button>
      <div class="stack" id="soundOpts">${opts.map((o, k) =>
        `<button class="abtn ${BTN_COLOURS[k % BTN_COLOURS.length]}" id="sopt${k}" onclick="__soundPick(${k})">${o}</button>`).join('')}</div>`, 'focus');
    window.__soundSay = () => { replays++; say(word); };
    say(word);
    window.__soundPick = k => {
      window.__soundPick = () => {}; window.__soundSay = () => {};
      const ok = opts[k] === answer;
      if(ok) correct++;
      // each round: the spoken word, what was picked, whether it was right, how many times it was replayed
      answers.push([word, opts[k], ok, replays]);
      document.querySelectorAll('#soundOpts .abtn').forEach(b => b.disabled = true);
      document.getElementById('sopt' + k).classList.add(ok ? 'right' : 'wrong');
      if(!ok) document.getElementById('sopt' + opts.indexOf(answer)).classList.add('right');
      later(() => { round++; next(); }, ok ? 700 : 1300);
    };
  }
  next();
}
