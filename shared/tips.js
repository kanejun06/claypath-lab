/* Clay tools: show setting explanations on hover instead of always.
   Every explanatory .note in the settings panel and in the G-code settings is hidden and attached to the
   setting rows just above it. Hovering (or focusing) a row shows the note as a small popup; on touch,
   tapping the row's label toggles it. Notes with an id are live readouts and stay visible (unless they carry data-tip).
   Notes added later (e.g. by shared/rim.js) are picked up too. */
(function(){
  'use strict';
  const css=`
.cl-tipped{display:none!important}
.cl-hastip>label,.cl-hastip>.lbl,h2.cl-hastip,summary.cl-hastip{text-decoration:underline dotted color-mix(in srgb,currentColor 45%,transparent);text-underline-offset:3px;cursor:help}
.cl-tip{position:fixed;z-index:1000;max-width:300px;padding:7px 9px;border-radius:6px;font-size:11.5px;line-height:1.55;
  background:var(--panel,#fff);color:var(--fg,#222);border:1px solid var(--line,#ccc);box-shadow:0 4px 14px rgba(0,0,0,.14);pointer-events:none;
  opacity:0;transform:translateY(-2px);transition:opacity .12s,transform .12s}
.cl-tip.on{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.cl-tip{transition:none}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const tip=document.createElement('div'); tip.className='cl-tip'; tip.setAttribute('role','tooltip'); tip.id='cl-tip';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(tip)); if(document.body) document.body.appendChild(tip);
  let cur=null, timer=0;
  function textOf(row){ return (row._clNotes||[]).map(n=>n.textContent.trim()).filter(Boolean).join('\n\n'); }
  function show(row,now){ clearTimeout(timer); const go=()=>{ const t=textOf(row); if(!t) return; cur=row; tip.textContent=t; tip.style.whiteSpace='pre-line';
      const r=row.getBoundingClientRect(), vw=innerWidth, vh=innerHeight; tip.style.left='0px'; tip.style.top='0px'; tip.classList.add('on');
      const w=tip.offsetWidth, h=tip.offsetHeight; let x=r.right+10, y=r.top;
      if(x+w>vw-8){ x=Math.max(8,Math.min(r.left,vw-w-8)); y=r.bottom+6; if(y+h>vh-8) y=r.top-h-6; }
      if(y+h>vh-8) y=vh-h-8; tip.style.left=Math.round(x)+'px'; tip.style.top=Math.round(Math.max(8,y))+'px'; row.setAttribute('aria-describedby','cl-tip'); };
    if(now) go(); else timer=setTimeout(go,220); }
  function hide(row){ clearTimeout(timer); if(row&&cur!==row) return; tip.classList.remove('on'); if(cur) cur.removeAttribute('aria-describedby'); cur=null; }
  function bind(row,note){ (row._clNotes=row._clNotes||[]).push(note); if(row._clBound) return; row._clBound=true; row.classList.add('cl-hastip');
    row.addEventListener('mouseenter',()=>show(row)); row.addEventListener('mouseleave',()=>hide(row));
    row.addEventListener('focusin',()=>show(row,true)); row.addEventListener('focusout',()=>hide(row));
    const lab=row.querySelector('label,.lbl'); if(lab) lab.addEventListener('touchend',e=>{ if(e.target.closest('input,select,button')) return; if(cur===row) hide(row); else show(row,true); },{passive:true}); }
  const isRow=el=>el&&el.nodeType===1&&(el.classList.contains('row')||el.classList.contains('fold')||el.matches('label.toggle'));
  function attach(note){ if(note._clDone||(note.id&&!note.hasAttribute('data-tip'))) return; note._clDone=true;
    // rows just above the note, back to the previous note or heading
    const rows=[]; let el=note.previousElementSibling;
    while(el && !el.classList.contains('note') && !/^H[1-6]$/.test(el.tagName)){ if(isRow(el)) rows.push(el); else if(el.querySelector&&el.querySelector('.row')) rows.push(...el.querySelectorAll(':scope > .row')); el=el.previousElementSibling; }
    let targets=rows.length? rows : [];
    if(!targets.length){ // nothing above: hang it on the section heading (or the previous element)
      const h=(el&&/^H[1-6]$/.test(el.tagName))? el : note.previousElementSibling || (note.parentElement&&note.parentElement.querySelector('h2'));
      if(h) targets=[h]; }
    if(!targets.length) return;
    for(const t of targets) bind(t,note); note.classList.add('cl-tipped'); }
  const SCOPE='.side .note, .export .note, details .note';
  function scan(){ document.querySelectorAll(SCOPE).forEach(attach); }
  const mo=new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes){ if(n.nodeType!==1) continue; if(n.matches&&n.matches('.note')) { if(n.closest('.side,.export,details')) attach(n); } else if(n.querySelectorAll) n.querySelectorAll('.note').forEach(x=>{ if(x.closest('.side,.export,details')) attach(x); }); } });
  function start(){ scan(); mo.observe(document.body,{childList:true,subtree:true}); addEventListener('scroll',()=>hide(cur),true); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.ClayTips={scan};
})();
