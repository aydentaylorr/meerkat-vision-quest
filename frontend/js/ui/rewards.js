/* Nomi’s treasure chest. */
import { meerkatSVG } from '../art/meerkat.js';
import { save } from '../core/api.js';
import { game } from '../core/state.js';
import { COSMETICS, SHOP_PRICE, cosmetic } from '../data/cosmetics.js';
import { toast } from './cards.js';
import { renderHud } from './hud.js';
import { renderSheet } from './sheets.js';
import { renderWorld } from './world.js';

export function rewardsSheet(){
  const shelf = slot => COSMETICS.filter(c => c.slot === slot).map(c => {
    const owned = game.owned.includes(c.id), on = game.equipped[slot] === c.id, price = SHOP_PRICE[c.id];
    return `<div class="item ${owned ? '' : 'locked'} ${on ? 'on' : ''}"
      onclick="${owned ? `equip('${slot}','${c.id}')` : (price ? `buy('${c.id}')` : `toast('Unlocked by finishing an adventure')`)}">
      <span class="em">${c.em}</span>${c.name}
      <div class="cmuted" style="font-size:.7rem">${owned ? (on ? 'wearing' : 'tap to wear') : (price ? price + ' 💎' : 'locked')}</div></div>`;
  }).join('');
  return `<div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
      <div style="width:110px">${meerkatSVG()}</div>
      <div style="flex:1;min-width:180px">
        <h2 class="sh" style="margin:0">Nomi’s treasure chest</h2>
        <div class="cmuted">💎 ${game.gems} gems · 🔥 ${game.streak.count} day streak · 🧊 ${game.streak.freezes} freezes</div>
        <div style="display:flex;gap:.4rem;margin-top:.5rem;flex-wrap:wrap">
          <button class="tab" onclick="equip('hat',null)">No hat</button>
          <button class="tab" onclick="equip('item',null)">No gear</button>
          <button class="tab" onclick="closeSheet()">Done</button></div>
      </div></div>
    <h2 class="sh" style="margin-top:1rem">Hats</h2><div class="shelf">${shelf('hat')}</div>
    <h2 class="sh" style="margin-top:1rem">Gear</h2><div class="shelf">${shelf('item')}</div>
    <p class="cmuted" style="margin-top:1rem">Streak freezes protect one missed day, so a single busy evening doesn’t wipe out weeks of practice.</p>`;
}

export function equip(slot, id){ game.equipped[slot] = id; save(); renderWorld(); renderSheet(); }

export function buy(id){
  const p = SHOP_PRICE[id];
  if(game.gems < p){ toast('Not enough gems yet!'); return; }
  game.gems -= p; game.owned.push(id);
  const c = cosmetic(id); game.equipped[c.slot] = id;
  save(); renderWorld(); renderHud(); renderSheet(); toast('Unlocked ' + c.name + '!');
}
