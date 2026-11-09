/* Talking to the game server: requests, and saving progress. */
import { game, token, user } from './state.js';
import { signedOut } from '../ui/auth.js';
import { toast } from '../ui/cards.js';

export let saveTimer = null;

function apiError(data, status){
  if(data && typeof data.detail === 'string') return data.detail;
  if(status === 422) return 'Please check what you typed and try again.';
  if(status >= 500) return 'The game server isn’t responding. Please try again in a moment.';
  return 'Something went wrong. Please try again.';
}

export async function api(method, path, body, keepalive){
  let res;
  try{
    res = await fetch(path, {
      method, keepalive: !!keepalive,
      headers: Object.assign({}, body ? { 'content-type':'application/json' } : {}, token ? { 'x-session-token':token } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
  }catch(e){ throw { status:0, message:'Can’t reach the game server. Please check your connection and try again.' }; }
  if(res.status === 204) return null;
  let data = null; try{ data = await res.json(); }catch(e){}
  if(!res.ok) throw { status:res.status, message:apiError(data, res.status) };
  return data;
}

export function save(){
  if(!user) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(pushState, 600);
}

export async function pushState(keepalive){
  clearTimeout(saveTimer); saveTimer = null;
  if(!user) return;
  try{ await api('PUT', '/api/progress', { state:game }, keepalive); }
  catch(e){
    if(e.status === 401){ toast('Please sign in again'); signedOut(); }
    else saveTimer = setTimeout(pushState, 5000);
  }
}

document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden' && saveTimer) pushState(true); });
window.addEventListener('pagehide', () => { if(saveTimer) pushState(true); });
export function cancelPendingSave(){ clearTimeout(saveTimer); saveTimer = null; }
