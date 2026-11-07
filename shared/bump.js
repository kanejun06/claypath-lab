/* ClayPath Lab / ClayMorph Lab — image bump: a black-and-white image wrapped around the wall
 * The image is wrapped once around the vessel (or repeated), and its brightness pushes the wall out or in (XY,
 * along the wall's outward direction) by up to the set depth. White = 1, black = 0 (after blur / invert).
 * The page calls ClayBump.mount(container, onChange) once, and ClayBump.disp(theta, z, zWall, H) for every wall point.
 * Detail is limited by the toolpath: points per turn around, one layer (0.9 mm) up.
 */
window.ClayBump=(function(){
"use strict";
const $=id=>document.getElementById(id);
const DEF={on:false, amp:1.0, mode:'out', ru:1, rv:1, rot:0, z0:0, z1:100, blur:1, inv:false};
const S={...DEF};
let src=null;   // {name, url(dataURL of the downscaled image), w, h, g:Float32Array (0..1 brightness)}
let proc=null;  // processed brightness (blur + invert), same size
let onChange=()=>{};
const IDS={bmpOn:'on',bmpAmp:'amp',bmpMode:'mode',bmpRu:'ru',bmpRv:'rv',bmpRot:'rot',bmpZ0:'z0',bmpZ1:'z1',bmpBlur:'blur',bmpInv:'inv'};
function html(){ return `
  <h2><label class="toggle"><input id="bmpOn" type="checkbox">画像のバンプ（白黒の画像で凹凸）</label></h2>
  <div class="row keep" style="flex-wrap:wrap"><button id="bmpLoad" type="button" class="sm">画像を読み込む</button><input id="bmpIn" type="file" accept="image/*" hidden>
    <button id="bmpSampleDots" type="button" class="sm">サンプル（ドット）</button><button id="bmpSampleWave" type="button" class="sm">サンプル（斜めの波）</button></div>
  <canvas id="bmpPrev" class="bmpprev" aria-label="バンプに使う画像（左右が器の一周、上が口）"></canvas>
  <div class="note" id="bmpInfo">画像を読み込むか、サンプルを選んでください（白が外へ・黒がそのまま）。</div>
  <div class="row"><label for="bmpAmp">深さ</label><input id="bmpAmp" type="range" min="0" max="4" step="0.05" value="1"><span class="val" id="bmpAmpV">1.00</span><span class="unit">mm</span></div>
  <div class="row"><label for="bmpMode">向き</label><select id="bmpMode"><option value="out">白い所を外へ浮き出す</option><option value="in">白い所を内へ彫り込む</option><option value="mid">灰色を基準に、白は外・黒は内</option></select></div>
  <div class="row"><label for="bmpRu">周方向の繰り返し</label><input id="bmpRu" type="range" min="1" max="12" step="1" value="1"><span class="val" id="bmpRuV">1</span></div>
  <div class="row"><label for="bmpRv">高さ方向の繰り返し</label><input id="bmpRv" type="range" min="1" max="12" step="1" value="1"><span class="val" id="bmpRvV">1</span></div>
  <div class="row"><label for="bmpRot">回転（貼る位置）</label><input id="bmpRot" type="range" min="-180" max="180" step="1" value="0"><span class="val" id="bmpRotV">0</span><span class="unit">°</span></div>
  <div class="row"><label for="bmpZ0">貼る範囲（壁の下端〜口を0〜100）</label><input id="bmpZ0" type="number" step="5" min="0" max="95" value="0"><span class="unit">〜</span><input id="bmpZ1" type="number" step="5" min="5" max="100" value="100"><span class="unit">%</span></div>
  <div class="row"><label for="bmpBlur">ぼかし</label><input id="bmpBlur" type="range" min="0" max="8" step="1" value="1"><span class="val" id="bmpBlurV">1</span><span class="unit">px</span></div>
  <div class="row"><label class="toggle"><input id="bmpInv" type="checkbox">白黒を反転</label></div>
  <div class="note">画像の左右が器の一周（左端＝0°、右回り）、上が口の側。細かさは「1周の点数」（周方向）と層高 0.9 mm（高さ方向）で決まるので、細かい模様は点数を増やすか、ぼかして大きな形にする。深さが大きいとオーバーハング警告が出やすい。「壁の下は変調なし」もかかる。</div>`; }
function css(){ const st=document.createElement('style'); st.textContent='.bmpprev{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:4px;background:#000;image-rendering:pixelated;margin:4px 0}'; document.head.appendChild(st); }
function readUI(){ for(const [id,k] of Object.entries(IDS)){ const el=$(id); if(!el) continue; S[k]= el.type==='checkbox'? el.checked : el.tagName==='SELECT'? el.value : +el.value; } if(S.z1<=S.z0) S.z1=Math.min(100,S.z0+5); }
function writeUI(){ for(const [id,k] of Object.entries(IDS)){ const el=$(id); if(!el) continue; if(el.type==='checkbox') el.checked=!!S[k]; else el.value=S[k]; const v=$(id+'V'); if(v) v.textContent= k==='amp'? (+S[k]).toFixed(2) : String(S[k]); } }
function process(){ if(!src){ proc=null; return; } const {w,h,g}=src; const r=Math.round(S.blur); let a=Float32Array.from(g);
  if(r>0){ const tmp=new Float32Array(w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ let s=0; for(let k=-r;k<=r;k++) s+=a[y*w+((x+k)%w+w)%w]; tmp[y*w+x]=s/(2*r+1); }        // wraps around
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ let s=0,n=0; for(let k=-r;k<=r;k++){ const yy=y+k; if(yy<0||yy>=h) continue; s+=tmp[yy*w+x]; n++; } a[y*w+x]=s/n; } }
  if(S.inv) for(let i=0;i<a.length;i++) a[i]=1-a[i]; proc=a; }
function preview(){ const cv=$('bmpPrev'); if(!cv) return; if(!proc){ cv.width=1; cv.height=1; cv.style.display='none'; return; } cv.style.display='block';
  const {w,h}=src; cv.width=w; cv.height=h; const c=cv.getContext('2d'); const im=c.createImageData(w,h);
  for(let i=0;i<w*h;i++){ const v=Math.round(proc[i]*255); im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v; im.data[i*4+3]=255; } c.putImageData(im,0,0);
  $('bmpInfo').textContent=`${src.name}（${w}×${h} px）`; }
function setImage(name,canvas){ const MAX=360; let w=canvas.width, h=canvas.height; const s=Math.min(1,MAX/Math.max(w,h)); w=Math.max(4,Math.round(w*s)); h=Math.max(4,Math.round(h*s));
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const c=cv.getContext('2d'); c.fillStyle='#000'; c.fillRect(0,0,w,h); c.drawImage(canvas,0,0,w,h);
  const d=c.getImageData(0,0,w,h).data; const g=new Float32Array(w*h); for(let i=0;i<w*h;i++) g[i]=(0.2126*d[i*4]+0.7152*d[i*4+1]+0.0722*d[i*4+2])/255*(d[i*4+3]/255);
  src={name,url:cv.toDataURL('image/png'),w,h,g}; process(); preview(); }
function loadURL(name,url,cb){ const im=new Image(); im.onload=()=>{ const cv=document.createElement('canvas'); cv.width=im.naturalWidth; cv.height=im.naturalHeight; cv.getContext('2d').drawImage(im,0,0); setImage(name,cv); cb&&cb(); }; im.onerror=()=>{ $('bmpInfo').textContent='画像を読めませんでした'; }; im.src=url; }
function sample(kind){ const w=240,h=160; const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const c=cv.getContext('2d'); c.fillStyle='#000'; c.fillRect(0,0,w,h);
  if(kind==='dots'){ const g=c.createRadialGradient(0,0,0,0,0,11); g.addColorStop(0,'#fff'); g.addColorStop(1,'#000');
    for(let j=0;j<6;j++) for(let i=0;i<12;i++){ c.save(); c.translate((i+(j%2)*0.5)*w/12+w/24,j*h/6+h/12); c.fillStyle=g; c.beginPath(); c.arc(0,0,11,0,6.283); c.fill(); c.restore(); } }
  else { const im=c.createImageData(w,h); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const v=0.5+0.5*Math.sin((x*2*Math.PI/w)*6+(y/h)*2*Math.PI*2); const k=(y*w+x)*4; im.data[k]=im.data[k+1]=im.data[k+2]=Math.round(v*255); im.data[k+3]=255; } c.putImageData(im,0,0); }
  setImage(kind==='dots'?'サンプル（ドット）':'サンプル（斜めの波）',cv); }
function mount(container,cb){ if(!container) return; onChange=cb||onChange; css(); container.innerHTML=html(); writeUI();
  for(const id of Object.keys(IDS)){ const el=$(id); const ev=(el.type==='range')?'input':'change';
    el.addEventListener(ev,()=>{ const before=[S.blur,S.inv]; readUI(); writeUI(); if(before[0]!==S.blur||before[1]!==S.inv){ process(); preview(); } onChange(); }); }
  $('bmpLoad').onclick=()=>$('bmpIn').click();
  $('bmpIn').addEventListener('change',e=>{ const f=e.target.files[0]; e.target.value=''; if(!f) return; const r=new FileReader(); r.onload=()=>loadURL(f.name,r.result,()=>{ if(!S.on){ S.on=true; writeUI(); } onChange(); }); r.readAsDataURL(f); });
  $('bmpSampleDots').onclick=()=>{ sample('dots'); if(!S.on){ S.on=true; writeUI(); } onChange(); };
  $('bmpSampleWave').onclick=()=>{ sample('wave'); if(!S.on){ S.on=true; writeUI(); } onChange(); };
  preview(); }
// displacement (mm, + = outward) for a wall point at angle theta (rad, around the section centre) and height z (mm)
function disp(theta,z,zWall,H){ if(!S.on||!proc||!S.amp) return 0; const zA=zWall+(H-zWall)*S.z0/100, zB=zWall+(H-zWall)*S.z1/100; if(z<zA||z>zB||zB<=zA) return 0;
  const {w,h}=src; let u=((theta-S.rot*Math.PI/180)/(2*Math.PI))%1; if(u<0) u+=1; u=(u*S.ru)%1; let v=((z-zA)/(zB-zA))*S.rv; v=v>=S.rv? 0.999999 : v%1;
  const fx=u*w-0.5, fy=(1-v)*h-0.5; const x0=Math.floor(fx), y0=Math.max(0,Math.min(h-1,Math.floor(fy))), y1=Math.min(h-1,y0+1); const tx=fx-x0, ty=Math.max(0,Math.min(1,fy-y0));
  const X=k=>((k%w)+w)%w; const a=proc[y0*w+X(x0)], b=proc[y0*w+X(x0+1)], c=proc[y1*w+X(x0)], d=proc[y1*w+X(x0+1)];
  const g=(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty;
  return S.mode==='in'? -S.amp*g : S.mode==='mid'? S.amp*(2*g-1) : S.amp*g; }
// for undo snapshots (image by name only) and settings files (image included)
function params(){ return {...S, img: src? src.name : null}; }
function setParams(o){ if(!o) return; for(const k of Object.keys(DEF)) if(k in o) S[k]=o[k]; writeUI(); process(); preview(); }
function state(){ return {params:{...S}, image: src? {name:src.name,url:src.url} : null}; }
function setState(o,cb){ if(!o){ Object.assign(S,DEF); src=null; writeUI(); process(); preview(); cb&&cb(); return; } Object.assign(S,DEF,o.params||{}); writeUI();
  if(o.image&&o.image.url) loadURL(o.image.name||'image',o.image.url,cb); else { src=null; process(); preview(); cb&&cb(); } }
function describe(){ return S.on&&src? `bump ${src.name} ${S.mode} amp ${S.amp}mm rep ${S.ru}x${S.rv} rot ${S.rot} range ${S.z0}-${S.z1}% blur ${S.blur}${S.inv?' inv':''}` : 'bump off'; }
return {mount,disp,params,setParams,state,setState,describe,defaults:()=>({...DEF})};
})();
