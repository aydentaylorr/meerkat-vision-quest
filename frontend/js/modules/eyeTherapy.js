/* Eye Therapy module: convergence and divergence fusion tests. */
import { setRun, view } from '../core/state.js';
import { later } from '../core/timers.js';
import { esc, pick } from '../core/utils.js';
import { eyeConfig } from '../data/difficulty.js';
import { finishModule, runModule } from './runner.js';
import { card } from '../ui/cards.js';
import { renderHud } from '../ui/hud.js';

export function openEyeMenu(grade){
  setRun({ grade, moduleKey:'eye', retryFn:null });
  view.mode = 'intro'; view.msg = null; renderHud();
  card(`<div class="ctitle">Eye Therapy</div>
    <div class="chead">Choose a test</div>
    <div class="stack">
      <button class="abtn" onclick="startFusion(${grade},'convergence')">👀 Convergence</button>
      <button class="abtn o" onclick="startFusion(${grade},'divergence')">🕶️ Divergence (red/blue glasses)</button>
    </div>
    <button class="abtn ghost sm" style="margin-top:.6rem" onclick="openGrade(${grade})">Back</button>`, 'dock');
}

/* Each eye gets its own picture holding half of the character. When the two pictures fuse
   into one, the halves line up and the whole letter or number appears in the middle.
   convergence: two side-by-side circles, no glasses (cross the eyes to join them).
   divergence: red and cyan circles pulled apart; red/cyan glasses give each eye its own picture. */
let FUSE_UID = 0;

function fusionSVG(kind, ch, p){
  const R = 90, pad = 24, cy = 112, H = 224, fs = 124, id = 'fz' + (++FUSE_UID);
  const glyph = (cx, side, color) => `<clipPath id="${id}${side}"><rect x="${side === 'left' ? cx - R : cx}" y="0" width="${R}" height="${H}"/></clipPath>
    <text x="${cx}" y="${cy + fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="900" font-family="Arial Black,Arial,Helvetica,sans-serif" fill="${color}" clip-path="url(#${id}${side})">${esc(ch)}</text>`;
  const ticks = (cx, color) => `<path d="M${cx} ${cy - R + 10} v16 M${cx} ${cy + R - 10} v-16" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`;
  if(kind === 'convergence'){
    const cxL = pad + R, cxR = cxL + 2 * R + p.gap, W = cxR + R + pad, mid = (cxL + cxR) / 2, ink = '#3b2410', line = '#8a6238';
    const circle = cx => `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${line}" stroke-width="5"/>`;
    return `<svg class="fusesvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Two circles to fuse">
      ${circle(cxL)}${ticks(cxL, line)}${glyph(cxL, 'left', ink)}
      ${circle(cxR)}${ticks(cxR, line)}${glyph(cxR, 'right', ink)}
      <circle cx="${mid}" cy="${cy}" r="7" fill="#f0a038"/></svg>`;
  }
  const W = 2 * (R + pad) + 80, cx = W / 2, red = '#ff2a2a', cyan = '#00e5ff';
  const eye = (shift, side, color) => `<g transform="translate(${shift} 0)" style="mix-blend-mode:screen">
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${color}" stroke-width="5"/>${ticks(cx, color)}${glyph(cx, side, color)}
    <circle cx="${cx}" cy="${cy}" r="6" fill="${color}"/></g>`;
  return `<svg class="fusesvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Red and blue circles to fuse">
    ${eye(-p.disparity / 2, 'left', red)}${eye(p.disparity / 2, 'right', cyan)}</svg>`;
}

export function startFusion(grade, kind){
  const c = eyeConfig(grade), conv = kind === 'convergence';
  runModule(grade, 'eye', {
    art: fusionSVG(kind, 'A', { gap:c.gap, disparity:c.disparity }), artWidth: conv ? '80%' : '48%',
    headline: conv ? 'Convergence' : 'Divergence',
    params: `${c.rounds} rounds · ${conv ? 'two circles, no glasses' : 'red/blue glasses'}`,
    prompt: conv ? 'Look at the middle dot and let the two circles join.' : 'Put on your red/blue glasses and let the circles join.',
    extraHtml: (conv ? '' : `<div class="hintbar">🕶️ <div><b>You need red/blue (red-cyan) 3D glasses.</b> Red lens over the left eye.</div></div>`) +
      `<div class="notice"><b>Pilot exercise.</b> Stop and rest if your eyes feel sore or you get a headache. The settings need a pediatric optometrist’s review before release.</div>`
  }, () => playFusion(grade, kind));
}

function playFusion(grade, kind){
  const c = eyeConfig(grade), conv = kind === 'convergence', name = conv ? 'Convergence' : 'Divergence';
  let round = 0, correct = 0, last = '', times = [];
  const tip = conv
    ? 'Look at the orange dot in the middle. Slowly cross your eyes, like looking at the tip of your nose, until the two circles slide together into one. Type the letter or number you see in the middle circle.'
    : 'Wear your red/blue glasses, red lens over your left eye. Look at the middle and relax your eyes, like gazing far away, until the red and blue circles join into one. Type the letter or number you see.';
  const reminder = conv ? 'Look at the dot and let the circles join.' : 'Relax your eyes and let the circles join.';

  function next(){
    if(round >= c.rounds){
      const score = correct / c.rounds;
      const avg = times.length ? (times.reduce((x, y) => x + y, 0) / times.length / 1000).toFixed(1) : '0';
      finishModule(grade, 'eye', score, score >= c.pass, `${correct} of ${c.rounds} correct · ${avg}s average`);
      return;
    }
    let ch; do{ ch = pick(c.chars); }while(ch === last); last = ch;
    card(`<div class="ctitle">${name}</div>
      <div class="center cmuted" style="font-size:.92rem">Round ${round + 1} of ${c.rounds}</div>
      <p class="cmuted center" style="margin:.3rem 0;font-size:.9rem">${round === 0 ? tip : reminder}</p>
      <div class="fusebox ${conv ? '' : 'dark'}">${fusionSVG(kind, ch, { gap:c.gap, disparity:c.disparity })}</div>
      <div class="chead" style="margin:.4rem 0 0">What do you see?</div>
      <input type="text" id="fuInput" class="vinput" maxlength="1" autocomplete="off" autocapitalize="characters" spellcheck="false" />
      <button class="abtn" onclick="__fuSubmit()">OK</button>
      <button class="abtn ghost sm" style="margin-top:.4rem" onclick="__fuSkip()">I can’t see it yet</button>`, 'focus');
    const inp = document.getElementById('fuInput'), t0 = performance.now();
    if(inp){ inp.focus(); inp.onkeydown = e => { if(e.key === 'Enter') window.__fuSubmit(); }; }
    const settle = (ok, typed) => {
      window.__fuSubmit = () => {}; window.__fuSkip = () => {};
      const el = document.getElementById('fuInput');
      el.disabled = true; el.classList.add(ok ? 'right' : 'wrong');
      if(!ok) el.value = ch;
      if(ok){ correct++; times.push(performance.now() - t0); }
      document.querySelectorAll('#cards button.abtn').forEach(b => b.disabled = true);
      later(() => { round++; next(); }, ok ? 700 : 1300);
    };
    window.__fuSubmit = () => {
      const v = (inp.value || '').trim().toUpperCase();
      if(v) settle(v === ch);
    };
    window.__fuSkip = () => settle(false);
  }
  next();
}
