/* The illustrated map and the three adventure backdrops. */
import { ART } from './primitives.js';

export const LOCATIONS = [
  { id:'g1',  x:12, y:20, w:11, art:'rocks',   adv:1,  name:'Grade 1' },
  { id:'g2',  x:30, y:12, w:11, art:'oasis',   adv:2,  name:'Grade 2' },
  { id:'g3',  x:48, y:22, w:11, art:'cave',    adv:3,  name:'Grade 3' },
  { id:'g4',  x:64, y:14, w:11, art:'pottery', adv:4,  name:'Grade 4' },
  { id:'g5',  x:80, y:24, w:11, art:'acacia',  adv:5,  name:'Grade 5' },
  { id:'g6',  x:84, y:44, w:11, art:'rocks',   adv:6,  name:'Grade 6' },
  { id:'g7',  x:68, y:52, w:11, art:'oasis',   adv:7,  name:'Grade 7' },
  { id:'g8',  x:50, y:44, w:11, art:'cave',    adv:8,  name:'Grade 8' },
  { id:'g9',  x:32, y:54, w:11, art:'pottery', adv:9,  name:'Grade 9' },
  { id:'g10', x:14, y:48, w:11, art:'acacia',  adv:10, name:'Grade 10' },
  { id:'g11', x:22, y:70, w:11, art:'rocks',   adv:11, name:'Grade 11' },
  { id:'g12', x:44, y:78, w:11, art:'oasis',   adv:12, name:'Grade 12' }
];

export const SCENES = {};

const SKY_DEFS = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#bfe3f5"/><stop offset="1" stop-color="#eefaff"/></linearGradient>
  <linearGradient id="skyHot" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9d9f0"/><stop offset=".6" stop-color="#ffeacb"/><stop offset="1" stop-color="#ffd9a2"/></linearGradient>
  <linearGradient id="skyWide" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#96cdea"/><stop offset="1" stop-color="#e8f6fd"/></linearGradient>
  <linearGradient id="caveWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a3f63"/><stop offset="1" stop-color="#2e2742"/></linearGradient>
  <radialGradient id="torchGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffd77a" stop-opacity=".6"/>
    <stop offset=".55" stop-color="#ffb03a" stop-opacity=".22"/>
    <stop offset="1" stop-color="#ff9d2e" stop-opacity="0"/></radialGradient>
  <radialGradient id="shaftGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="#ffeec2" stop-opacity=".55"/>
    <stop offset="1" stop-color="#ffeec2" stop-opacity="0"/></radialGradient>
  <radialGradient id="vignette" cx="50%" cy="48%" r="62%">
    <stop offset=".55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#0a0716" stop-opacity=".55"/></radialGradient>
  <radialGradient id="caveAir" cx="50%" cy="42%" r="70%">
    <stop offset="0" stop-color="#4b3f66"/><stop offset="1" stop-color="#171227"/></radialGradient>
  <linearGradient id="sandA" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fce7bb"/><stop offset="1" stop-color="#f9dca6"/></linearGradient>
  <linearGradient id="sandB" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f8d296"/><stop offset="1" stop-color="#f5c581"/></linearGradient>
  <linearGradient id="sandC" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4c078"/><stop offset="1" stop-color="#efb267"/></linearGradient>
  <linearGradient id="sandD" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#eda95c"/><stop offset="1" stop-color="#e79b4e"/></linearGradient>
  <linearGradient id="sandE" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e6994e"/><stop offset="1" stop-color="#d9853c"/></linearGradient>
</defs>`;

SCENES.map = function(){
  const P = [];
  P.push(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#bfe3f5"/><stop offset="1" stop-color="#eefaff"/></linearGradient>
    <linearGradient id="sandA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fce7bb"/><stop offset="1" stop-color="#f9dca6"/></linearGradient>
    <linearGradient id="sandB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8d296"/><stop offset="1" stop-color="#f5c581"/></linearGradient>
    <linearGradient id="sandC" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4c078"/><stop offset="1" stop-color="#efb267"/></linearGradient>
    <linearGradient id="sandD" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eda95c"/><stop offset="1" stop-color="#e79b4e"/></linearGradient>
    <linearGradient id="sandE" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6994e"/><stop offset="1" stop-color="#d9853c"/></linearGradient>
  </defs>`);
  P.push(`<rect width="1600" height="900" fill="url(#sky)"/>`);
  P.push(`<circle cx="1330" cy="80" r="180" fill="#fff6d8" opacity=".45"/>`);
  P.push(`<circle cx="1330" cy="80" r="54" fill="#fff3b8" opacity=".9"/>`);
  P.push(ART.cloud(210,110,1.05), ART.cloud(690,74,.8,.8), ART.cloud(1150,150,1.15), ART.cloud(1490,70,.7,.75));
  /* birds */
  P.push(`<g stroke="#a98a6a" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round">
    <path d="M470 150 q10 -8 20 0 q10 -8 20 0"/>
    <path d="M530 178 q7 -6 14 0 q7 -6 14 0"/>
    <path d="M860 132 q8 -7 16 0 q8 -7 16 0"/></g>`);
  /* distant mesas for depth */
  P.push(`<g fill="#f6d6a6" opacity=".85">
    <path d="M60 322 l34 -54 h118 l30 54 Z"/>
    <path d="M980 316 l26 -42 h96 l24 42 Z"/>
    <path d="M1300 322 l40 -62 h150 l34 62 Z"/></g>`);

  P.push(`<path d="M0 330 C130 276 270 274 400 306 C540 342 650 276 810 280 C970 284 1090 336 1250 306 C1380 282 1500 292 1600 274 L1600 900 L0 900 Z" fill="url(#sandA)"/>`);
  P.push(`<path d="M0 420 C170 368 310 400 470 410 C650 420 770 366 950 374 C1130 382 1270 428 1430 408 C1510 398 1560 402 1600 394 L1600 900 L0 900 Z" fill="url(#sandB)"/>`);
  P.push(`<path d="M0 534 C210 482 350 532 530 543 C710 554 850 500 1030 514 C1210 528 1350 562 1600 528 L1600 900 L0 900 Z" fill="url(#sandC)"/>`);
  P.push(`<path d="M0 668 C230 616 430 676 650 678 C870 680 1050 626 1270 640 C1430 650 1530 672 1600 662 L1600 900 L0 900 Z" fill="url(#sandD)"/>`);
  P.push(`<path d="M0 812 C210 764 470 810 710 820 C950 830 1220 792 1600 812 L1600 900 L0 900 Z" fill="url(#sandE)"/>`);
  /* dune crest shading */
  P.push(`<g fill="none" stroke="#d9853c" opacity=".16" stroke-width="6" stroke-linecap="round">
    <path d="M120 470 C250 440 360 462 470 486"/>
    <path d="M700 596 C830 566 950 586 1060 610"/>
    <path d="M1180 726 C1300 700 1400 714 1520 736"/>
    <path d="M240 726 C340 706 430 716 520 736"/></g>`);

  /* footprint trails between locations */
  const bends = Array.from({length: LOCATIONS.length - 1}, (_, i) => (i % 2 === 0 ? 65 : -65));
  for(let i = 0; i < LOCATIONS.length - 1; i++){
    const a = LOCATIONS[i], b = LOCATIONS[i+1];
    P.push(ART.pawTrail(a.x*16, a.y*9 + 22, b.x*16, b.y*9 + 22, bends[i]));
  }

  /* scenery — far, mid and foreground bands */
  P.push(ART.palm(548,392,.52), ART.palm(598,384,.42), ART.cactus(300,378,.46), ART.cactus(1032,362,.42));
  P.push(ART.rock(748,392,.6), ART.rock(1338,362,.55,-1), ART.grass(950,398,.8), ART.grass(190,388,.7));
  P.push(ART.tree(126,376,.44), ART.grass(660,470,1));
  P.push(ART.cactus(1450,506,.72,true), ART.rock(1112,478,.85), ART.palm(1562,512,.66));
  P.push(ART.cactus(330,498,.5), ART.rock(604,546,.6), ART.tree(1292,512,.58), ART.grass(1400,498,.8));
  P.push(ART.rock(70,606,1), ART.grass(300,626,1.1), ART.rock(1186,600,.9,-1));
  P.push(ART.cactus(706,632,.62,true), ART.grass(1424,604,1), ART.palm(1014,736,.78));
  P.push(ART.rock(1474,708,1.1,-1), ART.grass(766,716,1.2));
  P.push(ART.rock(432,812,1.6,-1), ART.cactus(152,880,1.3,true), ART.cactus(1232,890,1.25,true));
  P.push(ART.rock(886,866,1.2), ART.grass(1014,850,1.5), ART.grass(566,876,1.4), ART.grass(1330,830,1.2));
  P.push(`<g fill="#d9853c" opacity=".12">
    <ellipse cx="380" cy="560" rx="150" ry="26"/><ellipse cx="1120" cy="690" rx="190" ry="30"/>
    <ellipse cx="820" cy="470" rx="120" ry="20"/></g>`);
  /* fill the last sliver of sand right to the bottom edge so tall/narrow windows never show a flat strip */
  P.push(ART.rock(40,900,.85,1), ART.grass(230,898,1), ART.cactus(700,900,.7,true), ART.rock(960,900,1,-1),
    ART.grass(1170,896,.9), ART.cactus(1420,900,.8,true), ART.rock(1560,898,.7,1));
  P.push(`<g stroke="#c9762f" stroke-width="4" opacity=".18" fill="none" stroke-linecap="round">
    <path d="M0 862 C220 848 420 872 640 858"/><path d="M700 878 C920 864 1140 886 1360 870"/>
    <path d="M1360 862 C1450 856 1540 866 1600 858"/></g>`);
  return P.join('');
};

SCENES.adv1 = function(){
  const P = [SKY_DEFS];
  P.push(`<rect width="1600" height="900" fill="url(#skyHot)"/>`);
  P.push(`<circle cx="820" cy="120" r="200" fill="#fff3c9" opacity=".5"/>`);
  P.push(`<circle cx="820" cy="120" r="70" fill="#fff6d8"/>`);
  P.push(ART.cloud(260,120,.9,.7), ART.cloud(1320,150,1,.65));
  /* canyon walls either side */
  P.push(`<path d="M0 250 L150 210 L300 300 L420 260 L520 340 L560 900 L0 900 Z" fill="#e8a463"/>`);
  P.push(`<path d="M0 250 L150 210 L300 300 L360 280 L330 900 L0 900 Z" fill="#f0b478"/>`);
  P.push(`<path d="M1600 240 L1450 200 L1300 290 L1180 250 L1080 330 L1040 900 L1600 900 Z" fill="#e8a463"/>`);
  P.push(`<path d="M1600 240 L1450 200 L1330 285 L1290 900 L1600 900 Z" fill="#f0b478"/>`);
  P.push(`<g stroke="#c9762f" stroke-width="5" opacity=".22" fill="none" stroke-linecap="round">
    <path d="M90 330 C150 380 130 460 170 540"/><path d="M300 400 C340 470 320 540 350 620"/>
    <path d="M1380 320 C1330 390 1360 470 1320 550"/><path d="M1180 420 C1220 480 1200 560 1230 630"/></g>`);
  /* valley floor */
  P.push(`<path d="M0 470 C260 430 420 470 620 480 C820 490 1000 452 1200 462 C1360 470 1500 486 1600 470 L1600 900 L0 900 Z" fill="url(#sandC)"/>`);
  P.push(`<path d="M0 600 C240 560 460 610 700 618 C940 626 1160 586 1600 604 L1600 900 L0 900 Z" fill="url(#sandD)"/>`);
  /* the dried-out waterhole */
  P.push(`<ellipse cx="800" cy="770" rx="560" ry="128" fill="#d9853c" opacity=".55"/>`);
  P.push(`<ellipse cx="800" cy="778" rx="520" ry="112" fill="#e3a05a"/>`);
  P.push(`<ellipse cx="800" cy="784" rx="470" ry="96" fill="#d59250"/>`);
  P.push(`<g stroke="#a9642c" stroke-width="3.4" fill="none" opacity=".55" stroke-linecap="round">
    <path d="M470 780 h120 l50 -34 M590 780 l40 40"/>
    <path d="M700 748 l60 26 h110 l50 -30 M760 774 l-24 44 M870 774 l30 40"/>
    <path d="M1000 762 l70 20 h120 M1070 782 l-20 40"/>
    <path d="M560 820 h130 l60 26 M690 820 l-30 36"/>
    <path d="M900 826 h140 l50 -22 M1040 826 l24 34"/></g>`);
  P.push(`<ellipse cx="760" cy="756" rx="70" ry="16" fill="#8fd0d8" opacity=".35"/>`);
  /* stuff on the floor */
  P.push(ART.rock(300,700,1.1), ART.deadBush(470,690,1.1), ART.cactus(180,760,1.15,true));
  P.push(ART.rock(1330,706,1.25,-1), ART.deadBush(1180,678,.95), ART.cactus(1450,782,1.2,true));
  P.push(ART.grass(620,662,.9), ART.grass(1020,650,.8), ART.deadBush(900,640,.8));
  P.push(ART.rock(660,872,1.5,-1), ART.rock(1120,884,1.35));
  P.push(ART.palm(1290,600,.7), ART.deadBush(240,620,.8));
  return P.join('');
};

SCENES.adv2 = function(){
  const P = [SKY_DEFS];
  P.push(`<rect width="1600" height="900" fill="url(#skyWide)"/>`);
  P.push(ART.cloud(240,120,1.2,.9), ART.cloud(760,90,.9,.75), ART.cloud(1280,140,1.3,.85), ART.cloud(1520,72,.8,.7));
  /* the hawk, circling */
  P.push(`<g transform="translate(1080,210) scale(1.5)" opacity=".92">
    <ellipse cx="0" cy="6" rx="15" ry="26" fill="#6b4a2e"/>
    <path d="M-13 -2 C-46 -30 -80 -22 -92 2 C-62 -4 -34 8 -13 20 Z" fill="#7d5836"/>
    <path d="M13 -2 C46 -30 80 -22 92 2 C62 -4 34 8 13 20 Z" fill="#7d5836"/>
    <path d="M-13 4 C-42 -16 -66 -12 -78 4 C-54 0 -32 10 -13 18 Z" fill="#98693f" opacity=".8"/>
    <path d="M13 4 C42 -16 66 -12 78 4 C54 0 32 10 13 18 Z" fill="#98693f" opacity=".8"/>
    <path d="M-6 28 l6 20 l6 -20 Z" fill="#7d5836"/>
    <circle cx="0" cy="-20" r="12" fill="#8a5f3a"/><circle cx="-4" cy="-22" r="2.8" fill="#fff"/>
    <circle cx="-4" cy="-22" r="1.4" fill="#221610"/><path d="M6 -20 l11 5 l-11 5 z" fill="#ffc94d"/></g>`);
  /* ridge with sentries */
  P.push(`<path d="M0 452 C170 402 330 436 470 448 C620 460 760 418 940 424 C1120 430 1280 462 1600 436 L1600 900 L0 900 Z" fill="url(#sandB)"/>`);
  P.push(`<path d="M950 376 C1020 318 1150 296 1242 334 C1322 366 1382 390 1472 400
    C1400 410 1270 426 1130 402 C1040 388 990 382 950 376 Z" fill="#f3c98d"/>`);
  P.push(`<path d="M1000 356 C1060 322 1150 310 1220 332 C1150 328 1070 340 1000 356 Z" fill="#f9dcae" opacity=".7"/>`);
  P.push(`<g fill="#c98d55" opacity=".9">
    <ellipse cx="1124" cy="336" rx="7" ry="15"/><ellipse cx="1124" cy="318" rx="6" ry="6"/>
    <ellipse cx="1156" cy="342" rx="6" ry="13"/><ellipse cx="1156" cy="326" rx="5" ry="5"/></g>`);
  P.push(`<path d="M0 580 C250 534 470 588 700 596 C930 604 1150 562 1600 582 L1600 900 L0 900 Z" fill="url(#sandC)"/>`);
  P.push(`<path d="M0 726 C260 682 520 736 780 742 C1040 748 1300 712 1600 728 L1600 900 L0 900 Z" fill="url(#sandD)"/>`);
  /* the shadow sweeping the ground */
  P.push(`<g opacity=".22" fill="#7a4a1e">
    <ellipse cx="640" cy="700" rx="150" ry="34"/>
    <path d="M500 696 C440 674 400 678 386 692 C420 690 460 700 500 710 Z"/>
    <path d="M780 696 C840 674 880 678 894 692 C860 690 820 700 780 710 Z"/></g>`);
  P.push(`<g fill="none" stroke="#d9853c" opacity=".16" stroke-width="6" stroke-linecap="round">
    <path d="M180 630 C300 604 400 618 500 640"/><path d="M980 800 C1120 774 1240 790 1380 812"/></g>`);
  /* thorn bushes */
  P.push(ART.thorn(430,604,1), ART.thorn(1220,592,.9), ART.thorn(760,634,1.15));
  P.push(ART.thorn(150,742,1.5), ART.thorn(1420,760,1.5), ART.thorn(980,830,1.7), ART.thorn(520,860,1.6));
  P.push(ART.rock(1080,742,1), ART.rock(420,712,.85,-1), ART.grass(880,730,1.1), ART.grass(1300,860,1.4));
  P.push(ART.cactus(60,830,1.2,true), ART.grass(700,880,1.5), ART.rock(1520,880,1.5,-1));
  return P.join('');
};

SCENES.adv3 = function(){
  const P = [SKY_DEFS];
  P.push(`<rect width="1600" height="900" fill="url(#caveAir)"/>`);
  /* ceiling and stalactites */
  P.push(`<path d="M0 0 H1600 V150 C1400 210 1200 130 1000 180 C800 230 600 140 400 190 C260 224 120 180 0 210 Z" fill="url(#caveWall)"/>`);
  P.push(`<g fill="#3b3253">
    <path d="M180 195 l24 0 l-12 74 Z"/><path d="M300 205 l30 0 l-15 96 Z"/><path d="M560 190 l22 0 l-11 62 Z"/>
    <path d="M900 186 l28 0 l-14 86 Z"/><path d="M1080 175 l22 0 l-11 58 Z"/><path d="M1320 178 l32 0 l-16 100 Z"/>
    <path d="M1480 196 l24 0 l-12 68 Z"/></g>`);
  /* side walls */
  P.push(`<path d="M0 190 C120 240 90 380 140 520 C180 640 120 760 0 830 Z" fill="#453a5e"/>`);
  P.push(`<path d="M1600 180 C1470 236 1510 380 1460 520 C1420 640 1490 770 1600 840 Z" fill="#453a5e"/>`);
  /* back wall with painted glyphs */
  P.push(`<path d="M120 300 C420 250 700 290 980 260 C1180 240 1340 280 1480 300 L1480 640 L120 640 Z" fill="#3d3455" opacity=".85"/>`);
  P.push(`<g>${[0,1,2,3,4,5,0,2,4,1].map((n,i) => ART.glyph(300 + i*110, 380 + (i % 3)*40, 1.5, n)).join('')}</g>`);
  /* floor */
  P.push(`<path d="M0 630 C300 590 600 640 900 636 C1160 632 1400 600 1600 626 L1600 900 L0 900 Z" fill="#4a3f63"/>`);
  P.push(`<path d="M0 720 C320 686 640 730 960 726 C1240 722 1420 700 1600 716 L1600 900 L0 900 Z" fill="#574a72"/>`);
  P.push(`<g stroke="#3b3253" stroke-width="4" opacity=".6" fill="none">
    <path d="M240 780 h280 M560 760 h300 M900 800 h260 M120 840 h340 M700 856 h420"/></g>`);
  /* the spring */
  P.push(`<ellipse cx="1120" cy="800" rx="250" ry="62" fill="#2b6a86"/>`);
  P.push(`<ellipse cx="1120" cy="794" rx="235" ry="54" fill="#3f9fc4"/>`);
  P.push(`<ellipse cx="1060" cy="782" rx="110" ry="22" fill="#7ad4e2" opacity=".7"/>`);
  P.push(`<g stroke="#bdeef7" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round">
    <path d="M960 806 q40 10 90 4"/><path d="M1180 812 q50 8 100 -2"/></g>`);
  /* warm pools of torchlight on the floor */
  P.push(`<g><ellipse cx="200" cy="700" rx="190" ry="52" fill="url(#torchGlow)"/>
    <ellipse cx="760" cy="686" rx="165" ry="46" fill="url(#torchGlow)"/>
    <ellipse cx="1400" cy="706" rx="190" ry="52" fill="url(#torchGlow)"/></g>`);
  /* torches */
  P.push(ART.wallTorch(200,560,1.5), ART.wallTorch(760,540,1.3), ART.wallTorch(1400,566,1.5));
  /* daylight from a crack in the roof */
  P.push(`<path d="M330 120 L470 120 L700 660 L330 660 Z" fill="#ffeec2" opacity=".13"/>`);
  P.push(`<ellipse cx="516" cy="662" rx="200" ry="46" fill="url(#shaftGlow)"/>`);
  P.push(`<g fill="#ffeec2" opacity=".45">
    <circle cx="420" cy="240" r="3"/><circle cx="498" cy="340" r="2.4"/><circle cx="392" cy="400" r="2.6"/>
    <circle cx="560" cy="470" r="3.2"/><circle cx="462" cy="546" r="2.2"/><circle cx="612" cy="590" r="2.6"/></g>`);
  /* treasure */
  P.push(`<g transform="translate(430,812) scale(1.45)">
    <ellipse cx="0" cy="10" rx="90" ry="20" fill="#2f2745" opacity=".6"/>
    <path d="M-70 10 C-60 -22 60 -22 70 10 Z" fill="#e0a022"/>
    <path d="M-52 10 C-44 -12 40 -14 52 10 Z" fill="#ffc94d"/>
    <circle cx="-30" cy="-2" r="9" fill="#ffe07a"/><circle cx="6" cy="-8" r="8" fill="#ffe07a"/>
    <circle cx="34" cy="0" r="7" fill="#ffd85c"/>
    <path d="M-8 -30 L6 -16 L-8 0 L-22 -16 Z" fill="#7fd0ee"/>
    <path d="M-8 -30 L6 -16 L-8 0 Z" fill="#4bb3e6"/></g>`);
  P.push(`<g fill="#fff" opacity=".8">
    <path d="M470 740 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/>
    <path d="M370 776 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z"/></g>`);
  P.push(`<rect width="1600" height="900" fill="url(#vignette)"/>`);
  return P.join('');
};

export const SCENE_HERO = { adv1:{ x:20, y:80 }, adv2:{ x:17, y:80 }, adv3:{ x:20, y:79 } };
