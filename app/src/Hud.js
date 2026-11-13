/* The always-visible bar: streak, progress, gems, and the corner buttons. */
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGame, useTheme } from './GameContext';
import { currentGrade, gradeFullyDone, gradeModulesDoneCount } from './rules';
import { ART, EXIT_ICON, GRADES_COUNT, MODULE_META, PROFILE_ICON } from './shared';
import { Art, Txt } from './ui';

const SHADOW = '0 5px 0 rgba(150,100,50,0.22), 0 10px 22px rgba(120,70,20,0.16)';

/* `running` is { grade, moduleKey } while a module is open; then the bar names it and offers Exit. */
export function Hud({ running, onOpenSheet, onExit }) {
  const { game, user } = useGame();
  const { c, rem } = useTheme();
  const insets = useSafeAreaInsets();
  const top = insets.top + 8;
  const box = { backgroundColor: c.cream, boxShadow: SHADOW };

  let head, sub;
  if (running) { const m = MODULE_META[running.moduleKey]; head = `${m.icon} ${m.name}`; sub = `Grade ${running.grade}`; }
  else if (gradeFullyDone(game, GRADES_COUNT)) { head = 'All done! 🎉'; sub = '12 / 12 grades'; }
  else { const g = currentGrade(game, user); head = `Grade ${g}`; sub = `${gradeModulesDoneCount(game, g)} / 4 modules`; }

  const corner = { ...box, width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' };

  return (
    <View style={{ pointerEvents: 'box-none', position: 'absolute', left: 0, right: 0, top }}>
      <View style={{ pointerEvents: 'box-none', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View accessible accessibilityLabel={`${game.streak.count} day streak`}
          style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 6, borderTopRightRadius: 22, borderBottomRightRadius: 22, paddingVertical: 6, paddingLeft: 9, paddingRight: 12 }}>
          <Art xml={ART.flame} width={26} />
          <View>
            <Txt weight="black" style={{ fontSize: rem(0.95), lineHeight: rem(1.1) }}>{game.streak.count}</Txt>
            <Txt weight="bold" style={{ fontSize: rem(0.6), lineHeight: rem(0.8), color: c.brownSoft }}>DAY STREAK</Txt>
          </View>
        </View>

        <View style={{ ...box, borderRadius: 22, paddingVertical: 5, paddingHorizontal: 14, alignItems: 'center', flexShrink: 1, marginHorizontal: 6 }}>
          <Txt weight="black" numberOfLines={1} style={{ fontSize: rem(0.92), lineHeight: rem(1.2) }}>{head}</Txt>
          <Txt numberOfLines={1} style={{ fontSize: rem(0.66), lineHeight: rem(0.9), color: c.brownSoft }}>{sub}</Txt>
        </View>

        <Pressable onPress={() => onOpenSheet('rewards')} accessibilityRole="button" accessibilityLabel={`${game.gems} gems. Open Nomi’s treasure chest`}
          style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 6, borderTopLeftRadius: 22, borderBottomLeftRadius: 22, paddingVertical: 5, paddingLeft: 12, paddingRight: 9 }}>
          <Art xml={ART.coin} width={22} />
          <Txt weight="black" style={{ fontSize: rem(0.9) }}>{game.gems}</Txt>
          <Art xml={ART.chest} width={32} />
        </Pressable>
      </View>

      <View style={{ pointerEvents: 'box-none', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, paddingHorizontal: 12 }}>
        {running ? (
          <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Exit"
            style={{ ...corner, width: undefined, flexDirection: 'row', gap: 6, paddingHorizontal: 13 }}>
            <Art xml={EXIT_ICON} width={14} color={c.brown} />
            <Txt weight="black" style={{ fontSize: rem(0.95) }}>Exit</Txt>
          </Pressable>
        ) : <View />}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => onOpenSheet('parent')} accessibilityRole="button" accessibilityLabel="For grown-ups" style={corner}>
            <Txt style={{ fontSize: 19, lineHeight: 26 }}>⚙️</Txt>
          </Pressable>
          <Pressable onPress={() => onOpenSheet('profile')} accessibilityRole="button" accessibilityLabel="My profile" style={corner}>
            <Art xml={PROFILE_ICON} width={24} color={c.brown} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
