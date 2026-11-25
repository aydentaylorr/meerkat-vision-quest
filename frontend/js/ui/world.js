/* The illustrated world: scenes, map nodes, travel between them and sizing. */
import { meerkatSVG } from '../art/meerkat.js';
import { ART } from '../art/primitives.js';
import { LOCATIONS, SCENES, SCENE_HERO, mapTrails } from '../art/scenes.js';
import { currentGrade, isGradeDone, isGradeUnlocked } from '../core/progress.js';
import { game, view } from '../core/state.js';
import { $ } from '../core/utils.js';
import { clearCard } from './cards.js';
import { mapLayout } from './mapLayout.js';

export let currentScene = 'map';

export function setScene(key){
  currentScene = key;
  $('#bg').innerHTML = SCENES[key]();
  document.body.classList.toggle('in-level', key !== 'map');
  if(key === 'map') renderWorld();
  else renderLevelStage(key);
}

function renderLevelStage(key){
  const h = SCENE_HERO[key] || { x:20, y:78 };
  $('#nodes').innerHTML = `<div id="hero" style="left:${h.x}%;top:${h.y}%">${meerkatSVG()}</div>`;
}

/* sand-coloured curtain sweep between places */
export function travel(sceneKey, then){
  if(game.settings.reduceMotion){ setScene(sceneKey); if(then) then(); return; }
  clearCard();
  const w = document.createElement('div');
  w.className = 'wipe';
  document.body.appendChild(w);
  requestAnimationFrame(() => w.classList.add('in'));
  setTimeout(() => {
    setScene(sceneKey);
    if(then) then();
    w.classList.add('out');
    setTimeout(() => w.remove(), 560);
  }, 480);
}

/* the map card's height, which decides how much room the landmarks have */
let cardHeight = null;
const cardWatcher = new ResizeObserver(([entry]) => {
  if(view.mode !== 'map' || currentScene !== 'map' || !entry.target.isConnected) return;
  cardHeight = entry.target.offsetHeight;
  renderWorld();
});

/* keeps every grade above the map card, now and whenever the card changes size */
export function fitMapAbove(panel){
  cardWatcher.disconnect();
  if(panel) cardWatcher.observe(panel);
}

/* places the landmarks for this screen, in percentages of the painting */
function placeLandmarks(){
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / 1600, vh / 900);
  const sw = Math.ceil(1600 * scale), sh = Math.ceil(900 * scale);
  const bar = $('#rings');
  const { size, spots } = mapLayout({
    width: vw, count: LOCATIONS.length, maxWidth: 0.11 * sw,
    top: (bar ? bar.getBoundingClientRect().bottom : 64) + 8,
    bottom: vh - (cardHeight ?? vh * 0.42) - 8
  });
  return LOCATIONS.map((l, i) => ({
    ...l,
    x: +((spots[i].x - (vw - sw) / 2) / sw * 100).toFixed(2),
    y: +((spots[i].y - (vh - sh) / 2) / sh * 100).toFixed(2),
    w: +(size / sw * 100).toFixed(2)
  }));
}

export function renderWorld(){
  const places = placeLandmarks();
  const trails = $('#trails');
  if(trails) trails.innerHTML = mapTrails(places.map(l => ({ x: l.x * 16, y: l.y * 9 })), places[0].w * 2);

  const nodes = places.map(l => {
    const done = isGradeDone(l.adv);
    const open = isGradeUnlocked(l.adv);
    const cur  = l.adv === currentGrade();
    const badge = done ? ART.tick : (open ? '' : ART.lock);
    return `<div class="node ${cur ? 'current' : ''} ${open ? '' : 'locked'}" id="node-${l.id}"
        style="left:${l.x}%;top:${l.y}%;width:${l.w}%"
        onclick="tapNode('${l.id}')">
      ${ART.loc[l.art](cur)}
      ${badge ? `<div class="badgeicon">${badge}</div>` : ''}
      <div class="label">${l.name}</div>
    </div>`;
  }).join('');

  const cur = places.find(l => l.adv === currentGrade()) || places[0];
  const hp = heroPos(cur);
  $('#nodes').innerHTML = nodes +
    `<div id="hero" style="left:${hp.x}%;top:${hp.y}%;width:${(0.71 * cur.w).toFixed(2)}%">${meerkatSVG()}</div>` +
    (view.mode === 'map' ? `<div id="pointer" style="left:${cur.x + 0.62*cur.w}%;top:${cur.y + 0.2*cur.w}%;width:${(0.49 * cur.w).toFixed(2)}%">${ART.arrow}</div>` : '');
}

/* the meerkat stands on the sand platform, just left of the landmark */
function heroPos(l){ return { x: +(l.x - 0.12*l.w).toFixed(2), y: +(l.y + 0.3555*l.w).toFixed(2) }; }

/* keep #scene sized+centered to always cover the viewport at a locked 16:9 art
   aspect, computed directly from window dimensions (not vh/vw+calc, which some
   browsers resolve inconsistently and can leave gaps down the sides). */
export function fitScene(){
  const vw = window.innerWidth, vh = window.innerHeight;
  const scale = Math.max(vw / 1600, vh / 900);
  const scene = $('#scene');
  if(!scene) return;
  scene.style.width = Math.ceil(1600 * scale) + 'px';
  scene.style.height = Math.ceil(900 * scale) + 'px';
}

let fitTimer = null;

function scheduleFit(){
  clearTimeout(fitTimer);
  fitTimer = setTimeout(() => { fitScene(); if(currentScene === 'map') renderWorld(); }, 80);
}

window.addEventListener('resize', scheduleFit);
new ResizeObserver(scheduleFit).observe(document.body);
