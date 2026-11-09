/* The cards that carry every screen: show, swap and animate them. */
import { game } from '../core/state.js';
import { $ } from '../core/utils.js';

/* Swaps the card's contents. `mode` is 'dock' (bottom sheet), 'focus' (centred play surface) or
   'strip' (thin bar). When a card of the same kind is already showing it stays perfectly still
   (no pop-in), so only the contents change; pass animate=true to pop it in. */
export function card(html, mode, animate){
  mode = mode || 'dock';
  const c = $('#cards');
  const panel = c.firstElementChild;
  if(!animate && panel && panel.classList.contains('panel') && panel.classList.contains(mode)){
    panel.firstElementChild.innerHTML = html;
    panel.scrollTop = 0;
  } else {
    c.innerHTML = `<div class="panel ${mode}"><div class="inner">${html}</div></div>`;
  }
  c.className = mode;
  $('#scrim').classList.toggle('on', mode === 'focus');
}

export function clearCard(){ $('#cards').innerHTML = ''; $('#cards').className = ''; $('#scrim').classList.remove('on'); }
export function night(on){ $('#night').classList.toggle('on', !!on); }

export function toast(msg){
  const d = document.createElement('div');
  d.className = 'toastfx'; d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2200);
}

export function applySettings(){
  document.documentElement.style.setProperty('--fs', game.settings.fs);
  document.body.classList.toggle('contrast', !!game.settings.contrast);
  document.body.classList.toggle('reduce-motion', !!game.settings.reduceMotion);
}

export const BTN_COLOURS = ['', 'o', 'b', 'p', 'r'];
