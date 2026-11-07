/* ClayPath Lab / ClayMorph Lab — rim shaping: a slanted, wavy or spouted rim
 * Near the top, the layer height is changed little by little around the circumference, so the rim ends higher in some
 * directions and lower in others (non-planar layers). Over the "transition height" T below the rim, every point is
 * lifted by A·f(θ)·s(z) (s: smoothstep 0→1 over T), and its extrusion is scaled by the local layer-height ratio so the
 * bead keeps its width. A spout can also be pulled outward. The page calls ClayRim.mount(container, onChange) once,
 * ClayRim.begin() before the wall loop and ClayRim.at(theta, z, H, lh) for every wall point.
 */
window.ClayRim=(function(){
"use strict";
const $=id=>document.getElementById(id);
const DEF={on:false, kind:'tilt', amp:10, n:3, dir:0, width:50, out:0, zone:0};
const S={...DEF}; let onChange=()=>{}; let st={min:1,max:1,n:0};
const IDS={rimOn:'on',rimKind:'kind',rimAmp:'amp',rimN:'n',rimDir:'dir',rimWidth:'width',rimOut:'out',rimZone:'zone'};
function html(){ return `
  <h2><label class="toggle"><input id="rimOn" type="checkbox">口の形（斜め・波・注ぎ口）</label></h2>
  <div class="row"><label for="rimKind">形</label><select id="rimKind"><option value="tilt">斜め（片側を高く）</option><option value="wave">波打つ</option><option value="spout">注ぎ口（一か所を低く／高く）</option></select></div>
  <canvas id="rimPrev" class="rimprev" aria-label="口の高さの変化（左右が一周、上が高い）"></canvas>
  <div class="curvecap"><span>0°</span><span>口の高さ（一周を展開、点線が元の高さ）</span><span>360°</span></div>
  <div class="row"><label for="rimAmp">高さの変化（斜め・波は±）</label><input id="rimAmp" type="range" min="-30" max="30" step="0.5" value="10"><span class="val" id="rimAmpV">10.0</span><span class="unit">mm</span></div>
  <div class="row" id="rimNRow"><label for="rimN">波の数</label><input id="rimN" type="range" min="1" max="12" step="1" value="3"><span class="val" id="rimNV">3</span></div>
  <div class="row"><label for="rimDir">向き（一番高い／低い所）</label><input id="rimDir" type="range" min="-180" max="180" step="1" value="0"><span class="val" id="rimDirV">0</span><span class="unit">°</span></div>
  <div class="row" id="rimWidthRow"><label for="rimWidth">注ぎ口の幅</label><input id="rimWidth" type="range" min="10" max="180" step="1" value="50"><span class="val" id="rimWidthV">50</span><span class="unit">°</span></div>
  <div class="row" id="rimOutRow"><label for="rimOut">注ぎ口を外へ張り出す</label><input id="rimOut" type="range" min="0" max="15" step="0.5" value="0"><span class="val" id="rimOutV">0.0</span><span class="unit">mm</span></div>
  <div class="row"><label for="rimZone">変化させる高さ（0＝自動）</label><input id="rimZone" type="number" step="1" min="0" max="300" value="0"><span class="unit">mm</span></div>
  <div class="note" id="rimInfo"></div>
  <div class="note">口から「変化させる高さ」ぶん下までのあいだで、層の厚みを周方向に少しずつ変えて縁を傾ける（層が平らでなくなる）。高さの差が大きいほど、変化させる高さも長く必要（自動では層の厚みの変化が ±40% 以内になる長さ）。斜め・波は元の高さから±この値、注ぎ口は一か所だけこの値（マイナスで低くなる）。押出は層の厚みに合わせて増減する。</div>`; }
function css(){ const st=document.createElement('style'); st.textContent='.rimprev{display:block;width:100%;height:70px;border:1px solid var(--line);border-radius:4px;background:var(--bg);margin-top:4px}'; document.head.appendChild(st); }
function readUI(){ for(const [id,k] of Object.entries(IDS)){ const el=$(id); if(!el) continue; S[k]= el.type==='checkbox'? el.checked : el.tagName==='SELECT'? el.value : +el.value; } }
function writeUI(){ for(const [id,k] of Object.entries(IDS)){ const el=$(id); if(!el) continue; if(el.type==='checkbox') el.checked=!!S[k]; else el.value=S[k]; const v=$(id+'V'); if(v) v.textContent= (k==='amp'||k==='out')? (+S[k]).toFixed(1) : String(S[k]); }
  const sh=(id,on)=>{ const e=$(id); if(e) e.hidden=!on; }; sh('rimNRow',S.kind==='wave'); sh('rimWidthRow',S.kind==='spout'); sh('rimOutRow',S.kind==='spout'); }
// shape around the circumference, -1..1 (spout: 0..1)
function f(theta){ const d=theta-S.dir*Math.PI/180;
  if(S.kind==='wave') return Math.cos(S.n*d);
  if(S.kind==='spout'){ let a=Math.atan2(Math.sin(d),Math.cos(d)); const w=Math.max(1,S.width)*Math.PI/180/2; const u=a/w; return Math.abs(u)>=1? 0 : 0.5*(1+Math.cos(Math.PI*u)); }
  return Math.cos(d); }
function zone(){ return S.zone>0? S.zone : Math.max(5, 3.75*Math.abs(S.amp)); } // smoothstep slope 1.5/T keeps |ΔA/T·1.5| ≤ 0.4
const ss=t=>{ t=Math.min(1,Math.max(0,t)); return t*t*(3-2*t); };
function preview(){ const cv=$('rimPrev'); if(!cv) return; const dpr=window.devicePixelRatio||1; const W=cv.clientWidth||280,H=cv.clientHeight||70; cv.width=W*dpr; cv.height=H*dpr; const c=cv.getContext('2d'); c.scale(dpr,dpr); c.clearRect(0,0,W,H);
  const cs=getComputedStyle(document.documentElement); const acc=cs.getPropertyValue('--accent').trim(), fg2=cs.getPropertyValue('--fg2').trim();
  const lo=S.kind==='spout'? Math.min(0,S.amp) : -Math.abs(S.amp), hi=S.kind==='spout'? Math.max(0,S.amp) : Math.abs(S.amp); const span=Math.max(1,hi-lo)*1.2, mid=(hi+lo)/2; const y=v=>H/2-(v-mid)/span*H;
  c.strokeStyle=fg2; c.setLineDash([3,3]); c.beginPath(); c.moveTo(0,y(0)); c.lineTo(W,y(0)); c.stroke(); c.setLineDash([]);
  c.strokeStyle=acc; c.lineWidth=2; c.beginPath(); for(let x=0;x<=W;x+=2){ const v=S.amp*f(x/W*2*Math.PI); x?c.lineTo(x,y(v)):c.moveTo(x,y(v)); } c.stroke(); }
function info(){ const e=$('rimInfo'); if(!e) return; const T=zone(); const r=1.5*Math.abs(S.amp)*(S.kind==='spout'?1:1)/T;
  e.textContent= S.on? `口から ${T.toFixed(0)} mm 下までで変化。層の厚みは最大で ×${(1-r).toFixed(2)}〜×${(1+r).toFixed(2)}${r>0.45?'（変化が急。変化させる高さを長くする）':''}` : ''; }
function mount(container,cb){ if(!container) return; onChange=cb||onChange; css(); container.innerHTML=html(); writeUI();
  for(const id of Object.keys(IDS)){ const el=$(id); const ev=(el.type==='range')?'input':'change'; el.addEventListener(ev,()=>{ readUI(); writeUI(); preview(); info(); onChange(); }); }
  preview(); info(); }
function begin(){ st={min:1,max:1,n:0}; }
// for a wall point at angle theta and design height z: {dz (mm), dxy (mm, outward), k (extrusion factor)}
function at(theta,z,H,lh){ if(!S.on||!S.amp&&!(S.kind==='spout'&&S.out)) return null; const T=Math.min(zone(),H); const z0=H-T; if(z<=z0) return null;
  const fv=f(theta), s=ss((z-z0)/T), s1=ss((z-lh-z0)/T); const dz=S.amp*fv*s; const k=Math.max(0.2,1+S.amp*fv*(s-s1)/lh);
  st.n++; if(k<st.min) st.min=k; if(k>st.max) st.max=k;
  return {dz, dxy: S.kind==='spout'? S.out*fv*s : 0, k}; }
function stats(){ return {...st}; }
function params(){ return {...S}; }
function setParams(o){ if(!o) return; for(const k of Object.keys(DEF)) if(k in o) S[k]=o[k]; writeUI(); preview(); info(); }
function describe(){ return S.on? `rim ${S.kind} amp ${S.amp}mm dir ${S.dir}${S.kind==='wave'?` n ${S.n}`:''}${S.kind==='spout'?` width ${S.width} out ${S.out}mm`:''} zone ${zone().toFixed(1)}mm` : 'rim off'; }
return {mount,begin,at,stats,params,setParams,describe,redraw:preview};
})();
