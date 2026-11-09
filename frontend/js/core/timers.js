/* Tracked timers, so leaving an exercise can cancel everything it scheduled. */

let timers = [];
export const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
export function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
