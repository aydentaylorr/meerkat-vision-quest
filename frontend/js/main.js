/* Entry point: wires the game together and starts it. */
import './handlers.js';
import './core/updates.js';
import { boot } from './ui/auth.js';
import { applySettings } from './ui/cards.js';
import { fitScene, setScene } from './ui/world.js';

(function init(){
  applySettings();
  fitScene();
  setScene('map');
  // the viewport isn't always settled by the time this first measurement runs
  // (e.g. right after a resize/restore) — re-check shortly after first paint.
  requestAnimationFrame(fitScene);
  setTimeout(fitScene, 300);
  boot();
})();
