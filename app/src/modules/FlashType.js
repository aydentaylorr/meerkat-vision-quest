/* One "flash and type" round: the target shows for a moment in a fixed spot, then the child types
   what they saw. Used by Reading's word check and the Visual Memory games.
   Give each round its own `key` so it starts fresh. */
import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '../GameContext';
import { Big, Btn, CHead, CTitle, Focus, Input, Muted, useTimers } from '../ui';

export function FlashType({ title, roundLabel, target, flashMs, onResult }) {
  const { rem } = useTheme();
  const later = useTimers();
  const [phase, setPhase] = useState('ready');   // ready | flash | blank | ask | marked
  const [typed, setTyped] = useState('');
  const [ok, setOk] = useState(false);

  function flash() {
    setPhase('flash');
    later(() => { setPhase('blank'); later(() => setPhase('ask'), 200); }, flashMs);
  }

  function submit() {
    if (phase !== 'ask') return;
    const right = typed.trim().toLowerCase() === String(target).toLowerCase();
    setOk(right); setPhase('marked');
    if (!right) setTyped(String(target));
    later(() => onResult(right), right ? 700 : 1300);
  }

  const asking = phase === 'ask' || phase === 'marked';
  return (
    <Focus typing>
      <CTitle>{title}</CTitle>
      <Muted center size={0.92}>{roundLabel}</Muted>
      {asking ? (
        <>
          <CHead style={{ marginTop: rem(0.5), marginBottom: rem(0.4) }}>What did you see?</CHead>
          <Input value={typed} onChangeText={setTyped} autoFocus editable={phase === 'ask'} onSubmitEditing={submit}
            mark={phase === 'marked' ? (ok ? 'right' : 'wrong') : undefined} returnKeyType="done" accessibilityLabel="What did you see?" />
          <Btn label="OK" onPress={submit} disabled={phase !== 'ask'} />
        </>
      ) : (
        <>
          <Muted center style={{ marginBottom: rem(0.3) }}>Press Flash, then watch closely.</Muted>
          <View style={{ minHeight: 150, justifyContent: 'center' }}>{phase === 'flash' && <Big>{target}</Big>}</View>
          <Btn label="Flash" onPress={flash} disabled={phase !== 'ready'} />
        </>
      )}
    </Focus>
  );
}
