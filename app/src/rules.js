/* The game's rules as plain functions over the saved state: progress, unlocking, the daily streak
   and what finishing an exercise earns. Mirrors frontend/js/core/progress.js and the bookkeeping in
   frontend/js/modules/runner.js, so both versions of the game save the same state. */
import {
  GRADES_COUNT, MODULE_KEYS, clamp, cosmetic, dayKey, daysBetween, gradeReward,
} from './shared.js';

const DEFAULT_STATE = {
  gradeProgress: {}, gems: 0, owned: [], equipped: { hat: null, item: null },
  streak: { count: 0, last: null, freezes: 2 },
  log: [],
  settings: { fs: 1, contrast: false, reduceMotion: false, sessionCap: 15 },
};

export function normalizeState(raw) {
  const s = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), raw || {});
  s.settings = Object.assign({}, DEFAULT_STATE.settings, s.settings || {});
  s.streak = Object.assign({}, DEFAULT_STATE.streak, s.streak || {});
  s.equipped = Object.assign({}, DEFAULT_STATE.equipped, s.equipped || {});
  s.gradeProgress = s.gradeProgress || {};
  return s;
}

export const moduleDone = (game, grade, key) => !!(game.gradeProgress[grade] && game.gradeProgress[grade][key]);
export const gradeFullyDone = (game, grade) => MODULE_KEYS.every(k => moduleDone(game, grade, k));
export const gradeModulesDoneCount = (game, grade) => MODULE_KEYS.filter(k => moduleDone(game, grade, k)).length;
export const totalModulesDone = game =>
  Array.from({ length: GRADES_COUNT }, (_, i) => gradeModulesDoneCount(game, i + 1)).reduce((a, b) => a + b, 0);

const startGrade = user => (user && user.start_grade) || 1;
export const isGradeUnlocked = (game, user, grade) => grade <= startGrade(user) || gradeFullyDone(game, grade - 1);

export function currentGrade(game, user) {
  for (let g = startGrade(user); g <= GRADES_COUNT; g++) if (!gradeFullyDone(game, g)) return g;
  return GRADES_COUNT;
}

/* A streak that was left for more than a freeze can cover is over. Called when a session starts. */
export function expireStreak(game, today = dayKey()) {
  if (game.streak.last && daysBetween(game.streak.last, today) > 2) game.streak.count = 0;
}

export function bumpStreak(game, today = dayKey()) {
  if (game.streak.last === today) return 'same';
  const gap = game.streak.last ? daysBetween(game.streak.last, today) : 1;
  let note = 'up';
  if (gap === 1 || !game.streak.last) game.streak.count++;
  else if (gap === 2 && game.streak.freezes > 0) { game.streak.freezes--; game.streak.count++; note = 'freeze'; }
  else { game.streak.count = 1; note = 'reset'; }
  game.streak.last = today;
  return note;
}

/* Records a finished exercise in `game` (which it changes) and returns what to show on the results card. */
export function recordResult(game, grade, moduleKey, score, pass, now = new Date()) {
  score = clamp(score, 0, 1);
  game.log.push({ ts: now.getTime(), day: dayKey(now), grade, module: moduleKey, score: Math.round(score * 100), pass });
  if (game.log.length > 400) game.log = game.log.slice(-400);

  const out = { score, pass, gemsWon: 0, gradeCompleteNow: false, reward: null, note: null };
  if (!pass) return out;

  out.note = bumpStreak(game, dayKey(now));
  if (!game.gradeProgress[grade]) game.gradeProgress[grade] = {};
  const newlyDone = !game.gradeProgress[grade][moduleKey];
  game.gradeProgress[grade][moduleKey] = true;
  out.gemsWon = 5 + grade;
  game.gems += out.gemsWon;
  if (newlyDone && gradeFullyDone(game, grade)) {
    out.gradeCompleteNow = true;
    const rw = gradeReward(grade);
    game.gems += rw.gems;
    if (!game.owned.includes(rw.cosmetic)) {
      game.owned.push(rw.cosmetic);
      const cos = cosmetic(rw.cosmetic);
      if (cos && !game.equipped[cos.slot]) game.equipped[cos.slot] = cos.id;
      out.reward = cos;
    }
  }
  return out;
}
