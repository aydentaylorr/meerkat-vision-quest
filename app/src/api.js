/* Talking to the game server (the same API the web game uses; see the README). */
import Constants from 'expo-constants';

/* EXPO_PUBLIC_API_URL names the server. Without it (development) the server is assumed to be running
   on the machine that runs the Expo dev server, on port 8000 (`make run-lan`). */
function baseUrl() {
  const set = process.env.EXPO_PUBLIC_API_URL;
  if (set) return set.replace(/\/+$/, '');
  const host = (Constants.expoConfig?.hostUri || '').split(':')[0];
  return `http://${host || 'localhost'}:8000`;
}

export const API_URL = baseUrl();
export const APP_VERSION = Constants.expoConfig?.version || 'dev';

// a preview deployment can sit behind one shared password (MVQ_SITE_PASSWORD on the server)
const SITE_PASSWORD = process.env.EXPO_PUBLIC_SITE_PASSWORD;
const TIMEOUT_MS = 12000;

function apiError(data, status) {
  if (data && typeof data.detail === 'string') return data.detail;
  if (status === 422) return 'Please check what you typed and try again.';
  if (status >= 500) return 'The game server isn’t responding. Please try again in a moment.';
  return 'Something went wrong. Please try again.';
}

/* Resolves with the response body, or rejects with { status, message }; status 0 means the server
   could not be reached at all. */
export async function api(method, path, body, token) {
  const headers = {};
  if (body) headers['content-type'] = 'application/json';
  if (token) headers['x-session-token'] = token;
  if (SITE_PASSWORD) headers.authorization = 'Basic ' + btoa(':' + SITE_PASSWORD);

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: abort.signal });
  } catch {
    throw { status: 0, message: 'Can’t reach the game server. Please check your connection and try again.' };
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return null;
  // the preview gate answers 401 too, but that is not an expired session
  if (res.status === 401 && res.headers.get('www-authenticate')) {
    throw { status: 0, message: 'This preview needs its password. Set EXPO_PUBLIC_SITE_PASSWORD and rebuild.' };
  }
  let data = null;
  try { data = await res.json(); } catch { /* not JSON: the status code says enough */ }
  if (!res.ok) throw { status: res.status, message: apiError(data, res.status) };
  return data;
}
