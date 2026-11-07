/* ClayPath Lab / ClayLine Lab / ClayMorph Lab — tabs to move between the three tools
 * Replaces the header links with one tab bar (the current tool highlighted). Query and hash (e.g. ?teacher) carry over.
 * Moving to another tab loads that page: the tool you leave keeps nothing, so save G-code / settings first.
 */
(function(){
"use strict";
// order = the order the course introduces them: draw the path → modulate a given form → generate the form
const DOCS='https://github.com/kanejun06/claypath-lab/blob/main/docs/'; // manuals (Markdown, rendered by GitHub)
const TOOLS=[
  {name:'ClayLine Lab', sub:'SVGの線から', dir:'svg/', file:'clayline-lab.html', doc:'clayline'},
  {name:'ClayPath Lab', sub:'STLから', dir:'', file:'claypath-lab.html', doc:'claypath'},
  {name:'ClayMorph Lab', sub:'断面の変化から', dir:'morph/', file:'claymorph-lab.html', doc:'claymorph'},
];
const me=document.currentScript; const root=(me&&me.src||'').replace(/shared\/nav\.js(\?.*)?$/,'');
function build(){ const hd=document.querySelector('header'); if(!hd) return;
  hd.querySelectorAll('a.xlink').forEach(a=>a.remove());
  const here=location.href.split(/[?#]/)[0].replace(/index\.html$/,'');
  const st=document.createElement('style'); st.textContent=`
.tooltabs{display:flex;gap:2px;margin-left:auto;align-self:center;background:var(--line);padding:2px;border-radius:7px}
.tooltabs a{display:flex;flex-direction:column;align-items:center;padding:3px 12px;border-radius:5px;color:var(--fg2);text-decoration:none;font-size:12px;line-height:1.25;white-space:nowrap}
.tooltabs a small{font-size:10px}
.tooltabs a:hover{color:var(--fg);background:color-mix(in srgb,var(--panel) 60%,transparent)}
.tooltabs a[aria-current="page"]{background:var(--panel);color:var(--accent);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.08)}
a.tooldoc{align-self:center;font-size:12px;color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:5px;padding:5px 9px;background:var(--panel)}
a.tooldoc:hover{border-color:var(--accent)}
@media (max-width:760px){ .tooltabs{margin-left:0;width:100%} .tooltabs a{flex:1;padding:3px 4px} }`; document.head.appendChild(st);
  const nav=document.createElement('nav'); nav.className='tooltabs'; nav.setAttribute('aria-label','ツールの切り替え');
  // single-file builds (standalone/) set window.ClayNavFiles to their sibling file names
  const files=window.ClayNavFiles; const page=location.pathname.split('/').pop();
  TOOLS.forEach((t,i)=>{ const a=document.createElement('a');
    if(files){ a.href=t.file+location.search+location.hash; if(page===t.file) a.setAttribute('aria-current','page'); }
    else { const url=root+t.dir; a.href=url+(location.protocol==='file:'?'index.html':'')+location.search+location.hash; if(here===url) a.setAttribute('aria-current','page'); } // file:// does not serve a folder's index.html
    a.innerHTML=`${t.name}<small>${t.sub}</small>`; nav.appendChild(a); });
  const cur=TOOLS.find((t,i)=>nav.children[i]&&nav.children[i].getAttribute('aria-current'));
  const help=document.createElement('a'); help.className='tooldoc'; help.href=DOCS+(cur?cur.doc:'README')+'.md'; help.target='_blank'; help.rel='noopener'; help.textContent='説明書'; help.title='このツールの説明書（GitHub、新しいタブ）';
  // header: title and description first, tabs to the right
  const h1=hd.querySelector('h1'), sub=hd.querySelector('.sub'); (sub||h1).after(nav); nav.after(help); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
