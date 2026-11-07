/* ClayMorph Lab — save the previewed shape as STL (only ClayMorph loads this for now)
 * Writes the preview meshes as one binary STL (mm, same position as the preview: the part's centre on the origin,
 * the bed at Z=0). The mesh is the clay bead along the toolpath (a thin box around every segment, width = line width ×
 * thickness, height = layer), so textures and modulation show exactly as printed. It is for rendering, CAD reference
 * and portfolios — the beads overlap and are not one closed solid, so do not re-slice it.
 */
window.ClaySTL=(function(){
"use strict";
function build(meshes){ let n=0; const parts=[];
  for(const m of meshes){ const g=m&&m.geometry; if(!g||!g.attributes.position) continue; const pos=g.attributes.position.array, idx=g.index?g.index.array:null;
    const tri= idx? idx.length/3 : pos.length/9; parts.push({pos,idx,tri}); n+=tri; }
  const buf=new ArrayBuffer(84+50*n), dv=new DataView(buf); const head='ClayLab STL: clay bead along the toolpath, mm';
  for(let i=0;i<Math.min(80,head.length);i++) dv.setUint8(i,head.charCodeAt(i)); dv.setUint32(80,n,true);
  let o=84; const v=[0,0,0,0,0,0,0,0,0];
  for(const p of parts){ for(let t=0;t<p.tri;t++){
      for(let k=0;k<3;k++){ const vi= p.idx? p.idx[t*3+k] : t*3+k; v[k*3]=p.pos[vi*3]; v[k*3+1]=p.pos[vi*3+1]; v[k*3+2]=p.pos[vi*3+2]; }
      const ux=v[3]-v[0],uy=v[4]-v[1],uz=v[5]-v[2], wx=v[6]-v[0],wy=v[7]-v[1],wz=v[8]-v[2];
      let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz)||1;
      dv.setFloat32(o,nx/l,true); dv.setFloat32(o+4,ny/l,true); dv.setFloat32(o+8,nz/l,true); o+=12;
      for(let k=0;k<9;k++){ dv.setFloat32(o,v[k],true); o+=4; } dv.setUint16(o,0,true); o+=2; } }
  return {buf,tris:n}; }
// returns {ok,msg} for the page to show
function save(meshes,base){ const {buf,tris}=build(meshes); if(!tris) return {ok:false,msg:'保存する形がありません'};
  const name=(base||'clay').replace(/[^\w\-一-龠ぁ-んァ-ヶー]/g,'_')+'_clay.stl'; // _clay: not to be confused with the STL that was loaded const mb=(buf.byteLength/1048576).toFixed(1);
  try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([buf],{type:'model/stl'})); a.download=name; document.body.appendChild(a); a.click(); a.remove();
    return {ok:true,msg:`${name} を書き出しました（${tris.toLocaleString()} 三角形、${mb} MB）`}; }
  catch(e){ return {ok:false,msg:'この表示では STL を保存できません'}; } }
return {build,save};
})();
