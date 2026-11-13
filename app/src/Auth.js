/* Signing in and creating an account. */
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { APP_VERSION } from './api';
import { useGame, useTheme } from './GameContext';
import { GRADES_COUNT } from './shared';
import { Btn, CHead, CTitle, Chip, Focus, GradePicker, Input, Muted, Nomi, Txt } from './ui';

export function AuthCard() {
  const { login, register } = useGame();
  const { c, rem } = useTheme();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordBox = useRef(null);
  const reg = mode === 'register';

  async function submit() {
    if (busy) return;
    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(name)) return setError('Username: 3 to 20 letters, numbers or _ (no spaces)');
    if (!password) return setError('Please type your password');
    if (reg && password.length < 6) return setError('Password needs at least 6 characters');
    if (reg && !grade) return setError('Please choose the grade you are in');
    setBusy(true); setError('');
    try {
      await (reg ? register(name, password, grade) : login(name, password));   // success replaces this card
    } catch (e) {
      setError(e.message); setBusy(false);
    }
    return undefined;
  }

  return (
    <Focus>
      <View style={{ alignItems: 'center' }}><Nomi width={84} /></View>
      <CTitle>Meerkat Vision Quest</CTitle>
      <CHead>{reg ? 'Make your account' : 'Welcome back!'}</CHead>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: rem(0.3) }}>
        <Chip label="Log in" on={!reg} onPress={() => { setMode('login'); setError(''); }} />
        <Chip label="Create account" on={reg} onPress={() => { setMode('register'); setError(''); }} />
      </View>
      <Input value={username} onChangeText={setUsername} placeholder="Username" maxLength={20}
        autoComplete="username" textContentType="username" returnKeyType="next"
        onSubmitEditing={() => passwordBox.current?.focus()} submitBehavior="submit" accessibilityLabel="Username" />
      <Input ref={passwordBox} value={password} onChangeText={setPassword} placeholder="Password" maxLength={128} secureTextEntry
        autoComplete={reg ? 'new-password' : 'current-password'} textContentType={reg ? 'newPassword' : 'password'}
        returnKeyType="go" onSubmitEditing={submit} accessibilityLabel="Password" />
      {reg && (
        <>
          <Muted center bold size={0.95} style={{ marginTop: rem(0.3) }}>What grade are you in?</Muted>
          <GradePicker value={grade} onChange={setGrade} count={GRADES_COUNT} />
          <Muted center size={0.8}>Tip: use a fun nickname instead of your real name, and ask a grown-up to help.</Muted>
        </>
      )}
      <Txt weight="bold" accessibilityLiveRegion="polite" style={{ minHeight: rem(1.3), marginVertical: rem(0.2), textAlign: 'center', color: c.redD, fontSize: rem(0.9), lineHeight: rem(1.3) }}>{error}</Txt>
      <Btn label={reg ? 'Create my account' : 'Log in'} onPress={submit} disabled={busy} />
      <Muted center size={0.7} style={{ marginTop: rem(0.4) }}>Version {APP_VERSION}</Muted>
    </Focus>
  );
}
