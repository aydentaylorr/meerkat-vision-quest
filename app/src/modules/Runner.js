/* Runs any exercise: the briefing, the 3-2-1 countdown, the exercise itself, then the results. */
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useGame, useTheme } from '../GameContext';
import { recordResult } from '../rules';
import { MODULE_META, pct, pick } from '../shared';
import { B, Big, Btn, CHead, CTitle, Dock, Focus, HintBar, Muted, Nomi, Notice, Stack, Txt } from '../ui';

/* `spec` describes one exercise:
   { moduleKey, headline, art, params, prompt, extra, Play, props }
   `Play` is the exercise's component; it is given `grade`, `props` and `onFinish(score, pass, detail)`. */
export function ModuleRun({ grade, spec, onRetry, onModules, onMap }) {
  const { game, update } = useGame();
  const { c, rem } = useTheme();
  const [phase, setPhase] = useState('intro');   // intro | countdown | play | results
  const [result, setResult] = useState(null);
  const meta = MODULE_META[spec.moduleKey];

  function finish(score, pass, detail) {
    const outcome = update(draft => recordResult(draft, grade, spec.moduleKey, score, pass));
    setResult({ ...outcome, detail, cheer: pick(['Great looking!', 'Sharp eyes!', 'You got it!', 'Well spotted!']) });
    setPhase('results');
  }

  if (phase === 'intro') {
    return (
      <Dock>
        <CTitle>{meta.name}</CTitle>
        <View style={{ alignItems: 'center', marginVertical: rem(0.3) }}>{spec.art}</View>
        <CHead>{spec.headline}</CHead>
        <Muted center>{meta.clinical}</Muted>
        <Muted center bold style={{ marginTop: rem(0.3), marginBottom: rem(0.6) }}>{spec.params}</Muted>
        <Btn label="I’m ready" onPress={() => setPhase('countdown')} />
        {spec.extra}
      </Dock>
    );
  }

  if (phase === 'countdown') return <Countdown label={meta.name} prompt={spec.prompt} onDone={() => setPhase('play')} />;

  if (phase === 'play') return <spec.Play grade={grade} onFinish={finish} {...spec.props} />;

  const { pass, score, gemsWon, gradeCompleteNow, reward, note, detail, cheer } = result;
  const days = game.streak.count;
  return (
    <Focus>
      <CTitle>{meta.name}</CTitle>
      <View style={{ alignItems: 'center', marginVertical: rem(0.2) }}><Nomi width={96} /></View>
      <CHead>{pass ? cheer : 'Good try!'}</CHead>
      <Big color={pass ? c.greenD : c.redD}>{pct(score)}</Big>
      <Muted center>{detail}</Muted>
      {pass && <Txt weight="black" style={{ textAlign: 'center', marginVertical: rem(0.5) }}>+{gemsWon} 💎   🔥 {days} day{days === 1 ? '' : 's'}</Txt>}
      {gradeCompleteNow && <Notice><B>Grade complete!</B> All 4 modules done. The next grade is unlocked!{reward ? ` New reward: ${reward.em} ${reward.name}.` : ''}</Notice>}
      {note === 'freeze' && <HintBar icon="🧊">You missed a day, so a streak freeze was used. {game.streak.freezes} left.</HintBar>}
      <Stack style={{ marginTop: rem(0.7) }}>
        {!pass && <Btn label="Try again" color="o" onPress={onRetry} />}
        <Btn label="Back to modules" color={pass ? 'g' : 'ghost'} small={!pass} onPress={onModules} />
        <Btn label="Back to the map" color="ghost" small onPress={onMap} />
      </Stack>
    </Focus>
  );
}

function Countdown({ label, prompt, onDone }) {
  const { c } = useTheme();
  const [n, setN] = useState(3);
  useEffect(() => {
    const t = setTimeout(() => (n > 0 ? setN(n - 1) : onDone()), 700);
    return () => clearTimeout(t);
    // onDone is a fresh function each render; only the count should restart the timer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  return (
    <Focus>
      <CTitle>{label}</CTitle>
      <Big size={5.4} color={c.orange}>{n > 0 ? n : 'GO!'}</Big>
      <Muted center>{prompt}</Muted>
    </Focus>
  );
}
