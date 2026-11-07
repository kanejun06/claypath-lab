/* ClayLine Lab / ClayPath Lab / ClayMorph Lab — the G-code line at the playback position
 * Adds a "G-code" toggle (off by default) to the play bar. When on, a small panel above the bar shows the
 * line the nozzle is on (with the line before and after) and its line number in the file.
 *   ClayGLine.mount(playbarElement, build)  build() returns {text, map}: the G-code text and, for every
 *                                           path point, the 1-based line number of the command that ends there
 *   ClayGLine.show(i, path)                 call from the playback update with the current point index;
 *                                           a different path object means the G-code is rebuilt (lazily)
 */
window.ClayGLine=(function(){
"use strict";
let build=null, bar=null, panel=null, cb=null, on=false, cache=null, key=null, idx=-1, timer=0;
function css(){ const st=document.createElement('style'); st.textContent=
  '.glt{display:flex;align-items:center;gap:3px;white-space:nowrap;cursor:pointer}'+
  '.gline{position:absolute;z-index:3;background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:4px 8px;font-family:var(--mono);font-size:11px;line-height:1.5;pointer-events:none}'+
  '.gline[hidden]{display:none}'+
  '.gline .gl{white-space:pre;overflow:hidden;text-overflow:ellipsis;opacity:.55}'+
  '.gline .gl.cur{opacity:1;color:var(--accent)}'+
  '.gline .gn{display:inline-block;min-width:7ch;text-align:right;margin-right:1ch;opacity:.6;font-variant-numeric:tabular-nums}'+
  '.gline .gh{opacity:.6;font-size:10px}';
  document.head.appendChild(st); }
// keep the panel just above the bar (the bar moves with the layout's media queries)
function place(){ const cs=getComputedStyle(bar); panel.style.left=cs.left; panel.style.right=cs.right;
  panel.style.bottom=(parseFloat(cs.bottom)||0)+bar.offsetHeight+6+'px'; }
function esc(s){ return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function render(){ if(!on||!panel) return; place();
  if(!cache){ panel.innerHTML='<div class="gh">G-code を作っています…</div>'; clearTimeout(timer);
    timer=setTimeout(()=>{ try{ const r=build&&build(); cache=r? {lines:r.text.split('\n'), map:r.map} : null; }catch(e){ cache=null; } if(!cache) panel.innerHTML='<div class="gh">—</div>'; else render(); },120); return; }
  const L=cache.lines, total=L[L.length-1]===''? L.length-1 : L.length; let n=cache.map[Math.max(0,Math.min(cache.map.length-1,idx))]; if(n==null) n=1;
  let h=`<div class="gh">${n.toLocaleString()} 行目 / ${total.toLocaleString()} 行</div>`;
  for(const k of [n-1,n,n+1]){ if(k<1||k>total) continue; h+=`<div class="gl${k===n?' cur':''}"><span class="gn">${k}</span>${esc(L[k-1])}</div>`; }
  panel.innerHTML=h; }
function mount(barEl,fn){ if(!barEl) return; bar=barEl; build=fn; css();
  const lab=document.createElement('label'); lab.className='glt'; lab.title='再生位置の G-code の行を、シークバーの上に表示する';
  lab.innerHTML='<input type="checkbox" id="gLineOn">G-code'; bar.insertBefore(lab, bar.querySelector('.t'));
  panel=document.createElement('div'); panel.className='gline'; panel.hidden=true; panel.setAttribute('aria-live','off'); bar.parentNode.insertBefore(panel,bar);
  cb=lab.querySelector('input'); cb.checked=false;
  cb.addEventListener('change',()=>{ on=cb.checked; panel.hidden=!on; cache=null; render(); });
  window.addEventListener('resize',()=>{ if(on) place(); }); }
function show(i,path){ idx=i; if(path!==key){ key=path; cache=null; } if(on) render(); }
return {mount,show};
})();
