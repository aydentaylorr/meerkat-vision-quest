/* Extra games offered inside a module's menu.
   A new game is its own file in this folder, exporting start(grade), plus one line in the list
   below. Git keeps every branch's line when branches merge (see .gitattributes), so games built on
   separate branches never conflict with each other. */
import { toast } from '../ui/cards.js';

export const EXTRA_GAMES = [
];

export const extraGameButtons = (moduleKey, grade) => EXTRA_GAMES
  .map((g, i) => g.module === moduleKey ? `<button class="abtn b" onclick="startExtraGame(${i},${grade})">${g.label}</button>` : '')
  .join('');

/* the game's file is only fetched when the child picks it */
export function startExtraGame(i, grade){
  import('./' + EXTRA_GAMES[i].file).then(m => m.start(grade), () => toast('That game didn’t load. Please try again.'));
}
