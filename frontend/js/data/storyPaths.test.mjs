/* Checks every story tree is sound. Run with `make test`. */
import assert from 'node:assert';
import { GRADES_COUNT } from './grades.js';
import { STORY_PATHS } from './storyPaths.js';

for(const s of STORY_PATHS){
  const reached = new Set();
  const walk = (id, depth) => {
    assert(s.pages[id], `${s.id}: a choice leads to "${id}", which does not exist`);
    assert(depth < 20, `${s.id}: the story loops and never ends`);
    reached.add(id);
    for(const c of s.pages[id].choices || []) walk(c.to, depth + 1);
  };
  walk(s.start, 0);
  assert.deepEqual([...reached].sort(), Object.keys(s.pages).sort(), `${s.id}: a page can never be reached`);
  for(const [id, p] of Object.entries(s.pages)){
    assert(p.text && p.q, `${s.id}/${id}: needs text and a question`);
    assert(p.q.options.includes(p.q.answer), `${s.id}/${id}: the answer is not one of the options`);
    assert.equal(new Set(p.q.options).size, p.q.options.length, `${s.id}/${id}: repeated option`);
  }
}
for(let grade = 1; grade <= GRADES_COUNT; grade++){
  assert(STORY_PATHS.some(s => grade >= s.grades[0] && grade <= s.grades[1]), `no story for grade ${grade}`);
}
console.log('ok');
