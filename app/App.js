// Meerkat Vision Quest, the app. The game lives in src/; it shares its stories, word lists,
// difficulty curve and artwork with the web version in ../frontend (see src/shared.js).
import { Baloo2_500Medium } from '@expo-google-fonts/baloo-2/500Medium';
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2/700Bold';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Game } from './src/Game';
import { GameProvider } from './src/GameContext';

export default function App() {
  const [fontsReady, fontError] = useFonts({ Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold });
  // without the font the game still works in the system font, so a failed load does not block it
  if (!fontsReady && !fontError) return <View style={{ flex: 1, backgroundColor: '#eaa757' }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <GameProvider>
        <Game />
      </GameProvider>
    </SafeAreaProvider>
  );
}
