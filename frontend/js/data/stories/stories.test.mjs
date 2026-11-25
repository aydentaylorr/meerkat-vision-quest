/* Checks every reading story is complete. Run with `make test`. */
import assert from 'node:assert';
import { GRADES_COUNT } from '../grades.js';
import { GRADE_STORIES, storyFor } from './index.js';

assert.equal(GRADE_STORIES.length, GRADES_COUNT, 'one set of stories per grade');
const titles = new Set();
GRADE_STORIES.forEach((stories, i) => {
  assert.equal(stories.length, 5, `grade ${i + 1}: needs five stories`);
  for(const s of stories){
    const at = `grade ${i + 1}, ${s.title}`;
    assert(s.title && s.text, `${at}: needs a title and text`);
    assert(!titles.has(s.title), `${at}: repeated title`);
    titles.add(s.title);
    assert.equal(s.questions.length, 5, `${at}: needs five questions`);
    for(const q of s.questions){
      assert(q.options.includes(q.answer), `${at}: the answer is not one of the options`);
      assert.equal(new Set(q.options).size, 3, `${at}: needs three different options`);
    }
  }
});
assert.equal(storyFor(1, 0), GRADE_STORIES[0][0]);
assert.equal(storyFor(1, 4), GRADE_STORIES[0][4]);
assert.equal(storyFor(1, 5), GRADE_STORIES[0][0], 'starts again after the fifth');
console.log('ok');
