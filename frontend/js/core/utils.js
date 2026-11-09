/* Small helpers shared by the whole game: DOM lookup, random picks, formatting, safe localStorage. */

export const $  = s => document.querySelector(s);
export const rnd = n => Math.floor(Math.random()*n);
export const pick = a => a[rnd(a.length)];
export const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
export const clamp = (v,lo,hi) => Math.max(lo, Math.min(hi, v));
export const pct = v => Math.round(v*100) + '%';
export const dayKey = (d=new Date()) => d.toISOString().slice(0,10);
export const daysBetween = (a,b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export const store = {
  read(k, fb){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }catch(e){ return fb; } },
  write(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  remove(k){ try{ localStorage.removeItem(k); }catch(e){} }
};

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
