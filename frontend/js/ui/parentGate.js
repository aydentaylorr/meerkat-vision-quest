/* The grown-up on record for an account: the form that sets one up, confirming their email,
   the lock on the grown-ups area, and their consent to collecting the player's answers. */
import { api } from '../core/api.js';
import { user } from '../core/state.js';
import { $, esc } from '../core/utils.js';
import { card, toast } from './cards.js';
import { renderSheet } from './sheets.js';

const CONSENT_TEXT = 'Help improve the game: let this player’s answers be studied together with other players’, without their name. It starts once the grown-up’s email is confirmed, and can be changed at any time.';
const plain = 'text-transform:none;letter-spacing:0;font-size:1rem';
const MIN_PASSWORD = 8;

const emailField = `<input class="vinput" id="pgEmail" type="email" placeholder="Grown-up’s email" maxlength="254" autocomplete="email" autocapitalize="off" spellcheck="false" style="${plain}">`;
const passField = (hint, onEnter) => `<input class="vinput" id="pgPass" type="password" placeholder="Grown-up password" maxlength="128" autocomplete="${hint}" style="${plain}"${onEnter ? ` onkeydown="if(event.key==='Enter')${onEnter}()"` : ''}>`;

/* the email, grown-up password and consent box, shared by sign-up and the grown-ups area */
export const parentFields = () => `${emailField}${passField('new-password')}
  <label class="cmuted" style="display:flex;gap:.5rem;align-items:flex-start;max-width:280px;margin:.3rem auto;font-size:.8rem;text-align:left;cursor:pointer">
    <input type="checkbox" id="pgConsent" style="margin-top:.2rem"> <span>${CONSENT_TEXT}</span></label>`;

const readEmail = () => { const v = $('#pgEmail').value.trim().toLowerCase(); return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : null; };

/* returns { parent } to send to the server, or { error } to show */
export function readParentFields(playerPassword){
  const email = readEmail(), password = $('#pgPass').value;
  if(!email) return { error:'A grown-up needs to type their email address' };
  if(password.length < MIN_PASSWORD) return { error:`The grown-up password needs at least ${MIN_PASSWORD} characters` };
  if(password === playerPassword) return { error:'The grown-up password must be different from the player’s' };
  return { parent:{ email, password, consent: $('#pgConsent').checked } };
}

/* the grown-up password, kept only while the grown-ups area is open so consent can be changed */
let pass = null;
export const parentUnlocked = () => pass !== null;
export function lockParentArea(){ pass = null; }

const say = (t, good) => { const e = $('#pgErr'); if(e){ e.textContent = t; e.style.color = good ? 'var(--green-d)' : ''; } };

/* shown in place of the grown-ups area until a confirmed grown-up opens it */
export function gateView(){
  if(!user.has_parent) return `<p class="cmuted center">This area is for a grown-up. Set it up once: we email you a link to confirm, then it opens with your grown-up password.</p>
    ${parentFields()}
    <div class="autherr" id="pgErr"></div>
    <button class="abtn" onclick="parentSetup()">Set up</button>`;
  if(!user.verified) return `<p class="cmuted center">We emailed a link to <b>${esc(user.email_hint)}</b>. A grown-up needs to open it to finish setting up. Until then this area stays closed and nothing is shared.</p>
    <div class="autherr" id="pgErr"></div>
    <div class="stack">
      <button class="abtn" onclick="parentRecheck()">I’ve opened the link</button>
      <button class="abtn ghost sm" onclick="parentResend()">Send it again</button></div>
    <p class="cmuted center" style="margin-top:1rem;font-size:.85rem">Wrong address? Type the right one and the grown-up password.</p>
    ${emailField}${passField('current-password')}
    <button class="abtn ghost sm" onclick="parentChangeEmail()">Change the address</button>`;
  return `<p class="cmuted center">Type the grown-up password to open this area.</p>
    ${passField('current-password', 'parentUnlock')}
    <div class="autherr" id="pgErr"></div>
    <div class="stack">
      <button class="abtn" onclick="parentUnlock()">Open</button>
      <button class="abtn ghost sm" onclick="parentForgot()">Forgot the password?</button></div>`;
}

export async function parentSetup(){
  const read = readParentFields();
  if(read.error) return say(read.error);
  try{ Object.assign(user, await api('POST', '/api/parent', read.parent)); renderSheet(); }
  catch(e){ say(e.message); }
}

export async function parentRecheck(){
  try{
    Object.assign(user, (await api('GET', '/api/me')).user);
    renderSheet();
    if(!user.verified) say('Not confirmed yet. Look for our email, also in the spam folder.');
  }catch(e){ say(e.message); }
}

export async function parentResend(){
  try{ await api('POST', '/api/parent/resend'); say('Sent. Look in the inbox and the spam folder.', true); }
  catch(e){ say(e.message); }
}

export async function parentChangeEmail(){
  const email = readEmail(), password = $('#pgPass').value;
  if(!email) return say('Please type the right email address');
  if(!password) return say('Please type the grown-up password');
  try{
    Object.assign(user, await api('PUT', '/api/parent/email', { email, password }));
    renderSheet();
    say('Sent a new link to that address.', true);
  }catch(e){ say(e.message); }
}

export async function parentUnlock(){
  const password = $('#pgPass').value;
  if(!password) return say('Please type the grown-up password');
  try{
    await api('POST', '/api/parent/unlock', { password });
    pass = password;
    renderSheet();
  }catch(e){ say(e.message); }
}

export async function parentForgot(){
  try{ await api('POST', '/api/parent/reset'); say(`We emailed a link to ${user.email_hint} for choosing a new one.`, true); }
  catch(e){ say(e.message); }
}

export async function setConsent(on){
  if(!on && !confirm('Stop sharing and delete the answers already collected from this player? This cannot be undone.')) return;
  try{
    Object.assign(user, await api('PUT', '/api/parent/consent', { password:pass, consent:on }));
    renderSheet();
    toast(on ? 'Sharing is on' : 'Sharing is off and collected answers are deleted');
  }catch(e){ toast(e.message); }
}

/* Links in the grown-up's emails land on the game with #verify=… or #reset=… after the address.
   The part after # never reaches the server's logs. Returns true when it took over the screen. */
let resetToken = null;
const linkDone = (title, text) => card(`<div class="chead">${title}</div>
  <p class="cmuted center">${text}</p>
  <button class="abtn" onclick="boot()">Continue</button>`, 'focus');

export async function openEmailLink(){
  const m = location.hash.match(/^#(verify|reset)=([\w-]+)$/);
  if(!m) return false;
  history.replaceState(null, '', location.pathname);
  if(m[1] === 'verify'){
    try{
      await api('POST', '/api/parent/verify', { token:m[2] });
      linkDone('Email confirmed', 'Thank you. The grown-ups area now opens with your grown-up password.');
    }catch(e){ linkDone('That link didn’t work', esc(e.message)); }
  } else {
    resetToken = m[2];
    card(`<div class="chead">Choose a new grown-up password</div>
      <input class="vinput" id="pgNew" type="password" placeholder="New grown-up password" maxlength="128" autocomplete="new-password" style="${plain}" onkeydown="if(event.key==='Enter')parentNewPassword()">
      <div class="autherr" id="pgErr"></div>
      <button class="abtn" onclick="parentNewPassword()">Save</button>`, 'focus');
  }
  return true;
}

export async function parentNewPassword(){
  const password = $('#pgNew').value;
  if(password.length < MIN_PASSWORD) return say(`It needs at least ${MIN_PASSWORD} characters`);
  try{
    await api('POST', '/api/parent/reset/confirm', { token:resetToken, password });
    resetToken = null;
    linkDone('Password changed', 'The grown-ups area now opens with your new password.');
  }catch(e){ say(e.message); }
}
