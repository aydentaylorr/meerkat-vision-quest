/* The grown-ups area: progress, settings, and about. */
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { useGame, useTheme } from '../GameContext';
import { currentGrade, normalizeState, totalModulesDone } from '../rules';
import { GRADES_COUNT, MODULE_KEYS, MODULE_META, clamp, dayKey, rnd } from '../shared';
import { B, Btn, Chip, Muted, Notice, SectionHead, Stack, Txt } from '../ui';
import { Stat } from './Profile';

const TABS = [['progress', 'Progress'], ['settings', 'Settings'], ['about', 'About & safety']];

export function ParentSheet({ onClose, onAfterReset }) {
  const { rem } = useTheme();
  const [tab, setTab] = useState('progress');
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionHead style={{ marginVertical: 0 }}>For grown-ups</SectionHead>
        <Chip label="Close" onPress={onClose} />
      </View>
      <Muted size={0.9} style={{ marginTop: rem(0.2) }}>In a real build this would sit behind a parent gate.</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: rem(0.55), marginBottom: rem(0.85) }}>
        {TABS.map(([key, label]) => <Chip key={key} label={label} on={tab === key} onPress={() => setTab(key)} />)}
      </View>
      {tab === 'progress' ? <Progress /> : tab === 'settings' ? <Settings onAfterReset={onAfterReset} /> : <About />}
    </>
  );
}

function Progress() {
  const { game, user } = useGame();
  const { c, rem } = useTheme();
  const bars = MODULE_KEYS.map(k => {
    const rows = game.log.filter(l => l.module === k);
    return { k, avg: rows.length ? Math.round(rows.reduce((s, l) => s + l.score, 0) / rows.length) : 0 };
  });
  const recent = game.log.slice(-12).reverse();
  const when = ts => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const cell = { fontSize: rem(0.84), lineHeight: rem(1.2) };
  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rem(1.1), marginBottom: rem(1) }}>
        <Stat label="Modules done" value={`${totalModulesDone(game)} / ${GRADES_COUNT * 4}`} />
        <Stat label="Grade" value={`${currentGrade(game, user)} / ${GRADES_COUNT}`} />
        <Stat label="Days practised" value={new Set(game.log.map(l => l.day)).size} />
        <Stat label="Streak" value={`🔥 ${game.streak.count}`} />
      </View>
      <SectionHead>Average accuracy by skill</SectionHead>
      {game.log.length ? (
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: rem(0.6) }}>
          {bars.map(b => (
            <View key={b.k} style={{ flex: 1 }} accessible accessibilityLabel={`${MODULE_META[b.k].name} ${b.avg} percent`}>
              <View style={{ height: 104, justifyContent: 'flex-end' }}>
                <View style={{ height: `${Math.max(b.avg, 2)}%`, backgroundColor: c.blue, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
              </View>
              <Muted center size={0.66}>{MODULE_META[b.k].name} {b.avg}%</Muted>
            </View>
          ))}
        </View>
      ) : <Muted>No sessions yet.</Muted>}
      <SectionHead style={{ marginTop: rem(0.6) }}>Recent exercises</SectionHead>
      {recent.length ? recent.map((l, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6, paddingVertical: rem(0.3), borderBottomWidth: 1, borderBottomColor: c.line }}>
          <Txt style={[cell, { flex: 1.5 }]}>{when(l.ts)}</Txt>
          <Txt style={[cell, { flex: 1.6 }]}>G{l.grade} · {MODULE_META[l.module].name}</Txt>
          <Txt weight="black" style={[cell, { width: rem(3), textAlign: 'right', color: l.pass ? c.greenD : c.redD }]}>{l.score}%</Txt>
        </View>
      )) : <Muted>No sessions yet.</Muted>}
    </>
  );
}

function Row({ label, note, children }) {
  const { c, rem } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: rem(1), paddingVertical: rem(0.5), borderBottomWidth: 1, borderBottomColor: c.line }}>
      <View style={{ flex: 1 }}>
        <Txt weight="black">{label}</Txt>
        {note && <Muted size={0.9}>{note}</Muted>}
      </View>
      {children}
    </View>
  );
}

function Switch({ on, onPress, label }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} hitSlop={8}
      style={{ width: 52, height: 30, borderRadius: 999, backgroundColor: on ? c.green : c.line, justifyContent: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', marginLeft: on ? 25 : 3 }} />
    </Pressable>
  );
}

function Settings({ onAfterReset }) {
  const { game, user, update, replaceGame, toast, sessionMinutes, offerBreakAgain, restartSession } = useGame();
  const [minutes] = useState(() => Math.round(sessionMinutes()));
  const { rem } = useTheme();
  const set = (key, value) => update(d => { d.settings[key] = value; });

  const unlockAll = () => {
    update(d => { for (let g = 1; g < GRADES_COUNT; g++) d.gradeProgress[g] = Object.fromEntries(MODULE_KEYS.map(k => [k, true])); });
    toast('Unlocked through the final grade'); onAfterReset();
  };
  const seedDemo = () => {
    const now = Date.now(), grade = currentGrade(game, user);
    update(d => {
      for (let n = 9; n >= 1; n--) {
        MODULE_KEYS.forEach(k => {
          const base = 55 + (9 - n) * 3 + rnd(14), ts = now - n * 86400000;
          d.log.push({ ts, day: dayKey(new Date(ts)), grade, module: k, score: Math.min(base, 99), pass: base >= 65 });
        });
      }
      d.streak.count = Math.max(d.streak.count, 6);
    });
    toast('Sample data added');
  };
  const resetAll = () => Alert.alert('Reset everything?', 'This clears all progress for this account. It cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: () => { replaceGame(normalizeState(null)); restartSession(); onAfterReset(); } },
  ]);

  return (
    <>
      <SectionHead>Display</SectionHead>
      <Row label="Text size" note={`Currently ${Math.round(game.settings.fs * 100)}%`}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="A−" onPress={() => set('fs', clamp(+(game.settings.fs - 0.1).toFixed(2), 0.85, 1.4))} />
          <Chip label="A+" onPress={() => set('fs', clamp(+(game.settings.fs + 0.1).toFixed(2), 0.85, 1.4))} />
        </View>
      </Row>
      <Row label="High contrast" note="Darker cards and stronger text contrast">
        <Switch on={game.settings.contrast} onPress={() => set('contrast', !game.settings.contrast)} label="High contrast" />
      </Row>
      <Row label="Reduce motion" note="Turns off bobbing and pop animations">
        <Switch on={game.settings.reduceMotion} onPress={() => set('reduceMotion', !game.settings.reduceMotion)} label="Reduce motion" />
      </Row>
      <SectionHead style={{ marginTop: rem(1) }}>Session limits</SectionHead>
      <Muted size={0.9}>Break reminder after a set amount of screen time. An eye-health app should cap sessions, not reward long ones.</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: rem(0.5) }}>
        {[10, 15, 20, 30].map(m => (
          <Chip key={m} label={`${m} min`} on={game.settings.sessionCap === m} onPress={() => { offerBreakAgain(); set('sessionCap', m); }} />
        ))}
      </View>
      <Muted size={0.9}>This session so far: {minutes} min</Muted>
      <SectionHead style={{ marginTop: rem(1) }}>Demo tools</SectionHead>
      <Stack>
        <Btn label="Unlock all adventures (for previewing)" color="ghost" small onPress={unlockAll} />
        <Btn label="Add sample progress data" color="ghost" small onPress={seedDemo} />
        <Btn label="Reset everything" color="r" small onPress={resetAll} />
      </Stack>
    </>
  );
}

function About() {
  const { c, rem } = useTheme();
  return (
    <>
      <Notice><B>This is a prototype, not a medical device.</B> No claim is made that it improves vision. Exercise design, difficulty tiers and pass thresholds need review by a pediatric optometrist or vision therapist before any release.</Notice>
      <SectionHead style={{ marginTop: rem(0.8) }}>What each module trains</SectionHead>
      {MODULE_KEYS.map(k => (
        <View key={k} style={{ paddingVertical: rem(0.4), borderBottomWidth: 1, borderBottomColor: c.line }}>
          <Txt weight="black">{MODULE_META[k].name}</Txt>
          <Muted size={0.9}>{MODULE_META[k].clinical}</Muted>
        </View>
      ))}
      <Muted size={0.9} style={{ marginTop: rem(0.8) }}>Progress is saved to this player’s account on the game server. Accounts use a username and password only: no email address and no analytics.</Muted>
    </>
  );
}
