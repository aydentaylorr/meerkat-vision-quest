/* Scanning: Tracking (count the target as items flash past) and Symbol Search (find every match in a grid). */
import { useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../GameContext';
import { ART, ELEMENT_META, clamp, elementPool, pick, shuffle, symbolSearchConfig, trackingConfig } from '../shared';
import { Art, Big, Btn, CHead, CTitle, Focus, Input, Muted, Txt, useTimers } from '../ui';

export function scanningSpec(grade, game, elementKey) {
  const label = ELEMENT_META.find(e => e.key === elementKey).label;
  const art = <Art xml={ART.wordCard} width={110} />;
  if (game === 'tracking') {
    return {
      moduleKey: 'scan', headline: 'Tracking', art, params: `${label} · ${trackingConfig(grade).seqLen} items in a row`,
      prompt: `Silently count how many times you see the target ${label.toLowerCase()}.`,
      Play: Tracking, props: { elementKey },
    };
  }
  const c = symbolSearchConfig(grade);
  return {
    moduleKey: 'scan', headline: 'Symbol Search', art, params: `${label} · ${c.cols * c.rows} cells to search`,
    prompt: `Find every matching ${label.toLowerCase()} in the grid.`,
    Play: SymbolSearch, props: { elementKey },
  };
}

/* `total` cells, `targetCount` of them the target and the rest drawn from the pool, in random order */
function scatter(pool, target, targetCount, total) {
  const cells = Array.from({ length: total }, (_, i) => (i < targetCount ? target : pick(pool.items)));
  return shuffle(cells);
}

function Tracking({ grade, elementKey, onFinish }) {
  const { rem } = useTheme();
  const later = useTimers();
  const cfg = useMemo(() => trackingConfig(grade), [grade]);
  const { target, sequence, count } = useMemo(() => {
    const pool = elementPool(elementKey), t = pick(pool.items);
    const seq = scatter(pool, t, cfg.targetCount, cfg.seqLen);
    return { target: t, sequence: seq, count: seq.filter(x => x === t).length };
  }, [elementKey, cfg]);
  const [phase, setPhase] = useState('ready');   // ready | watch | ask
  const [showing, setShowing] = useState(null);
  const [typed, setTyped] = useState('');

  function start() {
    setPhase('watch');
    const show = i => {
      if (i >= sequence.length) { later(() => setPhase('ask'), 200); return; }
      setShowing(sequence[i]);
      later(() => { setShowing(null); later(() => show(i + 1), 120); }, cfg.itemMs);
    };
    show(0);
  }

  function submit() {
    const said = parseInt(typed.trim(), 10), ok = Number.isFinite(said);
    const score = clamp(1 - (ok ? Math.abs(said - count) : count) / Math.max(count, 1), 0, 1);
    onFinish(score, score >= 0.6, `You said ${ok ? said : '—'} · it appeared ${count} time${count === 1 ? '' : 's'}`);
  }

  const shownTarget = <Txt weight="black" style={{ textAlign: 'center', fontSize: rem(1.5), lineHeight: rem(2) }}>{target}</Txt>;
  if (phase === 'ask') {
    return (
      <Focus typing>
        <CTitle>Tracking</CTitle>
        <CHead>How many times did you see it?</CHead>
        {shownTarget}
        <Input value={typed} onChangeText={setTyped} autoFocus keyboardType="number-pad" maxLength={3} onSubmitEditing={submit} returnKeyType="done" accessibilityLabel="How many times" />
        <Btn label="OK" onPress={submit} />
      </Focus>
    );
  }
  return (
    <Focus>
      <CTitle>Tracking</CTitle>
      <CHead>Count the target</CHead>
      {shownTarget}
      <Muted center>Watch closely and silently count how many times it appears.</Muted>
      <View style={{ minHeight: 150, justifyContent: 'center' }}>{showing !== null && <Big>{showing}</Big>}</View>
      <Btn label={phase === 'watch' ? 'Watching…' : 'Start'} onPress={start} disabled={phase !== 'ready'} />
    </Focus>
  );
}

const GAP = 6;

function SymbolSearch({ grade, elementKey, onFinish }) {
  const { c, rem } = useTheme();
  const later = useTimers();
  const { target, grid, totalTargets, wordy } = useMemo(() => {
    const pool = elementPool(elementKey), cfg = symbolSearchConfig(grade), t = pick(pool.items);
    const cells = scatter(pool, t, cfg.targetCount, cfg.cols * cfg.rows);
    return { target: t, grid: cells, totalTargets: cells.filter(x => x === t).length, wordy: pool.kind === 'word' };
  }, [elementKey, grade]);
  const [found, setFound] = useState(() => new Set());
  const [wrongNow, setWrongNow] = useState(() => new Set());
  const [width, setWidth] = useState(0);
  const tally = useRef({ found: 0, wrong: 0, over: false });   // read by the delayed finish, so not React state

  function finish() {
    const t = tally.current;
    if (t.over) return;
    t.over = true;
    const score = clamp(t.found / totalTargets - t.wrong * 0.03, 0, 1);
    onFinish(score, score >= 0.6, `${t.found} of ${totalTargets} found · ${t.wrong} wrong tap${t.wrong === 1 ? '' : 's'}`);
  }

  function tap(i) {
    if (tally.current.over || found.has(i)) return;
    if (grid[i] === target) {
      setFound(new Set(found).add(i));
      if (++tally.current.found >= totalTargets) later(finish, 500);
    } else {
      tally.current.wrong++;
      setWrongNow(prev => new Set(prev).add(i));
      later(() => setWrongNow(prev => { const n = new Set(prev); n.delete(i); return n; }), 300);
    }
  }

  // letters and pictures sit in square cells big enough to tap; words get wide cells, fewer per row
  const cols = Math.max(wordy ? 3 : 5, Math.floor((width + GAP) / ((wordy ? 86 : 40) + GAP)));
  const cellW = Math.floor((width - GAP * (cols - 1)) / cols);
  const cellH = wordy ? 38 : cellW;

  return (
    <Focus>
      <CTitle>Symbol Search</CTitle>
      <Muted center size={0.92}>Found {found.size} of {totalTargets}</Muted>
      <CHead style={{ marginBottom: rem(0.4) }}>Find: {target}</CHead>
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
        {width > 0 && grid.map((item, i) => {
          const hit = found.has(i), miss = wrongNow.has(i);
          return (
            <Pressable key={i} onPress={() => tap(i)} accessibilityRole="button" accessibilityLabel={String(item)} accessibilityState={{ selected: hit }}
              style={{ width: cellW, height: cellH, marginBottom: 4, borderRadius: wordy ? 12 : 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                backgroundColor: hit ? '#8bd561' : miss ? c.red : '#e39d53', boxShadow: `0 4px 0 ${hit ? c.greenD : miss ? c.redD : '#b9762f'}` }}>
              <Txt weight="bold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} allowFontScaling={false}
                style={{ color: '#4a2c12', fontSize: wordy ? 13 : cellW * 0.48, lineHeight: wordy ? 18 : cellW * 0.62 }}>{item}</Txt>
            </Pressable>
          );
        })}
      </View>
      <Btn label="Done" color="ghost" small onPress={finish} style={{ marginTop: rem(0.7) }} />
    </Focus>
  );
}
