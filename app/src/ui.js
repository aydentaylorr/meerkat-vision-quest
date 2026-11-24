/* The building blocks every screen is made of: text styles, buttons, inputs, artwork, and the two
   kinds of card (a bottom "dock" and a centred "focus" card), styled after frontend/css. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { useGame, useTheme } from './GameContext';
import { cosmetic, meerkatSVG } from './shared';
import { FONT } from './theme';

/* ---------- animation ---------- */

/* An Animated.Value that goes 0 → 1 → 0 forever (or stays at 0 when motion is reduced). */
export function useLoop(duration) {
  const { reduceMotion } = useTheme();
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) { v.setValue(0); return undefined; }
    const half = { duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, ...half }), Animated.timing(v, { toValue: 0, ...half }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, duration, reduceMotion]);
  return v;
}

/* Fades and slides its children in once, when it first appears. */
function PopIn({ from, style, children }) {
  const { reduceMotion } = useTheme();
  const [v] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.out(Easing.back(1.3)), useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/* Cancels everything it scheduled when the screen that owns it goes away. */
export function useTimers() {
  const timers = useRef([]);
  useEffect(() => { const all = timers.current; return () => all.forEach(clearTimeout); }, []);
  return useCallback((fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; }, []);
}

/* ---------- artwork ---------- */

// the web art carries CSS hooks that mean nothing here
const cleanSvg = xml => xml.replace(/\s(class|style|role|aria-label)="[^"]*"/g, '');

/* Draws one of the game's SVG strings at `width`, keeping its proportions (or filling `width` × `height`). */
export function Art({ xml, width, height, color, style }) {
  const clean = useMemo(() => cleanSvg(xml), [xml]);
  const box = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(clean);
  const h = height ?? (box ? (width * box[2]) / box[1] : width);
  return <SvgXml xml={clean} width={width} height={h} color={color} style={style} />;
}

const NOMI_BARE = meerkatSVG({ hat: null, item: null });

/* Nomi, wearing whatever the player has equipped. The hat and gear are emoji, drawn as text on top
   because emoji inside an SVG do not render reliably on Android. */
export function Nomi({ width, bob }) {
  const { game } = useGame();
  const loop = useLoop(2800);
  const u = width / 120, height = u * 170;
  const hat = cosmetic(game.equipped.hat), item = cosmetic(game.equipped.item);
  const lift = bob ? loop.interpolate({ inputRange: [0, 1], outputRange: [0, -0.03 * height] }) : 0;
  return (
    <Animated.View style={{ pointerEvents: 'none', width, height, transform: [{ translateY: lift }] }}>
      <Art xml={NOMI_BARE} width={width} />
      {hat && <Text allowFontScaling={false} style={{ position: 'absolute', top: -8 * u, left: 0, right: 0, textAlign: 'center', fontSize: 28 * u, lineHeight: 36 * u }}>{hat.em}</Text>}
      {item && <Text allowFontScaling={false} style={{ position: 'absolute', top: 112 * u, left: 84 * u, fontSize: 24 * u, lineHeight: 32 * u }}>{item.em}</Text>}
    </Animated.View>
  );
}

/* ---------- text ---------- */

export function Txt({ style, weight = 'body', ...rest }) {
  const { c, rem } = useTheme();
  return <Text {...rest} style={[{ fontFamily: FONT[weight], color: c.brown, fontSize: rem(1), lineHeight: rem(1.45) }, style]} />;
}

/* small spaced-out capitals above a card's heading */
export function CTitle({ children }) {
  const { c, rem } = useTheme();
  return <Txt weight="black" style={{ fontSize: rem(0.9), lineHeight: rem(1.3), letterSpacing: rem(0.16), textTransform: 'uppercase', color: c.brownSoft, textAlign: 'center' }}>{children}</Txt>;
}

export function CHead({ children, style }) {
  const { rem } = useTheme();
  return <Txt weight="black" style={[{ fontSize: rem(1.6), lineHeight: rem(1.95), textAlign: 'center', marginVertical: rem(0.1) }, style]}>{children}</Txt>;
}

export function Muted({ children, center, size = 1, bold, style }) {
  const { c, rem } = useTheme();
  return <Txt weight={bold ? 'bold' : 'body'} style={[{ color: c.brownSoft, fontSize: rem(size), lineHeight: rem(size * 1.45), textAlign: center ? 'center' : 'left' }, style]}>{children}</Txt>;
}

/* the big flashed word, letter or number; shrinks to stay on one line */
export function Big({ children, color, size = 3.1 }) {
  const { rem } = useTheme();
  return (
    <Txt weight="black" numberOfLines={1} adjustsFontSizeToFit
      style={{ fontSize: rem(size), lineHeight: rem(size * 1.25), letterSpacing: rem(size * 0.05), textAlign: 'center', alignSelf: 'stretch', color }}>
      {children}
    </Txt>
  );
}

export function SectionHead({ children, style }) {
  const { rem } = useTheme();
  return <Txt weight="black" style={[{ fontSize: rem(1.12), lineHeight: rem(1.5), marginTop: rem(0.2), marginBottom: rem(0.3) }, style]}>{children}</Txt>;
}

/* ---------- controls ---------- */

const BTN = {
  g: ['green', 'greenD'], o: ['orange', 'orangeD'], b: ['blue', 'blueD'], p: ['purple', 'purpleD'], r: ['red', 'redD'], ghost: ['cream2', 'line'],
};
export const BTN_COLOURS = ['g', 'o', 'b', 'p', 'r'];

/* The big chunky game button. `mark` ('right' | 'wrong') shows an answer's result. */
export function Btn({ label, onPress, color = 'g', small, disabled, mark, style }) {
  const { c, rem } = useTheme();
  const [face, edge] = BTN[mark === 'right' ? 'g' : mark === 'wrong' ? 'r' : color];
  const ghost = color === 'ghost' && !mark;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{
        alignSelf: 'center', width: '100%', maxWidth: 460, borderRadius: 22, marginBottom: 6,
        paddingVertical: rem(small ? 0.5 : 0.62), paddingHorizontal: rem(0.9),
        backgroundColor: c[face], boxShadow: `0 ${pressed ? 1 : 5}px 0 ${c[edge]}`,
        transform: [{ translateY: pressed ? 4 : 0 }], opacity: disabled && !mark ? 0.6 : 1,
      }, style]}>
      <Txt weight="black" style={{
        textAlign: 'center', color: ghost ? c.brown : '#fff',
        fontSize: rem(small ? 1.02 : 1.15), lineHeight: rem(small ? 1.5 : 1.75),
        letterSpacing: small ? 0 : rem(0.06), textTransform: small ? 'none' : 'uppercase',
      }}>{label}</Txt>
    </Pressable>
  );
}

/* a small pill: tabs, and quiet actions like "Close" */
export function Chip({ label, onPress, on, style }) {
  const { c, rem } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!on }} hitSlop={6}
      style={[{ backgroundColor: on ? c.brown : c.cream2, borderRadius: 999, paddingVertical: rem(0.32), paddingHorizontal: rem(0.9) }, style]}>
      <Txt weight="bold" style={{ fontSize: rem(0.86), lineHeight: rem(1.3), color: on ? c.cream : c.brown }}>{label}</Txt>
    </Pressable>
  );
}

/* `mark` ('right' | 'wrong') colours the box once an answer has been checked. */
export function Input({ mark, style, ...rest }) {
  const { c, rem } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput autoCapitalize="none" autoCorrect={false} spellCheck={false} placeholderTextColor={c.brownSoft} {...rest}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={[{
        alignSelf: 'center', width: '100%', maxWidth: 280, marginVertical: rem(0.45),
        paddingVertical: rem(0.5), paddingHorizontal: rem(1),
        fontFamily: FONT.black, fontSize: rem(1.3), textAlign: 'center', letterSpacing: rem(0.05), color: c.brown,
        backgroundColor: mark === 'right' ? c.rightBg : mark === 'wrong' ? c.wrongBg : c.cream,
        borderWidth: 3, borderRadius: 16, borderColor: mark === 'right' ? c.green : mark === 'wrong' ? c.red : focused ? c.orange : c.line,
        outlineStyle: 'none',   // web preview only: the border already shows focus
      }, style]} />
  );
}

/* twelve grade buttons, used wherever a grade is chosen */
export function GradePicker({ value, onChange, count }) {
  const { c, rem } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginVertical: rem(0.4) }}>
      {Array.from({ length: count }, (_, i) => i + 1).map(g => (
        <Pressable key={g} onPress={() => onChange(g)} accessibilityRole="button" accessibilityLabel={`Grade ${g}`} accessibilityState={{ selected: value === g }}
          style={{ width: 46, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: value === g ? c.orange : c.cream2, boxShadow: `0 3px 0 ${value === g ? c.orangeD : c.line}` }}>
          <Txt weight="black" style={{ fontSize: rem(1.05), color: value === g ? '#fff' : c.brown }}>{g}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

export function Notice({ children }) {
  const { c, rem } = useTheme();
  return (
    <View style={{ backgroundColor: c.notice, borderRadius: 16, paddingVertical: rem(0.6), paddingHorizontal: rem(0.8), marginTop: rem(0.55) }}>
      <Txt style={{ fontSize: rem(0.8), lineHeight: rem(1.16) }}>{children}</Txt>
    </View>
  );
}

export function HintBar({ icon, children }) {
  const { c, rem } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: rem(0.5), backgroundColor: c.cream2, borderRadius: 16, paddingVertical: rem(0.55), paddingHorizontal: rem(0.75), marginTop: rem(0.55) }}>
      <Txt style={{ fontSize: rem(0.9) }}>{icon}</Txt>
      <Txt style={{ flex: 1, fontSize: rem(0.8), lineHeight: rem(1.12) }}>{children}</Txt>
    </View>
  );
}

export const B = ({ children }) => <Text style={{ fontFamily: FONT.black }}>{children}</Text>;

export function Stack({ children, style }) {
  const { rem } = useTheme();
  return <View style={[{ gap: rem(0.35) }, style]}>{children}</View>;
}

/* ---------- cards ---------- */

const SHADOW = '0 -6px 0 rgba(150,100,50,0.16), 0 -20px 50px rgba(110,65,20,0.24)';

/* Bottom card, flush with the bottom edge: briefings, menus and the story. */
export function Dock({ children }) {
  const { c, rem } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ pointerEvents: 'box-none', position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' }}>
      <PopIn from={40} style={{ width: '100%', maxWidth: 820, maxHeight: height * 0.72, backgroundColor: c.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', boxShadow: SHADOW }}>
        <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: rem(1.1), paddingHorizontal: rem(1.2), paddingBottom: rem(1.1) + insets.bottom, alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: 480 }}>{children}</View>
        </ScrollView>
      </PopIn>
    </View>
  );
}

/* How much of the bottom of the screen the on-screen keyboard is covering. */
function useKeyboardOverlap() {
  const [overlap, setOverlap] = useState(0);
  useEffect(() => {
    const ios = Platform.OS === 'ios';   // iOS announces the keyboard before it moves, which looks smoother
    const show = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setOverlap(Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY)));
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setOverlap(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return overlap;
}

export const HUD_HEIGHT = 120;   // the bar's two rows, measured from the safe area

/* Centred card over a dimmed world: the exercise itself. It sits below the bar (so Exit stays in
   reach) and above the keyboard. `typing` marks a card whose answer box is at the bottom: when the
   keyboard opens, the card scrolls so the box and its button stay in view. */
export function Focus({ children, typing }) {
  const { phase } = useGame();
  const { c, rem } = useTheme();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardOverlap();
  const scroller = useRef(null);
  const top = insets.top + 10 + (phase === 'play' && !keyboard ? HUD_HEIGHT : 0);
  const bottom = keyboard ? keyboard + 10 : insets.bottom + 10;
  useEffect(() => {
    if (!typing || !keyboard) return undefined;
    const t = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [typing, keyboard]);
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(56,32,10,0.42)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingTop: top, paddingBottom: bottom }}>
      <PopIn from={22} style={{ width: '100%', maxWidth: 700, maxHeight: win.height - top - bottom, backgroundColor: c.cream, borderRadius: 28, overflow: 'hidden', boxShadow: '0 10px 0 rgba(150,100,50,0.2), 0 30px 70px rgba(90,50,10,0.4)' }}>
        <ScrollView ref={scroller} style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: rem(1.2), paddingHorizontal: rem(1.2) }}>
          {children}
        </ScrollView>
      </PopIn>
    </View>
  );
}

/* Pop-up sheet over everything (rewards, profile, grown-ups, the exit question). Tapping outside closes it. */
export function Sheet({ children, onClose, maxWidth = 680 }) {
  const { c, rem } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
      <Pressable onPress={onClose} accessibilityLabel="Close" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(60,35,15,0.45)' }} />
      <View style={{ pointerEvents: 'box-none', flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
        <PopIn from={22} style={{ width: '100%', maxWidth, maxHeight: '100%', backgroundColor: c.cream, borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 50px rgba(60,35,15,0.4)' }}>
          <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: rem(1.15), paddingHorizontal: rem(1.2) }}>
            {children}
          </ScrollView>
        </PopIn>
      </View>
    </View>
  );
}

/* A short message at the bottom of the screen. Each new message replaces the last. */
export function Toast() {
  const { toastMsg } = useGame();
  const [finished, setFinished] = useState(null);
  if (!toastMsg || finished === toastMsg.id) return null;
  return <ToastBubble key={toastMsg.id} text={toastMsg.text} onDone={() => setFinished(toastMsg.id)} />;
}

function ToastBubble({ text, onDone }) {
  const { rem } = useTheme();
  const insets = useSafeAreaInsets();
  const [v] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const t = setTimeout(() => Animated.timing(v, { toValue: 0, duration: 250, useNativeDriver: true }).start(onDone), 2200);
    return () => clearTimeout(t);
    // shows once per message
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View accessibilityLiveRegion="polite"
      style={{ pointerEvents: 'none', position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 24, alignItems: 'center', opacity: v }}>
      <View style={{ backgroundColor: 'rgba(60,35,15,0.92)', borderRadius: 999, paddingVertical: rem(0.5), paddingHorizontal: rem(1.1) }}>
        <Txt weight="bold" style={{ color: '#fff9ec', textAlign: 'center' }}>{text}</Txt>
      </View>
    </Animated.View>
  );
}
