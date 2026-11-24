/* Story Paths: a story where the child chooses what happens next. Every page ends in a choice, and
   the choice decides which page comes next. After the ending come questions about the pages they
   actually read. The stories are fixed content in data/storyPaths.js. */
import { ART } from '../art/primitives.js';
import { later } from '../core/timers.js';
import { pick, shuffle } from '../core/utils.js';
import { STORY_PATHS } from '../data/storyPaths.js';
import { BTN_COLOURS, card } from '../ui/cards.js';
import { finishModule, runModule } from './runner.js';

export function start(grade){
  const story = pick(STORY_PATHS.filter(s => grade >= s.grades[0] && grade <= s.grades[1]));
  runModule(grade, 'read', {
    art: ART.wordCard, headline: story.title, params: 'you choose what happens · questions at the end',
    prompt: 'Read each page, then choose what happens next.'
  }, () => playStoryPaths(grade, story));
}

function playStoryPaths(grade, story){
  const path = [], quiz = [];
  let correct = 0;

  function page(id){
    const p = story.pages[id], choices = p.choices || [], t0 = performance.now();
    card(`<div class="ctitle">${story.title}</div>
      <p class="cbody">${p.text}</p>
      <div class="chead" style="margin:.5rem 0">${choices.length ? 'What should Nomi do?' : 'The end'}</div>
      <div class="stack">${choices.length
        ? choices.map((c, k) => `<button class="abtn ${BTN_COLOURS[k % BTN_COLOURS.length]}" onclick="__storyGo(${k})">${c.label}</button>`).join('')
        : `<button class="abtn" onclick="__storyGo(-1)">Finish the story</button>`}</div>`, 'dock');
    window.__storyGo = k => {
      window.__storyGo = () => {};
      // each page: its id, the choice taken (-1 at an ending), time spent on it, and its length in words.
      // The time includes deciding, so words per minute from it runs a little slow.
      path.push([id, k, Math.round(performance.now() - t0), p.text.split(' ').length]);
      if(k < 0) ask(0); else page(choices[k].to);
    };
  }

  function ask(n){
    if(n >= path.length){
      const score = correct / path.length;
      finishModule(grade, 'read', score, score >= 0.5, `${correct} of ${path.length} questions`,
        'storypaths', { story:story.id, path, quiz });
      return;
    }
    const id = path[n][0], cq = story.pages[id].q, opts = shuffle(cq.options);
    card(`<div class="ctitle">Quick check</div>
      <div class="center cmuted" style="font-size:.92rem">Question ${n + 1} of ${path.length}</div>
      <div class="chead">${cq.q}</div>
      <div class="stack" id="storyOpts">${opts.map((o, k) =>
        `<button class="abtn ${BTN_COLOURS[k % BTN_COLOURS.length]}" id="stopt${k}" onclick="__storyPick(${k})">${o}</button>`).join('')}</div>`, 'focus');
    window.__storyPick = k => {
      window.__storyPick = () => {};
      const ok = opts[k] === cq.answer;
      if(ok) correct++;
      // each question: the page it was about, which option was picked, and whether it was right
      quiz.push([id, cq.options.indexOf(opts[k]), ok]);
      document.querySelectorAll('#storyOpts .abtn').forEach(b => b.disabled = true);
      document.getElementById('stopt' + k).classList.add(ok ? 'right' : 'wrong');
      if(!ok) document.getElementById('stopt' + opts.indexOf(cq.answer)).classList.add('right');
      later(() => ask(n + 1), ok ? 700 : 1300);
    };
  }

  page(story.start);
}
