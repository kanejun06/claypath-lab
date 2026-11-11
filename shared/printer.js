/* ClayPath Lab / ClayLine Lab / ClayMorph Lab — shared machine profile
 *
 * The values every tool uses for the printer live here, in one place. Each page loads this file before its own script
 * and calls ClayPrinter.apply(): the machine inputs get these values and are locked for students. Opening a page with
 * ?teacher (e.g. .../morph/?teacher) unlocks them for that tab only, for test prints; reloading brings these values back.
 * To change what students print with, edit this file and push.
 *
 * Several machines can be described (PROFILES). The page uses ?machine=<id> (default: clay3040); a teacher can switch
 * from the header in ?teacher mode. Give students the link with the machine they should use.
 *   clay3040    SYNO-SOURCE-3040 (air tank + screw extruder), Kobe Design University. Values confirmed on the machine.
 *   ender3v3_10 Creality Ender-3 V3, 1.0 mm nozzle, PLA. PROVISIONAL: generic start code and typical PLA values,
 *               not yet checked on the machine. Replace gStart/gEnd with what Creality Print writes for this printer.
 */
(function(){
"use strict";
const PROFILES={
clay3040:{
  name:'SYNO-SOURCE-3040・ノズル1.5mm・標準',
  short:'3040・1.5mm',   // shown in the header chip
  nozzle:1.5,        // mm. 2.0 mm also exists but uses much more clay; the course uses 1.5 only
  lineW:1.5,         // mm, line width used for the E calculation
  layerH:0.9,        // mm
  filD:2.2,          // mm, "filament" diameter used to convert volume to E (screw extruder)
  eMul:0.85,         // extrusion multiplier (Cura flow)
  eFirst:1,          // extra multiplier for the first layer and skirt (e.g. 0.85 if the first layer blobs)
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
  notes:'空気圧・土の配合・ベッドはG-codeの外で決まる（例：0.3MPa、フロスト100:35、9mm MDF）',
  soft:{ovh:30},     // not locked: page defaults that suit this machine (overhang warning angle)
},
ender3v3_10:{
  name:'Ender-3 V3・ノズル1.0mm・PLA（仮）',
  short:'Ender-3 V3・1.0mm・PLA（仮）',
  provisional:true,  // start code and values not yet checked on the machine
  nozzle:1.0, lineW:1.1, layerH:0.5, filD:1.75, eMul:1.0, eFirst:1,
  baseF:25,          // mm/s: 1.1 × 0.5 × 25 ≈ 14 mm³/s, well inside what the hotend melts
  vFirst:15, travelF:150, zF:10,
  retract:0.8, retractF:40, hop:0.4,
  skirt:true, skirtOff:5,
  bedX:110, bedY:110,
  build:{x:220,y:220,z:250},
  gStart:"; PROVISIONAL start code for Ender-3 V3 (Creality OS / Klipper). Replace with the start of a Creality Print G-code for this printer.\nM140 S60 ;bed\nM104 S220 ;nozzle (PLA, 1.0 mm nozzle)\nG90\nM82 ;absolute extrusion\nG28 ;home all axes\nM190 S60\nM109 S220\nG92 E0\nG1 Z2 F600\nG1 X5 Y20 F6000 ;prime line at the left edge\nG1 Z0.4 F600\nG1 X5 Y180 E15 F900\nG1 X6 Y180 F900\nG1 X6 Y20 E30 F900\nG92 E0\nG1 Z2 F600\nM106 S255 ;part fan",
  gEnd:"G91\nG1 E-1 F2400\nG1 Z10 F600\nG90\nG1 X0 Y200 F6000 ;present the print\nM104 S0\nM140 S0\nM107\nM84",
  notes:'PLA。温度・速度・開始コードは仮。Creality Print の G-code の開始部分に差し替えて使う',
  soft:{ovh:45},
},
};
const MACHINE=(location.search.match(/[?&]machine=([\w-]+)/)||[])[1];
const PROFILE=PROFILES[MACHINE]||PROFILES.clay3040;
const PROFILE_ID=PROFILES[MACHINE]? MACHINE : 'clay3040';
// inputs that belong to the machine (only those a page has are touched)
const LOCK=['lineW','layerH','filD','eMul','eFirst','baseF','vFirst','travelF','hop','bedX','bedY','skirt','gStart','gEnd'];
const teacher=/[?&#]teacher\b/.test(location.search+location.hash);
function setValues(){ const $=id=>document.getElementById(id);
  for(const id of LOCK){ const el=$(id); if(!el||!(id in PROFILE)) continue;
    if(el.type==='checkbox') el.checked=!!PROFILE[id]; else el.value=PROFILE[id];
    if(!teacher){ el.disabled=true; el.title='機械の設定（変更は教員のみ）'; el.classList.add('locked'); } } }
let applied=false;
function apply(){ setValues(); if(applied) return; applied=true;
  for(const [id,v] of Object.entries(PROFILE.soft||{})){ const el=document.getElementById(id); if(el) el.value=v; }
  const st=document.createElement('style'); st.textContent='.locked{opacity:.65;cursor:not-allowed}.mbanner{font-size:11px;padding:1px 7px;white-space:nowrap;align-self:center;border-radius:4px;border:1px solid var(--line);color:var(--fg2)}.mbanner.t{border-color:var(--warn);color:var(--warn)}'; document.head.appendChild(st);
  const hd=document.querySelector('header'); if(hd){ const b=document.createElement('span'); b.className='mbanner'+(teacher?' t':'');
    if(teacher){ b.append('教員モード：機械の設定を変更できます（このタブだけ。再読み込みで元の値に戻る）　機械：');
      const sel=document.createElement('select'); sel.style.cssText='font:inherit;font-size:11px'; for(const [id,p] of Object.entries(PROFILES)){ const o=document.createElement('option'); o.value=id; o.textContent=p.name; if(id===PROFILE_ID) o.selected=true; sel.appendChild(o); }
      sel.title='機械を切り替える（ページを開き直す。今の作業は保存しておく）';
      sel.onchange=()=>{ const q=new URLSearchParams(location.search); q.set('machine',sel.value); location.search=q.toString(); }; b.appendChild(sel); hd.appendChild(b); }
    else { b.textContent=`🔒 ${PROFILE.short}`; b.title='機械の設定は教員だけが変更できます'+(PROFILE.provisional?'（この機械の設定は仮です）':''); const sub=hd.querySelector('.sub'); (sub||hd.lastChild).after(b); } } }
// after loading a settings file: put the machine values back unless a teacher is testing
function reapply(){ if(!teacher) setValues(); }
window.ClayPrinter={PROFILE, PROFILES, PROFILE_ID, LOCK, teacher, apply, reapply};
})();
