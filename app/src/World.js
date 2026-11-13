/* The illustrated world behind every card: the scrolling map of twelve grades, and the three
   adventure backdrops. The web game's map is a 16:9 painting; a phone is tall, so here the same
   building blocks (dunes, cacti, paw trails, landmarks) are laid out as a trail that climbs from
   Grade 1 at the bottom to Grade 12 under the open sky. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { useGame, useTheme } from './GameContext';
import { currentGrade, gradeFullyDone, isGradeUnlocked } from './rules';
import { ART, GRADES_COUNT, LOCATIONS, SCENES } from './shared';
import { Art, Nomi, Txt, useLoop } from './ui';

/* ---------- the map, in its own units (a column 900 wide) ---------- */

const COL = 900;            // width of the trail column
const MAX_COL_PX = 560;     // the column never gets wider than this on screen
const NODE = 250;           // a landmark's width
const STEP = 205;           // climb between one grade and the next
const TOP = 500;            // Grade 12 sits this far down
const HEIGHT = TOP + (GRADES_COUNT - 1) * STEP + 380;
const NODE_X = [300, 596, 330, 612, 292, 584, 322, 604, 300, 610, 334, 566];

/* where a grade's landmark is centred */
const spot = grade => ({ x: NODE_X[grade - 1], y: TOP + (GRADES_COUNT - grade) * STEP });

/* a repeatable "random" so the scenery is the same on every launch */
function seeded(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
}

const NEAR_SAND = '#e0904a';   // the nearest dunes, and everything below the painting

/* a band of dunes: a wavy top edge at `y`, filled to the bottom of the map */
function dune(y, amp, shift, fill) {
  let d = `M-1700 ${y}`;
  for (let x = -1700, i = shift; x < 2600; x += 430, i++) {
    const crest = y + (i % 2 ? -amp : amp);
    d += ` C${x + 140} ${crest} ${x + 290} ${crest} ${x + 430} ${y + ((i * 7) % 5 - 2) * amp * 0.16}`;
  }
  return `<path d="${d} L2600 ${HEIGHT} L-1700 ${HEIGHT} Z" fill="${fill}"/>`;
}

function scenery() {
  const rand = seeded(12), between = (a, b) => a + rand() * (b - a);
  const items = [];
  const add = (kind, x, y) => items.push({ kind, x: Math.round(x), y: Math.round(y), s: +(0.75 + 0.75 * (y / HEIGHT) + rand() * 0.2).toFixed(2), flip: rand() < 0.5 ? -1 : 1, face: rand() < 0.45 });
  const big = ['cactus', 'rock', 'palm', 'tree', 'cactus', 'rock'];
  // beside each landmark, on the empty side of the trail
  for (let g = 1; g <= GRADES_COUNT; g++) {
    const { x, y } = spot(g);
    add(big[(g * 5) % big.length], x < COL / 2 ? between(690, 800) : between(90, 200), y + between(-30, 70));
  }
  // out in the open desert either side (seen on wide screens, peeking in on narrow ones)
  for (let y = 420; y < HEIGHT - 20; y += 62) {
    add(big[Math.floor(rand() * big.length)], between(-760, 70), y + between(-20, 20));
    add(big[Math.floor(rand() * big.length)], between(830, 1660), y + between(-20, 20));
    add('grass', between(-700, 1600), y + between(-20, 20));
  }
  // the near edge of the map
  [[150, 'cactus'], [470, 'rock'], [760, 'cactus'], [-320, 'rock'], [1240, 'palm']].forEach(([x, kind]) => add(kind, x, HEIGHT - between(20, 110)));
  return items.sort((a, b) => a.y - b.y).map(i =>
    i.kind === 'cactus' ? ART.cactus(i.x, i.y, i.s, i.face)
      : i.kind === 'rock' ? ART.rock(i.x, i.y, i.s, i.flip)
        : i.kind === 'grass' ? ART.grass(i.x, i.y, i.s + 0.3)
          : ART[i.kind](i.x, i.y, i.s * 0.8)).join('');
}

const PAW = 1.5; // paw prints are drawn for the web's wider painting; enlarge them here
function trails() {
  let out = '';
  for (let g = 1; g < GRADES_COUNT; g++) {
    const a = spot(g), b = spot(g + 1), foot = 0.2 * NODE;
    out += ART.pawTrail(a.x / PAW, (a.y + foot) / PAW, b.x / PAW, (b.y + foot) / PAW, g % 2 ? 44 : -44);
  }
  return `<g transform="scale(${PAW})">${out}</g>`;
}

const gradient = (id, from, to) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;

/* everything except the landmarks; `left` and `width` choose how much desert shows either side */
const MAP_BODY = [
  `<defs>${gradient('sky', '#bfe3f5', '#eefaff')}${gradient('sandA', '#fce7bb', '#f9dca6')}${gradient('sandB', '#f8d296', '#f5c581')}
    ${gradient('sandC', '#f4c078', '#efb267')}${gradient('sandD', '#eda95c', '#e79b4e')}</defs>`,
  `<rect x="-1700" width="4300" height="${HEIGHT}" fill="url(#sky)"/>`,
  `<circle cx="690" cy="120" r="170" fill="#fff6d8" opacity=".45"/><circle cx="690" cy="120" r="52" fill="#fff3b8" opacity=".9"/>`,
  ART.cloud(170, 110, 1.05), ART.cloud(470, 210, 0.8, 0.8), ART.cloud(-420, 150, 1.15), ART.cloud(1280, 120, 1.1), ART.cloud(-1100, 90, 0.9, 0.8),
  `<g stroke="#a98a6a" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round">
    <path d="M330 170 q10 -8 20 0 q10 -8 20 0"/><path d="M400 200 q7 -6 14 0 q7 -6 14 0"/></g>`,
  `<g fill="#f6d6a6" opacity=".85"><path d="M40 352 l34 -54 h118 l30 54 Z"/><path d="M610 346 l26 -42 h96 l24 42 Z"/>
    <path d="M-560 352 l40 -62 h150 l34 62 Z"/><path d="M1180 352 l40 -62 h150 l34 62 Z"/></g>`,
  dune(330, 30, 0, 'url(#sandA)'), dune(700, 34, 1, 'url(#sandB)'), dune(1250, 36, 0, 'url(#sandC)'), dune(1850, 38, 1, 'url(#sandD)'), dune(2450, 34, 0, NEAR_SAND),
  trails(),
  scenery(),
].join('');

const GLOW = `<svg viewBox="0 0 220 180"><ellipse cx="110" cy="140" rx="106" ry="38" fill="#ffd873" opacity=".28"/>
  <ellipse cx="110" cy="140" rx="99" ry="33" fill="none" stroke="#ffce5c" stroke-width="8" opacity=".95"/></svg>`;

function Landmark({ grade, px, size, state, onPress }) {
  const { c, rem } = useTheme();
  const pulse = useLoop(2400);
  const art = LOCATIONS[grade - 1].art;
  const height = (size * 180) / 220;
  const label = state === 'locked' ? `Grade ${grade}, locked` : state === 'done' ? `Grade ${grade}, finished` : `Grade ${grade}`;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={{ position: 'absolute', left: px.x - size / 2, top: px.y - height / 2, width: size, height }}>
      {state === 'current' && (
        <Animated.View style={{ position: 'absolute', opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }}>
          <Art xml={GLOW} width={size} />
        </Animated.View>
      )}
      <Art xml={ART.loc[art](false)} width={size} />
      {(state === 'done' || state === 'locked') && (
        <View style={{ position: 'absolute', right: -0.04 * size, top: 0.26 * height }}>
          <Art xml={state === 'done' ? ART.tick : ART.lock} width={0.26 * size} />
        </View>
      )}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: -0.06 * height, alignItems: 'center' }}>
        <View style={{ backgroundColor: state === 'current' ? c.brown : 'rgba(255,250,240,0.94)', borderRadius: 999, paddingHorizontal: rem(0.6), boxShadow: '0 3px 0 rgba(160,110,60,0.25)' }}>
          <Txt weight="black" style={{ fontSize: rem(0.72), lineHeight: rem(1.2), color: state === 'current' ? '#fffaf0' : '#6b4423' }}>Grade {grade}</Txt>
        </View>
      </View>
    </Pressable>
  );
}

/* `quiet` shows the painting only (behind the sign-in form); `bottomSpace` is how much of the screen
   the map card covers, so the last landmark can scroll clear of it. */
export function MapWorld({ quiet, bottomSpace = 0, onOpenGrade }) {
  const { game, user, toast } = useGame();
  const win = useWindowDimensions();
  const scroller = useRef(null);
  const nudge = useLoop(1500);

  const scale = Math.min(win.width, MAX_COL_PX) / COL;
  const left = COL / 2 - win.width / scale / 2;                  // map x at the screen's left edge
  const at = p => ({ x: (p.x - left) * scale, y: p.y * scale });
  const size = NODE * scale;
  const xml = useMemo(() => `<svg viewBox="${left} 0 ${win.width / scale} ${HEIGHT}">${MAP_BODY}</svg>`, [left, win.width, scale]);

  const now = quiet ? 1 : currentGrade(game, user);
  const here = at(spot(now));
  const focusY = here.y - win.height * 0.38;
  useEffect(() => {
    const t = setTimeout(() => scroller.current?.scrollTo({ y: Math.max(0, focusY), animated: !quiet }), 60);
    return () => clearTimeout(t);
  }, [focusY, quiet]);

  const tap = grade => {
    if (isGradeUnlocked(game, user, grade)) onOpenGrade(grade);
    else toast('Finish the previous grade before this one!');
  };

  const heroW = 0.71 * size, heroH = (heroW * 170) / 120;
  const feet = at({ x: spot(now).x - 0.12 * NODE, y: spot(now).y + 0.2 * NODE });
  const arrowW = 0.44 * size;
  const arrow = at({ x: spot(now).x + 0.6 * NODE, y: spot(now).y + 0.11 * NODE });

  return (
    <ScrollView ref={scroller} style={{ flex: 1, backgroundColor: NEAR_SAND }} scrollEnabled={!quiet}
      showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never"
      contentContainerStyle={{ paddingBottom: bottomSpace }}>
      <View style={{ width: win.width, height: HEIGHT * scale }}>
        <Art xml={xml} width={win.width} height={HEIGHT * scale} />
        {!quiet && Array.from({ length: GRADES_COUNT }, (_, i) => i + 1).map(grade => (
          <Landmark key={grade} grade={grade} px={at(spot(grade))} size={size} onPress={() => tap(grade)}
            state={gradeFullyDone(game, grade) ? 'done' : !isGradeUnlocked(game, user, grade) ? 'locked' : grade === now ? 'current' : 'open'} />
        ))}
        {!quiet && (
          <Animated.View style={{ pointerEvents: 'none', position: 'absolute', left: arrow.x - arrowW / 2, top: arrow.y - arrowW / 4, transform: [{ translateX: nudge.interpolate({ inputRange: [0, 1], outputRange: [0, -0.14 * arrowW] }) }] }}>
            <Art xml={ART.arrow} width={arrowW} />
          </Animated.View>
        )}
        {!quiet && (
          <View style={{ pointerEvents: 'none', position: 'absolute', left: feet.x - heroW / 2, top: feet.y - 0.84 * heroH }}>
            <Nomi width={heroW} bob />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ---------- adventure backdrops ---------- */

/* The backdrops are 16:9 paintings (1600 × 900). A wide screen is simply covered by one. A tall screen
   shows the part around `focus`, fitted into the top of the screen where cards do not reach, and the
   painting fades into `ground`, which fills the rest. */
const BACKDROPS = {
  adv1: { focus: 800, ground: '#e39a4f' },
  adv2: { focus: 1010, ground: '#e39a4f' },
  adv3: { focus: 760, ground: '#3d3354' },
};
const TALL_SHARE = 0.75;   // how much of a tall screen's height the painting takes

const paintings = {};
const painting = key => (paintings[key] ||= SCENES[key]());

export function LevelWorld({ scene }) {
  const win = useWindowDimensions();
  const { focus, ground } = BACKDROPS[scene];
  const tall = win.height > win.width * 1.1;
  const xml = useMemo(() => {
    if (!tall) return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${painting(scene)}</svg>`;
    const shown = Math.min(1600, (900 * win.width) / (win.height * TALL_SHARE));
    const left = Math.min(Math.max(focus - shown / 2, 0), 1600 - shown);
    return `<svg viewBox="${left} 0 ${shown} 900" preserveAspectRatio="xMidYMin slice">${painting(scene)}
      <defs><linearGradient id="sink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground}" stop-opacity="0"/><stop offset="1" stop-color="${ground}"/></linearGradient></defs>
      <rect y="700" width="1600" height="201" fill="url(#sink)"/></svg>`;
  }, [scene, tall, focus, ground, win.width, win.height]);
  return (
    <View style={{ flex: 1, backgroundColor: ground }}>
      <Art xml={xml} width={win.width} height={tall ? win.height * TALL_SHARE : win.height} />
    </View>
  );
}

/* ---------- the sand curtain that sweeps across when travelling ---------- */

/* Sweeps in, calls `onCovered` while the screen is hidden, then sweeps away and calls `onDone`. */
export function Wipe({ onCovered, onDone }) {
  const { width } = useWindowDimensions();
  const [v] = useState(() => new Animated.Value(-1));
  useEffect(() => {
    const sweep = toValue => Animated.timing(v, { toValue, duration: 460, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    sweep(0).start(() => { onCovered(); sweep(1).start(() => onDone()); });
    // runs once: a Wipe is mounted per journey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={{ pointerEvents: 'none', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#e08a3c', transform: [{ translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-1.04 * width, 1.04 * width] }) }] }} />
  );
}
