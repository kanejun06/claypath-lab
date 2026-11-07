/* ClayLine Lab / ClayPath Lab / ClayMorph Lab — example settings ("作例")
 * Each template is a set of changes from the page's start-up settings, applied in one step (undo with ⌘Z).
 * Machine values are never part of a template. They are starting points, not machine-tested recipes: check the
 * judgement panel and print a small test first. To add one, copy an entry and change the values; the keys are the
 * input ids of each page (and prof / c / b / r as in the page's settings file).
 */
window.ClayTemplates=(function(){
"use strict";
// symmetric side profile from [h(0..1), diameter mm] pairs
const sym=list=>{ const side=list.map(([h,D])=>({h,x:D/2})); return {L:side.map(p=>({...p})),R:side}; };
const T={
  line:[
    {name:'波線のトレイ（基本）', desc:'サンプルの波線を四角い枠の中に積む', s:{}},
    {name:'交互の格子（0°と90°）', desc:'層ごとに線の向きを90°入れ替えて、格子状に積む', s:{rot:90,rotMode:'alt',height:12}},
    {name:'少しずつ回る格子', desc:'1層ごとに1°ずつ回して、ねじれた模様にする', s:{rot:1,rotMode:'cont',height:20}},
    {name:'丸い皿', desc:'丸い枠（直径100mm）で低い皿にする', s:{frameMode:'circle',frameDia:100,height:10}},
  ],
  path:[
    {name:'ねじれたうねり（開いたときの例）', desc:'輪郭のうねりと太さの揺れを、ねじりながら重ねる', v:{}},
    {name:'太さの縞', desc:'周方向に押出量だけを変えて、縦の縞にする', v:{xyAmp:0,fAmp:0.2,fN:12,fTw:0}},
    {name:'ドット模様（画像のバンプ）', desc:'サンプルのドット画像を巻き付ける（1周の点数240）', v:{xyAmp:0,fAmp:0,segs:240}, b:{on:true,amp:1,blur:2,fadeLo:5,fadeHi:5}, bumpSample:'dots'},
    {name:'斜めの口', desc:'ゆるいうねりに、片側が高い口を合わせる', v:{xyAmp:0.8,xyN:8,xyTw:0,fAmp:0}, r:{on:true,kind:'tilt',amp:8}},
  ],
  morph:[
    {name:'花びらの花器', desc:'丸い底から、上に開く6枚の花びらへ', v:{tKind:'petal',tN:6,tA:0.35,dB:70,dT:110,hgt:90,slopeOn:true}},
    {name:'ねじれた星のカップ', desc:'5つの角の星を36°ねじる。上下で星の向きをずらす', v:{bKind:'star',bN:5,bA:0.6,bR:2,tKind:'star',tN:5,tA:0.6,tR:2,tRot:36,dB:75,dT:85,hgt:85,twist:36,slopeOn:true}, prof:sym([[0,75],[0.5,78],[1,85]])},
    {name:'注ぎ口のピッチャー', desc:'胴がふくらみ、口の一か所が低く外へ張り出す', v:{bKind:'circle',tKind:'circle',dB:70,dT:80,hgt:110,slopeOn:true}, prof:sym([[0,70],[0.35,92],[0.75,78],[1,80]]), r:{on:true,kind:'spout',amp:-10,width:60,out:2.5,dir:0}},
    {name:'傾いた一輪挿し', desc:'左右非対称の輪郭で、口が片側へ寄る', v:{bKind:'circle',tKind:'ellipse',tA:0.7,dB:50,dT:40,hgt:120,slopeOn:true},
      prof:{L:[{h:0,x:25},{h:0.3,x:24},{h:0.65,x:17},{h:1,x:12}],R:[{h:0,x:25},{h:0.3,x:29},{h:0.65,x:30},{h:1,x:28}]}, sym:false, pair:true},
    {name:'波打つ口のボウル', desc:'広がる低い器の口を、ゆるく4回波打たせる', v:{bKind:'circle',tKind:'petal',tN:8,tA:0.12,dB:80,dT:115,hgt:65,slopeOn:true}, prof:sym([[0,80],[0.45,100],[1,115]]), r:{on:true,kind:'wave',amp:4,n:4}},
    {name:'ドット模様のタンブラー', desc:'まっすぐな筒にドット画像を巻き付ける（1周の点数360）', v:{bKind:'circle',tKind:'circle',dB:70,dT:78,hgt:100,segs:360}, prof:sym([[0,70],[0.5,74],[1,78]]), b:{on:true,amp:1,blur:2,fadeLo:6,fadeHi:6}, bumpSample:'dots'},
  ],
};
function list(tool){ return T[tool]||[]; }
// a "作例" menu; onPick(template) applies it
function mount(after,tool,onPick){ if(!after||!list(tool).length) return; const sel=document.createElement('select'); sel.className='tplsel'; sel.title='作例を開く（今の設定は ⌘Z で戻せる）';
  sel.innerHTML='<option value="">作例を開く…</option>'+list(tool).map((t,i)=>`<option value="${i}" title="${t.desc}">${t.name}</option>`).join('');
  sel.addEventListener('change',()=>{ const t=list(tool)[+sel.value]; sel.value=''; if(t) onPick(t); });
  const st=document.createElement('style'); st.textContent='.tplsel{font:inherit;font-size:11px;padding:3px 4px;border:1px solid var(--line);border-radius:4px;background:var(--panel);color:var(--fg);max-width:9em}'; document.head.appendChild(st);
  after.after(sel); }
return {list,mount};
})();
