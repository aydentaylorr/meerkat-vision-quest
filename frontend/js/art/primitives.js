/* Hand-drawn SVG building blocks (cacti, palms, rocks, trails) for the desert world. */

export const ART = {};

ART.cloud = (x,y,s,o=.92) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${o}">
  <ellipse cx="0" cy="0" rx="54" ry="24" fill="#fff"/>
  <ellipse cx="-34" cy="6" rx="30" ry="16" fill="#fff"/>
  <ellipse cx="30" cy="7" rx="34" ry="17" fill="#fff"/>
  <ellipse cx="-8" cy="-16" rx="30" ry="20" fill="#fff"/>
  <ellipse cx="20" cy="-10" rx="22" ry="15" fill="#fff"/></g>`;

/* Chunky storybook cactus. Origin sits on the ground line. */
ART.cactus = (x,y,s,face=false) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="34" ry="9" fill="#c9762f" opacity=".3"/>
  <g stroke="#5fb56c" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-19 -36 H-37 V-60" stroke-width="21"/>
    <path d="M19 -54 H38 V-76" stroke-width="19"/></g>
  <g stroke="#4a9d59" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45">
    <path d="M-37 -46 V-59" stroke-width="21"/>
    <path d="M38 -63 V-75" stroke-width="19"/></g>
  <rect x="-23" y="-92" width="46" height="94" rx="23" fill="#6cc077"/>
  <rect x="-18" y="-86" width="12" height="76" rx="6" fill="#8ed894" opacity=".75"/>
  <rect x="9" y="-84" width="12" height="72" rx="6" fill="#3f9152" opacity=".28"/>
  <g stroke="#3f9152" stroke-width="2.6" opacity=".4" stroke-linecap="round">
    <path d="M0 -80 v8"/><path d="M0 -60 v8"/><path d="M0 -40 v8"/><path d="M0 -20 v8"/>
    <path d="M-37 -52 v6"/><path d="M38 -68 v6"/></g>
  ${face ? `<ellipse cx="-8" cy="-62" rx="3.6" ry="4.6" fill="#2f5c39"/>
    <ellipse cx="8" cy="-62" rx="3.6" ry="4.6" fill="#2f5c39"/>
    <path d="M-7 -52 q7 7 14 0" stroke="#2f5c39" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="-16" cy="-55" rx="4.5" ry="3" fill="#ff9d9d" opacity=".45"/>
    <ellipse cx="16" cy="-55" rx="4.5" ry="3" fill="#ff9d9d" opacity=".45"/>` : ''}</g>`;

/* Rounded pebble rock with a sunlit top face. */
ART.rock = (x,y,s,flip=1) => `<g transform="translate(${x},${y}) scale(${s*flip},${s})">
  <ellipse cx="0" cy="14" rx="33" ry="8" fill="#c9762f" opacity=".3"/>
  <path d="M-30 14 C-34 -2 -21 -18 -4 -19 C13 -20 28 -9 30 6 C31 12 28 14 24 14 Z" fill="#c87d4f"/>
  <path d="M-30 14 C-34 -2 -21 -18 -4 -19 C-10 -10 -15 2 -17 14 Z" fill="#dda071"/>
  <path d="M6 -16 C19 -12 28 -3 30 6 C31 12 28 14 24 14 C22 2 15 -8 6 -16 Z" fill="#a75f3b"/>
  <ellipse cx="-9" cy="-9" rx="10" ry="4.5" fill="#f0bd93" opacity=".55" transform="rotate(-16)"/></g>`;

/* Palm: curved trunk, fat rounded fronds, a couple of coconuts. */
ART.palm = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="6" cy="2" rx="24" ry="7" fill="#c9762f" opacity=".3"/>
  <path d="M0 0 C-2 -24 4 -46 16 -62" stroke="#8d5a39" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M2 -6 C0 -26 6 -44 16 -58" stroke="#a97147" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
  <g transform="translate(16,-62)">
    ${[-168,-128,-84,-40,8,52].map(a => `<g transform="rotate(${a})">
      <ellipse cx="27" cy="0" rx="29" ry="11" fill="#3f9152"/>
      <ellipse cx="25" cy="-3" rx="23" ry="7" fill="#5cb96e"/></g>`).join('')}
    <circle cx="-3" cy="7" r="5.5" fill="#8d5a39"/><circle cx="8" cy="9" r="4.6" fill="#a2683f"/>
    <circle cx="2" cy="-1" r="6" fill="#4aa65e"/></g></g>`;

/* Big acacia: split trunk, layered blobby canopy. */
ART.tree = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="40" ry="10" fill="#c9762f" opacity=".3"/>
  <path d="M-9 2 C-11 -20 -8 -38 -4 -52 h14 C7 -36 8 -18 10 2 Z" fill="#8d5a39"/>
  <path d="M-4 -44 C-18 -54 -30 -62 -40 -72" stroke="#8d5a39" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M7 -48 C20 -58 32 -64 42 -72" stroke="#8d5a39" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M2 -52 C2 -62 0 -70 -2 -78" stroke="#8d5a39" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M-2 -30 C-9 -34 -14 -38 -18 -44" stroke="#7c4d30" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="-40" cy="-80" rx="34" ry="23" fill="#3f9152"/>
  <ellipse cx="41" cy="-78" rx="35" ry="24" fill="#3f9152"/>
  <ellipse cx="0" cy="-92" rx="52" ry="31" fill="#4aa65e"/>
  <ellipse cx="-16" cy="-104" rx="32" ry="20" fill="#5cb96e"/>
  <ellipse cx="20" cy="-100" rx="24" ry="15" fill="#6cc077" opacity=".85"/>
  <ellipse cx="-44" cy="-88" rx="15" ry="9" fill="#57b268" opacity=".7"/></g>`;

ART.grass = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})" stroke="#57a862" stroke-width="3" fill="none" stroke-linecap="round">
  <path d="M0 0 C-2 -8 -6 -12 -10 -14"/><path d="M0 0 C0 -9 0 -14 1 -18"/><path d="M0 0 C3 -8 7 -11 11 -13"/></g>`;

ART.pawTrail = (x1,y1,x2,y2,bend=0) => {
  const mx = (x1+x2)/2, my = (y1+y2)/2;
  const dx = x2-x1, dy = y2-y1, len = Math.hypot(dx,dy) || 1;
  const cx = mx - dy/len*bend, cy = my + dx/len*bend;
  const n = Math.max(8, Math.round(len/34));
  let out = '';
  for(let i = 1; i < n; i++){
    const t = i/n, u = 1-t;
    const px = u*u*x1 + 2*u*t*cx + t*t*x2;
    const py = u*u*y1 + 2*u*t*cy + t*t*y2;
    const tx = 2*u*(cx-x1) + 2*t*(x2-cx);
    const ty = 2*u*(cy-y1) + 2*t*(y2-cy);
    const ang = Math.atan2(ty,tx)*180/Math.PI;
    const side = (i % 2 ? 9 : -9);
    out += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${ang.toFixed(1)}) translate(0,${side})" opacity=".5">
      <ellipse rx="7" ry="5" fill="#c9762f"/>
      <ellipse cx="7" cy="-4.5" rx="2.4" ry="2" fill="#c9762f"/>
      <ellipse cx="8.4" cy="0.6" rx="2.4" ry="2" fill="#c9762f"/>
      <ellipse cx="6" cy="5" rx="2.4" ry="2" fill="#c9762f"/></g>`;
  }
  return out;
};

ART.platform = (glow) => `
  ${glow ? `<g class="glowring"><ellipse cx="110" cy="140" rx="106" ry="38" fill="#ffd873" opacity=".28"/>
    <ellipse cx="110" cy="140" rx="99" ry="33" fill="none" stroke="#ffce5c" stroke-width="8" opacity=".95"/></g>` : ''}
  <ellipse cx="110" cy="150" rx="92" ry="28" fill="#cf7f3d" opacity=".5"/>
  <ellipse cx="110" cy="140" rx="92" ry="28" fill="#eba95c"/>
  <ellipse cx="110" cy="134" rx="84" ry="24" fill="#f7cf90"/>
  <ellipse cx="110" cy="132" rx="66" ry="17" fill="#fbdfae" opacity=".7"/>`;

ART.loc = {
  rocks: g => `<svg viewBox="0 0 220 180">${ART.platform(g)}
    <g transform="translate(140,112) scale(1.06)">
      <ellipse cx="0" cy="12" rx="52" ry="12" fill="#cf7f3d" opacity=".35"/>
      <path d="M-48 12 C-54 -14 -34 -40 -12 -42 C6 -44 20 -30 24 -12 C26 -2 22 12 16 12 Z" fill="#c87d4f"/>
      <path d="M-48 12 C-54 -14 -34 -40 -12 -42 C-14 -26 -26 -6 -30 12 Z" fill="#dda071"/>
      <path d="M6 -36 C20 -32 30 -18 32 -4 C34 6 30 12 24 12 C22 -4 16 -24 6 -36 Z" fill="#a75f3b"/>
      <path d="M18 12 C14 -6 24 -22 38 -22 C50 -22 58 -12 58 0 C58 8 54 12 48 12 Z" fill="#c87d4f"/>
      <path d="M18 12 C14 -6 24 -22 38 -22 C34 -12 30 0 30 12 Z" fill="#dda071"/>
      <ellipse cx="-34" cy="6" rx="12" ry="8" fill="#a75f3b" opacity=".45"/>
      <path d="M-52 12 C-46 4 -34 2 -26 6 C-30 10 -34 12 -38 12 Z" fill="#a75f3b" opacity=".35"/>
      <path d="M-6 -40 C4 -38 12 -30 16 -20" stroke="#f0b98d" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>
    </g></svg>`,
  oasis: g => `<svg viewBox="0 0 220 180">${ART.platform(g)}
    <ellipse cx="108" cy="136" rx="58" ry="19" fill="#3fa9c4"/>
    <ellipse cx="108" cy="133" rx="54" ry="16" fill="#7ad4e2"/>
    <ellipse cx="96" cy="129" rx="24" ry="7" fill="#b6ecf4" opacity=".85"/>
    <path d="M64 136 q14 5 30 3" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
    ${ART.palm(46,134,.78)}
    ${ART.grass(170,138,1)}${ART.grass(140,146,.75)}</svg>`,
  cave: g => `<svg viewBox="0 0 220 180">${ART.platform(g)}
    <g transform="translate(110,124)">
      <path d="M-62 14 C-66 -20 -40 -52 0 -52 C40 -52 66 -20 62 14 Z" fill="#c87d4f"/>
      <path d="M-62 14 C-66 -20 -40 -52 0 -52 C-22 -40 -36 -14 -38 14 Z" fill="#dda071"/>
      <path d="M22 -44 C46 -34 64 -12 62 14 L34 14 C36 -8 32 -30 22 -44 Z" fill="#a75f3b"/>
      <path d="M-26 14 C-26 -12 -14 -26 0 -26 C14 -26 26 -12 26 14 Z" fill="#5d3a24"/>
      <path d="M-20 14 C-20 -8 -10 -20 0 -20 C10 -20 20 -8 20 14 Z" fill="#2f1c12"/>
      <ellipse cx="-44" cy="8" rx="10" ry="6" fill="#a75f3b" opacity=".4"/>
    </g></svg>`,
  pottery: g => `<svg viewBox="0 0 220 180">${ART.platform(g)}
    <g transform="translate(110,132)">
      <ellipse cx="0" cy="4" rx="54" ry="10" fill="#cf7f3d" opacity=".35"/>
      <g transform="translate(-26,0)">
        <path d="M-20 -2 C-24 -26 -14 -42 0 -42 C14 -42 24 -26 20 -2 C18 4 -18 4 -20 -2 Z" fill="#d08c53"/>
        <path d="M-20 -2 C-24 -26 -14 -42 0 -42 C-8 -30 -12 -14 -10 2 Z" fill="#e3a771"/>
        <rect x="-13" y="-46" width="26" height="7" rx="3.5" fill="#a6603a"/>
        <path d="M-16 -18 h32" stroke="#a6603a" stroke-width="3" opacity=".7"/></g>
      <g transform="translate(20,4) scale(.82)">
        <path d="M-20 -2 C-24 -26 -14 -42 0 -42 C14 -42 24 -26 20 -2 C18 4 -18 4 -20 -2 Z" fill="#c07f49"/>
        <path d="M-20 -2 C-24 -26 -14 -42 0 -42 C-8 -30 -12 -14 -10 2 Z" fill="#dc9e66"/>
        <rect x="-13" y="-46" width="26" height="7" rx="3.5" fill="#96552f"/></g>
      <g transform="translate(48,2) scale(.6)">
        <path d="M-20 -2 C-24 -26 -14 -42 0 -42 C14 -42 24 -26 20 -2 C18 4 -18 4 -20 -2 Z" fill="#d08c53"/>
        <rect x="-13" y="-46" width="26" height="7" rx="3.5" fill="#a6603a"/></g>
    </g></svg>`,
  acacia: g => `<svg viewBox="0 0 220 180">${ART.platform(g)}
    ${ART.tree(112,132,1.02)}
    ${ART.grass(56,136,.9)}${ART.grass(168,138,.8)}</svg>`
};

ART.thorn = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="30" ry="7" fill="#c9762f" opacity=".3"/>
  <g stroke="#4c7a45" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M0 0 C-4 -18 -14 -26 -24 -32"/><path d="M0 0 C0 -22 -4 -34 -6 -44"/>
    <path d="M0 0 C6 -18 16 -26 26 -34"/><path d="M0 0 C10 -14 14 -26 14 -38"/>
    <path d="M0 0 C-10 -12 -18 -16 -28 -18"/></g>
  <g fill="#5c8f50">
    <ellipse cx="-22" cy="-32" rx="9" ry="7"/><ellipse cx="-6" cy="-44" rx="10" ry="8"/>
    <ellipse cx="25" cy="-34" rx="10" ry="8"/><ellipse cx="14" cy="-38" rx="8" ry="6"/>
    <ellipse cx="-27" cy="-18" rx="8" ry="6"/><ellipse cx="4" cy="-24" rx="12" ry="9"/></g>
  <g fill="#6ea45f" opacity=".75">
    <ellipse cx="-8" cy="-46" rx="6" ry="4"/><ellipse cx="22" cy="-36" rx="6" ry="4"/></g></g>`;

ART.deadBush = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="2" rx="24" ry="6" fill="#c9762f" opacity=".28"/>
  <g stroke="#b98a54" stroke-width="3.4" fill="none" stroke-linecap="round">
    <path d="M0 0 C-4 -14 -12 -20 -22 -24"/><path d="M0 0 C-1 -18 -3 -26 -4 -34"/>
    <path d="M0 0 C6 -14 14 -20 24 -26"/><path d="M0 0 C9 -10 12 -20 12 -30"/>
    <path d="M-8 -12 l-10 -4 M8 -14 l11 -3 M2 -22 l8 -8"/></g></g>`;

ART.wallTorch = (x,y,s) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="-30" rx="120" ry="114" fill="url(#torchGlow)"/>
  <rect x="-6" y="-20" width="12" height="34" rx="6" fill="#7a5233"/>
  <rect x="-11" y="-26" width="22" height="10" rx="5" fill="#5d3d24"/>
  <path d="M0 -66 C11 -48 18 -40 18 -30 a18 18 0 0 1 -36 0 C-18 -40 -11 -48 0 -66 Z" fill="#ff9d2e"/>
  <path d="M0 -50 C6 -38 10 -34 10 -28 a10 10 0 0 1 -20 0 C-10 -34 -6 -38 0 -50 Z" fill="#ffe680"/></g>`;

ART.glyph = (x,y,s,i) => {
  const g = ['M0 0 v22 M-8 8 h16', 'M-9 0 h18 v20 h-18 z M0 0 v20', 'M0 -2 l10 20 h-20 z',
             'M-8 0 a8 10 0 1 0 16 0 a8 10 0 1 0 -16 0 M0 -10 v-8', 'M-9 18 l9 -20 l9 20 M-5 8 h10',
             'M-8 -2 h16 M0 -2 v22 M-6 20 h12'][i % 6];
  return `<path transform="translate(${x},${y}) scale(${s})" d="${g}" stroke="#e0a95e" stroke-width="3"
    fill="none" opacity=".55" stroke-linecap="round" stroke-linejoin="round"/>`;
};
