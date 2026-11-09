/* Grade and module progress rules, and the daily streak. */
import { game, user } from './state.js';
import { dayKey, daysBetween } from './utils.js';
import { GRADES_COUNT } from '../data/grades.js';
import { MODULE_KEYS } from '../data/modules.js';

export function moduleDone(grade, key){ return !!(game.gradeProgress[grade] && game.gradeProgress[grade][key]); }
export function gradeFullyDone(grade){ return MODULE_KEYS.every(k => moduleDone(grade, k)); }
export function gradeModulesDoneCount(grade){ return MODULE_KEYS.filter(k => moduleDone(grade, k)).length; }
export const isGradeDone = grade => gradeFullyDone(grade);
export const isGradeUnlocked = grade => grade <= startGrade() || gradeFullyDone(grade - 1);
const startGrade = () => (user && user.start_grade) || 1;

export function currentGrade(){
  for(let g = startGrade(); g <= GRADES_COUNT; g++) if(!gradeFullyDone(g)) return g;
  return GRADES_COUNT;
}

export function bumpStreak(){
  const today = dayKey();
  if(game.streak.last === today) return 'same';
  const gap = game.streak.last ? daysBetween(game.streak.last, today) : 1;
  let note = 'up';
  if(gap === 1 || !game.streak.last) game.streak.count++;
  else if(gap === 2 && game.streak.freezes > 0){ game.streak.freezes--; game.streak.count++; note = 'freeze'; }
  else { game.streak.count = 1; note = 'reset'; }
  game.streak.last = today;
  return note;
}
