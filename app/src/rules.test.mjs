// Run with: npm test   (plain Node, no test framework)
import assert from 'node:assert/strict';
import {
  bumpStreak, currentGrade, expireStreak, gradeFullyDone, isGradeUnlocked, normalizeState, recordResult, totalModulesDone,
} from './rules.js';
import { MODULE_KEYS } from './shared.js';

const day = n => new Date(Date.UTC(2026, 0, n, 12));
const user = { start_grade: 2 };

// a fresh state has the defaults, and a partial saved state keeps them
let g = normalizeState({ gems: 7, settings: { contrast: true } });
assert.equal(g.gems, 7);
assert.equal(g.settings.contrast, true);
assert.equal(g.settings.sessionCap, 15);
assert.deepEqual(g.equipped, { hat: null, item: null });

// unlocking: everything up to the starting grade is open, the next one only after all four modules
g = normalizeState(null);
assert.equal(currentGrade(g, user), 2);
assert.ok(isGradeUnlocked(g, user, 1) && isGradeUnlocked(g, user, 2));
assert.ok(!isGradeUnlocked(g, user, 3));

// a failed exercise is logged but earns nothing
let r = recordResult(g, 2, 'read', 0.2, false, day(1));
assert.deepEqual([r.gemsWon, g.gems, g.streak.count, g.log.length], [0, 0, 0, 1]);

// passing earns gems and starts the streak; the fourth module completes the grade and pays the reward
MODULE_KEYS.forEach((k, i) => { r = recordResult(g, 2, k, 0.9, true, day(1)); assert.equal(r.gradeCompleteNow, i === 3); });
assert.ok(gradeFullyDone(g, 2) && isGradeUnlocked(g, user, 3));
assert.equal(currentGrade(g, user), 3);
assert.equal(g.gems, 4 * 7 + 28);            // 4 passes at 5+grade, plus 20+grade*4
assert.equal(r.reward.id, 'hat_straw');      // grade 2's reward, worn straight away
assert.equal(g.equipped.hat, 'hat_straw');
assert.equal(g.streak.count, 1);             // four passes on one day count once
assert.equal(totalModulesDone(g), 4);

// replaying a finished module pays gems but never completes the grade twice
r = recordResult(g, 2, 'read', 1, true, day(1));
assert.equal(r.gradeCompleteNow, false);

// streak: next day counts, one missed day spends a freeze, a longer gap resets
assert.equal(bumpStreak(g, '2026-01-02'), 'up');
assert.equal(bumpStreak(g, '2026-01-04'), 'freeze');
assert.deepEqual([g.streak.count, g.streak.freezes], [3, 1]);
assert.equal(bumpStreak(g, '2026-01-09'), 'reset');
assert.equal(g.streak.count, 1);
expireStreak(g, '2026-01-11'); assert.equal(g.streak.count, 1);
expireStreak(g, '2026-01-12'); assert.equal(g.streak.count, 0);

// scores are clamped and the log is capped
g = normalizeState(null);
for (let i = 0; i < 405; i++) recordResult(g, 1, 'scan', 5, false, day(1));
assert.equal(g.log.length, 400);
assert.equal(g.log[0].score, 100);

console.log('rules: all checks passed');
