/* Where the session token is kept between launches: the device keychain / keystore. */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'mvq.token';
const web = Platform.OS === 'web'; // only for the browser preview (`npm run web`)

export const tokenStore = {
  get: async () => (web ? localStorage.getItem(KEY) : SecureStore.getItemAsync(KEY)),
  set: async value => (web ? localStorage.setItem(KEY, value) : SecureStore.setItemAsync(KEY, value)),
  clear: async () => (web ? localStorage.removeItem(KEY) : SecureStore.deleteItemAsync(KEY)),
};
