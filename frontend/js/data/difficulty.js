/* How each game gets harder as the grade goes up. */
import { gradeInfo } from './grades.js';
import { storyFor } from './stories/index.js';
import { MEMORY_ICON_POOL } from './words.js';

/* The games are tuned on a scale that reaches grade 12, so each grade keeps its own difficulty
   however many grades the game offers. */
const SCALE_TOP = 12;
export const gradeT = grade => (grade - 1) / (SCALE_TOP - 1);
export const gLerp = (grade, a, b) => Math.round(a + (b - a) * gradeT(grade));

export function readConfig(grade, timesRead = 0){
  const gi = gradeInfo(grade), story = storyFor(grade, timesRead);
  return {
    label: 'Reading', prompt: 'A story to read — twice — then a quick word check.',
    vocab: { rounds: gLerp(grade, 3, 5), flash: 500, pool: gi.words },
    title: story.title, passage: story.text, chunkSize: gLerp(grade, 2, 6), questions: story.questions,
    pass: 0.5
  };
}

export function memConfig(grade){
  const t = gradeT(grade);
  return {
    label: 'Card Match', prompt: 'Find the matching pairs.',
    pairs: gLerp(grade, 4, 8), cols: 4, time: t < 0.25 ? 0 : gLerp(grade, 90, 40), mode: 'identical',
    reshuffle: t > 0.6, pass: 0.45, pool: MEMORY_ICON_POOL
  };
}

export function eyeConfig(grade){
  return {
    rounds: gLerp(grade, 4, 8), gap: gLerp(grade, 14, 70), disparity: gLerp(grade, 6, 34), pass: 0.5,
    chars: 'ABDEFHKMNPRTUVWY2345789'.split('')
  };
}

export const flashMemoryRounds = grade => gLerp(grade, 5, 8);

export const trackingConfig = grade => ({
  seqLen: gLerp(grade, 12, 25), targetCount: gLerp(grade, 2, 6), itemMs: gLerp(grade, 1000, 600)
});

export const symbolSearchConfig = grade => ({
  cols: gLerp(grade, 6, 10), rows: gLerp(grade, 5, 8), targetCount: gLerp(grade, 4, 10)
});
