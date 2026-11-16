/* The grown-up on record for an account: the form that sets one up, the lock on the grown-ups
   area, and their consent to collecting the player's answers. */
import { api } from '../core/api.js';
import { user } from '../core/state.js';
import { $ } from '../core/utils.js';
import { toast } from './cards.js';
import { renderSheet } from './sheets.js';

const CONSENT_TEXT = 'Help improve the game: let this player’s answers be studied together with other players’, without their name. You can change this at any time.';
const plain = 'text-transform:none;letter-spacing:0;font-size:1rem';

/* the email, grown-up password and consent box, shared by sign-up and the grown-ups area */
export const parentFields = () => `
  <input class="vinput" id="pgEmail" type="email" placeholder="Grown-up’s email" maxlength="254" autocomplete="email" autocapitalize="off" spellcheck="false" style="${plain}">
  <input class="vinput" id="pgPass" type="password" placeholder="Grown-up password" maxlength="128" autocomplete="new-password" style="${plain}">
  <label class="cmuted" style="display:flex;gap:.5rem;align-items:flex-start;max-width:280px;margin:.3rem auto;font-size:.8rem;text-align:left;cursor:pointer">
    <input type="checkbox" id="pgConsent" style="margin-top:.2rem"> <span>${CONSENT_TEXT}</span></label>`;

/* returns { parent } to send to the server, or { error } to show */
export function readParentFields(playerPassword){
  const email = $('#pgEmail').value.trim().toLowerCase(), password = $('#pgPass').value;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error:'A grown-up needs to type their email address' };
  if(password.length < 6) return { error:'The grown-up password needs at least 6 characters' };
  if(password === playerPassword) return { error:'The grown-up password must be different from the player’s' };
  return { parent:{ email, password, consent: $('#pgConsent').checked } };
}

/* the grown-up password, kept only while the grown-ups area is open so consent can be changed */
let pass = null;
export const parentUnlocked = () => pass !== null;
export function lockParentArea(){ pass = null; }

const fail = t => { const e = $('#pgErr'); if(e) e.textContent = t; };

/* shown in place of the grown-ups area until a grown-up opens it */
export function gateView(){
  if(!user.has_parent) return `<p class="cmuted center">This area is for a grown-up. Set it up once, then it opens with your grown-up password.</p>
    ${parentFields()}
    <div class="autherr" id="pgErr"></div>
    <button class="abtn" onclick="parentSetup()">Set up</button>`;
  return `<p class="cmuted center">Type the grown-up password to open this area.</p>
    <input class="vinput" id="pgPass" type="password" placeholder="Grown-up password" maxlength="128" autocomplete="current-password" style="${plain}" onkeydown="if(event.key==='Enter')parentUnlock()">
    <div class="autherr" id="pgErr"></div>
    <button class="abtn" onclick="parentUnlock()">Open</button>`;
}

export async function parentSetup(){
  const read = readParentFields();
  if(read.error) return fail(read.error);
  try{
    Object.assign(user, await api('POST', '/api/parent', read.parent));
    pass = read.parent.password;
    renderSheet();
  }catch(e){ fail(e.message); }
}

export async function parentUnlock(){
  const password = $('#pgPass').value;
  if(!password) return fail('Please type the grown-up password');
  try{
    await api('POST', '/api/parent/unlock', { password });
    pass = password;
    renderSheet();
  }catch(e){ fail(e.message); }
}

export async function setConsent(on){
  if(!on && !confirm('Stop sharing and delete the answers already collected from this player? This cannot be undone.')) return;
  try{
    Object.assign(user, await api('PUT', '/api/parent/consent', { password:pass, consent:on }));
    renderSheet();
    toast(on ? 'Sharing is on' : 'Sharing is off and collected answers are deleted');
  }catch(e){ toast(e.message); }
}
