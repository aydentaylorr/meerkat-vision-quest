/* Nomi, drawn as SVG. */
import { game } from '../core/state.js';
import { cosmetic } from '../data/cosmetics.js';

export function meerkatSVG(opts){
  opts = opts || {};
  const hat  = opts.hat  !== undefined ? opts.hat  : game.equipped.hat;
  const item = opts.item !== undefined ? opts.item : game.equipped.item;
  const h = hat ? cosmetic(hat) : null, it = item ? cosmetic(item) : null;
  return `<svg viewBox="0 0 120 170" class="bob">
    <ellipse cx="60" cy="163" rx="31" ry="6" fill="#b9762f" opacity=".32"/>
    <path d="M86 132 C107 128 116 106 106 90 C104 96 102 100 99 104 C103 114 99 122 84 124 Z" fill="#c99a63"/>
    <path d="M86 132 C101 129 109 118 108 106 C105 116 98 122 85 125 Z" fill="#b6874f" opacity=".6"/>
    <g>
      <rect x="18" y="100" width="26" height="35" rx="11" fill="#a8703f"/>
      <rect x="22" y="106" width="18" height="10" rx="5" fill="#c98d55"/>
      <rect x="28" y="96" width="11" height="8" rx="4" fill="#8d5a33"/>
    </g>
    <ellipse cx="60" cy="120" rx="28" ry="35" fill="#dcae74"/>
    <ellipse cx="61" cy="126" rx="19" ry="27" fill="#f7e6ca"/>
    <path d="M32 108 C28 118 28 128 32 136" stroke="#c99a63" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M44 100 C50 112 52 124 50 138" stroke="#8d5a33" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
    <ellipse cx="34" cy="118" rx="8" ry="16" fill="#d3a067"/>
    <ellipse cx="86" cy="118" rx="8" ry="16" fill="#d3a067"/>
    <ellipse cx="47" cy="152" rx="12" ry="7.5" fill="#c99a63"/>
    <ellipse cx="73" cy="152" rx="12" ry="7.5" fill="#c99a63"/>
    <circle cx="25" cy="48" r="11.5" fill="#c99a63"/><circle cx="95" cy="48" r="11.5" fill="#c99a63"/>
    <circle cx="25" cy="48" r="6" fill="#a2764a"/><circle cx="95" cy="48" r="6" fill="#a2764a"/>
    <path d="M40 92 q20 12 40 0 q-2 10 -20 12 q-18 -2 -20 -12 Z" fill="#69c073"/>
    <path d="M74 98 C84 100 88 108 84 116 C80 108 76 104 70 102 Z" fill="#4fa85f"/>
    <ellipse cx="60" cy="58" rx="32" ry="29" fill="#e6c396"/>
    <ellipse cx="60" cy="66" rx="24" ry="19" fill="#f2d8ae" opacity=".55"/>
    <ellipse cx="46" cy="56" rx="12.5" ry="11.5" fill="#6b4a2e"/>
    <ellipse cx="74" cy="56" rx="12.5" ry="11.5" fill="#6b4a2e"/>
    <circle cx="46" cy="56" r="7.6" fill="#221610"/><circle cx="74" cy="56" r="7.6" fill="#221610"/>
    <circle cx="48.6" cy="53" r="2.8" fill="#fff"/><circle cx="76.6" cy="53" r="2.8" fill="#fff"/>
    <circle cx="43.6" cy="59.4" r="1.5" fill="#fff" opacity=".7"/><circle cx="71.6" cy="59.4" r="1.5" fill="#fff" opacity=".7"/>
    <ellipse cx="60" cy="74" rx="12" ry="8.5" fill="#f7e6ca"/>
    <ellipse cx="60" cy="70" rx="5" ry="3.8" fill="#3a2a1e"/>
    <path d="M60 73 v3 M54 79 q6 5 12 0" stroke="#3a2a1e" stroke-width="2.1" fill="none" stroke-linecap="round"/>
    <g>
      <path d="M27 38 q33 -16 66 0" stroke="#7a5233" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="34" r="11" fill="#7a5233"/><circle cx="76" cy="34" r="11" fill="#7a5233"/>
      <circle cx="44" cy="34" r="7.6" fill="#bfe9f5"/><circle cx="76" cy="34" r="7.6" fill="#bfe9f5"/>
      <circle cx="41.5" cy="31.5" r="2.6" fill="#fff" opacity=".9"/>
      <circle cx="73.5" cy="31.5" r="2.6" fill="#fff" opacity=".9"/>
    </g>
    ${h ? `<text x="60" y="24" font-size="30" text-anchor="middle">${h.em}</text>` : ''}
  </svg>`;
}
