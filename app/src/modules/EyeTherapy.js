/* Eye Therapy: convergence and divergence fusion tests.
   Each eye gets its own picture holding half of a character. When the two pictures fuse into one, the
   halves line up and the whole letter or number appears in the middle.
   Convergence: two circles side by side, no glasses (cross the eyes to join them).
   Divergence: red and cyan circles pulled apart; red/cyan glasses give each eye its own picture. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../GameContext';
import { eyeConfig, pick } from '../shared';
import { B, Btn, CHead, CTitle, Focus, HintBar, Input, Muted, Notice, useTimers } from '../ui';

const R = 90, PAD = 24, CY = 112, H = 224, FONT_SIZE = 124;

/* One eye's picture: a circle with tick marks and the left or right half of the character. */
function EyePicture({ cx, half, ch, line, ink, fill, dot }) {
  const clip = `half-${half}-${Math.round(cx)}`;
  return (
    <G>
      <Defs><ClipPath id={clip}><Rect x={half === 'left' ? cx - R : cx} y={0} width={R} height={H} /></ClipPath></Defs>
      <Circle cx={cx} cy={CY} r={R} fill={fill} stroke={line} strokeWidth={5} />
      <Path d={`M${cx} ${CY - R + 10} v16 M${cx} ${CY + R - 10} v-16`} stroke={line} strokeWidth={5} strokeLinecap="round" />
      <SvgText x={cx} y={CY + FONT_SIZE * 0.36} textAnchor="middle" fontSize={FONT_SIZE} fontWeight="900" fontFamily="Arial" fill={ink} clipPath={`url(#${clip})`}>{ch}</SvgText>
      {dot && <Circle cx={cx} cy={CY} r={6} fill={line} />}
    </G>
  );
}

/* `width` is the space available; the picture keeps its shape and is never taller than `maxHeight`. */
export function FusionPicture({ kind, ch, gap, disparity, width, maxHeight = 200 }) {
  if (kind === 'convergence') {
    const cxL = PAD + R, cxR = cxL + 2 * R + gap, W = cxR + R + PAD;
    const w = Math.min(width, (maxHeight * W) / H);
    return (
      <Svg width={w} height={(w * H) / W} viewBox={`0 0 ${W} ${H}`} accessibilityLabel="Two circles to fuse">
        <EyePicture cx={cxL} half="left" ch={ch} line="#8a6238" ink="#3b2410" fill="#fff" />
        <EyePicture cx={cxR} half="right" ch={ch} line="#8a6238" ink="#3b2410" fill="#fff" />
        <Circle cx={(cxL + cxR) / 2} cy={CY} r={7} fill="#f0a038" />
      </Svg>
    );
  }
  // Two pictures on black, blended like light: where red and cyan cross, each lens must still see its own.
  const W = 2 * (R + PAD) + 80, cx = W / 2;
  const w = Math.min(width - 12, (maxHeight * W) / H), h = (w * H) / W;
  const eye = (shift, half, color) => (
    <View style={{ position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen' }}>
      <Svg width={w} height={h} viewBox={`0 0 ${W} ${H}`}>
        <G transform={`translate(${shift} 0)`}><EyePicture cx={cx} half={half} ch={ch} line={color} ink={color} fill="none" dot /></G>
      </Svg>
    </View>
  );
  return (
    <View style={{ backgroundColor: '#000', borderRadius: 18, padding: 6 }} accessibilityLabel="Red and blue circles to fuse">
      <View style={{ width: w, height: h, isolation: 'isolate' }}>
        {eye(-disparity / 2, 'left', '#ff2a2a')}{eye(disparity / 2, 'right', '#00e5ff')}
      </View>
    </View>
  );
}

export function fusionSpec(grade, kind) {
  const c = eyeConfig(grade), conv = kind === 'convergence';
  return {
    moduleKey: 'eye', headline: conv ? 'Convergence' : 'Divergence',
    art: <FusionPicture kind={kind} ch="A" gap={c.gap} disparity={c.disparity} width={conv ? 260 : 170} maxHeight={130} />,
    params: `${c.rounds} rounds · ${conv ? 'two circles, no glasses' : 'red/blue glasses'}`,
    prompt: conv ? 'Look at the middle dot and let the two circles join.' : 'Put on your red/blue glasses and let the circles join.',
    extra: (
      <>
        {!conv && <HintBar icon="🕶️"><B>You need red/blue (red-cyan) 3D glasses.</B> Red lens over the left eye.</HintBar>}
        <Notice><B>Pilot exercise.</B> Stop and rest if your eyes feel sore or you get a headache. The settings need a pediatric optometrist’s review before release.</Notice>
      </>
    ),
    Play: Fusion, props: { kind },
  };
}

function Fusion({ grade, kind, onFinish }) {
  const { rem } = useTheme();
  const later = useTimers();
  const c = useMemo(() => eyeConfig(grade), [grade]);
  const conv = kind === 'convergence';
  // the characters for every round, never the same one twice in a row
  const chars = useMemo(() => {
    const out = [];
    while (out.length < c.rounds) { const ch = pick(c.chars); if (ch !== out[out.length - 1]) out.push(ch); }
    return out;
  }, [c]);
  const [round, setRound] = useState(0);
  const [typed, setTyped] = useState('');
  const [mark, setMark] = useState(null);
  const [width, setWidth] = useState(0);
  const tally = useRef({ correct: 0, times: [], shownAt: 0 });
  useEffect(() => { tally.current.shownAt = Date.now(); }, [round]);   // each answer is timed from when its picture appears
  const ch = chars[round];

  function settle(ok) {
    if (mark) return;
    const t = tally.current;
    if (ok) { t.correct++; t.times.push(Date.now() - t.shownAt); } else setTyped(ch);
    setMark(ok ? 'right' : 'wrong');
    later(() => {
      if (round + 1 < c.rounds) { setRound(round + 1); setTyped(''); setMark(null); return; }
      const score = t.correct / c.rounds;
      const avg = t.times.length ? (t.times.reduce((a, b) => a + b, 0) / t.times.length / 1000).toFixed(1) : '0';
      onFinish(score, score >= c.pass, `${t.correct} of ${c.rounds} correct · ${avg}s average`);
    }, ok ? 700 : 1300);
  }

  const submit = () => { const v = typed.trim().toUpperCase(); if (v) settle(v === ch); };
  const tip = conv
    ? 'Look at the orange dot in the middle. Slowly cross your eyes, like looking at the tip of your nose, until the two circles slide together into one. Type the letter or number you see in the middle circle.'
    : 'Wear your red/blue glasses, red lens over your left eye. Look at the middle and relax your eyes, like gazing far away, until the red and blue circles join into one. Type the letter or number you see.';
  const reminder = conv ? 'Look at the dot and let the circles join.' : 'Relax your eyes and let the circles join.';

  return (
    <Focus typing>
      <CTitle>{conv ? 'Convergence' : 'Divergence'}</CTitle>
      <Muted center size={0.92}>Round {round + 1} of {c.rounds}</Muted>
      <Muted center size={0.9} style={{ marginVertical: rem(0.3) }}>{round === 0 ? tip : reminder}</Muted>
      <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ alignItems: 'center', marginVertical: rem(0.3) }}>
        {width > 0 && <FusionPicture kind={kind} ch={ch} gap={c.gap} disparity={c.disparity} width={Math.min(width, 640)} />}
      </View>
      <CHead style={{ marginTop: rem(0.3), marginBottom: 0 }}>What do you see?</CHead>
      <Input value={typed} onChangeText={setTyped} maxLength={1} autoCapitalize="characters" autoFocus editable={!mark}
        mark={mark || undefined} onSubmitEditing={submit} submitBehavior="submit" returnKeyType="done" accessibilityLabel="What do you see?" />
      <Btn label="OK" onPress={submit} disabled={!!mark} />
      <Btn label="I can’t see it yet" color="ghost" small onPress={() => settle(false)} disabled={!!mark} style={{ marginTop: rem(0.3) }} />
    </Focus>
  );
}
