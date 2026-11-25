/* The reading stories: five for each grade, written for that grade's reading level
   (sentences and words get harder as the grade number goes up). Each story has five questions. */
import grade1 from './grade1.js';
import grade2 from './grade2.js';
import grade3 from './grade3.js';
import grade4 from './grade4.js';
import grade5 from './grade5.js';
import grade6 from './grade6.js';
import grade7 from './grade7.js';

export const GRADE_STORIES = [grade1, grade2, grade3, grade4, grade5, grade6, grade7];

/* Players get a grade's stories in turn: `timesRead` is how many they have finished in that grade. */
export const storyFor = (grade, timesRead = 0) => {
  const stories = GRADE_STORIES[grade - 1];
  return stories[timesRead % stories.length];
};
