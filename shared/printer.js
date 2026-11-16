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
  baseF:30,          // mm/s: 1.1 × 0.5 × 30 ≈ 17 mm³/s (2026-11-16: 30 mm/s at most for these PLA tests)
  maxF:30,           // mm/s: no extruding move faster than this, whatever the page's speed changes do (see finalize)
  vFirst:20, travelF:150, zF:10,
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
  baseF:30,          // mm/s: 0.82 × 0.4 × 30 ≈ 10 mm³/s (2026-11-16: 30 mm/s at most for these PLA tests; Creality Print allows 23 mm³/s for Hyper PLA)
  maxF:30,           // mm/s: no extruding move faster than this, whatever the page's speed changes do (see finalize)
  vFirst:20, travelF:150, zF:10,
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

// "Print at clay scale" (Ender only): a small PLA model of what the clay printer would print. The page works as if it were
// the clay machine (clay line width and layer height, so slicing, fill spacing and layer count are the clay ones), and
// finalize() shrinks the G-code by k = Ender line width / clay line width: XY and Z ×k, extrusion ×k³ (length k, bead
// cross-section k²), speeds ×k. The page's speed fields hold real speed / k, so its time estimates stay real.
// Turned on with the header checkbox or ?clayscale; remembered per browser.
const CLAY=PROFILES.clay3040;
const VOL_MAX=20; // mm³/s: keep the scaled model's bead (thicker layers) under what the hotend melts
const scaleK=()=>PROFILE.lineW/CLAY.lineW;
let scaleOn=false;
if(PROFILE.creality){ let v=null; try{ v=localStorage.getItem('clayScale'); }catch(e){} scaleOn=/[?&]clayscale\b/.test(location.search)||v==='1'; }
function eff(){ if(!scaleOn) return PROFILE; const k=scaleK(), p=Object.assign({},PROFILE), r1=v=>Math.round(v*100)/100;
  const vmax=Math.min(PROFILE.maxF||1e9, VOL_MAX/(PROFILE.lineW*CLAY.layerH*k));
  Object.assign(p,{lineW:CLAY.lineW, layerH:CLAY.layerH, bedX:r1(PROFILE.bedX/k), bedY:r1(PROFILE.bedY/k), hop:r1(PROFILE.hop/k),
    baseF:r1(Math.min(PROFILE.baseF,vmax)/k), vFirst:r1(Math.min(PROFILE.vFirst,vmax)/k), travelF:r1(PROFILE.travelF/k)});
  return p; }
function setValues(){ const $=id=>document.getElementById(id); const PR=eff();
  for(const id of LOCK){ const el=$(id); if(!el||!(id in PR)) continue;
    if(el.type==='checkbox') el.checked=!!PR[id]; else el.value=PR[id];
    if(!teacher){ el.disabled=true; el.title='機械の設定（変更は教員のみ）'; el.classList.add('locked'); } } }
function setScale(on){ scaleOn=!!on; try{ localStorage.setItem('clayScale',scaleOn?'1':'0'); }catch(e){}
  try{ const q=new URLSearchParams(location.search); if(scaleOn) q.set('clayscale',''); else q.delete('clayscale'); history.replaceState(null,'',location.pathname+'?'+q.toString().replace(/clayscale=(&|$)/,'clayscale$1')+location.hash); }catch(e){}
  setValues(); for(const id of LOCK){ const el=document.getElementById(id); if(!el) continue; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  scaleUI(); }
// In clay-scale mode the machine fields hold clay-size values; show what the printer really does next to them.
const REAL={lineW:'mm', layerH:'mm', baseF:'mm/s', vFirst:'mm/s', travelF:'mm/s', bedX:''};
function realNotes(){ const k=scaleK(); for(const id of Object.keys(REAL)){ const el=document.getElementById(id); if(!el) continue;
    const row=el.closest('.row')||el.parentElement; let sp=row.querySelector('.mreal');
    if(!scaleOn){ if(sp) sp.remove(); continue; }
    if(!sp){ sp=document.createElement('span'); sp.className='mreal'; row.appendChild(sp); if(!el._clReal){ el._clReal=true; el.addEventListener('input',realNotes); } }
    const v=+el.value*k, f=x=>String(Math.round(x*(x<1?100:10))/(x<1?100:10));
    sp.textContent= id==='bedX'? `実際 ${f(v)} / ${f(+(document.getElementById('bedY')||el).value*k)}` : `実際 ${f(v)} ${REAL[id]}`; } }
let scaleBox=null;
function scaleUI(){ realNotes(); if(!scaleBox) return; const k=scaleK(); scaleBox.querySelector('input').checked=scaleOn;
  scaleBox.classList.toggle('on',scaleOn);
  scaleBox.querySelector('span').textContent= scaleOn? `粘土の縮尺で刷る：画面は粘土の大きさ、刷るのは ${Math.round(k*100)}%（×${k.toFixed(2)}）` : '粘土の縮尺で刷る'; }
function scaleControl(){ const lab=document.createElement('label'); lab.className='mscale';
  lab.title=`粘土（線幅 ${CLAY.lineW} mm・層高 ${CLAY.layerH} mm）で刷るつもりで形を作り、PLA ではそれを ×${scaleK().toFixed(2)} に縮めて刷ります。線幅・層高・形を同じ倍率で縮めるので、層の数・壁の太さの比率・張り出しの角度が粘土と同じになります。画面の大きさ・線幅・層高は粘土の値で、印刷速度の欄は「実際の速度 ÷ ${scaleK().toFixed(2)}」です（予想時間は実際の時間）。PLA はすぐ固まるので、柔らかさによる崩れは再現しません。`;
  const cb=document.createElement('input'); cb.type='checkbox'; cb.onchange=()=>setScale(cb.checked); lab.append(cb,document.createElement('span')); scaleBox=lab; scaleUI(); return lab; }
let applied=false;
function apply(){ setValues(); if(applied) return; applied=true;
  for(const [id,v] of Object.entries(PROFILE.soft||{})){ const el=document.getElementById(id); if(!el) continue; if(el.type==='checkbox') el.checked=!!v; else el.value=v; }
  const st=document.createElement('style'); st.textContent='.locked{opacity:.65;cursor:not-allowed}.mbanner{font-size:11px;padding:1px 7px;white-space:nowrap;align-self:center;border-radius:4px;border:1px solid var(--line);color:var(--fg2)}.mbanner.t{border-color:var(--warn);color:var(--warn)}.mscale{font-size:11px;display:inline-flex;gap:4px;align-items:center;align-self:center;white-space:nowrap;padding:1px 7px;border-radius:4px;border:1px solid var(--line);color:var(--fg2);cursor:pointer}.mscale.on{border-color:var(--acc,#2a6);color:var(--fg)}.row:has(>.mreal){flex-wrap:wrap;row-gap:0}.mreal{flex-basis:100%;text-align:right;font-size:11px;color:var(--acc,#2a6);margin-top:-2px}'; document.head.appendChild(st);
  const hd=document.querySelector('header'); if(hd){ const b=document.createElement('span'); b.className='mbanner'+(teacher?' t':'');
    if(teacher){ b.append('教員モード：機械の設定を変更できます（このタブだけ。再読み込みで元の値に戻る）　機械：');
      const sel=document.createElement('select'); sel.style.cssText='font:inherit;font-size:11px'; for(const [id,p] of Object.entries(PROFILES)){ const o=document.createElement('option'); o.value=id; o.textContent=p.name; if(id===PROFILE_ID) o.selected=true; sel.appendChild(o); }
      sel.title='機械を切り替える（ページを開き直す。今の作業は保存しておく）';
      sel.onchange=()=>{ const q=new URLSearchParams(location.search); q.set('machine',sel.value); location.search=q.toString(); }; b.appendChild(sel); hd.appendChild(b); }
    else { b.textContent=`🔒 ${PROFILE.short}`; b.title='機械の設定は教員だけが変更できます'+(PROFILE.provisional?'（この機械の設定は仮です）':''); const sub=hd.querySelector('.sub'); (sub||hd.lastChild).after(b); }
    if(PROFILE.creality) b.after(scaleControl()); } }
// after loading a settings file: put the machine values back unless a teacher is testing
function reapply(){ if(!teacher) setValues(); realNotes(); }

// Last pass over a finished G-code (every tool calls it). For printers with a Creality OS screen the file must look like a
// Creality Print file: the screen reads the header when a file is opened, and a file with non-ASCII text (the tools'
// Japanese comments) and no header block made an Ender-3 V3 crash on 2026-11-16. So: ASCII only, plus the header and
// footer lines Creality Print writes. M (optional): line numbers of path points, shifted by the lines added on top.

// Creality OS screens show the PNG thumbnails embedded in a Creality Print file. Draw the extruded path seen from above at
// an angle (isometric) and embed it the same way: "; thumbnail begin WxH <base64 length>", 78 base64 characters a line.
function thumbBlock(segs,size){ try{
  const c=document.createElement('canvas'); c.width=c.height=size; const g=c.getContext('2d'); if(!g||!segs.length) return [];
  const cs=Math.cos(Math.PI/6), sn=Math.sin(Math.PI/6); const pr=(x,y,z)=>[(x-y)*cs, (x+y)*sn - z*1.0];
  let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9,zm=0; for(const s of segs){ for(const q of [pr(s[0],s[1],s[2]),pr(s[3],s[4],s[2])]){ u0=Math.min(u0,q[0]); u1=Math.max(u1,q[0]); v0=Math.min(v0,q[1]); v1=Math.max(v1,q[1]); } zm=Math.max(zm,s[2]); }
  const m=size*0.08, k=Math.min((size-2*m)/Math.max(1e-6,u1-u0),(size-2*m)/Math.max(1e-6,v1-v0)); const ox=(size-(u1-u0)*k)/2, oy=(size-(v1-v0)*k)/2;
  g.lineCap='round'; g.lineWidth=Math.max(1,size/96*1.2);
  const step=Math.max(1,Math.floor(segs.length/80000));
  for(let i=0;i<segs.length;i+=step){ const s=segs[i]; const t=zm>0? s[2]/zm : 0; const a=pr(s[0],s[1],s[2]), b=pr(s[3],s[4],s[2]);
    const L=Math.round(150+80*t); g.strokeStyle=`rgb(${Math.round(L*0.55)},${Math.round(L*0.75)},${L})`;
    g.beginPath(); g.moveTo(ox+(a[0]-u0)*k, oy+(a[1]-v0)*k); g.lineTo(ox+(b[0]-u0)*k, oy+(b[1]-v0)*k); g.stroke(); }
  const b64=c.toDataURL('image/png').split(',')[1]; const out=['; THUMBNAIL_BLOCK_START','',';',`; thumbnail begin ${size}x${size} ${b64.length}`];
  for(let i=0;i<b64.length;i+=78) out.push('; '+b64.slice(i,i+78)); out.push('; thumbnail end','; THUMBNAIL_BLOCK_END',''); return out; }catch(e){ return []; } }
// Clay-scale mode: shrink every move by k about the origin (the bed offset was set to bedX/k, so the part lands centred).
// Extruding moves get E ×k³; retracts and the unretracts that pay them back keep their length. F ×k, except on
// E-only and Z-only moves (retract and Z speeds are real already).
function scaleMoves(L,k){ const k3=k*k*k; let te=0, ne=0, debt=0, rel=false; const n3=v=>v.toFixed(3);
  return L.map(l=>{ const c=l.indexOf(';'); const cmd=c<0?l:l.slice(0,c), com=c<0?'':l.slice(c);
    if(/^M83\b/.test(cmd)) rel=true; else if(/^M82\b/.test(cmd)) rel=false;
    if(rel) return l; // relative E only appears in the end code (last retract)
    if(/^G92\b/.test(cmd)){ const m=cmd.match(/ E(-?[\d.]+)/); if(m){ te=ne=+m[1]; debt=0; } return l; }
    if(!/^G[01]\b/.test(cmd)) return l;
    const has=a=>new RegExp(' '+a+'-?[\\d.]').test(cmd); const xy=has('X')||has('Y');
    const out=cmd.replace(/ ([XYZEF])(-?[\d.]+)/g,(m0,a,v)=>{ v=+v;
      if(a==='X'||a==='Y'||a==='Z') return ' '+a+n3(v*k);
      if(a==='F') return ' F'+((xy||!(has('E')||has('Z')))? Math.max(1,Math.round(v*k)) : v);
      const d=v-te; te=v; let nd;
      if(d<0){ debt-=d; nd=d; } else { const r=Math.min(d,debt); debt-=r; nd=r+(d-r)*k3; }
      ne+=nd; return ' E'+(Math.abs(ne)<5e-4?0:ne).toFixed(4).replace(/0+$/,'').replace(/\.$/,''); });
    return out.trimEnd()+(com?(out.endsWith(' ')?'':' ')+com:''); }); }
function finalize(text,M){ if(!PROFILE.creality) return text;
  const ascii=t=>t.replace(/(\d+)時間/g,'$1h ').replace(/(\d+)分/g,'$1min').replace(/[^\x09\x0a\x0d\x20-\x7e]/g,'');
  let L=text.split('\n').map(l=>{ if(!/[^\x00-\x7f]/.test(l)) return l; const k=l.indexOf(';'); return k<0? ascii(l) : l.slice(0,k)+ascii(l.slice(k)); });
  if(scaleOn){ const k=scaleK(); L=scaleMoves(L,k); const i=L.findIndex(l=>/^G[01]\b/.test(l)); L.splice(Math.max(0,i),0,`; clay scale x${k.toFixed(4)}: clay-size design (line ${CLAY.lineW} mm, layer ${CLAY.layerH} mm) printed as a PLA model (line ${PROFILE.lineW} mm, layer ${(CLAY.layerH*k).toFixed(3)} mm)`);
    if(M&&M.length) for(let j=0;j<M.length;j++) if(typeof M[j]==='number'&&M[j]>=i) M[j]++; }
  if(PROFILE.maxF){ const fm=Math.round(PROFILE.maxF*60); // cap printing speed: F on extruding XY moves and on bare "G1 F" lines (they set the speed for the extrusion that follows)
    L=L.map(l=>{ const c=l.indexOf(';'), cmd=c<0?l:l.slice(0,c); if(!/^G[01]\b/.test(cmd)||!/ F[\d.]/.test(cmd)) return l;
      const xy=/ [XY]-?[\d.]/.test(cmd), e=/ E-?[\d.]/.test(cmd), z=/ Z-?[\d.]/.test(cmd); if(!((xy&&e)||(!xy&&!e&&!z))) return l;
      return l.replace(/ F([\d.]+)/,(m,v)=>' F'+Math.min(+v,fm)); }); }
  let layers=0, zmax=0, x0=1e9,y0=1e9,x1=-1e9,y1=-1e9, emax=0, mins=0;
  const segs=[]; let cx=0,cy=0,cz=0,ce=0;
  for(const l of L){ if(l.startsWith(';LAYER:')) layers++; if(!/^G[01] /.test(l)) continue;
    const z=l.match(/ Z(-?[\d.]+)/), x=l.match(/ X(-?[\d.]+)/), y=l.match(/ Y(-?[\d.]+)/), e=l.match(/ E(-?[\d.]+)/);
    if(e){ const ev=+e[1]; if(ev>emax) emax=ev; if(x&&ev>0){ x0=Math.min(x0,+x[1]); x1=Math.max(x1,+x[1]); } if(y&&ev>0){ y0=Math.min(y0,+y[1]); y1=Math.max(y1,+y[1]); } }
    if(z&&e) zmax=Math.max(zmax,+z[1]);
    { const nx=x?+x[1]:cx, ny=y?+y[1]:cy, nz=z?+z[1]:cz, ne=e?+e[1]:ce; if(e&&ne>ce&&(x||y)){ segs.push([cx,cy,nz,nx,ny]); if(nz>zmax) zmax=nz; } cx=nx; cy=ny; cz=nz; if(e) ce=ne; } }
  const tm=text.match(/(\d+)時間\s*(\d+)分/)||text.match(/(\d+)分/); if(tm) mins= tm.length>2? (+tm[1])*60+(+tm[2]) : +tm[1];
  const f2=v=>isFinite(v)?v.toFixed(2):'0.00';
  const head=['; HEADER_BLOCK_START','; generated by ClayPath Lab tools (kanejun06.github.io/claypath-lab)',`; total layer number: ${layers}`,
    `; filament_diameter: ${PROFILE.filD}`,`; max_z_height: ${f2(zmax)}`,'; HEADER_BLOCK_END','',...thumbBlock(segs,96),...thumbBlock(segs,300),
    `; MINX = ${f2(x0)}`,`; MINY = ${f2(y0)}`,'; MINZ = 0.00',`; MAXX = ${f2(x1)}`,`; MAXY = ${f2(y1)}`,`; MAXZ = ${f2(zmax)}`,''];
  if(M&&M.length) for(let i=0;i<M.length;i++) if(typeof M[i]==='number') M[i]+=head.length;
  while(L.length&&L[L.length-1]==='') L.pop();
  const foot=['',`; filament used [mm] = ${f2(emax)}`,`; total layers count = ${layers}`,`; estimated printing time (normal mode) = ${Math.floor(mins/60)?Math.floor(mins/60)+'h ':''}${mins%60}m 0s`];
  return head.concat(L,foot).join('\n')+'\n'; }
window.ClayPrinter={PROFILE, PROFILES, PROFILE_ID, LOCK, teacher, apply, reapply, finalize, scale:()=>scaleOn?scaleK():1, setScale};
})();
