/* Everything the app takes from the web game in ../frontend/js: the content, the difficulty curve
   and the hand-drawn SVG art are written once there. This is the only file that reaches outside app/.
   (meerkat.js pulls in the web game's state module; it is harmless here because the app always passes
   the hat and gear explicitly.) */
import '../../frontend/js/art/icons.js'; // adds the small icons to ART

export { ART } from '../../frontend/js/art/primitives.js';
export { ARROW_DOWN, ARROW_UP, EXIT_ICON, PROFILE_ICON } from '../../frontend/js/art/icons.js';
export { LOCATIONS, SCENES } from '../../frontend/js/art/scenes.js';
export { meerkatSVG } from '../../frontend/js/art/meerkat.js';
export { clamp, dayKey, daysBetween, pct, pick, rnd, shuffle } from '../../frontend/js/core/utils.js';
export { COSMETICS, SHOP_PRICE, cosmetic } from '../../frontend/js/data/cosmetics.js';
export {
  eyeConfig, flashMemoryRounds, gradeT, memConfig, readConfig, symbolSearchConfig, trackingConfig,
} from '../../frontend/js/data/difficulty.js';
export { GRADES_COUNT, gradeInfo, gradeReward } from '../../frontend/js/data/grades.js';
export { MODULE_KEYS, MODULE_META } from '../../frontend/js/data/modules.js';
export { ELEMENT_META, elementPool } from '../../frontend/js/data/words.js';
