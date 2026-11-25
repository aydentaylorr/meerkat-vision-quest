/* Checks every grade stays on screen, clear of the bottom card. Run with `make test`. */
import assert from 'node:assert';
import { GRADES_COUNT } from '../data/grades.js';
import { ABOVE, BELOW, mapLayout } from './mapLayout.js';

// screen width, then the top and bottom of the space left free by the top bar and the card
const screens = [
  ['phone', 375, 76, 500], ['small phone', 320, 76, 300], ['tablet', 768, 76, 690],
  ['laptop', 1280, 76, 475], ['short laptop', 1440, 76, 360], ['wide monitor', 2560, 76, 1050],
  ['split window', 700, 76, 420]
];
for(const [name, width, top, bottom] of screens){
  const { size, spots } = mapLayout({ width, top, bottom, count: GRADES_COUNT, maxWidth: 220 });
  assert.equal(spots.length, GRADES_COUNT, name);
  assert(size >= 40, `${name}: landmarks too small (${size.toFixed(0)}px)`);
  spots.forEach((p, i) => {
    const at = `${name}, grade ${i + 1}`;
    assert(p.x - size / 2 >= 0 && p.x + size / 2 <= width, `${at}: off the side`);
    assert(p.y - ABOVE * size >= top - 0.5, `${at}: under the top bar`);
    assert(p.y + BELOW * size <= bottom + 0.5, `${at}: behind the card`);
    spots.slice(i + 1).forEach((q, j) => assert(
      Math.abs(p.x - q.x) >= size || Math.abs(p.y - q.y) >= (ABOVE + BELOW) * size - 0.5,
      `${at} overlaps grade ${i + j + 2}`));
  });
}
console.log('ok');
