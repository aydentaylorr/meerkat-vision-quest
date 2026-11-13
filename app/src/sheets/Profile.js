/* The player's profile: totals, starting grade and logging out. */
import { useState } from 'react';
import { View } from 'react-native';

import { APP_VERSION } from '../api';
import { useGame, useTheme } from '../GameContext';
import { currentGrade, totalModulesDone } from '../rules';
import { GRADES_COUNT } from '../shared';
import { Btn, CHead, Chip, GradePicker, Muted, Nomi, SectionHead, Stack, Txt } from '../ui';

export function Stat({ label, value }) {
  const { rem } = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Muted size={0.85}>{label}</Muted>
      <Txt weight="black" style={{ fontSize: rem(1.3), lineHeight: rem(1.7) }}>{value}</Txt>
    </View>
  );
}

export function ProfileSheet({ onClose }) {
  const { game, user, logout, saveStartGrade } = useGame();
  const { c, rem } = useTheme();
  const [grade, setGrade] = useState(user.start_grade);
  const [msg, setMsg] = useState(null);   // { text, ok }

  const save = async () => {
    try { await saveStartGrade(grade); setMsg({ text: 'Saved!', ok: true }); }
    catch (e) { setMsg({ text: e.message, ok: false }); }
  };

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionHead style={{ marginVertical: 0 }}>My profile</SectionHead>
        <Chip label="Close" onPress={onClose} />
      </View>
      <View style={{ alignItems: 'center', marginTop: rem(0.4) }}><Nomi width={84} /></View>
      <CHead style={{ marginVertical: 0 }}>{user.username}</CHead>
      <Muted center>joined {user.created_at.slice(0, 10)}</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: rem(1.1), marginVertical: rem(1) }}>
        <Stat label="Grade" value={`${currentGrade(game, user)} / ${GRADES_COUNT}`} />
        <Stat label="Modules done" value={`${totalModulesDone(game)} / ${GRADES_COUNT * 4}`} />
        <Stat label="Streak" value={`🔥 ${game.streak.count}`} />
        <Stat label="Gems" value={`💎 ${game.gems}`} />
      </View>
      <SectionHead>Starting grade</SectionHead>
      <GradePicker value={grade} onChange={g => { setGrade(g); setMsg(null); }} count={GRADES_COUNT} />
      <Txt weight="bold" accessibilityLiveRegion="polite" style={{ minHeight: rem(1.3), textAlign: 'center', fontSize: rem(0.9), lineHeight: rem(1.3), color: msg?.ok ? c.greenD : c.redD }}>{msg?.text || ''}</Txt>
      <Stack>
        <Btn label="Save grade" onPress={save} />
        <Btn label="Log out" color="ghost" small onPress={logout} />
      </Stack>
      <Muted center size={0.72} style={{ marginTop: rem(0.6) }}>App version {APP_VERSION}</Muted>
    </>
  );
}
