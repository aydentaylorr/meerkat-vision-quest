/* The game itself: which place the player is in, which card is showing, and how they move between them.
   Layers, bottom to top: the world, the bar, the current card, a pop-up sheet, the exit question, messages. */
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, View, useWindowDimensions } from 'react-native';

import { API_URL } from './api';
import { AuthCard } from './Auth';
import { useGame, useTheme } from './GameContext';
import { Hud } from './Hud';
import { cardMatchSpec, FLASH_MEMORY_GAMES, flashMemorySpec } from './modules/VisualMemory';
import { fusionSpec } from './modules/EyeTherapy';
import { readingSpec } from './modules/Reading';
import { ModuleRun } from './modules/Runner';
import { scanningSpec } from './modules/Scanning';
import { currentGrade, gradeFullyDone, gradeModulesDoneCount, isGradeUnlocked, moduleDone } from './rules';
import { ART, ELEMENT_META, GRADES_COUNT, MODULE_META, gradeInfo } from './shared';
import { ParentSheet } from './sheets/Parent';
import { ProfileSheet } from './sheets/Profile';
import { RewardsSheet } from './sheets/Rewards';
import { Art, BTN_COLOURS, Btn, CHead, CTitle, Dock, Focus, Muted, Sheet, Stack, Toast } from './ui';
import { LevelWorld, MapWorld, Wipe } from './World';

const MAP = { name: 'map' };

let serial = 0;
const nextId = () => ++serial;   // numbers each journey and each run, so a retry starts fresh

/* A view is the card on screen:
   { name: 'map' } | { name: 'grade', grade } | { name: 'menu', menu, grade, running }
   | { name: 'run', grade, spec, id, running } | { name: 'break', mins, back } | { name: 'travelling', running }
   `running` ({ grade, moduleKey }) is set while a module is open. */
export function Game() {
  const { phase } = useGame();
  // a fresh start whenever someone signs in or out
  return <Play key={phase === 'play' ? 'in' : 'out'} />;
}

function Play() {
  const { phase, bootError, retryBoot, game, user, breakDue, logout, toast } = useGame();
  const { rem, reduceMotion } = useTheme();
  const win = useWindowDimensions();
  const [scene, setScene] = useState('map');      // 'map' or an adventure backdrop
  const [view, setView] = useState(MAP);
  const [sheet, setSheet] = useState(null);       // 'rewards' | 'profile' | 'parent'
  const [exitOpen, setExitOpen] = useState(false);
  const [journey, setJourney] = useState(null);   // the sand curtain, while travelling
  const playing = phase === 'play';

  const travel = useCallback((to, next) => {
    if (reduceMotion) { setScene(to); setView(next); return; }
    setView({ name: 'travelling', running: next.running });
    setJourney({ id: nextId(), to, next });
  }, [reduceMotion]);

  const toMap = useCallback(() => {
    setExitOpen(false);
    if (scene === 'map') setView(MAP); else travel('map', MAP);
  }, [scene, travel]);

  const openGrade = grade => {
    if (isGradeUnlocked(game, user, grade)) setView({ name: 'grade', grade });
    else toast('Finish the previous grade before this one!');
  };
  const openMenu = (menu, grade, moduleKey) => setView({ name: 'menu', menu, grade, running: { grade, moduleKey } });

  /* Starts an exercise, unless it is time for an eye break. */
  const startRun = (grade, spec) => {
    const mins = breakDue();
    if (mins) { setView({ name: 'break', mins, back: view }); return; }
    travel(gradeInfo(grade).scene, { name: 'run', grade, spec, id: nextId(), running: { grade, moduleKey: spec.moduleKey } });
  };

  // Android's back button: close whatever is on top, then step back towards the map
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (exitOpen) setExitOpen(false);
      else if (sheet) setSheet(null);
      else if (view.running) setExitOpen(true);
      else if (playing && view.name !== 'map') toMap();
      else return false;
      return true;
    });
    return () => sub.remove();
  }, [exitOpen, sheet, view, playing, toMap]);


  function card() {
    if (phase === 'boot') return <Focus><CHead>Loading your adventure…</CHead></Focus>;
    if (phase === 'offline') {
      return (
        <Focus>
          <CHead>Hmm, we can’t reach the game</CHead>
          <Muted center style={{ marginBottom: rem(0.7) }}>{bootError}</Muted>
          {__DEV__ && <Muted center size={0.75} style={{ marginBottom: rem(0.7) }}>Looking for the server at {API_URL}</Muted>}
          <Btn label="Try again" onPress={retryBoot} />
        </Focus>
      );
    }
    if (phase === 'auth') return <AuthCard />;

    const { grade } = view;
    const back = (label, onPress) => <Btn label={label} color="ghost" small onPress={onPress} style={{ marginTop: rem(0.6) }} />;

    switch (view.name) {
      case 'map': {
        const all = gradeFullyDone(game, GRADES_COUNT), now = currentGrade(game, user);
        return (
          <Dock>
            <Muted center bold>Hi, {user.username}!</Muted>
            <CTitle>{all ? 'The desert is quiet' : `Grade ${now}`}</CTitle>
            <CHead>{all ? 'Every trail explored' : gradeInfo(now).title.split(' · ')[1]}</CHead>
            <Muted center style={{ marginBottom: rem(0.5) }}>{all ? 'You’ve completed all 12 grades!' : `${gradeModulesDoneCount(game, now)} of 4 modules done`}</Muted>
            {!all && <Btn label="Enter" onPress={() => openGrade(now)} />}
          </Dock>
        );
      }
      case 'grade': {
        const open = { read: () => startRun(grade, readingSpec(grade)), mem: () => openMenu('mem', grade, 'mem'), scan: () => openMenu('scan', grade, 'scan'), eye: () => openMenu('eye', grade, 'eye') };
        return (
          <Dock>
            <CTitle>{gradeInfo(grade).title}</CTitle>
            <CHead>Choose a module</CHead>
            <Muted center style={{ marginBottom: rem(0.6) }}>{gradeModulesDoneCount(game, grade)} of 4 done this grade</Muted>
            <Stack>
              {Object.keys(open).map(key => {
                const done = moduleDone(game, grade, key);
                return <Btn key={key} label={`${MODULE_META[key].icon} ${MODULE_META[key].name}${done ? ' ✅' : ''}`} color={done ? 'g' : 'o'} onPress={open[key]} />;
              })}
            </Stack>
            {back('Back to the map', toMap)}
          </Dock>
        );
      }
      case 'menu':
        if (view.menu === 'mem') {
          return (
            <Dock>
              <CTitle>Visual Memory</CTitle>
              <CHead>Choose a game</CHead>
              <Stack>
                {FLASH_MEMORY_GAMES.map((g, i) => <Btn key={g.kind} label={g.label} color={BTN_COLOURS[i]} onPress={() => startRun(grade, flashMemorySpec(grade, g.kind))} />)}
                <Btn label="🃏 Card Match Memory" color="r" onPress={() => startRun(grade, cardMatchSpec(grade))} />
              </Stack>
              {back('Back', () => openGrade(grade))}
            </Dock>
          );
        }
        if (view.menu === 'scan') {
          return (
            <Dock>
              <CTitle>Scanning</CTitle>
              <CHead>Choose a game</CHead>
              <Stack>
                <Btn label="🧮 Tracking" onPress={() => openMenu('tracking', grade, 'scan')} />
                <Btn label="🔍 Symbol Search" color="o" onPress={() => openMenu('symbol', grade, 'scan')} />
              </Stack>
              {back('Back', () => openGrade(grade))}
            </Dock>
          );
        }
        if (view.menu === 'eye') {
          return (
            <Dock>
              <CTitle>Eye Therapy</CTitle>
              <CHead>Choose a test</CHead>
              <Stack>
                <Btn label="👀 Convergence" onPress={() => startRun(grade, fusionSpec(grade, 'convergence'))} />
                <Btn label="🕶️ Divergence (red/blue glasses)" color="o" onPress={() => startRun(grade, fusionSpec(grade, 'divergence'))} />
              </Stack>
              {back('Back', () => openGrade(grade))}
            </Dock>
          );
        }
        return (   // 'tracking' or 'symbol': which kind of thing to look for
          <Dock>
            <CTitle>{view.menu === 'tracking' ? 'Tracking' : 'Symbol Search'}</CTitle>
            <CHead>Choose an element</CHead>
            <Stack>
              {ELEMENT_META.map((e, i) => <Btn key={e.key} label={e.label} color={BTN_COLOURS[i % BTN_COLOURS.length]} onPress={() => startRun(grade, scanningSpec(grade, view.menu, e.key))} />)}
            </Stack>
            {back('Back', () => openMenu('scan', grade, 'scan'))}
          </Dock>
        );
      case 'run':
        return <ModuleRun key={view.id} grade={grade} spec={view.spec} onRetry={() => startRun(grade, view.spec)} onModules={() => openGrade(grade)} onMap={toMap} />;
      case 'break':
        return (
          <Focus>
            <CTitle>Eye break</CTitle>
            <View style={{ alignItems: 'center', marginVertical: rem(0.3) }}><Art xml={ART.drop} width={90} /></View>
            <CHead>Time to look far away</CHead>
            <Muted center style={{ marginBottom: rem(0.7) }}>You’ve been playing for {view.mins} minutes. Rest your eyes on something distant, then come back.</Muted>
            <Stack>
              <Btn label="Take a break" onPress={toMap} />
              <Btn label="Keep going" color="ghost" small onPress={() => setView(view.back)} />
            </Stack>
          </Focus>
        );
      default:
        return null;   // travelling: nothing but the curtain
    }
  }

  const closeSheet = () => setSheet(null);
  return (
    <View style={{ flex: 1, backgroundColor: '#eaa757' }}>
      {scene === 'map'
        ? <MapWorld quiet={!playing} bottomSpace={win.height * 0.34} onOpenGrade={openGrade} />
        : <LevelWorld scene={scene} />}
      {playing && <Hud running={view.running} onOpenSheet={setSheet} onExit={() => setExitOpen(true)} />}
      {card()}
      {playing && sheet && (
        <Sheet onClose={closeSheet}>
          {sheet === 'rewards' ? <RewardsSheet onClose={closeSheet} />
            : sheet === 'profile' ? <ProfileSheet onClose={closeSheet} />
              : <ParentSheet onClose={closeSheet} onAfterReset={() => { closeSheet(); toMap(); }} />}
        </Sheet>
      )}
      {playing && exitOpen && (
        <Sheet onClose={() => setExitOpen(false)} maxWidth={420}>
          <CTitle>Exit</CTitle>
          <CHead>Leave this exercise?</CHead>
          <Muted center style={{ marginBottom: rem(0.7) }}>Your progress in this exercise won’t be saved, but you can come back and play any time.</Muted>
          <Stack>
            <Btn label="Keep playing" onPress={() => setExitOpen(false)} />
            <Btn label="Exit to the map" color="o" onPress={toMap} />
            <Btn label="Log out" color="ghost" small onPress={() => { setExitOpen(false); logout(); }} />
          </Stack>
        </Sheet>
      )}
      {journey && <Wipe key={journey.id} onCovered={() => { setScene(journey.to); setView(journey.next); }} onDone={() => setJourney(null)} />}
      <Toast />
    </View>
  );
}
