/* ClayPath Lab / ClayLine Lab / ClayMorph Lab — shared machine profile
 *
 * The values every tool uses for the printer live here, in one place. Each page loads this file before its own script
 * and calls ClayPrinter.apply(): the machine inputs get these values and are locked for students. Opening a page with
 * ?teacher (e.g. .../morph/?teacher) unlocks them for that tab only, for test prints; reloading brings these values back.
 * To change what students print with, edit this file and push.
 *
 * Machine: SYNO-SOURCE-3040 (air tank + screw extruder), Kobe Design University. Values confirmed on the machine.
 */
(function(){
"use strict";
const PROFILE={
  name:'SYNO-SOURCE-3040・ノズル1.5mm・標準',
  short:'3040・1.5mm',   // shown in the header chip
  nozzle:1.5,        // mm. 2.0 mm also exists but uses much more clay; the course uses 1.5 only
  lineW:1.5,         // mm, line width used for the E calculation
  layerH:0.9,        // mm
  filD:2.2,          // mm, "filament" diameter used to convert volume to E (screw extruder)
  eMul:0.85,         // extrusion multiplier (Cura flow)
  baseF:18,          // mm/s, base wall speed (try up to ~30 later)
  vFirst:18,         // mm/s, first layer and skirt
  travelF:60,        // mm/s, travel moves
  zF:40,             // mm/s, Z moves (F2400)
  retract:1,         // mm of E pulled back before a travel
  retractF:30,       // mm/s for retract / unretract (F1800)
  hop:1,             // mm, Z lift for travel moves
  skirt:true,        // one skirt loop
  skirtOff:6,        // mm, skirt offset from the part
  bedX:150, bedY:150,// mm, added to every XY (same frame as the Cura output); the start code's G92 X-15 Y-30 also applies
  build:{x:300,y:300,z:400}, // mm
  gStart:"G90 ;absolute positioning\nG92 Z0 ;current needle height is Z zero\nG21 ;metric values\nM82 ;absolute extrusion\nM107 ;fan off\nG28 X0 Y0 ;home X and Y only. never home Z\nG92 X-15 Y-30 ;bed center offset. edit these two numbers to shift the print\nG1 Z15.0 F2400 ;lower the platform\nG92 E0 ;reset extruder\nG1 F200 E3 ;prime 3mm\nM117 Printing...\nM106 S255 ;fan full\nG92 E0\nG1 F1800 E-1 ;retract",
  gEnd:"M107\nG91 ;relative\nG1 E-1 F300\nG1 Z+20\nG90 ;back to absolute\nG28 X0 Y0\nM106 S0 ;fan off\nM84 ;disable motors\nM82 ;absolute extrusion mode",
  notes:'空気圧・土の配合・ベッドはG-codeの外で決まる（例：0.3MPa、フロスト100:35、アクリル＋マスキングテープ／9mm MDF）'
};
// inputs that belong to the machine (only those a page has are touched)
const LOCK=['lineW','layerH','filD','eMul','baseF','vFirst','travelF','hop','bedX','bedY','skirt','gStart','gEnd'];
const teacher=/[?&#]teacher\b/.test(location.search+location.hash);
function setValues(){ const $=id=>document.getElementById(id);
  for(const id of LOCK){ const el=$(id); if(!el||!(id in PROFILE)) continue;
    if(el.type==='checkbox') el.checked=!!PROFILE[id]; else el.value=PROFILE[id];
    if(!teacher){ el.disabled=true; el.title='機械の設定（変更は教員のみ）'; el.classList.add('locked'); } } }
let applied=false;
function apply(){ setValues(); if(applied) return; applied=true;
  const st=document.createElement('style'); st.textContent='.locked{opacity:.65;cursor:not-allowed}.mbanner{font-size:11px;padding:1px 7px;white-space:nowrap;align-self:center;border-radius:4px;border:1px solid var(--line);color:var(--fg2)}.mbanner.t{border-color:var(--warn);color:var(--warn)}'; document.head.appendChild(st);
  const hd=document.querySelector('header'); if(hd){ const b=document.createElement('span'); b.className='mbanner'+(teacher?' t':'');
    b.textContent= teacher? `教員モード：機械の設定を変更できます（このタブだけ。再読み込みで ${PROFILE.name} に戻る）` : `🔒 ${PROFILE.short}`; b.title= teacher? '' : '機械の設定は教員だけが変更できます'; if(teacher) hd.appendChild(b); else { const sub=hd.querySelector('.sub'); (sub||hd.lastChild).after(b); } } }
// after loading a settings file: put the machine values back unless a teacher is testing
function reapply(){ if(!teacher) setValues(); }
window.ClayPrinter={PROFILE, LOCK, teacher, apply, reapply};
})();
