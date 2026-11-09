/* Reloads an idle tab when a newer version of the game has been deployed. */
import { run } from './state.js';
import { BUILD } from './version.js';

/* when a new version goes live, an open tab picks it up on its own (never in the middle of a task) */
async function checkForUpdate(){
  if(BUILD === 'dev' || run || document.visibilityState !== 'visible') return;
  try{
    const res = await fetch('/api/health', { cache:'no-store' });
    const d = await res.json();
    if(d.version && d.version !== BUILD) location.reload();
  }catch(e){}
}

setInterval(checkForUpdate, 30000);
document.addEventListener('visibilitychange', checkForUpdate);
