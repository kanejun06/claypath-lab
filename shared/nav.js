/* ClayPath Lab / ClayLine Lab / ClayMorph Lab — tabs to move between the three tools
 * Replaces the header links with one tab bar (the current tool highlighted). Query and hash (e.g. ?teacher) carry over.
 * Moving to another tab loads that page: the tool you leave keeps nothing, so save G-code / settings first.
 */
(function(){
"use strict";
const TOOLS=[
  {name:'ClayPath Lab', sub:'STLから', dir:''},
  {name:'ClayLine Lab', sub:'SVGの線から', dir:'svg/'},
  {name:'ClayMorph Lab', sub:'断面の変化から', dir:'morph/'},
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
@media (max-width:760px){ .tooltabs{margin-left:0;width:100%} .tooltabs a{flex:1;padding:3px 4px} }`; document.head.appendChild(st);
  const nav=document.createElement('nav'); nav.className='tooltabs'; nav.setAttribute('aria-label','ツールの切り替え');
  // single-file builds (standalone/) set window.ClayNavFiles to their sibling file names
  const files=window.ClayNavFiles; const page=location.pathname.split('/').pop();
  TOOLS.forEach((t,i)=>{ const a=document.createElement('a');
    if(files){ a.href=files[i]+location.search+location.hash; if(page===files[i]) a.setAttribute('aria-current','page'); }
    else { const url=root+t.dir; a.href=url+(location.protocol==='file:'?'index.html':'')+location.search+location.hash; if(here===url) a.setAttribute('aria-current','page'); } // file:// does not serve a folder's index.html
    a.innerHTML=`${t.name}<small>${t.sub}</small>`; nav.appendChild(a); });
  // header: title and description first, tabs to the right
  const h1=hd.querySelector('h1'), sub=hd.querySelector('.sub'); (sub||h1).after(nav); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
