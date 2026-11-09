/* Small SVG icons and picture cards. */
import { ART } from './primitives.js';

ART.flame = `<svg viewBox="0 0 40 44" style="width:30px;height:33px">
  <path d="M20 2 C26 12 34 16 34 27 a14 14 0 0 1 -28 0 C6 18 12 14 20 2 Z" fill="#ff9d2e"/>
  <path d="M20 14 C24 20 28 23 28 29 a8 8 0 0 1 -16 0 C12 24 16 20 20 14 Z" fill="#ffd84d"/></svg>`;

ART.coin = `<svg class="coin" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#e0a022"/>
  <circle cx="20" cy="20" r="14" fill="#ffc94d"/><path d="M20 11 v18 M15 15 h10 M15 25 h10" stroke="#e0a022" stroke-width="3" stroke-linecap="round"/></svg>`;

ART.chest = `<svg class="chest" viewBox="0 0 48 44">
  <rect x="5" y="20" width="38" height="20" rx="4" fill="#b06a34"/>
  <path d="M5 20 a19 12 0 0 1 38 0 Z" fill="#c87d4f"/>
  <rect x="3" y="18" width="42" height="6" rx="3" fill="#ffc94d"/>
  <rect x="20" y="16" width="8" height="12" rx="3" fill="#ffc94d"/>
  <circle cx="24" cy="24" r="2.6" fill="#7a4a1e"/></svg>`;

ART.lock = `<svg viewBox="0 0 40 44"><rect x="6" y="18" width="28" height="22" rx="7" fill="#8a8f99"/>
  <rect x="9" y="21" width="22" height="16" rx="5" fill="#b9bfc9"/>
  <path d="M13 18 v-4 a7 7 0 0 1 14 0 v4" stroke="#8a8f99" stroke-width="5" fill="none"/>
  <circle cx="20" cy="29" r="3.4" fill="#6c727c"/></svg>`;

ART.tick = `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#7ac943"/>
  <path d="M11 20 l6 7 l12 -14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

ART.arrow = `<svg viewBox="0 0 80 40"><path d="M74 20 H16 M32 6 L14 20 L32 34" stroke="#fff" stroke-width="7" fill="none"
  stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>`;

ART.drop = `<svg viewBox="0 0 60 60"><path d="M30 6 C40 22 46 28 46 36 a16 16 0 0 1 -32 0 C14 28 20 22 30 6 Z" fill="#7ad4e2"/>
  <path d="M24 34 a8 8 0 0 0 6 10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/></svg>`;

ART.wordCard = `<svg viewBox="0 0 60 60"><rect x="4" y="12" width="52" height="36" rx="8" fill="#fff6e2" stroke="#e0b878" stroke-width="3"/>
  <rect x="12" y="22" width="36" height="7" rx="3.5" fill="#6b4423"/>
  <rect x="12" y="34" width="24" height="6" rx="3" fill="#c8a882"/>
  <path d="M46 6 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 Z" fill="#ffc94d"/></svg>`;

export const EXIT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`;
export const ARROW_UP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15l7-7 7 7"/></svg>`;
export const ARROW_DOWN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>`;
export const PROFILE_ICON = `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c0-4.7 3.8-7.5 8.5-7.5s8.5 2.8 8.5 7.5z"/></svg>`;
