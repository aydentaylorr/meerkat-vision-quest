// The game itself lives in ../frontend and is served by the backend; this app is a native shell around it.
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// ponytail: one env var, no settings screen. Set EXPO_PUBLIC_GAME_URL to the deployed site for release builds.
const GAME_URL = process.env.EXPO_PUBLIC_GAME_URL || 'http://localhost:8000';
const BG = '#eaa757'; // matches frontend/css/base.css body background

export default function App() {
  const web = useRef(null);
  const [failed, setFailed] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" backgroundColor={BG} />
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.msg}>Can’t reach the game right now.</Text>
            <Pressable style={styles.btn} onPress={() => { setFailed(false); web.current?.reload(); }}>
              <Text style={styles.btnText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={web}
            source={{ uri: GAME_URL }}
            style={styles.root}
            bounces={false}
            overScrollMode="never"
            allowsBackForwardNavigationGestures={false}
            setSupportMultipleWindows={false}
            startInLoadingState
            renderLoading={() => <ActivityIndicator style={styles.center} color="#fff" size="large" />}
            onError={() => setFailed(true)}
            onHttpError={(e) => { if (e.nativeEvent.statusCode >= 500) setFailed(true); }}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG, gap: 16 },
  msg: { fontSize: 18, color: '#3a2a12' },
  btn: { backgroundColor: '#3a2a12', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
