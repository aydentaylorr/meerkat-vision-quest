/* Visual Memory: number, letter and word memory (flash and type), and card match. */
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Animated, Pressable, View, useWindowDimensions } from 'react-native';

import { useGame, useTheme } from '../GameContext';
import { ART, flashMemoryRounds, gradeInfo, gradeT, memConfig, pick, rnd, shuffle } from '../shared';
import { Art, CTitle, Focus, Muted, Txt, useTimers } from '../ui';
import { FlashType } from './FlashType';

export const FLASH_MEMORY_GAMES = [
  { kind: 'number', label: '🔢 Number Memory', name: 'Number Memory' },
  { kind: 'lower', label: '🔡 Small Letter Memory', name: 'Small Letter Memory' },
  { kind: 'upper', label: '🔠 Capital Letter Memory', name: 'Capital Letter Memory' },
  { kind: 'word', label: '🔤 Word Memory', name: 'Word Memory' },
];

function flashMemoryTarget(kind, grade) {
  const count = Math.round(1 + gradeT(grade) * 2);
  if (kind === 'number') return Array.from({ length: count }, () => rnd(10)).join('');
  if (kind === 'lower' || kind === 'upper') {
    const s = Array.from({ length: count }, () => 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]).join('');
    return kind === 'upper' ? s.toUpperCase() : s;
  }
  return pick(gradeInfo(grade).words);
}

export function flashMemorySpec(grade, kind) {
  const rounds = flashMemoryRounds(grade);
  const name = FLASH_MEMORY_GAMES.find(g => g.kind === kind).name;
  return {
    moduleKey: 'mem', headline: name, art: <Art xml={ART.wordCard} width={110} />,
    params: `${rounds} rounds · 500ms flash`,
    prompt: 'Press Flash, watch closely, then type what you saw.',
    Play: FlashMemory, props: { kind, name, rounds },
  };
}

function FlashMemory({ grade, kind, name, rounds, onFinish }) {
  const [round, setRound] = useState(0);
  const correct = useRef(0);
  const targets = useMemo(() => Array.from({ length: rounds }, () => flashMemoryTarget(kind, grade)), [kind, grade, rounds]);
  const done = ok => {
    if (ok) correct.current++;
    if (round + 1 < rounds) { setRound(round + 1); return; }
    const score = correct.current / rounds;
    onFinish(score, score >= 0.5, `${correct.current} of ${rounds} correct`);
  };
  return <FlashType key={round} title={name} roundLabel={`Round ${round + 1} of ${rounds}`} target={targets[round]} flashMs={500} onResult={done} />;
}

export function cardMatchSpec(grade) {
  const c = memConfig(grade);
  return {
    moduleKey: 'mem', headline: 'Card Match Memory', art: <Art xml={ART.chest} width={110} />,
    params: `${c.pairs} pairs${c.time ? ' · ' + c.time + 's limit' : ''}`,
    prompt: 'Find the matching pairs.',
    Play: CardMatch, props: {},
  };
}

const GAP = 9;

/* The board's state. `deck` is in board order; `up` holds the positions of the (at most two) cards
   turned over and not yet settled; while two are up the board is locked. */
function newBoard(c) {
  const faces = shuffle(c.pool).slice(0, c.pairs);
  const deck = shuffle(faces.flatMap((f, k) => [{ k, f }, { k, f }])).map(d => ({ ...d, up: false, matched: false }));
  return { deck, up: [], matched: 0, moves: 0, reshuffled: false, left: c.time };
}

function board(state, action) {
  const { deck, up } = state;
  const set = (positions, change) => deck.map((card, i) => (positions.includes(i) ? { ...card, ...change } : card));
  switch (action.type) {
    case 'flip': {
      const card = deck[action.at];
      if (up.length === 2 || card.up || card.matched) return state;
      return { ...state, deck: set([action.at], { up: true }), up: [...up, action.at], moves: state.moves + (up.length === 1 ? 1 : 0) };
    }
    case 'settle': {   // the two turned-over cards either stay (a pair) or turn back
      if (up.length < 2) return state;
      const pair = deck[up[0]].k === deck[up[1]].k;
      return { ...state, deck: set(up, pair ? { matched: true } : { up: false }), up: [], matched: state.matched + (pair ? 1 : 0) };
    }
    case 'shuffle': {  // the cards still face down swap places
      const open = deck.map((card, i) => (card.matched ? -1 : i)).filter(i => i >= 0);
      const from = shuffle(open), next = deck.slice();
      open.forEach((at, n) => { next[at] = deck[from[n]]; });
      return { ...state, deck: next, reshuffled: true };
    }
    case 'tick':
      return { ...state, left: state.left - 1 };
    default:
      return state;
  }
}

function CardMatch({ grade, onFinish }) {
  const { toast } = useGame();
  const { rem } = useTheme();
  const win = useWindowDimensions();
  const later = useTimers();
  const [boardWidth, setBoardWidth] = useState(0);
  const c = useMemo(() => memConfig(grade), [grade]);
  const [state, dispatch] = useReducer(board, c, newBoard);
  const { deck, up, matched, moves, left } = state;
  const finished = useRef(false);

  const end = timeUp => {
    if (finished.current) return;
    finished.current = true;
    const score = (matched / c.pairs) * (c.pairs / Math.max(moves, c.pairs));
    onFinish(score, score >= c.pass, `${matched} of ${c.pairs} pairs · ${moves} tries${timeUp ? ' · time ran out' : ''}`);
  };

  // two cards up: show them for a moment, then settle (a pair settles sooner)
  const pairUp = up.length === 2 && deck[up[0]].k === deck[up[1]].k;
  useEffect(() => {
    if (up.length === 2) later(() => dispatch({ type: 'settle' }), pairUp ? 380 : 850);
  }, [up.length, pairUp, later]);

  // after each pair: the game may be won, or (in higher grades) the cards shuffle once at half way
  useEffect(() => {
    if (matched === c.pairs) end(false);
    else if (c.reshuffle && !state.reshuffled && matched === Math.ceil(c.pairs / 2)) {
      toast('The cards shuffle!');
      later(() => dispatch({ type: 'shuffle' }), 700);
    }
    // reacts to a new pair only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  // the countdown, in grades that have one
  useEffect(() => {
    if (!c.time) return undefined;
    if (left <= 0) { end(true); return undefined; }
    const t = setTimeout(() => dispatch({ type: 'tick' }), 1000);
    return () => clearTimeout(t);
    // reacts to the clock only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // cards are as big as the card's width allows, but the whole board always fits on screen
  const rows = Math.ceil(deck.length / c.cols);
  const size = Math.max(0, Math.floor(Math.min((boardWidth - GAP * (c.cols - 1)) / c.cols, (win.height - 300 - GAP * (rows - 1)) / rows)));

  return (
    <Focus>
      <CTitle>{c.label}</CTitle>
      <Muted center>{moves} tries{c.time ? ` · ⏳ ${left}s` : ''}</Muted>
      <View onLayout={e => setBoardWidth(e.nativeEvent.layout.width)} style={{ alignItems: 'center', marginTop: rem(0.5) }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, width: size * c.cols + GAP * (c.cols - 1) }}>
          {size > 0 && deck.map((card, at) => <MatchCard key={at} card={card} size={size} onPress={() => dispatch({ type: 'flip', at })} />)}
        </View>
      </View>
      <Muted center style={{ marginTop: rem(0.7) }}>{c.prompt}</Muted>
    </Focus>
  );
}

function MatchCard({ card, size, onPress }) {
  const { c, reduceMotion } = useTheme();
  const shown = card.up || card.matched;
  const [pop] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!shown || reduceMotion) return;
    pop.setValue(0.86);
    Animated.timing(pop, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [shown, card.matched, pop, reduceMotion]);
  const [face, edge] = card.matched ? ['#8bd561', c.greenD] : card.up ? ['#fff5e3', c.line] : ['#e39d53', '#b9762f'];
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={shown ? `Card ${card.f}` : 'Face-down card'}>
      <Animated.View style={{ width: size, height: size, marginBottom: 5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: face, boxShadow: `0 5px 0 ${edge}`, transform: [{ scale: pop }] }}>
        <Txt allowFontScaling={false} style={{ fontSize: size * (shown ? 0.56 : 0.34), lineHeight: size * (shown ? 0.72 : 0.46), opacity: shown ? 1 : 0.55 }}>{shown ? card.f : '🐾'}</Txt>
      </Animated.View>
    </Pressable>
  );
}
