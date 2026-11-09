/* The page's HTML calls these by name from onclick="..." attributes, so they are made available on window. */
import { openEyeMenu, startFusion } from './modules/eyeTherapy.js';
import { startReading } from './modules/reading.js';
import { closeExit, confirmQuit, retryModule } from './modules/runner.js';
import { openElementMenu, openScanningMenu, startScanning } from './modules/scanning.js';
import { openVisualMemoryMenu, startCardMatch, startFlashMemory } from './modules/visualMemory.js';
import { authMode, authSubmit, boot, logout } from './ui/auth.js';
import { toast } from './ui/cards.js';
import { mapCard, openGrade, tapNode, toMap } from './ui/map.js';
import { fontStep, resetAll, seedDemo, setCap, toggleSetting, unlockAll } from './ui/parentArea.js';
import { saveProfile } from './ui/profile.js';
import { buy, equip } from './ui/rewards.js';
import { closeSheet, openSheet, setTab } from './ui/sheets.js';

Object.assign(window, {
  authMode,
  authSubmit,
  boot,
  buy,
  closeExit,
  closeSheet,
  confirmQuit,
  equip,
  fontStep,
  logout,
  mapCard,
  openElementMenu,
  openEyeMenu,
  openGrade,
  openScanningMenu,
  openSheet,
  openVisualMemoryMenu,
  resetAll,
  retryModule,
  saveProfile,
  seedDemo,
  setCap,
  setTab,
  startCardMatch,
  startFlashMemory,
  startFusion,
  startReading,
  startScanning,
  tapNode,
  toMap,
  toast,
  toggleSetting,
  unlockAll,
});
