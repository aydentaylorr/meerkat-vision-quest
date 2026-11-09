/* Grade titles, scenes and per-grade lookups. */
import { COSMETICS } from './cosmetics.js';
import { GRADE_INTROS } from './stories.js';
import { GRADE_WORDS } from './words.js';

export const GRADES_COUNT = 12;

const GRADE_TITLES = [
  'Grade 1 · Red Rocks', 'Grade 2 · The Hawk’s Shadow', 'Grade 3 · Buried Treasure',
  'Grade 4 · The Far Dunes', 'Grade 5 · Whispering Canyon', 'Grade 6 · The Long Trail',
  'Grade 7 · Sunbaked Flats', 'Grade 8 · The Ancient Spring', 'Grade 9 · Stormy Ridge',
  'Grade 10 · The Hidden Vale', 'Grade 11 · Old Caravan Road', 'Grade 12 · The Final Horizon'
];

const GRADE_SCENES = ['adv1', 'adv2', 'adv3'];

export function gradeInfo(grade){
  const i = grade - 1;
  return {
    grade, title: GRADE_TITLES[i], scene: GRADE_SCENES[i % 3],
    words: GRADE_WORDS[i],
    passage: GRADE_INTROS[i].join(' ')
  };
}

export function gradeReward(grade){ return { cosmetic: COSMETICS[(grade - 1) % COSMETICS.length].id, gems: 20 + grade * 4 }; }
