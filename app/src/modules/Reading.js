/* Reading: read the story once (timed), read it again as a moving block at the child's own pace,
   answer the questions, then a flash-and-type word check. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../GameContext';
import { ARROW_DOWN, ARROW_UP, ART, clamp, pick, readConfig, shuffle } from '../shared';
import { Art, B, BTN_COLOURS, Btn, CHead, CTitle, Dock, Focus, HintBar, Muted, Stack, Txt, useTimers } from '../ui';
import { FlashType } from './FlashType';

export function readingSpec(grade) {
  const c = readConfig(grade);
  return {
    moduleKey: 'read', headline: 'Reading', art: <Art xml={ART.wordCard} width={110} />,
    params: `read the story twice · ${c.questions.length} questions · ${c.vocab.rounds} word check`,
    prompt: 'A story to read, twice, then a quick word check.',
    extra: <HintBar icon="📖"><B>Take your time.</B> Read the story once, then read it again at your own pace, answer {c.questions.length} questions, then a quick word check.</HintBar>,
    Play: Reading, props: {},
  };
}

function Reading({ grade, onFinish }) {
  const { c: colour, rem } = useTheme();
  const later = useTimers();
  const c = useMemo(() => readConfig(grade), [grade]);
  const words = useMemo(() => Array.from({ length: c.vocab.rounds }, () => pick(c.vocab.pool)), [c]);
  const [phase, setPhase] = useState('first');   // first | speed | second | quiz | vocab
  const startedAt = useRef(0);
  useEffect(() => { startedAt.current = Date.now(); }, []);   // the first read is timed from when the story appears
  const [measuredWpm, setMeasuredWpm] = useState(0);
  const [practiceWpm, setPracticeWpm] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [vi, setVi] = useState(0);
  const right = useRef({ questions: 0, words: 0 });
  const question = c.questions[qi];
  const options = useMemo(() => (question ? shuffle(question.options) : []), [question]);

  // hold an arrow to keep changing the speed
  const hold = useRef(null);
  const stopHold = () => { clearTimeout(hold.current); clearInterval(hold.current); hold.current = null; };
  const step = d => setPracticeWpm(w => clamp(w + d, 20, 400));
  const startHold = d => { stopHold(); step(d); hold.current = setTimeout(() => { hold.current = setInterval(() => step(d), 90); }, 350); };
  useEffect(() => stopHold, []);

  if (phase === 'first') {
    const done = () => {
      const seconds = (Date.now() - startedAt.current) / 1000;
      const wpm = clamp(Math.round((c.passage.split(' ').length / Math.max(seconds, 1)) * 60), 20, 400);
      setMeasuredWpm(wpm); setPracticeWpm(wpm); setPhase('speed');
    };
    return (
      <Dock>
        <CTitle>{c.label}</CTitle>
        <CHead>Read the story</CHead>
        <Txt style={{ fontSize: rem(1.15), lineHeight: rem(1.8), textAlign: 'center', marginBottom: rem(0.7) }}>{c.passage}</Txt>
        <Btn label="I’ve read it!" onPress={done} />
      </Dock>
    );
  }

  if (phase === 'speed') {
    const arrow = (icon, d, label) => (
      <Pressable onPressIn={() => startHold(d)} onPressOut={stopHold} accessibilityRole="button" accessibilityLabel={label}
        style={({ pressed }) => ({ width: 52, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colour.cream2, boxShadow: `0 ${pressed ? 1 : 3}px 0 ${colour.line}`, transform: [{ translateY: pressed ? 2 : 0 }] })}>
        <Art xml={icon} width={22} color={colour.brown} />
      </Pressable>
    );
    return (
      <Focus>
        <CTitle>{c.label}</CTitle>
        <CHead>Nice reading!</CHead>
        <Muted center>You read that at about <B>{measuredWpm} words per minute</B>.</Muted>
        <Muted center>Now read it again. The words will appear at your practice pace. Want to go faster?</Muted>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rem(1.1), marginVertical: rem(0.8) }}>
          <CHead style={{ marginVertical: 0, minWidth: rem(6.5) }}>{practiceWpm} wpm</CHead>
          <View style={{ gap: 8 }}>{arrow(ARROW_UP, 10, 'Faster')}{arrow(ARROW_DOWN, -10, 'Slower')}</View>
        </View>
        <Btn label="Read it again" onPress={() => { stopHold(); setPhase('second'); }} />
      </Focus>
    );
  }

  if (phase === 'second') {
    return (
      <Dock>
        <CTitle>{c.label}</CTitle>
        <CHead>Read along</CHead>
        <MovingBlock text={c.passage} wpm={practiceWpm} chunkSize={c.chunkSize} onDone={() => later(() => setPhase('quiz'), 400)} />
      </Dock>
    );
  }

  if (phase === 'quiz') {
    const choose = k => {
      if (picked !== null) return;
      const ok = options[k] === question.answer;
      if (ok) right.current.questions++;
      setPicked(k);
      later(() => { setPicked(null); if (qi + 1 < c.questions.length) setQi(qi + 1); else setPhase('vocab'); }, ok ? 700 : 1300);
    };
    return (
      <Focus>
        <CTitle>Quick check</CTitle>
        <Muted center size={0.92}>Question {qi + 1} of {c.questions.length}</Muted>
        <CHead style={{ marginBottom: rem(0.5) }}>{question.q}</CHead>
        <Stack>
          {options.map((o, k) => (
            <Btn key={o} label={o} color={BTN_COLOURS[k % BTN_COLOURS.length]} onPress={() => choose(k)} disabled={picked !== null}
              mark={picked === null ? undefined : o === question.answer ? 'right' : k === picked ? 'wrong' : undefined} />
          ))}
        </Stack>
      </Focus>
    );
  }

  const wordDone = ok => {
    if (ok) right.current.words++;
    if (vi + 1 < c.vocab.rounds) { setVi(vi + 1); return; }
    const { questions, words: wordsRight } = right.current;
    const score = (wordsRight / c.vocab.rounds) * 0.5 + (questions / c.questions.length) * 0.5;
    onFinish(score, score >= c.pass,
      `read at ${measuredWpm} wpm, practiced at ${practiceWpm} wpm · ${questions} of ${c.questions.length} questions · ${wordsRight} of ${c.vocab.rounds} word check`);
  };
  return <FlashType key={vi} title={c.label} roundLabel={`Word check ${vi + 1} of ${c.vocab.rounds}`}
    target={words[vi].toUpperCase()} flashMs={c.vocab.flash} onResult={wordDone} />;
}

/* Shows the passage as a moving block: only the current `chunkSize` words are visible, the rest keep
   their place but are hidden, and the block advances at `wpm`. */
function MovingBlock({ text, wpm, chunkSize, onDone }) {
  const { rem } = useTheme();
  const words = useMemo(() => text.split(' '), [text]);
  const [at, setAt] = useState(0);               // first visible word; -1 once the block has passed
  const intervalMs = Math.max(60000 / wpm, 90) * chunkSize;
  useEffect(() => {
    if (at < 0) return undefined;
    const t = setTimeout(() => {
      if (at + chunkSize < words.length) setAt(at + chunkSize);
      else { setAt(-1); onDone(); }
    }, intervalMs);
    return () => clearTimeout(t);
    // only the block's position should restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at]);
  return (
    <Txt accessibilityLabel={text} style={{ fontSize: rem(1.15), lineHeight: rem(1.8), textAlign: 'center' }}>
      {words.map((w, i) => {
        const on = at >= 0 && i >= at && i < at + chunkSize;
        return <Text key={i} style={on ? { backgroundColor: '#ffe9b3', color: '#6b4423' } : { color: 'transparent' }}>{w} </Text>;
      })}
    </Txt>
  );
}
