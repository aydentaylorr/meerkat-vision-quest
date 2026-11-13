/* Colours, fonts and sizes (the web game's design tokens, frontend/css/base.css). */

const FIXED = {
  green: '#7ac943', greenD: '#57a02c', orange: '#f0a038', orangeD: '#cf7d17',
  blue: '#4bb3e6', blueD: '#2c8cbd', purple: '#a284d8', purpleD: '#7b5cb8',
  red: '#ef7566', redD: '#c9503f', gold: '#ffc94d', sand: '#eaa757',
  rightBg: '#eaf9de', wrongBg: '#fdeceb',
};
const LIGHT = { ...FIXED, cream: '#fffaf0', cream2: '#fff3dd', line: '#f2ddb0', brown: '#6b4423', brownSoft: '#9a7350', notice: '#fff2d2' };
const CONTRAST = { ...FIXED, cream: '#151318', cream2: '#1e1a22', line: '#4a3f52', brown: '#fff6e6', brownSoft: '#d8c6b2', notice: '#2a2410', rightBg: '#1d3312', wrongBg: '#3d1b17' };

export const FONT = { body: 'Baloo2_500Medium', bold: 'Baloo2_700Bold', black: 'Baloo2_800ExtraBold' };

/* `rem(n)` is n × 16 points, scaled by the grown-ups' text-size setting. */
export function makeTheme(settings) {
  const fs = settings.fs || 1;
  return { c: settings.contrast ? CONTRAST : LIGHT, fs, rem: n => Math.round(n * 16 * fs * 10) / 10, reduceMotion: !!settings.reduceMotion };
}
