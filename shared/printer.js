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
 *   ender3v3_08 Creality Ender-3 V3, 0.8 mm nozzle, PLA. Start/end code and values from Creality Print 6.3 (2026-11-16);
 *               not yet printed with these tools.
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
  eFirst:0.85,       // extra multiplier for the first layer and skirt (0.85 stopped first-layer blobs, 2026-11-11)
  baseF:20,          // mm/s, base wall speed (20 from 2026-11-12; 30 collapsed flaring walls, use the minimum layer time for those)
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
  soft:{ovh:30, fillPitch:1.15, slopeOn:true, slopeMax:1.2}, // not locked: page defaults that suit this machine (overhang warning angle; bottom fill spacing: 1.0 blobbed on layer 2, 1.25 fixed it (2026-11-11), set to 1.15 on 2026-11-12; slope compensation on, capped at x1.2 so steep walls do not get too wide)
},
ender3v3_10:{
  name:'Ender-3 V3・ノズル1.0mm・PLA（仮）',
  short:'Ender-3 V3・1.0mm・PLA（仮）',
  creality:true,     // Creality OS screen: ASCII-only G-code with a Creality Print style header (see finalize)
  provisional:true,  // start code and values not yet checked on the machine
  nozzle:1.0, lineW:1.1, layerH:0.5, filD:1.75, eFirst:1,
  eMul:0.884,        // = flow 0.98 × 0.902 (rounded-slot bead area, as Creality Print computes it)
  baseF:25,          // mm/s: 1.1 × 0.5 × 25 ≈ 14 mm³/s, well inside what the hotend melts
  vFirst:15, travelF:150, zF:10,
  retract:0.8, retractF:40, hop:0.4,
  skirt:true, skirtOff:5,
  bedX:110, bedY:110,
  build:{x:220,y:220,z:250},
  gStart:"; Ender-3 V3 (Creality OS / Klipper). Taken from Creality Print 6.3: START_PRINT heats, homes, levels and primes.\nM140 S0\nM104 S0\nSTART_PRINT EXTRUDER_TEMP=220 BED_TEMP=65\nG90 ;absolute positioning\nG21 ;millimetres\nM82 ;absolute extrusion (Creality Print uses M83; these tools write absolute E)\nG92 E0\nSET_PRESSURE_ADVANCE ADVANCE=0.02 ;from the Hyper PLA filament start code\nM106 S255 ;part fan",
  gEnd:"M83 ;relative extrusion for the last retract\nG1 E-1.5 F2400\nM106 S0\nEND_PRINT ;Creality macro: lift, present the bed, heaters and motors off",
  notes:'PLA。温度・速度・開始コードは仮。Creality Print の G-code の開始部分に差し替えて使う',
  soft:{ovh:45},
},
ender3v3_08:{
  name:'Ender-3 V3・ノズル0.8mm・PLA（仮）',
  short:'Ender-3 V3・0.8mm・PLA（仮）',
  creality:true,     // Creality OS screen: ASCII-only G-code with a Creality Print style header (see finalize)
  provisional:true,  // start/end code and values from Creality Print 6.3 ("0.40mm Standard @Creality Ender-3 V3 0.8 nozzle", Hyper PLA), not yet printed with these tools
  nozzle:0.8, lineW:0.82, layerH:0.4, filD:1.75, eFirst:1,
  eMul:0.877,        // = Creality flow 0.98 × 0.895: these tools take the bead as width × height, Creality Print as a rounded slot ((w−h)·h + π(h/2)²); matched to its 0.1197 E/mm on straight walls
  baseF:40,          // mm/s: 0.82 × 0.4 × 40 ≈ 13 mm³/s (Creality Print allows 23 mm³/s for Hyper PLA; its outer wall is 100 mm/s)
  vFirst:25, travelF:150, zF:10,
  retract:1.5, retractF:40, hop:0.4,
  skirt:true, skirtOff:5,
  bedX:110, bedY:110,
  build:{x:220,y:220,z:250},
  gStart:"; Ender-3 V3 (Creality OS / Klipper). Taken from Creality Print 6.3: START_PRINT heats, homes, levels and primes.\nM140 S0\nM104 S0\nSTART_PRINT EXTRUDER_TEMP=220 BED_TEMP=65\nG90 ;absolute positioning\nG21 ;millimetres\nM82 ;absolute extrusion (Creality Print uses M83; these tools write absolute E)\nG92 E0\nSET_PRESSURE_ADVANCE ADVANCE=0.02 ;from the Hyper PLA filament start code\nM106 S255 ;part fan",
  gEnd:"M83 ;relative extrusion for the last retract\nG1 E-1.5 F2400\nM106 S0\nEND_PRINT ;Creality macro: lift, present the bed, heaters and motors off",
  notes:'PLA（Hyper PLA）。ノズル220℃・ベッド65℃。開始・終了コードと値は Creality Print 6.3 の 0.8mm ノズル用プロファイルから',
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
  for(const [id,v] of Object.entries(PROFILE.soft||{})){ const el=document.getElementById(id); if(!el) continue; if(el.type==='checkbox') el.checked=!!v; else el.value=v; }
  const st=document.createElement('style'); st.textContent='.locked{opacity:.65;cursor:not-allowed}.mbanner{font-size:11px;padding:1px 7px;white-space:nowrap;align-self:center;border-radius:4px;border:1px solid var(--line);color:var(--fg2)}.mbanner.t{border-color:var(--warn);color:var(--warn)}'; document.head.appendChild(st);
  const hd=document.querySelector('header'); if(hd){ const b=document.createElement('span'); b.className='mbanner'+(teacher?' t':'');
    if(teacher){ b.append('教員モード：機械の設定を変更できます（このタブだけ。再読み込みで元の値に戻る）　機械：');
      const sel=document.createElement('select'); sel.style.cssText='font:inherit;font-size:11px'; for(const [id,p] of Object.entries(PROFILES)){ const o=document.createElement('option'); o.value=id; o.textContent=p.name; if(id===PROFILE_ID) o.selected=true; sel.appendChild(o); }
      sel.title='機械を切り替える（ページを開き直す。今の作業は保存しておく）';
      sel.onchange=()=>{ const q=new URLSearchParams(location.search); q.set('machine',sel.value); location.search=q.toString(); }; b.appendChild(sel); hd.appendChild(b); }
    else { b.textContent=`🔒 ${PROFILE.short}`; b.title='機械の設定は教員だけが変更できます'+(PROFILE.provisional?'（この機械の設定は仮です）':''); const sub=hd.querySelector('.sub'); (sub||hd.lastChild).after(b); } } }
// after loading a settings file: put the machine values back unless a teacher is testing
function reapply(){ if(!teacher) setValues(); }

// Last pass over a finished G-code (every tool calls it). For printers with a Creality OS screen the file must look like a
// Creality Print file: the screen reads the header when a file is opened, and a file with non-ASCII text (the tools'
// Japanese comments) and no header block made an Ender-3 V3 crash on 2026-11-16. So: ASCII only, plus the header and
// footer lines Creality Print writes. M (optional): line numbers of path points, shifted by the lines added on top.
function finalize(text,M){ if(!PROFILE.creality) return text;
  const ascii=t=>t.replace(/(\d+)時間/g,'$1h ').replace(/(\d+)分/g,'$1min').replace(/[^\x09\x0a\x0d\x20-\x7e]/g,'');
  let L=text.split('\n').map(l=>{ if(!/[^\x00-\x7f]/.test(l)) return l; const k=l.indexOf(';'); return k<0? ascii(l) : l.slice(0,k)+ascii(l.slice(k)); });
  let layers=0, zmax=0, x0=1e9,y0=1e9,x1=-1e9,y1=-1e9, emax=0, mins=0;
  for(const l of L){ if(l.startsWith(';LAYER:')) layers++; if(!/^G[01] /.test(l)) continue;
    const z=l.match(/ Z(-?[\d.]+)/), x=l.match(/ X(-?[\d.]+)/), y=l.match(/ Y(-?[\d.]+)/), e=l.match(/ E(-?[\d.]+)/);
    if(e){ const ev=+e[1]; if(ev>emax) emax=ev; if(x&&ev>0){ x0=Math.min(x0,+x[1]); x1=Math.max(x1,+x[1]); } if(y&&ev>0){ y0=Math.min(y0,+y[1]); y1=Math.max(y1,+y[1]); } }
    if(z&&e) zmax=Math.max(zmax,+z[1]); }
  const tm=text.match(/(\d+)時間\s*(\d+)分/)||text.match(/(\d+)分/); if(tm) mins= tm.length>2? (+tm[1])*60+(+tm[2]) : +tm[1];
  const f2=v=>isFinite(v)?v.toFixed(2):'0.00';
  const head=['; HEADER_BLOCK_START','; generated by ClayPath Lab tools (kanejun06.github.io/claypath-lab)',`; total layer number: ${layers}`,
    `; filament_diameter: ${PROFILE.filD}`,`; max_z_height: ${f2(zmax)}`,'; HEADER_BLOCK_END','',
    `; MINX = ${f2(x0)}`,`; MINY = ${f2(y0)}`,'; MINZ = 0.00',`; MAXX = ${f2(x1)}`,`; MAXY = ${f2(y1)}`,`; MAXZ = ${f2(zmax)}`,''];
  if(M&&M.length) for(let i=0;i<M.length;i++) if(typeof M[i]==='number') M[i]+=head.length;
  while(L.length&&L[L.length-1]==='') L.pop();
  const foot=['',`; filament used [mm] = ${f2(emax)}`,`; total layers count = ${layers}`,`; estimated printing time (normal mode) = ${Math.floor(mins/60)?Math.floor(mins/60)+'h ':''}${mins%60}m 0s`];
  return head.concat(L,foot).join('\n')+'\n'; }
window.ClayPrinter={PROFILE, PROFILES, PROFILE_ID, LOCK, teacher, apply, reapply, finalize};
})();
