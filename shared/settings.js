/* ClayPath Lab / ClayMorph Lab — helpers for saving and loading settings files
 * A settings file is JSON: {app, version, saved, settings, text:{gStart,gEnd}, ...model}. Machine values in it are
 * ignored for students (shared/printer.js puts the profile back after loading).
 */
window.ClaySettings=(function(){
"use strict";
let dl; async function getDl(){ if(dl===undefined){ try{ dl = window.claude?.use ? await window.claude.use('downloads') : null; }catch(e){ dl=null; } } return dl; }
// download text as base.ext; returns a message for the page to show
async function saveText(base,ext,txt){ const kb=(txt.length/1024).toFixed(0); const d=await getDl();
  if(d){ try{ await d.save({filename:`${base}_${ext}.txt`,data:txt}); return {ok:true,msg:`保存しました（${kb} KB）。拡張子を .${ext} に直して使用`}; }catch(e){ return {ok:false,msg:e&&e.code==='declined'?'保存をキャンセルしました':'保存できませんでした：'+(e&&e.message||e)}; } }
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'})); a.download=`${base}.${ext}`; document.body.appendChild(a); a.click(); a.remove(); return {ok:true,msg:`${base}.${ext} を書き出しました（${kb} KB）`}; }
  catch(e){ return {ok:false,msg:'この表示では保存できません'}; } }
function toB64(buf){ const u=new Uint8Array(buf); let s=''; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); }
function fromB64(b64){ const s=atob(b64); const u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u.buffer; }
// read a chosen file as JSON settings of this app
function readFile(file,app,cb){ const r=new FileReader(); r.onload=()=>{ let o; try{ o=JSON.parse(r.result); }catch(e){ cb(null,'設定ファイルとして読めませんでした（JSON ではありません）'); return; }
    if(!o||!o.settings){ cb(null,`${app} の設定ファイルではありません`); return; }
    if(o.app && o.app!==app){ cb(null,`${o.app} の設定ファイルです（${app} では読めません）`); return; }
    cb(o,null); }; r.readAsText(file); }
// two-step button instead of a confirm dialog
function twoStep(btn,label,armedLabel,fn){ let t=0; btn.onclick=()=>{ if(!t){ btn.classList.add('armed'); btn.textContent=armedLabel; t=setTimeout(()=>{ btn.classList.remove('armed'); btn.textContent=label; t=0; },3000); return; }
  clearTimeout(t); t=0; btn.classList.remove('armed'); btn.textContent=label; fn(); }; }
const safe=s=>(s||'clay').replace(/[^\w\-一-龠ぁ-んァ-ヶー]/g,'_');
return {saveText,toB64,fromB64,readFile,twoStep,safe};
})();
